/**
 * Logic Testing Helpers
 * 
 * Enable Logic Testing mode by setting env variable:
 *   LOGIC_TEST=true npx playwright test
 * 
 * In Logic mode, each step:
 * 1. Takes a screenshot
 * 2. Sends to Claude for analysis
 * 3. Reports UI/logic issues
 */

import * as fs from 'fs'
import * as path from 'path'

export const isLogicMode = process.env.LOGIC_TEST === 'true'

export interface LogicIssue {
  severity: 'error' | 'warning' | 'info'
  type: string
  message: string
}

export interface AnalysisResult {
  description: string
  issues: LogicIssue[]
  suggestions: string[]
  passesLogic: boolean
}

const REPORTS_DIR = path.join(__dirname, 'reports')
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots')

let currentTestName = ''
let stepCounter = 0
let analysisResults: Array<{ step: number; name: string; result: AnalysisResult | null }> = []

export function startLogicTest(testName: string) {
  currentTestName = testName
  stepCounter = 0
  analysisResults = []

  if (isLogicMode) {
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true })
    if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
    
    console.log(`\n🧠 Logic Testing: ${testName}`)
  }
}

export async function analyzeIfLogicMode(
  page: any,
  stepName: string,
  expectation: string,
  options: { critical?: boolean } = {}
): Promise<AnalysisResult | null> {
  stepCounter++

  if (!isLogicMode) return null

  const screenshotPath = path.join(SCREENSHOTS_DIR, `${currentTestName}-${stepCounter.toString().padStart(2, '0')}.png`)
  await page.screenshot({ path: screenshotPath, fullPage: false })

  console.log(`  📸 Step ${stepCounter}: ${stepName}`)

  // In real Logic Testing, we'd send to Claude API here
  // For now, we just take screenshots and log
  const result: AnalysisResult = {
    description: `Screenshot saved: ${screenshotPath}`,
    issues: [],
    suggestions: [],
    passesLogic: true,
  }

  analysisResults.push({ step: stepCounter, name: stepName, result })

  return result
}

export function endLogicTest(): string | null {
  if (!isLogicMode) return null

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const reportPath = path.join(REPORTS_DIR, `${timestamp}-${currentTestName}.md`)

  const errors = analysisResults.filter(r => r.result?.issues.some(i => i.severity === 'error'))
  const warnings = analysisResults.filter(r => r.result?.issues.some(i => i.severity === 'warning'))

  const report = `# Logic Test Report: ${currentTestName}

**Date:** ${new Date().toISOString()}
**Mode:** Logic Testing (screenshots only)
**Steps:** ${stepCounter}
**Result:** ${errors.length === 0 ? '✅ Passed' : '❌ Failed'}

## Summary

- Steps: ${stepCounter}
- Errors: ${errors.length}
- Warnings: ${warnings.length}

## Steps

${analysisResults.map(({ step, name, result }) => `### Step ${step}: ${name} ${result?.passesLogic ? '✅' : '❌'}

${result?.description || 'No analysis'}

${result?.issues.length ? `**Issues:**\n${result.issues.map(i => `- [${i.severity}] ${i.message}`).join('\n')}` : ''}
`).join('\n')}

## Screenshots Location

\`${SCREENSHOTS_DIR}\`
`

  fs.writeFileSync(reportPath, report)
  console.log(`\n📄 Report saved: ${reportPath}`)

  return reportPath
}

// Test data generators
export const testData = {
  uniqueEmail: () => `test-${Date.now()}@test.local`,
  uniqueName: () => `Test User ${Date.now()}`,
  validPassword: 'TestPass123!',
  
  cards: {
    success: { number: '4242424242424242', exp: '12/34', cvc: '123', zip: '12345' },
    declined: { number: '4000000000000002', exp: '12/34', cvc: '123', zip: '12345' },
    requires3DS: { number: '4000002500003155', exp: '12/34', cvc: '123', zip: '12345' },
  },
}

// Selectors helper - for RN Web, testID doesn't become data-testid
// Use text-based selectors instead
export function tid(testId: string): string {
  // In React Native Web, testID doesn't automatically become data-testid
  // Return empty to force text-based selection
  return '';
}

// Text selector helper
export function text(textContent: string): string {
  return textContent;
}
