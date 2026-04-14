import fs from "node:fs/promises";
import path from "node:path";

import bingApi from "bing-translate-api";
import {XMLBuilder, XMLParser} from "fast-xml-parser";

const {translate: bingTranslate} = bingApi;

const sourcePath = process.argv[2] ?? "lang/en-EN/game.xml";
const targetPath = process.argv[3] ?? "lang/zh-CN/game.xml";
const cachePath = process.argv[4] ?? path.join("output", "translate-zh-cache.json");

const parser = new XMLParser({
    ignoreAttributes: false,
    preserveOrder: true,
    trimValues: false,
    commentPropName: "#comment",
    cdataPropName: "#cdata",
});
const builder = new XMLBuilder({
    ignoreAttributes: false,
    preserveOrder: true,
    format: true,
    suppressEmptyNode: false,
    commentPropName: "#comment",
    cdataPropName: "#cdata",
});

const excludedTextTags = new Set(["id", "link", "?xml"]);
const translatableAttrs = new Set(["@_caption", "@_condition"]);

const manualByPath = new Map([
    ["body>menu>save>meta>title", "存档"],
    ["body>menu>faq>meta>title", "常见问题"],
    ["body>menu>options>meta>title", "选项"],
    ["body>menu>extras>meta>title", "额外设置"],
    ["body>menu>challenges>meta>title", "挑战"],
    ["body>menu>totals>meta>title", "总计"],
    ["body>menu>prestige_bonus>meta>title", "转生加成"],
    ["body>time_controls>bonus_seconds>title", "奖励秒数"],
    ["body>stats>title", "属性"],
    ["body>skills>title", "技能"],
    ["body>buffs>title", "增益"],
    ["body>actions>title", "行动选项"],
    ["body>actions>title_stories", "行动故事"],
    ["body>actions>title_log", "行动日志"],
    ["body>actions>title_list", "行动队列"],
    ["body>actions>title_loadout", "行动预设"],
    ["body>actions>log>load_previous", "加载更早记录..."],
    ["body>actions>log>latest", "日志末尾"],
    ["body>actions>tooltip>save_loadout", "保存到预设"],
    ["body>actions>tooltip>load_loadout", "从预设载入"],
    ["body>actions>tooltip>clear_list", "清空队列"],
    ["body>actions>tooltip>max_training", "训练拉满"],
    ["body>menu>navigation>town", "城镇"],
    ["body>menu>navigation>actions", "行动"],
    ["body>menu>navigation>action_log", "日志"],
    ["body>menu>navigation>stats", "属性"],
]);

const manualByText = new Map([
    ["Changelog", "更新日志"],
    ["Saving", "存档"],
    ["FAQ", "常见问题"],
    ["Options", "选项"],
    ["Extras", "额外设置"],
    ["Challenges", "挑战"],
    ["Totals", "总计"],
    ["Prestige Perks", "转生加成"],
    ["Stats", "属性"],
    ["Skills", "技能"],
    ["Buffs", "增益"],
    ["Action Options", "行动选项"],
    ["Action Stories", "行动故事"],
    ["Action Log", "行动日志"],
    ["Action List", "行动队列"],
    ["Loadouts", "行动预设"],
    ["Load Previous Entries...", "加载更早记录..."],
    ["End of log", "日志末尾"],
    ["Latest", "最新"],
    ["Discord Link", "Discord 链接"],
    ["Bonus Seconds", "奖励秒数"],
    ["Town", "城镇"],
    ["Actions", "行动"],
    ["Log", "日志"],
    ["Save To List", "保存到预设"],
    ["Load From List", "从预设载入"],
    ["Clear List", "清空队列"],
    ["Max Training", "训练拉满"],
    ["Loading...", "加载中..."],
    ["OK", "确定"],
    ["Cheat", "作弊"],
    ["Version", "版本"],
]);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function readJson(filePath) {
    try {
        return JSON.parse(await fs.readFile(filePath, "utf8"));
    } catch {
        return {};
    }
}

async function writeJson(filePath, payload) {
    await fs.mkdir(path.dirname(filePath), {recursive: true});
    await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
}

function splitOuterWhitespace(rawValue) {
    const match = rawValue.match(/^(\s*)([\s\S]*?)(\s*)$/u);
    if (!match) return {leading: "", core: rawValue, trailing: ""};
    return {leading: match[1], core: match[2], trailing: match[3]};
}

