---
name: test
agent: CodeActAgent
triggers:
- test
- dotest
- qa
---

# Test — Automated UI QA via Browser + Vision Model

## Goal
Test ALL pages listed in `constants/pageRegistry.ts` on the staging URL.
For each page: screenshot every state, run visual QA, file bugs as GitHub Issues.

## Staging URL
```
https://daterabbit.smartlaunchhub.com
```

## Step 1: Read pages to test
```bash
cat constants/pageRegistry.ts
```

## Step 2: Install Playwright (if not installed)
```bash
pip install playwright -q && python3 -m playwright install chromium --with-deps
```

## Step 3: For each page — run test scenarios

### 3a. Screenshot every state on staging
```python
from playwright.sync_api import sync_playwright

STAGING = "https://daterabbit.smartlaunchhub.com"

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 390, "height": 844})
    for route in routes:
        url = f"{STAGING}{route}"
        page.goto(url, wait_until="networkidle", timeout=15000)
        page.wait_for_timeout(1000)
        page.screenshot(path=f"/tmp/qa_{route.replace('/', '_')}.png", full_page=False)
    browser.close()
```

### 3b. Run visual QA
```bash
python3 scripts/qa-vision.py /tmp/qa_screenshot.png --json
```

### 3c. Run testScenarios from pageRegistry (if defined)

## Step 4: File bugs as GitHub Issues
```bash
gh issue create \
  --repo serter2069/date-rabbit \
  --title "bug: [PageName] — [brief description]" \
  --body "**Page:** /route
**Bug:** exact description from vision model
**Steps to reproduce:**
1. Open staging URL
2. Navigate to page
3. Observe issue" \
  --label "bug,oh:ready"
```
Only CLEAR visual bugs. Check existing issues first.

## Step 5: Summary report
```
=== QA SUMMARY ===
Pages tested: N / Screenshots: N / Bugs found: N / Issues created: N
VERDICT: PASS / FAIL
```

## RULES
1. Mobile viewport 390x844 only
2. Wait for network idle
3. Batch then file all issues
4. No duplicate issues
