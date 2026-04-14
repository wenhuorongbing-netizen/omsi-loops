const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async() => {
  const outDir = path.resolve('output/gui-qol-p3-closeout');
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const errors = [];
  page.on('pageerror', error => errors.push({ type: 'pageerror', message: String(error) }));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push({ type: 'console', message: msg.text() });
  });

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  const tutorialButton = page.locator('#tutorial button');
  if (await tutorialButton.count()) await tutorialButton.click();
  await page.waitForTimeout(300);

  await page.click('#optionsMenu');
  await page.click('#optionsHotkeyReferenceButton');
  await page.waitForTimeout(150);
  const optionsPanel = page.locator('#hotkeyReferencePanelOptions');
  const optionsHotkeyState = {
    visible: await optionsPanel.isVisible(),
    rowCount: await optionsPanel.locator('.hotkeyReferenceRow').count(),
    expanded: await page.locator('#optionsHotkeyReferenceButton').getAttribute('aria-expanded'),
  };
  await page.screenshot({ path: path.join(outDir, 'hotkeys-options-panel.png') });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);

  await page.click('#quickSettingsMenu');
  await page.click('#quickSettingHotkeyReference');
  await page.waitForTimeout(150);
  const quickPanel = page.locator('#hotkeyReferencePanelQuick');
  const quickStatusBefore = await quickPanel.locator('.hotkeyReferenceStatus').getAttribute('class');
  await page.screenshot({ path: path.join(outDir, 'hotkeys-quick-panel.png') });
  await page.click('#quickSettingHotkeys');
  await page.waitForTimeout(150);
  const quickStatusAfterDisable = await quickPanel.locator('.hotkeyReferenceStatus').getAttribute('class');
  await page.screenshot({ path: path.join(outDir, 'hotkeys-quick-panel-disabled.png') });
  await page.click('#quickSettingHotkeys');
  await page.waitForTimeout(150);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);

  await page.evaluate(() => setOption('simpleTooltips', false, true));
  await page.waitForTimeout(150);
  await page.hover('#containerWander');
  await page.waitForTimeout(150);
  const offState = await page.evaluate(() => {
    const root = document.querySelector('#containerWander .showthis.when-unlocked');
    const advanced = root?.querySelector('.tooltipAdvanced');
    const hint = root?.querySelector('.tooltipSimpleHint');
    return {
      advancedDisplay: advanced ? getComputedStyle(advanced).display : null,
      hintDisplay: hint ? getComputedStyle(hint).display : null,
    };
  });
  await page.screenshot({ path: path.join(outDir, 'simple-tooltips-off.png') });

  await page.click('#quickSettingsMenu');
  await page.click('#quickSettingSimpleTooltips');
  await page.waitForTimeout(150);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
  await page.hover('#containerWander');
  await page.waitForTimeout(150);
  const onState = await page.evaluate(() => {
    const root = document.querySelector('#containerWander .showthis.when-unlocked');
    const advanced = root?.querySelector('.tooltipAdvanced');
    const hint = root?.querySelector('.tooltipSimpleHint');
    const checkbox = document.getElementById('simpleTooltipsInput');
    return {
      advancedDisplay: advanced ? getComputedStyle(advanced).display : null,
      hintDisplay: hint ? getComputedStyle(hint).display : null,
      optionChecked: checkbox instanceof HTMLInputElement ? checkbox.checked : null,
      bodyClass: document.documentElement.classList.contains('use-simple-tooltips'),
      quickSettingPressed: document.getElementById('quickSettingSimpleTooltips')?.getAttribute('aria-pressed') || null,
    };
  });
  await page.screenshot({ path: path.join(outDir, 'simple-tooltips-on.png') });

  const results = {
    optionsHotkeyPanel: optionsHotkeyState,
    quickHotkeyPanel: {
      visible: true,
      statusBefore: quickStatusBefore,
      statusAfterDisable: quickStatusAfterDisable,
    },
    simpleTooltips: {
      off: offState,
      on: onState,
    },
    errors,
  };
  fs.writeFileSync(path.join(outDir, 'results.json'), JSON.stringify(results, null, 2));
  await browser.close();
})();
