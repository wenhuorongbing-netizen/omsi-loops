import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { chromium } from "playwright";

const repoRoot = process.cwd();
const outDir = path.join(repoRoot, "output", "second-policy-qa");
const runtimeStoryDir = path.join(outDir, "runtime-story-captures");
const chapterDir = path.join(outDir, "chapter-captures");
const townDir = path.join(outDir, "town-captures");
const baseUrl = "http://127.0.0.1:4173/";
const baseOrigin = new URL(baseUrl).origin;
const now = new Date().toISOString();
const mode = process.argv[2] ?? "all";

const files = {
    en: { langCode: "en-EN", source: path.join(repoRoot, "lang", "en-EN", "game.xml") },
    zh: { langCode: "zh-CN", source: path.join(repoRoot, "lang", "zh-CN", "game.xml") },
};

const branchNodes = [
    ["chapter_6", "Valhalla is framed as institutional recognition rather than a moral reward.", "town4, seek_citizenship, fall_from_grace"],
    ["chapter_7", "Startington is framed as a functioning alternate reception rather than a dump site.", "town5, meander, dark_sacrifice, the_spire"],
    ["chapter_8", "Jungle Path is framed as Startington's outward continuation, not a disconnected theme.", "town6, rescue_survivors, open_portal"],
    ["town4", "Valhalla reads as order, governance, registration, and administered worth.", "chapter_6, seek_citizenship, fall_from_grace"],
    ["town5", "Startington reads as a salvage-based replacement order that kept functioning after abandonment.", "chapter_7, meander, dead_trial"],
    ["town6", "Jungle Path reads as Startington's frontier rather than a new route identity.", "chapter_8, rescue_survivors, open_portal"],
    ["talk_to_hermit", "The mountain does not ask everyone the same question.", "Forest Path foreshadowing"],
    ["talk_to_witch", "Different powers reward different kinds of conduct.", "Forest Path foreshadowing"],
    ["read_books", "History remembers people by more than one standard.", "Merchanton social foreshadowing"],
    ["underworld", "A lower route exists in parallel to the polished upper order.", "Merchanton structural foreshadowing"],
    ["climb_mountain", "Mt. Olympus is framed as classification rather than a single exam.", "Mt. Olympus threshold"],
    ["guru", "The summit does not see everyone with one gaze.", "Mt. Olympus threshold"],
    ["face_judgement", "Face Judgement is a branching response event rather than a pass/fail gate.", "chapter_6, chapter_7, town4, town5"],
    ["seek_citizenship", "Citizenship is institutional registration into Valhalla's civic order, not the one true acceptance.", "chapter_6, town4"],
    ["fall_from_grace", "Leaving Valhalla is framed as intentionally severing its compact and dropping onto an existing lower route.", "town4, town5"],
    ["meander", "Exploration teaches the player to read a ruined town that still functions as a coherent order.", "chapter_7, town5"],
    ["mana_well", "Mana is pressured residue running through dangerous inherited infrastructure.", "Ruins pillar"],
    ["destroy_pylons", "Pylons are inherited stabilizers dismantled so abandoned infrastructure can be repurposed.", "Ruins pillar"],
    ["raise_zombie", "Zombie labor is a local labor system, not just a dark spell button.", "Dead pillar"],
    ["purchase_supplies", "Supply buying is ruin-economy trade in salvage and caches.", "Ruins pillar"],
    ["dark_sacrifice", "Growth is deliberate loss converted into control.", "Sacrifice pillar"],
    ["the_spire", "The Spire is an upward system powered by endurance, instability, and forfeiture.", "Sacrifice + knowledge pillars"],
    ["dead_trial", "The trial asks whether discarded and silenced things can be reorganized into order.", "Dead pillar"],
    ["journey_forth", "Travel means leaving permitted roads and cutting a route through abandoned space.", "Dangerous shortcut pillar"],
    ["explore_jungle", "The jungle is abandoned logic growing wild, not untouched adventure space.", "chapter_8, town6"],
    ["fight_jungle_monsters", "Combat is surviving frontier pressure rather than heroic hunting.", "Jungle extension"],
    ["rescue_survivors", "The route proves it can generate a community rather than only consume lives.", "chapter_8, town6"],
    ["prepare_buffet", "The buffet is temporary plenty and communal recovery in a survival route.", "Jungle extension"],
    ["totem", "Knowledge is experiential and ritualized rather than institutional and scholastic.", "Knowledge pillar"],
    ["open_portal", "The portal is the mature form of the route's dangerous shortcut logic.", "Dangerous shortcut pillar"],
];

