#!/usr/bin/env python3
"""
Live Bug Hunter v2 - Enhanced Error Detection
Catches: JavaScript runtime errors, white screens, module import failures
"""

import asyncio
import json
import os
import re
import sys
from datetime import datetime
from typing import Optional
from pathlib import Path

try:
    from playwright.async_api import async_playwright, Page, Browser
except ImportError:
    print("[ERROR] Playwright not installed. Run: pip install playwright && playwright install")
    sys.exit(1)

# Configuration
BASE_URL = os.getenv('BASE_URL', 'http://localhost:3000')
SCREENSHOTS_DIR = 'bug_hunter/screenshots'
REPORTS_DIR = 'bug_hunter/reports'
MAX_ITERATIONS = int(os.getenv('MAX_ITERATIONS', '10'))
HEADLESS = os.getenv('HEADLESS', 'false').lower() == 'true'


class ErrorType:
    CONSOLE = "console_error"
    NETWORK = "network_error"
    VISUAL = "visual_error"
    RUNTIME = "runtime_error"
    SYNTAX = "syntax_error"
    WHITE_SCREEN = "white_screen"
    MODULE_IMPORT = "module_import_error"


class BugHunterError:
    def __init__(self, error_type: str, message: str, location: str = "", stack: str = "",
                 suggestion: str = "", severity: str = "medium", page_url: str = ""):
        self.error_type = error_type
        self.message = message
        self.location = location
        self.stack = stack
        self.suggestion = suggestion
        self.severity = severity
        self.timestamp = datetime.now().isoformat()
        self.fixed = False
        self.page_url = page_url

    def to_dict(self):
        return {
            "error_type": self.error_type,
            "message": self.message,
            "location": self.location,
            "stack": self.stack,
            "suggestion": self.suggestion,
            "severity": self.severity,
            "timestamp": self.timestamp,
            "fixed": self.fixed,
            "page_url": self.page_url
        }


class AIFixer:
    """AI-assisted error analysis and fix suggestions"""

    ERROR_FIXES = {
        # HTTP Status Errors
        r"HTTP 429|429.*Too Many Requests": {
            "cause": "Rate limiting - too many requests from this IP",
            "fix": "1) Check rate limiter config in backend/src/server.ts, 2) Increase RATE_LIMIT_MAX_REQUESTS, 3) Add endpoint to skip list, 4) Wait 15 minutes for limit to reset",
            "files": ["backend/src/server.ts", "backend/src/middleware/rateLimiter.ts"]
        },
        r"HTTP 401|401.*Unauthorized": {
            "cause": "Authentication required or token expired",
            "fix": "1) Check if user is logged in, 2) Refresh auth token, 3) Check token expiration",
            "files": ["auth middleware", "token management"]
        },
        r"HTTP 403|403.*Forbidden": {
            "cause": "CSRF token missing or invalid",
            "fix": "1) Fetch CSRF token before request, 2) Include CSRF token in headers, 3) Check CORS config",
            "files": ["api.ts", "csrf middleware"]
        },
        r"HTTP 404|404.*Not Found": {
            "cause": "Resource or endpoint not found",
            "fix": "1) Check URL spelling, 2) Verify route exists, 3) Check API version",
            "files": ["routes", "API endpoints"]
        },
        r"HTTP 500|500.*Internal Server": {
            "cause": "Server-side error",
            "fix": "1) Check server logs, 2) Debug the endpoint, 3) Check database connection",
            "files": ["server logs", "database"]
        },
        # Module Import Errors
        r"does not provide an export named": {
            "cause": "Invalid import - module doesn't export the specified item",
            "fix": "Check import statement: 1) Verify the export exists, 2) Use correct export name, 3) Use default import if named export doesn't exist",
            "files": ["check import statement", "verify module exports"]
        },
        r"Failed to resolve module": {
            "cause": "Module not found or cannot be loaded",
            "fix": "1) Check if module is installed (npm install), 2) Verify import path, 3) Check for typos",
            "files": ["package.json", "import statement"]
        },
        r"SyntaxError": {
            "cause": "JavaScript syntax error in source code",
            "fix": "Check for missing brackets, parentheses, or invalid syntax",
            "files": ["file with syntax error"]
        },
        # WebSocket Errors
        r"WebSocket connection.*failed": {
            "cause": "WebSocket connection failed - Vite HMR or server issue",
            "fix": "Development issue. Check: 1) Server is running, 2) Port is correct, 3) Can be ignored in production",
            "files": ["vite.config.ts", "server configuration"]
        },
        r"vite.*failed to connect": {
            "cause": "Vite dev server WebSocket connection failed",
            "fix": "Development-only warning. Ensure Vite dev server is running.",
            "files": ["vite.config.ts"]
        },
        # JavaScript Errors
        r"Cannot read properties of undefined": {
            "cause": "Accessing property on undefined value",
            "fix": "Add null checks: obj?.property or if (obj) { obj.property }",
            "files": ["check data fetching, API responses, props"]
        },
        r"TypeError": {
            "cause": "Type mismatch or invalid operation",
            "fix": "Add type checking and validation",
            "files": ["check variable types before operations"]
        },
        r"ReferenceError": {
            "cause": "Variable or function not defined",
            "fix": "Check for typos, verify imports, check scope",
            "files": ["imports", "variable declarations"]
        },
        r"Uncaught": {
            "cause": "Unhandled JavaScript error",
            "fix": "Add error boundary or try-catch block",
            "files": ["error handling", "component with error"]
        },
    }

    @classmethod
    def analyze_error(cls, error: BugHunterError) -> str:
        message = error.message
        for pattern, info in cls.ERROR_FIXES.items():
            if re.search(pattern, message, re.IGNORECASE):
                return f"[ANALYSIS] Cause: {info['cause']} | Fix: {info['fix']} | Files: {', '.join(info['files'])}"
        return "[ANALYSIS] Unknown error - Check DevTools console and server logs"

    @classmethod
    def suggest_fix(cls, error: BugHunterError) -> BugHunterError:
        error.suggestion = cls.analyze_error(error)
        return error


