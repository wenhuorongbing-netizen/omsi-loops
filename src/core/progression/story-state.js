"use strict";

(function setupStoryState(global) {
    function unlockGlobalStory(storyMax, num) {
        if (num <= storyMax) {
            return {
                changed: false,
                storyMax,
            };
        }

        return {
            changed: true,
            storyMax: num,
        };
    }

    function setStoryFlag(storyFlags, name) {
        if (storyFlags[name]) {
            return {
                changed: false,
                value: storyFlags[name],
            };
        }

        storyFlags[name] = true;
        return {
            changed: true,
            value: true,
        };
    }

    function increaseStoryVarTo(storyVars, name, value) {
        const currentValue = storyVars[name] ?? 0;
        if (currentValue >= value) {
            return {
                changed: false,
                value: currentValue,
            };
        }

        storyVars[name] = value;
        return {
            changed: true,
            value,
        };
    }

    function applyStoryCollections(storyFlags, storyVars, collections) {
        for (const key of Object.keys(storyFlags)) {
            delete storyFlags[key];
        }
        Object.assign(storyFlags, collections.storyFlags ?? {});

        for (const key of Object.keys(storyVars)) {
            delete storyVars[key];
        }
        Object.assign(storyVars, collections.storyVars ?? {});

        return {
            storyFlags,
            storyVars,
        };
    }

    global.IdleLoopsStoryState = Object.freeze({
        unlockGlobalStory,
        setStoryFlag,
        increaseStoryVarTo,
        applyStoryCollections,
    });
})(globalThis);