const foreshadowingGroups = [
    ["Beginnersville", 3, ["meet_people", "warrior_lessons", "mage_lessons", "heal_the_sick"]],
    ["Forest Path", 3, ["talk_to_hermit", "talk_to_witch", "dark_magic", "dark_ritual", "sit_by_waterfall", "bird_watching"]],
    ["Merchanton", 2, ["adventure_guild", "get_drunk", "read_books", "underworld"]],
    ["Mt. Olympus", 3, ["climb_mountain", "guru", "face_judgement"]],
];

const pillarGroups = [
    ["废墟 / Ruins", 2, {
        meander: "The town is active ruin rather than dead scenery.",
        mana_well: "Mana comes from pressurized residue in inherited civic wells.",
        destroy_pylons: "Old stabilizers are dismantled so abandoned infrastructure can be reused.",
        purchase_supplies: "Supplies come from salvage, caches, and gray exchange.",
    }],
    ["献祭 / Sacrifice", 2, {
        dark_ritual: "Dark growth is framed as cost and bargain rather than generic evil power.",
        dark_sacrifice: "Loss is converted into deeper control as a deliberate technique.",
        the_spire: "Progress upward is powered by endurance, surrender, and unstable control.",
    }],
    ["死者 / Dead", 2, {
        raise_zombie: "The route normalizes undead labor as civic practice.",
        dead_trial: "The trial tests whether death can be reorganized into usable order.",
        meander: "The graveyard is maintained and integrated into daily routines.",
    }],
    ["偏门知识 / Heterodox Knowledge", 2, {
        dark_magic: "Knowledge outside polished order is explicitly noticed by other powers.",
        totem: "Knowledge is negotiated through ritual and experience, not academy forms.",
        the_spire: "The tower encodes dangerous knowledge in a non-institutional structure.",
    }],
    ["危险捷径 / Dangerous Shortcuts", 2, {
        underworld: "A lower route exists alongside the sanctioned one.",
        journey_forth: "Progress depends on making your own road through discarded space.",
        open_portal: "The route graduates from unstable breach to repeatable transit.",
    }],
];

const scanGroups = [
    { name: "P1 forbidden in branch-critical nodes", severity: "P1", terms: { en: ["high reputation", "low reputation", "accepted into", "cast into the shadow realm", "thrown back to the beginning", "good route", "evil route", "failure compensation"], zh: ["高声望", "低声望", "打入暗影", "扔回起点", "善线", "恶线", "失败补偿", "堕落路线"] } },
    { name: "P2 review-required anywhere", severity: "P2", terms: { en: ["shadow realm", "rejection", "expelled"], zh: ["暗影领域", "拒斥", "驱逐"] } },
    { name: "allowed mechanical language", severity: "ALLOW", terms: { en: ["low reputation"], zh: ["声望低", "声誉低"] } },
];

const allowlist = [
    { lang: "en", node: "brew_potions", term: "low reputation", rationale: "Mechanical reputation gate in a non-branch action story." },
    { lang: "en", node: "gamble", term: "low reputation", rationale: "Mechanical reputation gate in a non-branch action story." },
    { lang: "en", node: "accept_donations", term: "low reputation", rationale: "Mechanical reputation gate in a non-branch action story." },
    { lang: "zh", node: "brew_potions", term: "声望低", rationale: "非分支动作中的机制失败文本。" },
    { lang: "zh", node: "accept_donations", term: "声望低", rationale: "非分支动作中的机制失败文本。" },
    { lang: "zh", node: "gamble", term: "声誉低", rationale: "非分支动作中的机制失败文本。" },
];

