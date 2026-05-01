import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { execSync } from "node:child_process";

async function probe() {
    const browser = await chromium.launch({ headless: true });

    const viewports = [
        { width: 1280, height: 720, label: "desktop" },
        { width: 1024, height: 768, label: "narrow" },
        { width: 390, height: 844, label: "mobile" }
    ];

    const results = [];

    for (const viewport of viewports) {
        const context = await browser.newContext({ viewport });
        const page = await context.newPage();
        await page.goto("http://127.0.0.1:5500/");

        await page.waitForTimeout(2000);

        await page.evaluate(() => {
            const tutorial = document.getElementById('tutorial');
            if (tutorial) tutorial.style.display = 'none';
        });

        const selectors = ["#commandDeck", "#timeInfo", "#runStatusDeck", "#runVitals", "#timeControls", "#actionsColumn"];

        const observations = {};
        for (const selector of selectors) {
            const el = await page.$(selector);
            if (el) {
                const box = await el.boundingBox();
                observations[selector] = box;
            } else {
                observations[selector] = null;
            }
        }

        // Check text and accessbility logic per criteria:
        const criticalControls = await page.evaluate(() => {
             const pausePlay = document.getElementById('pausePlay');
             const menu = document.getElementById('menuDeckLabel');
             return {
                 pausePlayVisible: pausePlay ? pausePlay.offsetParent !== null : false,
                 pausePlayText: pausePlay ? pausePlay.innerText.trim() : null,
                 menuVisible: menu ? menu.offsetParent !== null : false,
                 menuText: menu ? menu.innerText.trim() : null,
             }
        });

        const localizedText = await page.evaluate(() => {
             const el = document.querySelector('.runVitalLabel');
             return el ? el.innerText.trim() : null;
        });

        results.push({
            viewportLabel: viewport.label,
            viewportDimensions: viewport,
            observations,
            interactionAndAccessibility: criticalControls,
            localizedTextObservations: { runVitalLabel: localizedText }
        });

        await context.close();
    }

    await browser.close();

    const branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
    const commit = execSync("git rev-parse HEAD").toString().trim();

    const isPostChange = process.argv.includes('--post');
    const filename = isPostChange ? 'post-change.json' : 'baseline.json';

    const output = {
        timestamp: new Date().toISOString(),
        branch,
        commit,
        generationCommand: isPostChange ? "node tools/probe-top-shell.mjs --post" : "node tools/probe-top-shell.mjs",
        results
    };

    fs.mkdirSync("output/probe", { recursive: true });
    fs.writeFileSync(`output/probe/${filename}`, JSON.stringify(output, null, 2));
    console.log(`${filename} captured.`);
}

probe().catch(console.error);
