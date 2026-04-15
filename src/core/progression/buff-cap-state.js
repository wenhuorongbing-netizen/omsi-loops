"use strict";

(function setupBuffCapState(global) {
    function normalizeBuffCapValue(rawValue, hardCap, fallbackValue = 0) {
        const parsedValue = parseInt(rawValue, 10);
        const baseValue = Number.isNaN(parsedValue) ? fallbackValue : parsedValue;
        return Math.min(baseValue, hardCap);
    }

    function applyBuffCapInput(buffCaps, buff, rawValue, buffHardCaps) {
        const nextValue = normalizeBuffCapValue(rawValue, buffHardCaps[buff], buffCaps[buff]);
        buffCaps[buff] = nextValue;
        return nextValue;
    }

    function applyBuffCapSnapshot(buffCaps, nextBuffCaps) {
        for (const key of Object.keys(buffCaps)) {
            delete buffCaps[key];
        }
        Object.assign(buffCaps, nextBuffCaps ?? {});
        return buffCaps;
    }

    global.IdleLoopsBuffCapState = Object.freeze({
        normalizeBuffCapValue,
        applyBuffCapInput,
        applyBuffCapSnapshot,
    });
})(globalThis);