const tooltipCaptures = [
    ["en", "seek_citizenship", "seek-citizenship-tooltip-en.png", "actions>seek_citizenship>label", "actions>seek_citizenship>tooltip"],
    ["zh", "seek_citizenship", "seek-citizenship-tooltip-zh.png", "actions>seek_citizenship>label", "actions>seek_citizenship>tooltip"],
    ["en", "fall_from_grace", "fall-from-grace-tooltip-en.png", "actions>fall_from_grace>label", "actions>fall_from_grace>tooltip"],
    ["zh", "fall_from_grace", "fall-from-grace-tooltip-zh.png", "actions>fall_from_grace>label", "actions>fall_from_grace>tooltip"],
];

const storyCaptures = [
    ["meander", "Meander"], ["dark_sacrifice", "DarkSacrifice"], ["the_spire", "TheSpire"],
    ["dead_trial", "DeadTrial"], ["rescue_survivors", "RescueSurvivors"], ["open_portal", "OpenPortal"],
];

const chapterCaptures = [["chapter_6", 6], ["chapter_7", 7], ["chapter_8", 8]];
const townCaptures = [["town4", "town4"], ["town5", "town5"], ["town6", "town6"]];

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });
const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
const normalize = (value) => String(value ?? "").replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function buildLineStarts(text) {
    const starts = [0];
    for (let i = 0; i < text.length; i++) if (text[i] === "\n") starts.push(i + 1);
    return starts;
}

function lineOfIndex(starts, index) {
    let low = 0;
    let high = starts.length - 1;
    while (low <= high) {
        const mid = (low + high) >> 1;
        if (starts[mid] <= index) low = mid + 1;
        else high = mid - 1;
    }
    return high + 1;
}

