"use strict";

(function setupLegacyActionEffects(global) {
    const effectHookNames = new Set([
        "finish",
        "loopsFinished",
        "segmentFinished",
    ]);

    global.IdleLoopsLegacyActionEffects = Object.freeze({
        hasEffectHook(hookName) {
            return effectHookNames.has(hookName);
        },
        getEffectModuleId() {
            return "legacy-action-effects";
        },
        listEffectHooks() {
            return [...effectHookNames];
        },
        invokeEffectHook(actionPrototype, hookName, ...args) {
            const hook = actionPrototype?.[hookName];
            if (typeof hook !== "function") {
                throw new Error(`[content/effects] Missing legacy effect hook: ${hookName}`);
            }
            return hook.apply(actionPrototype, args);
        },
    });
})(globalThis);
