"use strict";

(function setupLegacyStoryHooks(global) {
    const storyHookNames = new Set([
        "story",
        "storyReqs",
    ]);

    global.IdleLoopsLegacyStoryHooks = Object.freeze({
        hasStoryHook(hookName) {
            return storyHookNames.has(hookName);
        },
        getStoryModuleId() {
            return "legacy-story-hooks";
        },
        listStoryHooks() {
            return [...storyHookNames];
        },
        invokeStoryHook(actionPrototype, hookName, ...args) {
            const hook = actionPrototype?.[hookName];
            if (typeof hook !== "function") {
                throw new Error(`[content/stories] Missing legacy story hook: ${hookName}`);
            }
            return hook.apply(actionPrototype, args);
        },
    });
})(globalThis);