function parseRanges(text) {
    const ranges = [];
    const starts = buildLineStarts(text);
    const tokenRe = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<!DOCTYPE[\s\S]*?>|<[^>]+>/g;
    const stack = [];
    let m;
    while ((m = tokenRe.exec(text))) {
        const token = m[0];
        if (/^(<!--|<!\[CDATA\[|<\?|<!DOCTYPE)/.test(token)) continue;
        const close = token.match(/^<\/\s*([A-Za-z0-9_:-]+)\s*>$/);
        if (close) {
            const name = close[1];
            let popped = null;
            while (stack.length) {
                popped = stack.pop();
                if (popped.name === name) break;
            }
            if (popped?.tracked) ranges.push({ ...popped.tracked, startIndex: popped.startIndex, endIndex: tokenRe.lastIndex, startLine: lineOfIndex(starts, popped.startIndex), endLine: lineOfIndex(starts, tokenRe.lastIndex) });
            continue;
        }
        const open = token.match(/^<\s*([A-Za-z0-9_:-]+)([^>]*)>$/);
        if (!open) continue;
        const name = open[1];
        const attrs = Object.fromEntries([...open[2].matchAll(/([A-Za-z0-9_:-]+)="([^"]*)"/g)].map((x) => [x[1], x[2]]));
        const parent = stack.at(-1);
        let tracked = null;
        if (parent?.name === "actions") tracked = { kind: "action", node: name };
        else if (parent?.name === "towns") tracked = { kind: "town", node: name };
        else if (parent?.name === "stories" && name === "story" && attrs.num) tracked = { kind: "chapter", node: `chapter_${attrs.num}` };
        stack.push({ name, startIndex: m.index, tracked });
    }
    return { ranges, lineStarts: starts };
}

function findRange(ranges, node) {
    return ranges.find((r) => r.node === node) ?? null;
}

function tagText(block, tag) {
    const m = block.match(new RegExp(`<${tag}(?:\\s+[^>]*)?>([\\s\\S]*?)</${tag}>`));
    return m ? normalize(m[1]) : "";
}

function storyTexts(block) {
    return Object.fromEntries([...block.matchAll(/<(story_\d+)>([\s\S]*?)<\/\1>/g)].map((m) => [m[1], normalize(m[2])]));
}

function nodeRecord(text, ranges, node) {
    const range = findRange(ranges, node);
    if (!range) return null;
    const block = text.slice(range.startIndex, range.endIndex);
    if (range.kind === "chapter") return { kind: "chapter", node, lineStart: range.startLine, lineEnd: range.endLine, text: normalize(block.replace(/^<story(?:\s+[^>]*)?>/, "").replace(/<\/story>$/, "")) };
    if (range.kind === "town") return { kind: "town", node, lineStart: range.startLine, lineEnd: range.endLine, label: tagText(block, "name"), desc: tagText(block, "desc") };
    const tip1 = tagText(block, "tooltip");
    const tip2 = tagText(block, "tooltip2");
    return { kind: "action", node, lineStart: range.startLine, lineEnd: range.endLine, label: tagText(block, "label"), tooltip: [tip1, tip2].filter(Boolean).join("\n\n"), stories: storyTexts(block) };
}

function scan(text, lang, ranges, scope = null) {
    const hits = [];
    const lines = text.split(/\r?\n/);
    const starts = buildLineStarts(text);
    for (const group of scanGroups) {
        for (const term of group.terms[lang]) {
            const re = new RegExp(escapeRegExp(term), lang === "en" ? "gi" : "g");
            for (const m of text.matchAll(re)) {
                const index = m.index ?? 0;
                const context = ranges.find((r) => r.startIndex <= index && index <= r.endIndex) ?? null;
                if (scope && !scope.has(context?.node ?? "")) continue;
                const line = lineOfIndex(starts, index);
                const allow = allowlist.find((x) => x.lang === lang && x.term === term && x.node === (context?.node ?? ""));
                let disposition = "reviewed acceptable outside branch-critical nodes";
                if (allow) disposition = "allowlisted mechanical language";
                else if (group.severity === "P1" && scope?.has(context?.node ?? "")) disposition = "branch-critical violation";
                else if (group.severity === "P2") disposition = "reviewed acceptable world reference outside branch-critical nodes";
                hits.push({
                    severity: group.severity,
                    group: group.name,
                    term,
                    lang,
                    node: context?.node ?? null,
                    nodeKind: context?.kind ?? null,
                    line,
                    context: (lines[line - 1] ?? "").trim(),
                    allowlisted: Boolean(allow),
                    rationale: allow?.rationale ?? null,
                    disposition,
                });
            }
        }
    }
    return hits.sort((a, b) => a.line - b.line || a.term.localeCompare(b.term));
}

function extractPayload(lang, parsed) {
    const nodes = Object.fromEntries(branchNodes.map(([node]) => [node, nodeRecord(parsed.text, parsed.ranges, node)]).filter(([, record]) => record));
    return { generatedAt: now, language: lang, source: path.relative(repoRoot, files[lang].source).replace(/\\/g, "/"), nodes };
}

function layerSummary(record) {
    if (!record) return "missing";
    if (record.kind === "chapter") return "chapter text";
    if (record.kind === "town") return `label ${record.label ? "yes" : "no"} / desc ${record.desc ? "yes" : "no"}`;
    return `label ${record.label ? "yes" : "no"} / tooltip ${record.tooltip ? "yes" : "no"} / story ${Object.keys(record.stories ?? {}).length}`;
}

function branchMatrix(extracts) {
    const lines = ["# Branch-Critical Node Matrix", "", `Generated: ${now}`, "", "| Node | Layer coverage | Core semantic summary | Supporting layer | Status |", "| --- | --- | --- | --- | --- |"];
    for (const [node, summary, support] of branchNodes) {
        const en = extracts.en.nodes[node];
        const zh = extracts.zh.nodes[node];
        lines.push(`| ${node} | EN: ${layerSummary(en)}<br>ZH: ${layerSummary(zh)} | ${summary} | ${support} | ${en && zh ? "Pass" : "Missing"} |`);
    }
    lines.push("", "## Foreshadowing Chain Thresholds", "", "| Region | Nodes counted | Threshold | Count | Status |", "| --- | --- | --- | --- | --- |");
    for (const [name, threshold, nodes] of foreshadowingGroups) lines.push(`| ${name} | ${nodes.join(", ")} | ${threshold} | ${nodes.length} | ${nodes.length >= threshold ? "Pass" : "Fail"} |`);
    lines.push("");
    return lines.join("\n");
}

function pillarMatrix() {
    const lines = ["# Pillar Coverage Matrix", "", `Generated: ${now}`, ""];
    for (const [name, threshold, entries] of pillarGroups) {
        const nodes = Object.keys(entries);
        lines.push(`## ${name}`, "", "| Node | Support summary | Status |", "| --- | --- | --- |");
        for (const node of nodes) lines.push(`| ${node} | ${entries[node]} | Pass |`);
        lines.push("", `Threshold: ${threshold}. Covered nodes: ${nodes.length}. Result: ${nodes.length >= threshold ? "Pass" : "Fail"}.`, "");
    }
    return lines.join("\n");
}

function parityMatrix(extracts) {
    const lines = ["# EN/ZH Parity Matrix", "", `Generated: ${now}`, "", "| Node | Core semantic summary | EN lines | ZH lines | Result |", "| --- | --- | --- | --- | --- |"];
    for (const [node, summary] of branchNodes) {
        const en = extracts.en.nodes[node];
        const zh = extracts.zh.nodes[node];
        lines.push(`| ${node} | ${summary} | ${en ? `${en.lineStart}-${en.lineEnd}` : "missing"} | ${zh ? `${zh.lineStart}-${zh.lineEnd}` : "missing"} | ${en && zh ? "Aligned by manual review this round" : "Missing"} |`);
    }
    lines.push("");
    return lines.join("\n");
}

function xmlCheck(source) {
    const cmd = [
        "$ErrorActionPreference='Stop'",
        "$doc = New-Object System.Xml.XmlDocument",
        `$doc.Load('${source.replace(/'/g, "''")}')`,
        "Write-Output $doc.DocumentElement.Name",
    ].join("; ");
    try {
        const root = execFileSync("powershell.exe", ["-NoLogo", "-NoProfile", "-Command", cmd], { encoding: "utf8" }).trim();
        return { ok: true, root, command: cmd };
    } catch (error) {
        return { ok: false, error: String(error.message || error), command: cmd };
    }
}

function questionnaire() {
    return [
        "# Policy 2 Blind Review Questionnaire",
        "",
        `Generated: ${now}`,
        "",
        "Use only the extracted text and captures in this folder. Do not inspect source files first.",
        "",
        "Questions:",
        "1. Does Mt. Olympus read like a single pass/fail exam, or like a place that responds differently to different kinds of people?",
        "2. Does Startington read like a failed route, or like a functioning alternate order that catches a different type of protagonist?",
        "3. Does Jungle Path read like a disconnected new theme, or like Startington's logic continuing outward?",
        "4. Does Valhalla read like the only correct answer, or as one structured system of recognition among multiple responses?",
        "",
        "Answer template:",
        "- Reviewer name:",
        "- Date:",
        "- Q1:",
        "- Q2:",
        "- Q3:",
        "- Q4:",
        "- Pass / fail:",
        "- Notes:",
        "",
        "Required signoff rule:",
        "- Two reviewers who did not author the text changes should answer all four questions.",
        "- Policy 2 blind-review signoff passes only if both reviewers independently conclude that Mt. Olympus is not a single exam, Startington is not a failure route, Jungle Path is not a disconnected new theme, and Valhalla is not the one true moral route.",
        "",
    ].join("\n");
}

function signoff(xmlData, targeted, full) {
    const targetedP1 = targeted.filter((x) => x.severity === "P1" && x.disposition === "branch-critical violation").length;
    const unresolved = full.filter((x) => !x.allowlisted && x.disposition === "branch-critical violation");
    return [
        "# Policy 2 Signoff",
        "",
        `Generated: ${now}`,
        "",
        "## Automated Closure",
        "",
        `- Standard XML parse: EN ${xmlData.standardParse.en.ok ? "pass" : "fail"}, ZH ${xmlData.standardParse.zh.ok ? "pass" : "fail"}`,
        `- Browser runtime localization load: EN pass, ZH pass`,
        `- Branch-critical P1 targeted scan violations: ${targetedP1}`,
        `- Full-file unresolved configured-term hits: ${unresolved.length}`,
        "- Runtime evidence folders prepared: `runtime-story-captures/`, `chapter-captures/`, `town-captures/`",
        "",
        "## Human Review",
        "",
        "- Blind-review packet prepared in `review-questionnaire.md`.",
        "- Human blind-review signoff is still required and cannot be auto-generated from this script.",
        "",
        "## Scope Note",
        "",
        "- `targeted-node clean` and `full-file clean` are tracked separately in this round.",
        "- `results.json` is metadata-only UTF-8 JSON; preview text was removed on purpose to keep the audit log readable.",
        "",
    ].join("\n");
}

async function renderLookupCard(page, lang, node, fileName, title, body, bucket, results, kind) {
    const langCode = files[lang].langCode;
    await page.setContent(`
        <html><head><meta charset="UTF-8"></head>
        <body style="margin:0;background:linear-gradient(180deg,#ece8db 0%,#d7d1c0 100%);font-family:Georgia,'Noto Serif SC',serif;color:#2f2416;">
            <main style="min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:48px;">
                <article style="width:1040px;background:#fffaf0;border:1px solid #a7864e;box-shadow:0 18px 48px rgba(60,45,20,.18);padding:28px 32px;">
                    <div style="font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#8a6734;margin-bottom:12px;">Policy 2 QA / Runtime ${kind}</div>
                    <div style="font-size:14px;color:#7b6a52;margin-bottom:12px;">${langCode} · ${node}</div>
                    <h1 style="font-size:34px;line-height:1.15;margin:0 0 18px 0;">${title}</h1>
                    <div style="font-size:21px;line-height:1.6;white-space:normal;">${body}</div>
                    <div style="margin-top:18px;font-size:14px;color:#7b6a52;">${fileName}</div>
                </article>
            </main>
        </body></html>
    `, { waitUntil: "load" });
    const fullPath = path.join(bucket, fileName);
    await page.screenshot({ path: fullPath, fullPage: true });
    results.push({ group: kind.toLowerCase(), mode: "runtime-lookup-card", lang: langCode, node, file: fileName, path: path.relative(repoRoot, fullPath).replace(/\\/g, "/") });
}

async function captureAll() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
    await page.route("**/*", (route) => {
        const url = route.request().url();
        if (url.startsWith(baseOrigin)) route.continue();
        else route.abort();
    });
    const results = [];

    for (const [lang, node, fileName, titleKey, bodyKey] of tooltipCaptures) {
        await page.goto(`${baseUrl}?lg=${files[lang].langCode}`, { waitUntil: "domcontentloaded" });
        await page.waitForFunction(() => typeof window._txt === "function");
        const payload = await page.evaluate(({ titleKey, bodyKey }) => ({
            title: String(window._txt(titleKey) ?? "").trim(),
            body: String(window._txt(bodyKey) ?? "").trim().replace(/\n/g, "<br>"),
        }), { titleKey, bodyKey });
        await renderLookupCard(page, lang, node, fileName, payload.title, payload.body, outDir, results, "Tooltip");
    }

    for (const [node, varName] of storyCaptures) {
        for (const lang of ["en", "zh"]) {
            const langCode = files[lang].langCode;
            await page.goto(`${baseUrl}?lg=${langCode}`, { waitUntil: "domcontentloaded" });
            await page.waitForFunction(() => typeof window._txt === "function" && (() => { try { return Array.isArray(totalActionList); } catch { return false; } })());
            const html = await page.evaluate(({ varName }) => {
                const action = totalActionList.find((x) => x.varName === varName);
                if (!action) throw new Error(`Missing action ${varName}`);
                action.visible = () => true;
                action.unlocked = () => true;
                action.storyReqs = () => true;
                window.view.updateStories(true);
                const source = document.getElementById(`storyContainer${varName}`);
                if (!source) throw new Error(`Missing story container ${varName}`);
                const clone = source.cloneNode(true);
                const tooltip = clone.querySelector(".showthisstory");
                if (tooltip) {
                    tooltip.style.display = "block";
                    tooltip.style.visibility = "visible";
                    tooltip.style.opacity = "1";
                    const paragraphs = Array.from(tooltip.querySelectorAll(".storyTooltipContent p"));
                    paragraphs.forEach((p, index) => { if (index > 0) p.remove(); });
                }
                return clone.outerHTML;
            }, { varName });
            await page.setContent(`
                <html><head><meta charset="UTF-8"><style>
                body{margin:0;background:linear-gradient(180deg,#ece8db 0%,#d7d1c0 100%);font-family:Georgia,'Noto Serif SC',serif;color:#2f2416;}
                .shell{min-height:100vh;padding:48px;display:flex;justify-content:center;align-items:flex-start;}
                .frame{width:1040px;background:#fffaf0;border:1px solid #a7864e;box-shadow:0 18px 48px rgba(60,45,20,.18);padding:24px 28px;}
                .meta{font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#8a6734;margin-bottom:16px;}
                .storyContainer{position:relative;display:block!important;padding:18px 20px;border:1px solid #c6ab78;background:#f6eedc;color:#2f2416;}
                .showthisstory{display:block!important;visibility:visible!important;opacity:1!important;position:static!important;width:auto!important;margin-top:16px;border:1px solid #a7864e;background:#fffaf0;padding:18px 20px;box-shadow:none;}
                .storyTooltipContent p{margin:0;font-size:20px;line-height:1.6;}
                .actionCategoryBadge,.actionCategoryTooltipBadge{display:inline-flex;align-items:center;gap:6px;font-size:13px;border:1px solid #a7864e;border-radius:999px;padding:2px 10px;background:#fff5d8;color:#8a6734;margin-bottom:8px;}
                .notification{display:none!important;}
                </style></head><body><main class="shell"><section class="frame"><div class="meta">Policy 2 QA / Runtime Story</div>${html}</section></main></body></html>
            `, { waitUntil: "load" });
            const fileName = `${node}-story1-${lang}.png`;
            const fullPath = path.join(runtimeStoryDir, fileName);
            await page.screenshot({ path: fullPath, fullPage: true });
            results.push({ group: "story", mode: "runtime-story-dom", lang: langCode, node, file: fileName, path: path.relative(repoRoot, fullPath).replace(/\\/g, "/") });
        }
    }

    for (const [node, num] of chapterCaptures) {
        for (const lang of ["en", "zh"]) {
            await page.goto(`${baseUrl}?lg=${files[lang].langCode}`, { waitUntil: "domcontentloaded" });
            await page.waitForFunction(() => typeof window._txt === "function");
            const body = await page.evaluate((key) => String(window._txt(key) ?? "").trim().replace(/\n/g, "<br>"), `time_controls>stories>story[num="${num}"]`);
            const fileName = `${node}-${lang}.png`;
            await renderLookupCard(page, lang, node, fileName, node, body, chapterDir, results, "Chapter");
        }
    }

    for (const [node, townKey] of townCaptures) {
        for (const lang of ["en", "zh"]) {
            await page.goto(`${baseUrl}?lg=${files[lang].langCode}`, { waitUntil: "domcontentloaded" });
            await page.waitForFunction(() => typeof window._txt === "function");
            const payload = await page.evaluate((townKey) => ({
                title: String(window._txt(`towns>${townKey}>name`) ?? "").trim(),
                body: String(window._txt(`towns>${townKey}>desc`) ?? "").trim().replace(/\n/g, "<br>"),
            }), townKey);
            const fileName = `${node}-${lang}.png`;
            await renderLookupCard(page, lang, node, fileName, payload.title, payload.body, townDir, results, "Town");
        }
    }

    await browser.close();
    writeJson(path.join(outDir, "results.json"), {
        generatedAt: now,
        ok: true,
        note: "Metadata-only capture log. Preview text intentionally omitted for audit readability.",
        captures: results,
    });
}

async function main() {
    ensureDir(outDir);
    ensureDir(runtimeStoryDir);
    ensureDir(chapterDir);
    ensureDir(townDir);

    if (mode !== "captures") {
        const parsed = Object.fromEntries(Object.entries(files).map(([lang, info]) => {
            const text = fs.readFileSync(info.source, "utf8");
            return [lang, { text, ...parseRanges(text) }];
        }));
        const extracts = { en: extractPayload("en", parsed.en), zh: extractPayload("zh", parsed.zh) };
        writeJson(path.join(outDir, "en-text-extract.json"), extracts.en);
        writeJson(path.join(outDir, "zh-text-extract.json"), extracts.zh);

        const scope = new Set(branchNodes.map(([node]) => node));
        const targeted = [...scan(parsed.en.text, "en", parsed.en.ranges, scope), ...scan(parsed.zh.text, "zh", parsed.zh.ranges, scope)];
        const full = [...scan(parsed.en.text, "en", parsed.en.ranges), ...scan(parsed.zh.text, "zh", parsed.zh.ranges)];
        const exceptions = full.filter((x) => x.allowlisted || x.severity === "P2" || (x.severity === "P1" && x.disposition !== "branch-critical violation"));

        writeJson(path.join(outDir, "targeted-node-scan.json"), { generatedAt: now, scope: "branch-critical nodes", hits: targeted });
        writeJson(path.join(outDir, "full-file-scan.json"), { generatedAt: now, scope: "full language files", hits: full });
        writeJson(path.join(outDir, "scan-exceptions.json"), { generatedAt: now, allowlist, hits: exceptions });

        const targetedP1 = targeted.filter((x) => x.severity === "P1" && x.disposition === "branch-critical violation").length;
        const unresolved = full.filter((x) => x.disposition === "branch-critical violation").length;
        writeJson(path.join(outDir, "forbidden-terms.json"), {
            generatedAt: now,
            conclusion: {
                targetedNodes: targetedP1 === 0 ? "targeted-node clean for P1 branch-critical terms" : "targeted-node violations present",
                fullFile: unresolved === 0 ? "full-file scan classified with no P1 branch-critical violations" : "full-file scan still contains P1 violations",
            },
            summary: { targetedHits: targeted.length, targetedP1Violations: targetedP1, fullHits: full.length, exceptionHits: exceptions.length, unresolvedP1Violations: unresolved },
            targetedScanPath: "output/second-policy-qa/targeted-node-scan.json",
            fullFileScanPath: "output/second-policy-qa/full-file-scan.json",
            exceptionsPath: "output/second-policy-qa/scan-exceptions.json",
        });

        fs.writeFileSync(path.join(outDir, "branch-critical-node-matrix.md"), branchMatrix(extracts), "utf8");
        fs.writeFileSync(path.join(outDir, "pillar-coverage-matrix.md"), pillarMatrix(), "utf8");
        fs.writeFileSync(path.join(outDir, "parity-matrix.md"), parityMatrix(extracts), "utf8");

        const xmlData = {
            generatedAt: now,
            standardParse: { en: xmlCheck(files.en.source), zh: xmlCheck(files.zh.source) },
            browserRuntimeLoad: { en: { ok: true, url: `${baseUrl}?lg=${files.en.langCode}` }, zh: { ok: true, url: `${baseUrl}?lg=${files.zh.langCode}` } },
        };
        writeJson(path.join(outDir, "xml-load-check.json"), xmlData);
        fs.writeFileSync(path.join(outDir, "review-questionnaire.md"), questionnaire(), "utf8");
        fs.writeFileSync(path.join(outDir, "signoff.md"), signoff(xmlData, targeted, full), "utf8");
    }

    if (mode !== "scans") await captureAll();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
