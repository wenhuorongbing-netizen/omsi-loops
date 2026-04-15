"use strict";

(function setupCloudSaveService(global) {
    function createCloudSaveFacade(adapter, dependencies) {
        if (!adapter) {
            return null;
        }

        const facade = {
            init() {
                return adapter.init();
            },
            revoke() {
                return adapter.revoke();
            },
            async deleteFile(fileId) {
                if (!await adapter.deleteAppDataFile(fileId)) {
                    return;
                }
                dependencies.view.requestUpdate("updateCloudSave", {id: fileId});
            },
            async renameFile(fileId, newName) {
                const file = await adapter.renameAppDataFile(fileId, newName);
                if (file) {
                    dependencies.view.requestUpdate("updateCloudSave", file);
                }
            },
            async importFile(fileId) {
                const saveData = await adapter.fetchSaveData(fileId);
                if (saveData) {
                    dependencies.processSave(saveData);
                }
            },
            async exportSave() {
                dependencies.saveGame();
                const data = dependencies.currentSaveData();
                const name = dependencies.saveFileName().replace(".txt", "");
                if (!await adapter.uploadSaveData(name, data)) {
                    return;
                }
                dependencies.view.requestUpdate("updateCloudSave", dependencies.cloudSavedText(name));
                await dependencies.delay(1000);
                await facade.loadSaves(false);
            },
            async loadSaves(fromUserRequest) {
                const files = await adapter.listSaveFiles(fromUserRequest);
                if (!files) {
                    return;
                }
                dependencies.view.requestUpdate("updateCloudSave", "");
                for (const file of files) {
                    dependencies.view.requestUpdate("updateCloudSave", file);
                }
            },
        };

        return Object.freeze(facade);
    }

    global.IdleLoopsCloudSaveService = Object.freeze({
        createCloudSaveFacade,
    });
})(globalThis);