class ConsoleMonitor:
    """Monitors browser console for all error types"""

    def __init__(self):
        self.messages = []
        self.errors = []
        self.page_url = ""

    def handler(self, msg):
        msg_type = msg.type
        text = msg.text
        location_data = msg.location or {}
        location = f"{location_data.get('url', '')}:{location_data.get('lineNumber', '')}"

        self.messages.append({
            "type": msg_type,
            "text": text,
            "location": location,
            "timestamp": datetime.now().isoformat()
        })

        if msg_type == 'error':
            error_type = ErrorType.CONSOLE
            severity = 'critical'

            # Detect specific error types
            if 'does not provide an export' in text:
                error_type = ErrorType.MODULE_IMPORT
            elif 'Failed to resolve' in text or 'SyntaxError' in text:
                error_type = ErrorType.SYNTAX
            elif 'WebSocket' in text:
                severity = 'high'
            elif 'Uncaught' in text:
                error_type = ErrorType.RUNTIME

            error = BugHunterError(
                error_type=error_type,
                message=text,
                location=location,
                severity=severity,
                page_url=self.page_url
            )
            self.errors.append(AIFixer.suggest_fix(error))
            safe_text = text.encode('ascii', 'replace').decode('ascii')[:150]
            print(f"  [ERROR] {safe_text}")

        elif msg_type == 'warning':
            severity = 'medium'
            if 'WebSocket' in text or 'vite' in text.lower():
                severity = 'low'

            error = BugHunterError(
                error_type=ErrorType.CONSOLE,
                message=text,
                location=location,
                severity=severity,
                page_url=self.page_url
            )
            self.errors.append(AIFixer.suggest_fix(error))
            safe_text = text.encode('ascii', 'replace').decode('ascii')[:150]
            print(f"  [WARN] {safe_text}")


