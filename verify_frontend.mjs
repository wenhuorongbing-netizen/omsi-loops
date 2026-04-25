import { chromium } from "playwright";
import fs from "fs";

(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({
        recordVideo: { dir: "output/videos" }
    });

    for (const viewport of [
        { width: 1280, height: 720 },
        { width: 1024, height: 768 },
        { width: 390, height: 844 }
    ]) {
        const page = await context.newPage();
        await page.setViewportSize(viewport);

        await page.goto("http://127.0.0.1:5500");
        await page.waitForTimeout(4000); // Wait for initialization

        // hide tutorial
        await page.evaluate(() => {
            const tutorial = document.getElementById('tutorial');
            if (tutorial) tutorial.style.display = 'none';
        });

        await page.screenshot({ path: `output/screenshot_${viewport.width}x${viewport.height}.png` });

        // click some actions and test tooltip
        await page.hover('.actionOrTravelContainer');
        await page.waitForTimeout(500);

        await page.close();
    }

    await context.close();
    await browser.close();
})();
