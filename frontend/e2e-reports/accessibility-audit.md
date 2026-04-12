# Accessibility Audit Report

**Date:** 2026-04-04T11:18:42.779Z
**WCAG Level:** 2.1 AA
**Pages scanned:** 6
**Total findings:** 18

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| Serious | 10 |
| Moderate | 8 |
| Minor | 0 |

## Serious Violations (10)

### [Landing] document-title

- **WCAG:** wcag2a, wcag242
- **Description:** Ensure each HTML document contains a non-empty <title> element
- **Suggested fix:** Add a meaningful <title> element inside <head>.
- **Help:** https://dequeuniversity.com/rules/axe/4.11/document-title?application=playwright
- **Elements affected:** 1

**Affected elements:**

- `html`
  ```html
  <html><head></head><body></body></html>
  ```

### [Landing] html-has-lang

- **WCAG:** wcag2a, wcag311
- **Description:** Ensure every HTML document has a lang attribute
- **Suggested fix:** Add a lang attribute to the <html> element (e.g., lang="en").
- **Help:** https://dequeuniversity.com/rules/axe/4.11/html-has-lang?application=playwright
- **Elements affected:** 1

**Affected elements:**

- `html`
  ```html
  <html><head></head><body></body></html>
  ```

### [Login] document-title

- **WCAG:** wcag2a, wcag242
- **Description:** Ensure each HTML document contains a non-empty <title> element
- **Suggested fix:** Add a meaningful <title> element inside <head>.
- **Help:** https://dequeuniversity.com/rules/axe/4.11/document-title?application=playwright
- **Elements affected:** 1

**Affected elements:**

- `html`
  ```html
  <html><head></head><body></body></html>
  ```

### [Login] html-has-lang

- **WCAG:** wcag2a, wcag311
- **Description:** Ensure every HTML document has a lang attribute
- **Suggested fix:** Add a lang attribute to the <html> element (e.g., lang="en").
- **Help:** https://dequeuniversity.com/rules/axe/4.11/html-has-lang?application=playwright
- **Elements affected:** 1

**Affected elements:**

- `html`
  ```html
  <html><head></head><body></body></html>
  ```

### [Register] document-title

- **WCAG:** wcag2a, wcag242
- **Description:** Ensure each HTML document contains a non-empty <title> element
- **Suggested fix:** Add a meaningful <title> element inside <head>.
- **Help:** https://dequeuniversity.com/rules/axe/4.11/document-title?application=playwright
- **Elements affected:** 1

**Affected elements:**

- `html`
  ```html
  <html><head></head><body></body></html>
  ```

### [Register] html-has-lang

- **WCAG:** wcag2a, wcag311
- **Description:** Ensure every HTML document has a lang attribute
- **Suggested fix:** Add a lang attribute to the <html> element (e.g., lang="en").
- **Help:** https://dequeuniversity.com/rules/axe/4.11/html-has-lang?application=playwright
- **Elements affected:** 1

**Affected elements:**

- `html`
  ```html
  <html><head></head><body></body></html>
  ```

### [Forgot Password] document-title

- **WCAG:** wcag2a, wcag242
- **Description:** Ensure each HTML document contains a non-empty <title> element
- **Suggested fix:** Add a meaningful <title> element inside <head>.
- **Help:** https://dequeuniversity.com/rules/axe/4.11/document-title?application=playwright
- **Elements affected:** 1

**Affected elements:**

- `html`
  ```html
  <html><head></head><body></body></html>
  ```

### [Forgot Password] html-has-lang

- **WCAG:** wcag2a, wcag311
- **Description:** Ensure every HTML document has a lang attribute
- **Suggested fix:** Add a lang attribute to the <html> element (e.g., lang="en").
- **Help:** https://dequeuniversity.com/rules/axe/4.11/html-has-lang?application=playwright
- **Elements affected:** 1

**Affected elements:**

- `html`
  ```html
  <html><head></head><body></body></html>
  ```

### [Landing (contrast)] color-contrast

- **WCAG:** wcag2aa, wcag143
- **Description:** Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Suggested fix:** Increase foreground/background contrast to at least 4.5:1 for normal text or 3:1 for large text.
- **Help:** https://dequeuniversity.com/rules/axe/4.11/color-contrast?application=playwright
- **Elements affected:** 3

**Affected elements:**

- `.hover\:border-white\/10.rounded-2xl.p-8:nth-child(1) > .items-baseline.mb-6.flex > .ml-2.text-slate-500`
  ```html
  <span class="text-slate-500 ml-2">/forever</span>
  ```
