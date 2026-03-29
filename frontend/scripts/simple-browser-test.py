#!/usr/bin/env python3
"""
Simple browser test script for AstroVerse
Uses Playwright directly without complex setup
"""

import asyncio
from playwright.async_api import async_playwright
from datetime import datetime
import json
import os

BASE_URL = os.getenv('BASE_URL', 'http://localhost:3000')
SCREENSHOTS_DIR = 'screenshots'
RESULTS_DIR = 'test-results'


class SimpleBrowserTester:
    def __init__(self):
        self.browser = None
        self.page = None
        self.results = []

    async def setup(self):
        """Setup browser and directories"""
        os.makedirs(self.screenshots_dir, exist_ok=True)
        os.makedirs(self.results_dir, exist_ok=True)

        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(headless=False)
        context = await self.browser.new_context(viewport={'width': 1280, 'height': 720})
        self.page = await context.new_page()

    async def teardown(self):
        """Cleanup browser"""
        if self.browser:
            await self.browser.close()

    async def take_screenshot(self, name: str) -> None:
        """Take a screenshot and save to file"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        screenshot_path = os.path.join(self.screenshots_dir, f'{name}-{timestamp}.png')
        await self.page.screenshot(path=screenshot_path)

    async def test_pages(self) -> list[dict]:
        """Test all main pages"""
        results = []
        pages = [
            ('Home', f'{BASE_URL}/'),
            ('Login', f'{BASE_URL}/login'),
            ('Register', f'{BASE_URL}/register'),
        ]

        for page_name, page_url in pages:
            result = {
                'name': f'{page_name} Page Test',
                'timestamp': datetime.now().isoformat(),
                'status': 'pending',
                'details': {}
            }
            print(f"  Testing: {page_name}...")

            try:
                await self.page.goto(page_url)
                await self.page.wait_for_load_state('networkidle')
                await self.take_screenshot(f'{page_name.lower().replace(" ", "-")}')

                result['details']['title'] = await self.page.title()
                result['details']['url'] = self.page.url
                result['details']['screenshot'] = os.path.basename(await self.take_screenshot.__self__)

                result['status'] = 'passed'
                print(f"  [OK] {page_name} - passed")

            except Exception as e:
                result['status'] = 'failed'
                result['error'] = str(e)
                print(f"  [FAIL] {page_name} - failed: {e}")

            self.results.append(result)

        return results

    async def test_navigation(self) -> dict:
        """Test navigation between pages"""
        result = {
            'name': 'Navigation Test',
            'timestamp': datetime.now().isoformat(),
            'status': 'pending',
            'details': {}
        }
        print("  Testing navigation...")

        try:
                # Start at home
                await self.page.goto(BASE_URL)
                await self.page.wait_for_load_state('networkidle')

                # Find navigation links
                nav_links = await self.page.locator('nav a, [role="navigation"] a').count()
                result['details']['nav_links_found'] = nav_links

                # Try clicking login link if exists
                login_link = self.page.locator('a[href*="login"], a:has-text("Login"), a:has-text("Sign In")').first()
                if await login_link.count() > 0:
                    await login_link.click()
                    await self.page.wait_for_load_state('networkidle')
                    result['details']['navigated_to_login'] = self.page.url
                    await self.take_screenshot('navigation-login')

                result['status'] = 'passed'
                print("  [OK] Navigation Test - passed")
            else:
                result['status'] = 'passed'
                result['details']['login_link_not_found'] = True
                print("  [OK] Navigation Test - passed (no login link found)")

        except Exception as e:
            result['status'] = 'failed'
            result['error'] = str(e)
            print(f"  [FAIL] Navigation Test - failed: {e}")

        self.results.append(result)
        return result

    async def test_forms(self) -> dict:
        """Test form functionality"""
        result = {
            'name': 'Forms Test',
            'timestamp': datetime.now().isoformat(),
            'status': 'pending',
            'details': {}
        }
        print("  Testing forms...")

        try:
                # Go to login page
                await self.page.goto(f'{BASE_URL}/login')
                await self.page.wait_for_load_state('networkidle')

                # Find form elements
                email_input = self.page.locator('input[type="email"], input[name="email"]').first()
                password_input = self.page.locator('input[type="password"], input[name="password"]').first()
                submit_btn = self.page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first()

                email_found = await email_input.count() > 0
                password_found = await password_input.count() > 0
                submit_found = await submit_btn.count() > 0

                result['details']['email_input_found'] = email_found
                result['details']['password_input_found'] = password_found
                result['details']['submit_button_found'] = submit_found

                # Fill form
                if email_found:
                    await email_input.fill('test@example.com')
                if password_found:
                    await password_input.fill('TestPassword123!')
                await self.take_screenshot('form-filled')

                # Clear form
                if email_found:
                    await email_input.clear()
                if password_found:
                    await password_input.clear()
                await self.take_screenshot('form-empty')

                result['status'] = 'passed'
                print("  [OK] Forms Test - passed")

        except Exception as e:
            result['status'] = 'failed'
            result['error'] = str(e)
            print(f"  [FAIL] Forms Test - failed: {e}")

        self.results.append(result)
        return result

    async def run_all_tests(self):
        """Run all tests"""
        print("\n" + "=" * 60)
        print("  AstroVerse Browser Testing Suite")
        print("=" * 60)
        print(f"  Base URL: {BASE_URL}")
        print(f"  Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)

        print("\n[PAGES] Testing Pages...")
        await self.test_pages()
        print("\n[NAVIGATION] Testing Navigation...")
        await self.test_navigation()
        print("\n[FORMS] Testing Forms...")
        await self.test_forms()

        print("\n" + "=" * 60)
        print("  TEST SUMMARY")
        print("=" * 60)
        print(f"  Total Tests: {len(self.results)}")
        passed = sum(1 for r in self.results if r['status'] == 'passed')
        failed = sum(1 for r in self.results if r['status'] == 'failed')
        print(f"  [OK] Passed: {passed}")
        print(f"  [FAIL] Failed: {failed}")
        print("=" * 60)

        # Save results
        json_path = os.path.join(self.results_dir, 'test-results.json')
        with open(json_path, 'w') as f:
            json.dump(self.results, f, indent=2)
        print(f"  JSON Report: {json_path}")

        # Generate HTML report
        html_content = self._generate_html_report()
        html_path = os.path.join(self.results_dir, 'test-report.html')
        with open(html_path, 'w') as f:
            f.write(html_content)
        print(f"  HTML Report: {html_path}")
        print("=" * 60 + "\n")

    def _generate_html_report(self) -> str:
        """Generate HTML report"""
        html = "<html><head><title>Test Report</title>"
        html += "<style>body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }</style>"
        html += "<style>.test-card { border: 1px solid #ddd; margin: 10px; padding: 15px; border-radius: 4px; }</style>"
        html += "<style>.passed { background: #d4eddc; }</style>"
        html += "<style>.failed { background: #ffcccc; }</style>"
        html += "<style>h1 { color: #333; }</style>"
        html += "<style>h2 { color: #666; }</style>"
        html += "<style>pre { margin: 0; color: #666; }</style>"
        html += "</head><body>"
        html += f"<h1>AstroVerse Browser Test Report</h1>"
        html += f"<p>Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>"
        html += f"<p>Base URL: {BASE_URL}</p>"
        html += "<div class='summary'>"
        for result in self.results:
            color = '#10B981' if result['status'] == 'passed' else '#ffcccc'
            html += f"<div class='test-card' style='background: {color}; padding: 10px; margin: 5px;'>"
            html += f"<h3>{result['name']}</h3>"
            html += f"<p>Status: {result['status']}</p>"
            html += f"<p>Timestamp: {result['timestamp']}</p>"
            if result.get('details'):
                html += "<h4>Details:</h4>"
                for k, v in result['details'].items():
                    html += f"<p><strong>{k}:</strong> {v}</p>"
            if result.get('error'):
                html += f"<p style='color: red;'>Error: {result['error']}</p>"
            html += "</div>"
        html += "</body></html>"
        return html


async def main():
    """Main entry point"""
    tester = SimpleBrowserTester()
    await tester.run_all_tests()


if __name__ == '__main__':
    asyncio.run(main())
