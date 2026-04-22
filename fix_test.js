const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:5500/index.html');
    await page.waitForTimeout(2000);

    const checkHeight = async () => {
        return await page.evaluate(() => {
            return {
                deck: document.getElementById('commandDeck').getBoundingClientRect().height,
                resources: document.getElementById('trackedResources').getBoundingClientRect().height,
            };
        });
    }

    console.log("Initial:", await checkHeight());

    // Inject 50 resources into trackedResources. If flex-wrap is wrap, the deck grows massively.
    await page.evaluate(() => {
        const tr = document.getElementById('trackedResources');
        for (let i = 0; i < 50; i++) {
            const el = document.createElement('div');
            el.style.width = '40px';
            el.style.height = '40px';
            el.style.backgroundColor = 'red';
            tr.appendChild(el);
        }
    });

    await page.waitForTimeout(1000);
    console.log("After resources:", await checkHeight());

    // See if any other children in commandDeck are expanding
    const parts = await page.evaluate(() => {
        return {
            timeInfo: document.getElementById('timeInfo').getBoundingClientRect().height,
            runStatusDeck: document.getElementById('runStatusDeck').getBoundingClientRect().height,
            resourceDeck: document.getElementById('resourceDeck').getBoundingClientRect().height,
            menuDeck: document.getElementById('menuDeck').getBoundingClientRect().height,
        }
    });
    console.log("Parts:", parts);

    await browser.close();
})();