class NetworkMonitor:
    """Monitors network requests for failures"""

    def __init__(self):
        self.requests = []
        self.failures = []

    def request_handler(self, request):
        self.requests.append({
            "url": request.url,
            "method": request.method,
            "timestamp": datetime.now().isoformat()
        })

    def response_handler(self, response):
        status = response.status
        url = response.url

        # Catch ALL HTTP errors including 429, 401, 403, 404, 500
        if status >= 400:
            # Determine severity based on status code
            if status == 429:
                severity = 'critical'  # Rate limiting - blocks users
                error_type = ErrorType.NETWORK
            elif status >= 500:
                severity = 'critical'  # Server errors
                error_type = ErrorType.NETWORK
            elif status in [401, 403]:
                severity = 'high'  # Auth errors
                error_type = ErrorType.NETWORK
            else:
                severity = 'high'  # 404, etc.
                error_type = ErrorType.NETWORK

            error = BugHunterError(
                error_type=error_type,
                message=f"HTTP {status} on {response.request.method} {url}",
                location=url,
                severity=severity
            )
            self.failures.append(AIFixer.suggest_fix(error))

            # Print with clear indicator
            if status == 429:
                print(f"  [CRITICAL] HTTP 429 RATE LIMITED - {url}")
            elif status >= 500:
                print(f"  [CRITICAL] HTTP {status} - {url}")
            else:
                print(f"  [WARN] HTTP {status} - {url}")

    def failure_handler(self, request):
        error = BugHunterError(
            error_type=ErrorType.NETWORK,
            message=f"Failed to load: {request.url}",
            location=request.url,
            severity='critical'
        )
        self.failures.append(AIFixer.suggest_fix(error))
        print(f"  [CRITICAL] NETWORK FAILED {request.url}")


class WhiteScreenDetector:
    """Detects white/blank screens"""

    def __init__(self, page: Page):
        self.page = page

    async def check_white_screen(self, url: str) -> dict:
        result = {
            "is_white_screen": False,
            "reason": "",
            "content_metrics": {}
        }

        try:
            metrics = await self.page.evaluate('''() => {
                const body = document.body;
                const html = document.documentElement.outerHTML;
                return {
                    bodyText: body.innerText.trim(),
                    bodyHTML: body.innerHTML.length,
                    fullHTML: html.length,
                    visibleElements: body.querySelectorAll('*:not(script):not(style)').length,
                    hasContent: body.innerText.trim().length > 0,
                    bodyHeight: body.scrollHeight,
                    viewportHeight: window.innerHeight
                };
            }''')

            result["content_metrics"] = metrics

            # Detect white screen conditions
            if metrics["fullHTML"] < 500:
                result["is_white_screen"] = True
                result["reason"] = "Page HTML is too small (< 500 bytes)"
            elif metrics["visibleElements"] < 3:
                result["is_white_screen"] = True
                result["reason"] = "Too few visible elements (< 3)"
            elif not metrics["hasContent"] and metrics["bodyHTML"] < 1000:
                result["is_white_screen"] = True
                result["reason"] = "No text content and minimal HTML"
            elif metrics["bodyHeight"] < 100:
                result["is_white_screen"] = True
                result["reason"] = "Body height too small (< 100px)"

        except Exception as e:
            result["error"] = str(e)

        return result


