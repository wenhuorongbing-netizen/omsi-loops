"use strict";

(function setupActionMetadataRegistry(global) {
    /**
     * @typedef {{
     *   id: string,
     *   name: string,
     *   varName: string,
     *   type: string,
     *   townNum: number,
     *   xmlName: string,
     *   category: string,
     *   constructorKind: string,
     *   hasStoryReqs: boolean,
     *   stats: string[],
     *   affectedBy: string[],
     *   runtimeHooks: string[],
     *   isTravel: boolean,
     *   legacyIndex: number,
     * }} RawActionMetadata
     */

    function requireGeneratedMetadata() {
        const generatedMetadata = global.IdleLoopsGeneratedActionMetadata;
        if (!generatedMetadata || !Array.isArray(generatedMetadata.entries)) {
            throw new Error("[content] IdleLoopsGeneratedActionMetadata.entries is not available");
        }
        return generatedMetadata;
    }

    function requireZoneRegistry() {
        const zoneRegistry = global.IdleLoopsZoneRegistry;
        if (!zoneRegistry || typeof zoneRegistry.getZoneByTownNum !== "function") {
            throw new Error("[content] IdleLoopsZoneRegistry is not available");
        }
        return zoneRegistry;
    }

    /** @param {(string|null|undefined)[]} values */
    function compactUnique(values) {
        return [...new Set(values.filter(Boolean))];
    }

    /** @param {RawActionMetadata} entry */
    function buildCostKey(entry) {
        const hookSet = new Set(entry.runtimeHooks);
        return hookSet.has("manaCost") || hookSet.has("goldCost") ? `legacy:${entry.id}:cost` : null;
    }

    /** @param {RawActionMetadata} entry */
    function buildRewardKey(entry) {
        const hookSet = new Set(entry.runtimeHooks);
        return hookSet.has("finish") ? `legacy:${entry.id}:finish` : null;
    }

    /** @param {RawActionMetadata} entry */
    function buildProgressKey(entry) {
        const hookSet = new Set(entry.runtimeHooks);
        return hookSet.has("tickProgress") ? `legacy:${entry.id}:tickProgress` : null;
    }

    /**
     * @param {RawActionMetadata} entry
     * @param {ReturnType<typeof requireZoneRegistry>} zoneRegistry
     */
    function normalizeEntry(entry, zoneRegistry) {
        const zone = zoneRegistry.getZoneByTownNum(entry.townNum);
        const zoneId = zone?.id ?? `town-${entry.townNum}`;
        const runtimeHookIds = entry.runtimeHooks.map(hookName => `legacy:${entry.id}:${hookName}`);

        return Object.freeze({
            id: entry.id,
            name: entry.name,
            varName: entry.varName,
            type: entry.type,
            townNum: entry.townNum,
            zoneId,
            category: entry.category,
            tags: Object.freeze(compactUnique([
                `type:${entry.type}`,
                `category:${entry.category}`,
                `zone:${zoneId}`,
                `kind:${entry.constructorKind}`,
                entry.hasStoryReqs ? "story" : null,
                entry.isTravel ? "travel" : null,
                entry.constructorKind === "DungeonAction" ? "dungeon" : null,
                entry.constructorKind === "TrialAction" ? "trial" : null,
            ])),
            localizationKey: `actions>${entry.xmlName}`,
            visibleKey: entry.runtimeHooks.includes("visible") ? `legacy:${entry.id}:visible` : null,
            unlockedKey: entry.runtimeHooks.includes("unlocked") ? `legacy:${entry.id}:unlocked` : null,
            costKey: buildCostKey(entry),
            rewardKey: buildRewardKey(entry),
            progressKey: buildProgressKey(entry),
            storySetId: entry.hasStoryReqs ? entry.xmlName : null,
            runtimeHookIds: Object.freeze(runtimeHookIds),
            xmlName: entry.xmlName,
            constructorKind: entry.constructorKind,
            hasStoryReqs: entry.hasStoryReqs,
            stats: Object.freeze(entry.stats.slice()),
            affectedBy: Object.freeze(entry.affectedBy.slice()),
            isTravel: entry.isTravel,
            legacyIndex: entry.legacyIndex,
        });
    }

    const generatedMetadata = requireGeneratedMetadata();
    const zoneRegistry = requireZoneRegistry();
    const actionMetadataEntries = Object.freeze(generatedMetadata.entries.map(
        /** @param {RawActionMetadata} entry */ entry => normalizeEntry(entry, zoneRegistry)
    ));

    const actionMetadataById = Object.freeze(Object.fromEntries(actionMetadataEntries.map(entry => [entry.id, entry])));
    const actionMetadataByName = Object.freeze(Object.fromEntries(actionMetadataEntries.map(entry => [entry.name, entry])));
    const actionMetadataByVarName = Object.freeze(Object.fromEntries(actionMetadataEntries.map(entry => [entry.varName, entry])));

    global.IdleLoopsActionMetadataRegistry = Object.freeze({
        listActionMetadata() {
            return actionMetadataEntries.slice();
        },
        getActionMetadata(query) {
            if (typeof query !== "string") return null;
            return actionMetadataById[query] ?? actionMetadataByVarName[query] ?? actionMetadataByName[query] ?? null;
        },
        getActionMetadataById(actionId) {
            return actionMetadataById[actionId] ?? null;
        },
        getActionMetadataByName(name) {
            return actionMetadataByName[name] ?? null;
        },
        getActionMetadataByVarName(varName) {
            return actionMetadataByVarName[varName] ?? null;
        },
        listActionMetadataByZone(zoneId) {
            return actionMetadataEntries.filter(entry => entry.zoneId === zoneId);
        },
        listActionMetadataByTownNum(townNum) {
            return actionMetadataEntries.filter(entry => entry.townNum === townNum);
        },
        getSummary() {
            return {
                version: generatedMetadata.version,
                generatedAt: generatedMetadata.generatedAt,
                source: generatedMetadata.source,
                actionCount: actionMetadataEntries.length,
                zoneCount: zoneRegistry.listZones().length,
            };
        },
    });
})(globalThis);
