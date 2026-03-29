#!/usr/bin/env python3
"""
AstroVerse Live Browser Test
Uses Playwright directly for browser automation testing
"""

import asyncio
from playwright.async_api import async_playwright
from datetime import datetime
import json
import os

BASE_URL = "http://localhost:3000"
SCREENSHOTS_DIR = "screenshots"
RESULTS_DIR = "test-results"

async def main():
    # Create directories
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
    os.makedirs(RESULTS_DIR, exist_ok=True)

    results = []

    print("\n" + "=" * 60)
    print("  AstroVerse Live Browser Testing")
    print("=" * 60)
    print(f"  Base URL: {BASE_URL}")
    print(f"  Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={'width': 1280, 'height': 720})
        page = await context.new_page()

        # Test 1: Home Page
        print("\n[TEST 1] Testing Home Page...")
        try:
            await page.goto(BASE_URL)
            await page.wait_for_load_state('networkidle')
            title = await page.title()
            screenshot = os.path.join(SCREENSHOTS_DIR, '01-home.png')
            await page.screenshot(path=screenshot)
            results.append({
                'name': 'Home Page',
                'status': 'passed',
                'title': title,
                'url': page.url,
                'screenshot': screenshot
            })
            print(f"  [OK] Title: {title}")
        except Exception as e:
            results.append({'name': 'Home Page', 'status': 'failed', 'error': str(e)})
            print(f"  [FAIL] {e}")

        # Test 2: Login Page
        print("\n[TEST 2] Testing Login Page...")
        try:
            await page.goto(f"{BASE_URL}/login")
            await page.wait_for_load_state('networkidle')
            title = await page.title()
            screenshot = os.path.join(SCREENSHOTS_DIR, '02-login.png')
            await page.screenshot(path=screenshot)
            results.append({
                'name': 'Login Page',
                'status': 'passed',
                'title': title,
                'url': page.url,
                'screenshot': screenshot
            })
            print(f"  [OK] Title: {title}")
        except Exception as e:
            results.append({'name': 'Login Page', 'status': 'failed', 'error': str(e)})
            print(f"  [FAIL] {e}")

        # Test 3: Login Form Interaction
        print("\n[TEST 3] Testing Login Form...")
        try:
            await page.goto(f"{BASE_URL}/login")
            await page.wait_for_load_state('networkidle')

            # Find form elements
            email = page.locator('input[type="email"], input[name="email"]').first
            password = page.locator('input[type="password"]').first
            submit = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign")').first

            email_found = await email.count() > 0
            password_found = await password.count() > 0
            submit_found = await submit.count() > 0

            if email_found:
                await email.fill('test@example.com')
            if password_found:
                await password.fill('TestPassword123!')

            screenshot = os.path.join(SCREENSHOTS_DIR, '03-login-form.png')
            await page.screenshot(path=screenshot)

            results.append({
                'name': 'Login Form',
                'status': 'passed',
                'email_input': email_found,
                'password_input': password_found,
                'submit_button': submit_found,
                'screenshot': screenshot
            })
            print(f"  [OK] Email input: {email_found}, Password input: {password_found}")
        except Exception as e:
            results.append({'name': 'Login Form', 'status': 'failed', 'error': str(e)})
            print(f"  [FAIL] {e}")

        # Test 4: Register Page
        print("\n[TEST 4] Testing Register Page...")
        try:
            await page.goto(f"{BASE_URL}/register")
            await page.wait_for_load_state('networkidle')
            title = await page.title()
            screenshot = os.path.join(SCREENSHOTS_DIR, '04-register.png')
            await page.screenshot(path=screenshot)
            results.append({
                'name': 'Register Page',
                'status': 'passed',
                'title': title,
                'url': page.url,
                'screenshot': screenshot
            })
            print(f"  [OK] Title: {title}")
        except Exception as e:
            results.append({'name': 'Register Page', 'status': 'failed', 'error': str(e)})
            print(f"  [FAIL] {e}")

        # Test 5: Navigation Test
        print("\n[TEST 5] Testing Navigation...")
        try:
            await page.goto(BASE_URL)
            await page.wait_for_load_state('networkidle')

            # Check for nav links
            nav_links = await page.locator('nav a, [role="navigation"] a').count()

            # Try clicking login link
            login_link = page.locator('a[href*="login"], a:has-text("Login"), a:has-text("Sign In")').first
            if await login_link.count() > 0:
                await login_link.click()
                await page.wait_for_load_state('networkidle')
                navigated = page.url
            else:
                navigated = "No login link found"

            screenshot = os.path.join(SCREENSHOTS_DIR, '05-navigation.png')
            await page.screenshot(path=screenshot)

            results.append({
                'name': 'Navigation',
                'status': 'passed',
                'nav_links_count': nav_links,
                'navigated_to': navigated,
                'screenshot': screenshot
            })
            print(f"  [OK] Nav links: {nav_links}")
        except Exception as e:
            results.append({'name': 'Navigation', 'status': 'failed', 'error': str(e)})
            print(f"  [FAIL] {e}")

        # Test 6: Responsive Design (Mobile)
        print("\n[TEST 6] Testing Mobile Viewport...")
        try:
            await page.set_viewport_size({'width': 375, 'height': 667})
            await page.goto(BASE_URL)
            await page.wait_for_load_state('networkidle')
            screenshot = os.path.join(SCREENSHOTS_DIR, '06-mobile.png')
            await page.screenshot(path=screenshot)
            results.append({
                'name': 'Mobile Viewport (375x667)',
                'status': 'passed',
                'screenshot': screenshot
            })
            print(f"  [OK] Mobile viewport tested")
        except Exception as e:
            results.append({'name': 'Mobile Viewport', 'status': 'failed', 'error': str(e)})
            print(f"  [FAIL] {e}")

        # Reset viewport
        await page.set_viewport_size({'width': 1280, 'height': 720})

        # Test 7: Accessibility Check
        print("\n[TEST 7] Basic Accessibility Check...")
        try:
            await page.goto(BASE_URL)
            await page.wait_for_load_state('networkidle')

            # Check for basic accessibility
            lang = await page.locator('html').get_attribute('lang')
            title = await page.title()
            h1_count = await page.locator('h1').count()

            # Check images for alt
            images = await page.locator('img').all()
            images_without_alt = 0
            for img in images:
                alt = await img.get_attribute('alt')
                if alt is None:
                    images_without_alt += 1

            screenshot = os.path.join(SCREENSHOTS_DIR, '07-accessibility.png')
            await page.screenshot(path=screenshot)

            results.append({
                'name': 'Accessibility Check',
                'status': 'passed' if images_without_alt == 0 else 'warning',
                'html_lang': lang,
                'page_title': title,
                'h1_count': h1_count,
                'images_without_alt': images_without_alt,
                'screenshot': screenshot
            })
            print(f"  [OK] Lang: {lang}, H1 count: {h1_count}, Images without alt: {images_without_alt}")
        except Exception as e:
            results.append({'name': 'Accessibility Check', 'status': 'failed', 'error': str(e)})
            print(f"  [FAIL] {e}")

        # Close browser
        await browser.close()

    # Print summary
    print("\n" + "=" * 60)
    print("  TEST SUMMARY")
    print("=" * 60)
    passed = sum(1 for r in results if r['status'] == 'passed')
    failed = sum(1 for r in results if r['status'] == 'failed')
    warnings = sum(1 for r in results if r['status'] == 'warning')
    print(f"  Total Tests: {len(results)}")
    print(f"  [OK] Passed: {passed}")
    print(f"  [FAIL] Failed: {failed}")
    print(f"  [WARN] Warnings: {warnings}")
    print("=" * 60)

    # Save results
    json_path = os.path.join(RESULTS_DIR, 'browser-test-results.json')
    with open(json_path, 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'base_url': BASE_URL,
            'total': len(results),
            'passed': passed,
            'failed': failed,
            'warnings': warnings,
            'results': results
        }, f, indent=2)
    print(f"  Results saved to: {json_path}")
    print("=" * 60 + "\n")

if __name__ == '__main__':
    asyncio.run(main())