- `.border-primary > .items-baseline.mb-6.flex > .ml-2.text-slate-500`
  ```html
  <span class="text-slate-500 ml-2">/mo</span>
  ```
- `.hover\:border-white\/10.rounded-2xl.p-8:nth-child(3) > .items-baseline.mb-6.flex > .ml-2.text-slate-500`
  ```html
  <span class="text-slate-500 ml-2">/mo</span>
  ```

### [Forgot Password (contrast)] color-contrast

- **WCAG:** wcag2aa, wcag143
- **Description:** Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Suggested fix:** Increase foreground/background contrast to at least 4.5:1 for normal text or 3:1 for large text.
- **Help:** https://dequeuniversity.com/rules/axe/4.11/color-contrast?application=playwright
- **Elements affected:** 1

**Affected elements:**

- `.text-primary`
  ```html
  <a class="text-primary hover:text-primary-light font-medium" href="/login">Sign In</a>
  ```

## Moderate Violations (8)

### [Landing] landmark-one-main

- **WCAG:** best-practice
- **Description:** Ensure the document has a main landmark
- **Suggested fix:** Add a <main> or role="main" landmark to the page.
- **Help:** https://dequeuniversity.com/rules/axe/4.11/landmark-one-main?application=playwright
- **Elements affected:** 1

**Affected elements:**

- `html`
  ```html
  <html><head></head><body></body></html>
  ```

### [Landing] page-has-heading-one

- **WCAG:** best-practice
- **Description:** Ensure that the page, or at least one of its frames contains a level-one heading
- **Suggested fix:** Add an <h1> element as the primary page heading.
- **Help:** https://dequeuniversity.com/rules/axe/4.11/page-has-heading-one?application=playwright
- **Elements affected:** 1

**Affected elements:**

- `html`
  ```html
  <html><head></head><body></body></html>
  ```

### [Login] landmark-one-main

- **WCAG:** best-practice
- **Description:** Ensure the document has a main landmark
- **Suggested fix:** Add a <main> or role="main" landmark to the page.
- **Help:** https://dequeuniversity.com/rules/axe/4.11/landmark-one-main?application=playwright
- **Elements affected:** 1

**Affected elements:**

- `html`
  ```html
  <html><head></head><body></body></html>
  ```

### [Login] page-has-heading-one

- **WCAG:** best-practice
- **Description:** Ensure that the page, or at least one of its frames contains a level-one heading
- **Suggested fix:** Add an <h1> element as the primary page heading.
- **Help:** https://dequeuniversity.com/rules/axe/4.11/page-has-heading-one?application=playwright
- **Elements affected:** 1

**Affected elements:**

- `html`
  ```html
  <html><head></head><body></body></html>
  ```

### [Register] landmark-one-main

- **WCAG:** best-practice
- **Description:** Ensure the document has a main landmark
- **Suggested fix:** Add a <main> or role="main" landmark to the page.
- **Help:** https://dequeuniversity.com/rules/axe/4.11/landmark-one-main?application=playwright
- **Elements affected:** 1

**Affected elements:**

- `html`
  ```html
  <html><head></head><body></body></html>
  ```

### [Register] page-has-heading-one

- **WCAG:** best-practice
- **Description:** Ensure that the page, or at least one of its frames contains a level-one heading
- **Suggested fix:** Add an <h1> element as the primary page heading.
- **Help:** https://dequeuniversity.com/rules/axe/4.11/page-has-heading-one?application=playwright
- **Elements affected:** 1

**Affected elements:**

- `html`
  ```html
  <html><head></head><body></body></html>
  ```

### [Forgot Password] landmark-one-main

- **WCAG:** best-practice
- **Description:** Ensure the document has a main landmark
- **Suggested fix:** Add a <main> or role="main" landmark to the page.
- **Help:** https://dequeuniversity.com/rules/axe/4.11/landmark-one-main?application=playwright
- **Elements affected:** 1

**Affected elements:**

- `html`
  ```html
  <html><head></head><body></body></html>
  ```

### [Forgot Password] page-has-heading-one

- **WCAG:** best-practice
- **Description:** Ensure that the page, or at least one of its frames contains a level-one heading
- **Suggested fix:** Add an <h1> element as the primary page heading.
- **Help:** https://dequeuniversity.com/rules/axe/4.11/page-has-heading-one?application=playwright
- **Elements affected:** 1

**Affected elements:**

- `html`
  ```html
  <html><head></head><body></body></html>
  ```

---
*Generated by CHI-49 accessibility pre-audit. Feed findings into [CHI-44](/CHI/issues/CHI-44) for remediation.*