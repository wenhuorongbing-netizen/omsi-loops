import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function measure() {
    const browser = await chromium.launch();
    const context = await browser.newContext({
        recordVideo: { dir: 'output/fixtures/review' }
    });

    const sizes = [
        { name: 'desktop', width: 1280, height: 720 },
        { name: 'tablet', width: 1024, height: 768 },
        { name: 'mobile', width: 390, height: 844 }
    ];

    const results = {};

    for (const size of sizes) {
        const page = await context.newPage();
        await page.setViewportSize({ width: size.width, height: size.height });

        await page.goto('http://127.0.0.1:5500');
        await page.waitForTimeout(1000);

        // Hide tutorial
        await page.evaluate(() => {
            const tutorial = document.getElementById('tutorial');
            if (tutorial) tutorial.style.display = 'none';
        });

        await page.waitForTimeout(2000);

        console.log(`--- Measurements for ${size.name} (${size.width}x${size.height}) ---`);
        results[size.name] = {};

        const getMeasurements = async (selector) => {
            const el = await page.$(selector);
            if (el) {
                const box = await el.boundingBox();
                console.log(`${selector}:`, box);
                results[size.name][selector] = box;
            } else {
                console.log(`${selector} not found`);
                results[size.name][selector] = null;
            }
        };

        await getMeasurements('#commandDeck');
        await getMeasurements('#runVitals');
        await getMeasurements('#main');
        await getMeasurements('#actionsColumn');
        await getMeasurements('#statsColumn');
        await getMeasurements('#townColumn');

        await page.screenshot({ path: `output/fixtures/review/verification_${size.name}.png` });
        await page.waitForTimeout(1000);
        await page.close();
    }

    fs.mkdirSync('output/smoke/runtime', { recursive: true });
    fs.writeFileSync('output/smoke/runtime/layout-measurements.json', JSON.stringify(results, null, 2));

    await context.close();
    await browser.close();
}

measure().catch(err => {
    console.error(err);
    process.exit(1);
});
