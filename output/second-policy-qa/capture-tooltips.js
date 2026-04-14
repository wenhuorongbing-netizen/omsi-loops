const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const outDir = path.resolve('C:/Users/Jack/Documents/GitHub/omsi-loops/output/second-policy-qa');
const baseUrl = 'http://127.0.0.1:4173/';

const specs = [
  { file: 'mt-olympus-tooltip.png', lang: 'en-EN', titleKey: 'actions>climb_mountain>label', bodyKey: 'actions>climb_mountain>tooltip' },
  { file: 'face-judgement-tooltip-en.png', lang: 'en-EN', titleKey: 'actions>face_judgement>label', bodyKey: 'actions>face_judgement>tooltip' },
  { file: 'face-judgement-tooltip-zh.png', lang: 'zh-CN', titleKey: 'actions>face_judgement>label', bodyKey: 'actions>face_judgement>tooltip' },
  { file: 'startington-town-desc-en.png', lang: 'en-EN', titleKey: 'towns>town5>name', bodyKey: 'towns>town5>desc' },
  { file: 'startington-town-desc-zh.png', lang: 'zh-CN', titleKey: 'towns>town5>name', bodyKey: 'towns>town5>desc' },
  { file: 'jungle-tooltip-en.png', lang: 'en-EN', titleKey: 'actions>explore_jungle>label', bodyKey: 'actions>explore_jungle>tooltip' },
  { file: 'jungle-tooltip-zh.png', lang: 'zh-CN', titleKey: 'actions>explore_jungle>label', bodyKey: 'actions>explore_jungle>tooltip' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1100 }, deviceScaleFactor: 1 });
  const results = [];

  for (const spec of specs) {
    await page.goto(`${baseUrl}?lg=${spec.lang}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => typeof window._txt === 'function');
    const payload = await page.evaluate(({ titleKey, bodyKey }) => {
      const normalize = (value) => String(value ?? '').replace(/\n/g, '<br>').trim();
      return {
        title: normalize(window._txt(titleKey)),
        body: normalize(window._txt(bodyKey)),
      };
    }, spec);
    await page.evaluate(({ title, body, file }) => {
      document.body.innerHTML = `
        <div id="qa-card-root" style="min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:48px;background:linear-gradient(180deg,#ece8db 0%,#d7d1c0 100%);font-family:'Georgia','Noto Serif SC',serif;">
          <article style="width:980px;background:#fffaf0;border:1px solid #a7864e;box-shadow:0 18px 48px rgba(60,45,20,.18);padding:28px 32px;color:#2f2416;">
            <div style="font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#8a6734;margin-bottom:12px;">Policy 2 QA</div>
            <h1 style="font-size:34px;line-height:1.15;margin:0 0 18px 0;">${title}</h1>
            <div style="font-size:21px;line-height:1.6;white-space:normal;">${body}</div>
            <div style="margin-top:18px;font-size:14px;color:#7b6a52;">${file}</div>
          </article>
        </div>`;
    }, { ...payload, file: spec.file });
    const dest = path.join(outDir, spec.file);
    await page.screenshot({ path: dest, fullPage: true });
    results.push({ ...spec, title: payload.title, bodyPreview: payload.body.replace(/<br>/g, ' ').slice(0, 160) });
  }

  fs.writeFileSync(path.join(outDir, 'results.json'), JSON.stringify({ ok: true, captures: results }, null, 2));
  await browser.close();
})();
