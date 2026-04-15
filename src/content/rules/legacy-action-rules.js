"use strict";

(function setupLegacyActionRules(global) {
    const ruleHookNames = new Set([
        "allowed",
        "canStart",
        "cost",
        "getPartName",
        "goldCost",
        "loopCost",
        "manaCost",
        "tickProgress",
        "unlocked",
        "visible",
    ]);

    function invokeLegacyHook(actionPrototype, hookName, args) {
        const hook = actionPrototype?.[hookName];
        if (typeof hook !== "function") {
            throw new Error(`[content/rules] Missing legacy rule hook: ${hookName}`);
        }
        return hook.apply(actionPrototype, args);
    }

    global.IdleLoopsLegacyActionRules = Object.freeze({
        hasRuleHook(hookName) {
            return ruleHookNames.has(hookName);
        },
        getRuleModuleId(hookName) {
            return hookName === "cost" ? "legacy-cost-rules" : "legacy-action-rules";
        },
        listRuleHooks() {
            return [...ruleHookNames];
        },
        invokeRuleHook(actionPrototype, hookName, ...args) {
            if (hookName === "cost") {
                return {
                    manaCost: typeof actionPrototype?.manaCost === "function" ? actionPrototype.manaCost.apply(actionPrototype, args) : null,
                    goldCost: typeof actionPrototype?.goldCost === "function" ? actionPrototype.goldCost.apply(actionPrototype, args) : null,
                };
            }
            return invokeLegacyHook(actionPrototype, hookName, args);
        },
    });
})(globalThis);
