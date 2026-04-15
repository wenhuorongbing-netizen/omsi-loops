"use strict";

(function setupOptionsStore(global) {
    function readStorageValue(storage, key) {
        return typeof storage?.getItem === "function"
            ? storage.getItem(key)
            : storage?.[key] ?? null;
    }

    function writeStorageValue(storage, key, value) {
        storage[key] = value;
        return value;
    }

    function importLegacyPredictorSettings(storage, settingsMap, dependencies) {
        const newOptions = {};
        for (const [originalSetting, newOption] of Object.entries(settingsMap)) {
            const value = readStorageValue(storage, originalSetting);
            if (value != null) {
                if (dependencies.isNumericOption(newOption)) {
                    const numericValue = parseInt(value, 10);
                    if (isFinite(numericValue)) {
                        newOptions[newOption] = numericValue;
                    }
                } else if (dependencies.isStringOption(newOption)) {
                    newOptions[newOption] = value;
                } else {
                    newOptions[newOption] = value === "true";
                }
            }
        }
        return newOptions;
    }

    function readActionListHeight(storage) {
        return readStorageValue(storage, "actionListHeight");
    }

    function writeActionListHeight(storage, height) {
        if (height !== "") {
            writeStorageValue(storage, "actionListHeight", height);
        }
        return height;
    }

    function readUpdateRate(storage) {
        return readStorageValue(storage, "updateRate");
    }

    function writeUpdateRate(storage, updateRate) {
        return writeStorageValue(storage, "updateRate", updateRate);
    }

    function writePredictorToggle(storage, value) {
        return writeStorageValue(storage, "loadPredictor", value || "");
    }

    global.IdleLoopsOptionsStore = Object.freeze({
        readStorageValue,
        writeStorageValue,
        importLegacyPredictorSettings,
        readActionListHeight,
        writeActionListHeight,
        readUpdateRate,
        writeUpdateRate,
        writePredictorToggle,
    });
})(globalThis);