class TestSuite:
    """Enhanced test suite with white screen detection"""

    def __init__(self, page: Page, console_monitor: ConsoleMonitor, network_monitor: NetworkMonitor):
        self.page = page
        self.console = console_monitor
        self.network = network_monitor
        self.white_screen_detector = WhiteScreenDetector(page)
        self.results = []
        self.screenshots_dir = SCREENSHOTS_DIR

    async def take_screenshot(self, name: str) -> str:
        os.makedirs(self.screenshots_dir, exist_ok=True)
        path = os.path.join(self.screenshots_dir, f"{name}.png")
        await self.page.screenshot(path=path, full_page=True)
        return path

    async def test_page_load(self, url: str, name: str) -> dict:
        """Test if page loads correctly with white screen detection"""
        result = {
            "test": f"Page Load: {name}",
            "url": url,
            "status": "pending",
            "errors": [],
            "screenshot": None,
            "white_screen": None
        }

        try:
            self.console.page_url = url
            await self.page.goto(url, wait_until='networkidle', timeout=30000)
            await self.page.wait_for_timeout(1000)  # Wait for JS errors to surface

            title = await self.page.title()
            result['title'] = title

            # Check for white screen
            white_screen = await self.white_screen_detector.check_white_screen(url)
            result['white_screen'] = white_screen

            if white_screen["is_white_screen"]:
                result['status'] = 'failed'
                error = BugHunterError(
                    error_type=ErrorType.WHITE_SCREEN,
                    message=f"White screen detected: {white_screen['reason']}",
                    location=url,
                    severity='critical',
                    page_url=url
                )
                result['errors'].append(AIFixer.suggest_fix(error).to_dict())
                print(f"  [WHITE SCREEN] {white_screen['reason']}")
            else:
                page_errors = [e for e in self.console.errors if url in e.page_url]
                if page_errors:
                    result['errors'] = [e.to_dict() for e in page_errors]
                    result['status'] = 'warning'
                else:
                    result['status'] = 'passed'
                    print(f"  [OK] {name} - Title: {title}")

            result['screenshot'] = await self.take_screenshot(f"page-{name.lower().replace(' ', '-')}")
            html = await self.page.content()
            result['html_size'] = len(html)

        except Exception as e:
            result['status'] = 'failed'
            result['error'] = str(e)
            error = BugHunterError(
                error_type=ErrorType.RUNTIME,
                message=str(e),
                location=url,
                severity='critical',
                page_url=url
            )
            result['errors'] = [AIFixer.suggest_fix(error).to_dict()]
            print(f"  [FAIL] {name} - {e}")

        self.results.append(result)
        return result

    async def test_form_interaction(self, url: str, form_name: str, fields: dict) -> dict:
        result = {
            "test": f"Form: {form_name}",
            "url": url,
            "status": "pending",
            "fields_tested": [],
            "errors": []
        }

        try:
            await self.page.goto(url, wait_until='networkidle')

            for field_name, field_value in fields.items():
                selectors = [
                    f'input[name="{field_name}"]',
                    f'input[type="{field_name}"]',
                    f'#{field_name}',
                    f'.{field_name}',
                    f'[data-testid="{field_name}"]'
                ]

                filled = False
                for selector in selectors:
                    try:
                        element = self.page.locator(selector).first
                        if await element.count() > 0:
                            await element.fill(str(field_value))
                            result['fields_tested'].append({
                                "name": field_name,
                                "value": field_value,
                                "selector": selector,
                                "status": "filled"
                            })
                            filled = True
                            break
                    except Exception:
                        continue

                if not filled:
                    result['fields_tested'].append({
                        "name": field_name,
                        "status": "not_found"
                    })

            result['screenshot'] = await self.take_screenshot(f"form-{form_name.lower().replace(' ', '-')}")
            result['status'] = 'passed' if all(f.get('status') == 'filled' for f in result['fields_tested']) else 'warning'
            filled_count = sum(1 for f in result['fields_tested'] if f.get('status') == 'filled')
            print(f"  [OK] Form {form_name} - {filled_count}/{len(fields)} fields filled")

        except Exception as e:
            result['status'] = 'failed'
            result['error'] = str(e)
            print(f"  [FAIL] Form {form_name} - {e}")

        self.results.append(result)
        return result

    async def test_navigation(self, start_url: str) -> dict:
        result = {
            "test": "Navigation",
            "url": start_url,
            "links_tested": [],
            "status": "pending"
        }

        try:
            await self.page.goto(start_url, wait_until='networkidle')
            nav_links = await self.page.locator('nav a, [role="navigation"] a, a[href^="/"]').all()

            for i, link in enumerate(nav_links[:10]):
                try:
                    href = await link.get_attribute('href')
                    text = await link.inner_text()
                    await link.click()
                    await self.page.wait_for_load_state('networkidle')
                    result['links_tested'].append({
                        "href": href,
                        "text": text,
                        "navigated_to": self.page.url,
                        "status": "success"
                    })
                    await self.page.go_back()
                    await self.page.wait_for_load_state('networkidle')
                except Exception as e:
                    result['links_tested'].append({
                        "href": href if 'href' in dir() else 'unknown',
                        "status": "failed",
                        "error": str(e)
                    })

            result['status'] = 'passed'
            print(f"  [OK] Navigation - {len(result['links_tested'])} links tested")

        except Exception as e:
            result['status'] = 'failed'
            result['error'] = str(e)
            print(f"  [FAIL] Navigation - {e}")

        self.results.append(result)
        return result

    async def test_accessibility(self, url: str) -> dict:
        result = {
            "test": "Accessibility",
            "url": url,
            "checks": [],
            "status": "pending"
        }

        try:
            await self.page.goto(url, wait_until='networkidle')

            lang = await self.page.locator('html').get_attribute('lang')
            result['checks'].append({
                "name": "HTML lang attribute",
                "value": lang,
                "status": "pass" if lang else "fail"
            })

            title = await self.page.title()
            result['checks'].append({
                "name": "Page title",
                "value": title,
                "status": "pass" if title else "fail"
            })

            h1_count = await self.page.locator('h1').count()
            result['checks'].append({
                "name": "H1 heading",
                "value": f"{h1_count} found",
                "status": "pass" if h1_count == 1 else "warning"
            })

            images = await self.page.locator('img').all()
            missing_alt = 0
            for img in images:
                alt = await img.get_attribute('alt')
                if alt is None:
                    missing_alt += 1

            result['checks'].append({
                "name": "Images with alt",
                "value": f"{len(images) - missing_alt}/{len(images)}",
                "status": "pass" if missing_alt == 0 else "warning"
            })

            result['status'] = 'passed'
            passed_checks = sum(1 for c in result['checks'] if c['status'] == 'pass')
            print(f"  [OK] Accessibility - {passed_checks}/{len(result['checks'])} checks passed")

        except Exception as e:
            result['status'] = 'failed'
            result['error'] = str(e)
            print(f"  [FAIL] Accessibility - {e}")

        self.results.append(result)
        return result


