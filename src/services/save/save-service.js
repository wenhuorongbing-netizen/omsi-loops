"use strict";

(function setupSaveService(global) {
    function readSaveJson(storage, slotName) {
        return storage?.[slotName] ?? null;
    }

    function hasSaveSlot(storage, slotName) {
        const value = readSaveJson(storage, slotName);
        return !!value && value !== "null";
    }

    function clearSaveSlot(storage, slotName) {
        storage[slotName] = "";
        return slotName;
    }

    function clearSaveSlots(storage, slotNames) {
        for (const slotName of slotNames) {
            clearSaveSlot(storage, slotName);
        }
        return [...slotNames];
    }

    function copySaveSlot(storage, sourceSlotName, targetSlotName) {
        storage[targetSlotName] = readSaveJson(storage, sourceSlotName);
        return targetSlotName;
    }

    function storeSaveJson(storage, slotName, saveJson, callbacks = {}) {
        try {
            storage[slotName] = saveJson;
            return {
                stored: true,
                slotName,
            };
        } catch (error) {
            if (error instanceof DOMException && error.name === "QuotaExceededError") {
                callbacks.onQuotaExceeded?.(error);
                return {
                    stored: false,
                    slotName,
                    quotaExceeded: true,
                };
            }
            throw error;
        }
    }

    function createEncodedSaveData(saveJson, compressor) {
        return `ILSV01${compressor.compressToBase64(saveJson)}`;
    }

    function decodeSaveData(saveData, dependencies) {
        if (saveData.substr(0, 6) === "ILSV01") {
            return dependencies.compressor.decompressFromBase64(saveData.substr(6));
        }
        return dependencies.decodeLegacy(saveData);
    }

    function buildSaveFileName(gameName, version, loopCount) {
        return `${gameName} ${version} - Loop ${loopCount}.txt`;
    }

    global.IdleLoopsSaveService = Object.freeze({
        readSaveJson,
        hasSaveSlot,
        clearSaveSlot,
        clearSaveSlots,
        copySaveSlot,
        storeSaveJson,
        createEncodedSaveData,
        decodeSaveData,
        buildSaveFileName,
    });
})(globalThis);
