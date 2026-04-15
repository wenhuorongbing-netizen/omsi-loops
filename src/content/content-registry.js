"use strict";

(function setupContentRegistry(global) {
    function requireZoneRegistry() {
        const zoneRegistry = global.IdleLoopsZoneRegistry;
        if (!zoneRegistry || typeof zoneRegistry.listZones !== "function") {
            throw new Error("[content] IdleLoopsZoneRegistry.listZones is not available");
        }
        return zoneRegistry;
    }

    function requireActionMetadataRegistry() {
        const actionRegistry = global.IdleLoopsActionMetadataRegistry;
        if (!actionRegistry || typeof actionRegistry.listActionMetadata !== "function") {
            throw new Error("[content] IdleLoopsActionMetadataRegistry.listActionMetadata is not available");
        }
        return actionRegistry;
    }

    function requireRuntimeHookRegistry() {
        const hookRegistry = global.IdleLoopsRuntimeHookRegistry;
        if (!hookRegistry || typeof hookRegistry.listRuntimeHooks !== "function") {
            throw new Error("[content] IdleLoopsRuntimeHookRegistry.listRuntimeHooks is not available");
        }
        return hookRegistry;
    }

    const zoneRegistry = requireZoneRegistry();
    const actionRegistry = requireActionMetadataRegistry();
    const hookRegistry = requireRuntimeHookRegistry();

    global.IdleLoopsContentRegistry = Object.freeze({
        listZones() {
            return zoneRegistry.listZones();
        },
        getZoneById(zoneId) {
            return zoneRegistry.getZoneById(zoneId);
        },
        getZoneByTownNum(townNum) {
            return zoneRegistry.getZoneByTownNum(townNum);
        },
        listActionMetadata() {
            return actionRegistry.listActionMetadata();
        },
        getActionMetadata(query) {
            return actionRegistry.getActionMetadata(query);
        },
        listRuntimeHooks() {
            return hookRegistry.listRuntimeHooks();
        },
        listRuntimeHooksByKind(kind) {
            return hookRegistry.listRuntimeHooksByKind(kind);
        },
        getRuntimeHookDescriptor(hookId) {
            return hookRegistry.getRuntimeHookDescriptor(hookId);
        },
        hasRuntimeHook(hookId) {
            return hookRegistry.hasRuntimeHook(hookId);
        },
        listRuntimeHooksForAction(actionQuery) {
            return hookRegistry.listRuntimeHooksForAction(actionQuery);
        },
        invokeRuntimeHook(hookId, ...args) {
            return hookRegistry.invokeRuntimeHook(hookId, ...args);
        },
        getSummary() {
            const actionSummary = actionRegistry.getSummary();
            const hookSummary = hookRegistry.getSummary();
            return {
                zoneCount: zoneRegistry.listZones().length,
                actionCount: actionSummary.actionCount,
                hookCount: hookSummary.hookCount,
                ruleHookCount: hookSummary.ruleHookCount,
                effectHookCount: hookSummary.effectHookCount,
                storyHookCount: hookSummary.storyHookCount,
                effectfulHookCount: hookSummary.effectfulHookCount,
                version: actionSummary.version,
                generatedAt: actionSummary.generatedAt,
                source: actionSummary.source,
            };
        },
    });
})(globalThis);