class LiveBugHunter:
    """Main bug hunter class with continuous testing loop"""

    def __init__(self):
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
        self.console_monitor = ConsoleMonitor()
        self.network_monitor = NetworkMonitor()
        self.test_suite: Optional[TestSuite] = None
        self.iteration = 0
        self.all_errors = []
        self.reports_dir = REPORTS_DIR

    async def setup(self):
        os.makedirs(self.reports_dir, exist_ok=True)
        os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(headless=HEADLESS)
        context = await self.browser.new_context(
            viewport={'width': 1280, 'height': 720},
            locale='en-US'
        )
        self.page = await context.new_page()

        # Setup monitors
        self.page.on('console', self.console_monitor.handler)
        self.page.on('request', self.network_monitor.request_handler)
        self.page.on('response', self.network_monitor.response_handler)
        self.page.on('requestfailed', self.network_monitor.failure_handler)

        self.test_suite = TestSuite(self.page, self.console_monitor, self.network_monitor)

    async def teardown(self):
        if self.browser:
            await self.browser.close()

    async def run_test_suite(self) -> dict:
        results = {
            "iteration": self.iteration,
            "timestamp": datetime.now().isoformat(),
            "tests": [],
            "errors": [],
            "summary": {"total": 0, "passed": 0, "failed": 0, "warnings": 0}
        }

        # Clear previous errors
        self.console_monitor.errors = []
        self.network_monitor.failures = []

        print(f"\n{'='*60}")
        print(f"  TEST ITERATION {self.iteration}")
        print(f"{'='*60}")

        # Test pages
        print(f"\n[TEST 1] Home Page Load")
        await self.test_suite.test_page_load(f"{BASE_URL}/", "Home")

        print(f"\n[TEST 2] Login Page")
        await self.test_suite.test_page_load(f"{BASE_URL}/login", "Login")

        print(f"\n[TEST 3] Login Form Interaction")
        await self.test_suite.test_form_interaction(
            f"{BASE_URL}/login", "Login",
            {"email": "test@example.com", "password": "TestPassword123!"}
        )

        print(f"\n[TEST 4] Register Page")
        await self.test_suite.test_page_load(f"{BASE_URL}/register", "Register")

        print(f"\n[TEST 5] Navigation Links")
        await self.test_suite.test_navigation(BASE_URL)

        print(f"\n[TEST 6] Accessibility Checks")
        await self.test_suite.test_accessibility(BASE_URL)

        print(f"\n[TEST 7] Mobile Viewport")
        await self.page.set_viewport_size({'width': 375, 'height': 667})
        await self.test_suite.test_page_load(BASE_URL, "Mobile")
        await self.page.set_viewport_size({'width': 1280, 'height': 720})

        # Collect all errors
        all_errors = self.console_monitor.errors + self.network_monitor.failures

        # Calculate summary
        for test in self.test_suite.results:
            results['tests'].append(test)
            results['summary']['total'] += 1
            if test['status'] == 'passed':
                results['summary']['passed'] += 1
            elif test['status'] == 'failed':
                results['summary']['failed'] += 1
            else:
                results['summary']['warnings'] += 1

        results['errors'] = [e.to_dict() for e in all_errors]
        self.all_errors.extend(all_errors)

        return results

    def print_error_report(self, errors: list):
        if not errors:
            print(f"\n[OK] No errors detected!")
            return

        print(f"\n{'='*60}")
        print(f"  ERROR REPORT - {len(errors)} errors found")
        print(f"{'='*60}")

        # Group errors by type
        error_groups = {}
        for error in errors:
            key = error.error_type
            if key not in error_groups:
                error_groups[key] = []
            error_groups[key].append(error)

        for error_type, group_errors in error_groups.items():
            print(f"\n--- {error_type.upper()} ({len(group_errors)} errors) ---")
            for i, error in enumerate(group_errors[:5], 1):  # Show first 5 of each type
                print(f"\n  [{error.severity.upper()}] Error #{i}")
                safe_msg = error.message.encode('ascii', 'replace').decode('ascii')[:200]
                print(f"  Message: {safe_msg}")
                if error.location:
                    print(f"  Location: {error.location}")
                if error.suggestion:
                    print(f"  {error.suggestion}")

            if len(group_errors) > 5:
                print(f"\n  ... and {len(group_errors) - 5} more {error_type} errors")

    async def run_continuous_loop(self):
        print(f"\n{'='*60}")
        print("  LIVE BUG HUNTER v2 - Enhanced Error Detection")
        print(f"{'='*60}")
        print(f"  Base URL: {BASE_URL}")
        print(f"  Max Iterations: {MAX_ITERATIONS}")
        print(f"  Headless: {HEADLESS}")
        print(f"  Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*60}")
        print("\n  Features:")
        print("  - Console error monitoring")
        print("  - Network failure detection")
        print("  - White screen detection")
        print("  - Module import error detection")
        print("  - AI-assisted fix suggestions")

        await self.setup()

        try:
            while self.iteration < MAX_ITERATIONS:
                self.iteration += 1
                results = await self.run_test_suite()

                print(f"\n{'='*60}")
                print(f"  ITERATION {self.iteration} SUMMARY")
                print(f"{'='*60}")
                print(f"  Total Tests: {results['summary']['total']}")
                print(f"  [OK] Passed: {results['summary']['passed']}")
                print(f"  [FAIL] Failed: {results['summary']['failed']}")
                print(f"  [WARN] Warnings: {results['summary']['warnings']}")

                current_errors = self.console_monitor.errors + self.network_monitor.failures
                self.print_error_report(current_errors)

                report_path = os.path.join(self.reports_dir, f"iteration-{self.iteration}.json")
                with open(report_path, 'w') as f:
                    json.dump(results, f, indent=2, default=str)
                print(f"\n  Report saved: {report_path}")

                # Check if all tests passed with no critical errors
                critical_errors = [e for e in current_errors if e.severity in ['critical', 'high']]
                if results['summary']['failed'] == 0 and len(critical_errors) == 0:
                    print(f"\n{'='*60}")
                    print("  ALL TESTS PASSED - NO CRITICAL ERRORS!")
                    print(f"{'='*60}")
                    break

                if self.iteration < MAX_ITERATIONS:
                    print(f"\n[INFO] Waiting 2 seconds before next iteration...")
                    await asyncio.sleep(2)

        finally:
            await self.teardown()

        print(f"\n{'='*60}")
        print("  FINAL SUMMARY")
        print(f"{'='*60}")
        print(f"  Total Iterations: {self.iteration}")
        print(f"  Total Errors Found: {len(self.all_errors)}")

        # Group errors by type for summary
        error_types = {}
        for e in self.all_errors:
            t = e.error_type
            if t not in error_types:
                error_types[t] = 0
            error_types[t] += 1

        print(f"\n  Errors by Type:")
        for error_type, count in error_types.items():
            print(f"    - {error_type}: {count}")

        final_report = {
            "timestamp": datetime.now().isoformat(),
            "total_iterations": self.iteration,
            "total_errors": len(self.all_errors),
            "errors_by_type": error_types,
            "errors": [e.to_dict() for e in self.all_errors]
        }
        final_path = os.path.join(self.reports_dir, "final-report.json")
        with open(final_path, 'w') as f:
            json.dump(final_report, f, indent=2, default=str)
        print(f"\n  Final Report: {final_path}")
        print(f"{'='*60}\n")


async def main():
    hunter = LiveBugHunter()
    await hunter.run_continuous_loop()


if __name__ == '__main__':
    asyncio.run(main())
