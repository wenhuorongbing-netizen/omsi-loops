"use strict";

(function setupRuntimeHookRegistry(global) {
    function requireActionMetadataRegistry() {
        const actionRegistry = global.IdleLoopsActionMetadataRegistry;
        if (!actionRegistry || typeof actionRegistry.listActionMetadata !== "function") {
            throw new Error("[content] IdleLoopsActionMetadataRegistry.listActionMetadata is not available");
        }
        return actionRegistry;
    }

    function requireActionConstructor() {
        const actionConstructor = typeof Action !== "undefined" ? Action : global.Action;
        if (typeof actionConstructor !== "function") {
            throw new Error("[content] Legacy Action constructor is not available");
        }
        return actionConstructor;
    }

    function requireRuleRegistry() {
        const ruleRegistry = global.IdleLoopsLegacyActionRules;
        if (!ruleRegistry || typeof ruleRegistry.hasRuleHook !== "function") {
            throw new Error("[content] IdleLoopsLegacyActionRules is not available");
        }
        return ruleRegistry;
    }

    function requireEffectRegistry() {
        const effectRegistry = global.IdleLoopsLegacyActionEffects;
        if (!effectRegistry || typeof effectRegistry.hasEffectHook !== "function") {
            throw new Error("[content] IdleLoopsLegacyActionEffects is not available");
        }
        return effectRegistry;
    }

    function requireStoryRegistry() {
        const storyRegistry = global.IdleLoopsLegacyStoryHooks;
        if (!storyRegistry || typeof storyRegistry.hasStoryHook !== "function") {
            throw new Error("[content] IdleLoopsLegacyStoryHooks is not available");
        }
        return storyRegistry;
    }

    function requireLegacyActionPrototype(actionId) {
        const actionConstructor = requireActionConstructor();
        const actionPrototype = actionConstructor[actionId];
        if (!actionPrototype || !(actionPrototype instanceof actionConstructor)) {
            throw new Error(`[content] Missing legacy action prototype for ${actionId}`);
        }
        return actionPrototype;
    }

    /**
     * @param {string} hookId
     * @param {string} actionId
     * @param {string} actionName
     * @param {string} hookName
     * @param {"rule"|"effect"|"story"} kind
     * @param {string} moduleId
     * @param {boolean} effectful
     * @param {string[] | undefined} delegatesTo
     */
    function createDescriptor(hookId, actionId, actionName, hookName, kind, moduleId, effectful, delegatesTo) {
        return Object.freeze({
            id: hookId,
            actionId,
            actionName,
            hookName,
            kind,
            moduleId,
            effectful,
            delegatesTo: Object.freeze([...(delegatesTo ?? [])]),
            source: "actionList.js",
        });
    }

    /**
     * @param {Record<string, ReturnType<typeof createDescriptor>>} descriptors
     * @param {Record<string, (...args: any[]) => any>} handlers
     * @param {string} hookId
     * @param {ReturnType<typeof createDescriptor>} descriptor
     * @param {(...args: any[]) => any} invoke
     */
    function registerHook(descriptors, handlers, hookId, descriptor, invoke) {
        descriptors[hookId] = descriptor;
        handlers[hookId] = invoke;
    }

    const actionRegistry = requireActionMetadataRegistry();
    const ruleRegistry = requireRuleRegistry();
    const effectRegistry = requireEffectRegistry();
    const storyRegistry = requireStoryRegistry();
    const hookDescriptorsById = Object.create(null);
    const hookHandlersById = Object.create(null);

    for (const metadata of actionRegistry.listActionMetadata()) {
        const actionPrototype = requireLegacyActionPrototype(metadata.id);

        for (const hookId of metadata.runtimeHookIds) {
            const hookName = hookId.slice(hookId.lastIndexOf(":") + 1);
            const hook = actionPrototype[hookName];
            if (typeof hook !== "function") {
                continue;
            }

            const kind = storyRegistry.hasStoryHook(hookName)
                ? "story"
                : effectRegistry.hasEffectHook(hookName)
                    ? "effect"
                    : "rule";
            const moduleId = kind === "story"
                ? storyRegistry.getStoryModuleId(hookName)
                : kind === "effect"
                    ? effectRegistry.getEffectModuleId(hookName)
                    : ruleRegistry.getRuleModuleId(hookName);
            const invoke = kind === "story"
                ? (...args) => storyRegistry.invokeStoryHook(actionPrototype, hookName, ...args)
                : kind === "effect"
                    ? (...args) => effectRegistry.invokeEffectHook(actionPrototype, hookName, ...args)
                    : (...args) => ruleRegistry.invokeRuleHook(actionPrototype, hookName, ...args);

            registerHook(
                hookDescriptorsById,
                hookHandlersById,
                hookId,
                createDescriptor(
                    hookId,
                    metadata.id,
                    metadata.name,
                    hookName,
                    kind,
                    moduleId,
                    kind === "effect",
                ),
                invoke,
            );
        }

        if (metadata.costKey && !hookDescriptorsById[metadata.costKey]) {
            registerHook(
                hookDescriptorsById,
                hookHandlersById,
                metadata.costKey,
                createDescriptor(
                    metadata.costKey,
                    metadata.id,
                    metadata.name,
                    "cost",
                    "rule",
                    ruleRegistry.getRuleModuleId("cost"),
                    false,
                    ["manaCost", "goldCost"],
                ),
                (...args) => ruleRegistry.invokeRuleHook(actionPrototype, "cost", ...args),
            );
        }
    }

    const hookDescriptors = Object.freeze(Object.values(hookDescriptorsById));

    global.IdleLoopsRuntimeHookRegistry = Object.freeze({
        listRuntimeHooks() {
            return hookDescriptors.slice();
        },
        listRuntimeHooksByKind(kind) {
            return hookDescriptors.filter(hook => hook.kind === kind);
        },
        hasRuntimeHook(hookId) {
            return hookId in hookHandlersById;
        },
        getRuntimeHookDescriptor(hookId) {
            return hookDescriptorsById[hookId] ?? null;
        },
        listRuntimeHooksForAction(actionQuery) {
            const metadata = actionRegistry.getActionMetadata(actionQuery);
            if (!metadata) return [];
            return hookDescriptors.filter(hook => hook.actionId === metadata.id);
        },
        invokeRuntimeHook(hookId, ...args) {
            const invoke = hookHandlersById[hookId];
            if (typeof invoke !== "function") {
                throw new Error(`[content] Unknown runtime hook id: ${hookId}`);
            }
            return invoke(...args);
        },
        getSummary() {
            return {
                hookCount: hookDescriptors.length,
                ruleHookCount: hookDescriptors.filter(hook => hook.kind === "rule").length,
                effectHookCount: hookDescriptors.filter(hook => hook.kind === "effect").length,
                storyHookCount: hookDescriptors.filter(hook => hook.kind === "story").length,
                effectfulHookCount: hookDescriptors.filter(hook => hook.effectful).length,
            };
        },
    });
})(globalThis);