function protectTokens(text) {
    const replacements = [];
    let protectedText = text;
    const patterns = [
        /<[^>]+>/gu,
        /\{[^{}]+\}/gu,
        /&[#A-Za-z0-9]+;/gu,
        /⮀/gu,
        /`[^`]+`/gu,
    ];

    for (const pattern of patterns) {
        protectedText = protectedText.replace(pattern, match => {
            const token = `ZXQ${replacements.length}QXZ`;
            replacements.push({token, match});
            return token;
        });
    }

    return {protectedText, replacements};
}

function restoreTokens(text, replacements) {
    let restored = text;
    for (const {token, match} of replacements) {
        restored = restored.replaceAll(token, match);
    }
    return restored;
}

function shouldTranslateText(tagName, rawValue) {
    if (excludedTextTags.has(tagName)) return false;
    const core = rawValue.trim();
    if (!core) return false;
    if (/^https?:\/\//iu.test(core)) return false;
    return true;
}

async function main() {
    const xml = await fs.readFile(sourcePath, "utf8");
    const cache = await readJson(cachePath);
    const nodes = parser.parse(xml);
    const jobs = [];

    function registerJob(pathKey, rawValue, apply) {
        const {leading, core, trailing} = splitOuterWhitespace(rawValue);
        if (!core.trim()) return;
        jobs.push({pathKey, core, leading, trailing, apply});
    }

    function collect(list, pathParts = []) {
        for (const node of list) {
            for (const [tagName, value] of Object.entries(node)) {
                if (tagName === "#text" || tagName === "#comment") continue;
                if (!Array.isArray(value)) continue;

                const nextPath = pathParts.concat(tagName);
                const pathKey = nextPath.join(">");

                for (const child of value) {
                    if (child[":@"]) {
                        for (const [attrName, attrValue] of Object.entries(child[":@"])) {
                            if (translatableAttrs.has(attrName) && attrValue?.trim()) {
                                registerJob(`${pathKey}${attrName}`, attrValue, translated => {
                                    child[":@"][attrName] = translated;
                                });
                            }
                        }
                    }

                    if (typeof child["#text"] === "string" && shouldTranslateText(tagName, child["#text"])) {
                        registerJob(pathKey, child["#text"], translated => {
                            child["#text"] = translated;
                        });
                    }

                    if (Array.isArray(child["#cdata"])) {
                        for (const cdataPart of child["#cdata"]) {
                            if (typeof cdataPart["#text"] === "string" && cdataPart["#text"].trim()) {
                                registerJob(`${pathKey}#cdata`, cdataPart["#text"], translated => {
                                    cdataPart["#text"] = translated;
                                });
                            }
                        }
                    }
                }

                collect(value, nextPath);
            }
        }
    }

    collect(nodes);

    const pending = new Map();
    let translatedCount = 0;

    async function translateRequest(text, pathKey) {
        const {protectedText, replacements} = protectTokens(text);
        let lastError;

        for (let attempt = 0; attempt < 5; attempt += 1) {
            try {
                const response = await bingTranslate(protectedText, "en", "zh-Hans", false);
                await sleep(150);
                return restoreTokens(response.translation, replacements);
            } catch (error) {
                lastError = error;
                const retryDelay = 1000 * (attempt + 1);
                console.warn(`[retry ${attempt + 1}] ${pathKey}: ${error.message}`);
                await sleep(retryDelay);
            }
        }

        throw lastError;
    }

    async function translateCore(core, pathKey) {
        if (manualByPath.has(pathKey)) return manualByPath.get(pathKey);
        if (manualByText.has(core)) return manualByText.get(core);
        if (cache[core]) return cache[core];

        let translated;
        if (core.length > 900 && /<br\s*\/?>|\n/iu.test(core)) {
            const parts = core.split(/(<br\s*\/?>|\n)/iu);
            const translatedParts = [];
            for (const part of parts) {
                if (!part || /^(<br\s*\/?>|\n)$/iu.test(part) || !part.trim()) {
                    translatedParts.push(part);
                } else {
                    translatedParts.push(await translateRequest(part, pathKey));
                }
            }
            translated = translatedParts.join("");
        } else {
            translated = await translateRequest(core, pathKey);
        }

        cache[core] = translated;
        translatedCount += 1;
        if (translatedCount % 25 === 0) {
            console.log(`Translated ${translatedCount} new strings...`);
            await writeJson(cachePath, cache);
        }
        return translated;
    }

    async function resolveTranslation(core, pathKey) {
        const pendingKey = manualByPath.has(pathKey) ? `path:${pathKey}` : `text:${core}`;
        if (!pending.has(pendingKey)) {
            pending.set(pendingKey, translateCore(core, pathKey));
        }
        return pending.get(pendingKey);
    }

    let jobIndex = 0;
    const concurrency = 2;

    async function worker() {
        while (jobIndex < jobs.length) {
            const currentIndex = jobIndex;
            jobIndex += 1;
            const job = jobs[currentIndex];
            const translated = await resolveTranslation(job.core, job.pathKey);
            job.apply(job.leading + translated + job.trailing);

            if ((currentIndex + 1) % 200 === 0 || currentIndex + 1 === jobs.length) {
                console.log(`Applied ${currentIndex + 1}/${jobs.length} translations`);
            }
        }
    }

    await Promise.all(Array.from({length: concurrency}, () => worker()));

    await fs.mkdir(path.dirname(targetPath), {recursive: true});
    await fs.writeFile(targetPath, builder.build(nodes), "utf8");
    await writeJson(cachePath, cache);

    console.log(`Wrote ${targetPath}`);
    console.log(`New translations fetched: ${translatedCount}`);
}

await main();
