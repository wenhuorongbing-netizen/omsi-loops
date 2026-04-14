import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const outputDir = 'C:/Users/Jack/Documents/GitHub/omsi-loops/output/gui-qol-p1-polish';
fs.mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
const consoleErrors = [];
page.on('pageerror', error => consoleErrors.push({ type: 'pageerror', text: String(error) }));
page.on('console', message => {
  if (message.type() === 'error') {
    consoleErrors.push({ type: 'console', text: message.text() });
  }
});

await page.goto('http://127.0.0.1:5500/?lg=zh-CN', { waitUntil: 'networkidle' });
await page.waitForSelector('#townBrowserTools');
if (await page.locator('#tutorial button').count()) {
  await page.locator('#tutorial button').click();
  await page.waitForTimeout(100);
}

const townTools = page.locator('#townBrowserTools');
await townTools.screenshot({ path: path.join(outputDir, 'town-summary-categories.png') });
const categorySummary = await page.$$eval('#townSummaryCategoryRow .townSummaryCategoryPill', elements => elements.map(element => ({
  isEmpty: element.classList.contains('is-empty'),
  count: Number(element.querySelector('.townSummaryCategoryCount')?.textContent ?? '0'),
  title: element.getAttribute('title') ?? '',
})));

await page.locator('#containerWander').click();
await page.waitForTimeout(150);
const inspectorTabAfterAction = await page.$eval('.readingSubTab.is-active', element => element.id);

await page.locator('#loadoutManagerToggle').click();
await page.locator('#load1').click();
await page.waitForTimeout(100);
await page.locator('#saveLoadoutButton').click();
await page.waitForTimeout(150);
await page.locator('#loadoutManagerPanel').screenshot({ path: path.join(outputDir, 'loadout-slot-times.png') });
const loadoutSlotMetrics = await page.$$eval('#loadoutSlotGrid .loadoutSlotButton', elements => elements.slice(0, 3).map(element => ({
  lineCount: element.innerText.split(/\n+/).filter(Boolean).length,
  savedLineLength: (element.querySelector('.loadoutSlotSaved')?.textContent ?? '').trim().length,
  hasSavedLine: !!element.querySelector('.loadoutSlotSaved'),
})));

await page.locator('#readingTabChronicle').click();
await page.waitForTimeout(100);
await page.locator('#readingShell').screenshot({ path: path.join(outputDir, 'reading-tab-contrast.png') });
const activeTabStyles = await page.$eval('#readingTabChronicle', element => {
  const styles = getComputedStyle(element);
  return {
    color: styles.color,
    backgroundColor: styles.backgroundColor,
    borderColor: styles.borderColor,
  };
});

await page.locator('#chronicleTabStories').click();
await page.waitForTimeout(100);
await page.locator('#chronicleStoriesPane').screenshot({ path: path.join(outputDir, 'chronicle-stories.png') });
const storyMetrics = await page.evaluate(() => ({
  sectionCount: document.querySelectorAll('.chronicleStorySection').length,
  cardCount: document.querySelectorAll('.chronicleStoryCard').length,
  unreadBadgeCount: document.querySelectorAll('.chronicleStoryUnread').length,
  topLineCount: document.querySelectorAll('.chronicleStoryTopline').length,
  metaChipCount: document.querySelectorAll('.chronicleStoryMetaChip').length,
}));

const results = {
  categoryPillCount: categorySummary.length,
  categoryCounts: categorySummary.map(item => item.count),
  categoryNonZeroCount: categorySummary.filter(item => item.count > 0).length,
  categoryTitleCount: categorySummary.filter(item => item.title.length > 0).length,
  inspectorTabAfterAction,
  loadoutSlotMetrics,
  activeTabStyles,
  storyMetrics,
  consoleErrors,
};
fs.writeFileSync(path.join(outputDir, 'results.json'), JSON.stringify(results, null, 2), 'utf8');
await browser.close();