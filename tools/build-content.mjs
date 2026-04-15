import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { startStaticServer } from "./static-server-lib.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.resolve(rootDir, "generated/action-metadata-registry.js");

async function startContentServer() {
    const host = "127.0.0.1";
    const preferredPorts = [
        8600,
        8601,
        8602,
        8603,
        8604,
    ];

    for (const port of preferredPorts) {
        try {
            return await startStaticServer({
                rootDir,
                host,
                port,
            });
        } catch (error) {
            if (error?.code !== "EADDRINUSE") {
                throw error;
            }
        }
    }

    throw new Error(`Could not start content build server on any preferred port: ${preferredPorts.join(", ")}`);
}

function formatGeneratedFile(payload) {
    const serialized = JSON.stringify(payload, null, 4);
    const indented = serialized
        .split("\n")
        .map(line => `    ${line}`)
        .join("\n");
    return `"use strict";\n\n(function defineGeneratedActionMetadata(global) {\n    global.IdleLoopsGeneratedActionMetadata = Object.freeze(\n${indented}\n    );\n})(globalThis);\n`;
}

async function collectActionMetadata(baseUrl) {
    const browser = await chromium.launch({headless: true});
    const context = await browser.newContext();
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];

    page.on("console", message => {
        if (message.type() === "error") {
            consoleErrors.push(message.text());
        }
    });
    page.on("pageerror", error => {
        pageErrors.push(String(error));
    });

    try {
        await page.addInitScript(() => {
            try {
                localStorage.clear();
            } catch (_error) {
                // ignored during content build bootstrap
            }
        });
        await page.goto(baseUrl, {waitUntil: "load"});
        await page.waitForFunction(() =>
            globalThis.IdleLoopsBootstrap?.getGameSession?.()
            && Array.isArray(totalActionList)
            && totalActionList.length > 0
        );

        if (consoleErrors.length || pageErrors.length) {
            throw new Error(`Content build bootstrap failed with console/page errors:\n${[...consoleErrors, ...pageErrors].join("\n")}`);
        }

        return await page.evaluate(() => {
            const actionIds = new Map(
                Object.entries(Action)
                    .filter(([_key, value]) => value instanceof Action)
                    .map(([actionId, action]) => [action, actionId])
            );

            const entries = totalActionList.map((action, legacyIndex) => {
                const runtimeHooks = Object.keys(action)
                    .filter(key => typeof action[key] === "function")
                    .sort();

                const constructorKind = action instanceof TrialAction
                    ? "TrialAction"
                    : action instanceof DungeonAction
                        ? "DungeonAction"
                        : action instanceof MultipartAction
                            ? "MultipartAction"
                            : "Action";

                return {
                    id: actionIds.get(action) ?? withoutSpaces(action.name),
                    name: action.name,
                    varName: action.varName,
                    type: action.type,
                    townNum: action.townNum,
                    xmlName: Action.xmlNameFor(action.name),
                    category: action.category,
                    constructorKind,
                    hasStoryReqs: Object.prototype.hasOwnProperty.call(action, "storyReqs"),
                    stats: Object.keys(action.stats ?? {}).sort(),
                    affectedBy: Array.isArray(action.affectedBy) ? action.affectedBy.slice().sort() : [],
                    runtimeHooks,
                    isTravel: typeof getPossibleTravel === "function" ? getPossibleTravel(action.name).length > 0 : false,
                    legacyIndex,
                };
            });

            return {
                version: 1,
                generatedAt: new Date().toISOString(),
                source: "tools/build-content.mjs",
                entries,
            };
        });
    } finally {
        await context.close();
        await browser.close();
    }
}

async function main() {
    const server = await startContentServer();

    try {
        const metadata = await collectActionMetadata(`${server.url}/index.html`);
        await fs.mkdir(path.dirname(outputPath), {recursive: true});
        await fs.writeFile(outputPath, formatGeneratedFile(metadata), "utf8");
        console.log(`Generated action metadata registry written to ${outputPath}`);
        console.log(`Actions captured: ${metadata.entries.length}`);
    } finally {
        await server.close();
    }
}

await main();
