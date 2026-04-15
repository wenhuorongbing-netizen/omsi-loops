"use strict";

(function initPredictorWorkerService(global) {
    class PredictorWorkerService {
        /**
         * @param {{
         *   predictor: Predictor,
         *   dataApi: typeof Data,
         *   postMessage: (message: MessageFromPredictor) => void,
         * }} config
         */
        constructor(config) {
            this.predictor = config.predictor;
            this.dataApi = config.dataApi;
            this.postMessage = config.postMessage;
            /** @type {MessageToPredictor|undefined} */
            this.queuedUpdate = undefined;
        }

        /** @param {MessageToPredictor} data */
        handleMessage(data) {
            if (!data?.type) {
                console.error("Unexpected message, no type:", data);
                return;
            }

            switch (data.type) {
                case "setOptions":
                    this.predictor.setOptions(data.options);
                    break;
                case "verifyDefaultIds":
                    if (!this.dataApi.verifyDefaultIds(data.idRefs)) {
                        this.postMessage({type: "error", message: "default id verification failed"});
                    }
                    break;
                case "importSnapshots":
                    this.importSnapshots(data);
                    break;
                case "startUpdate":
                    this.startUpdate(data);
                    break;
            }
        }

        /** @param {Extract<MessageToPredictor, {type: "importSnapshots"}>} data */
        importSnapshots(data) {
            if (data.resetToDefaults) {
                this.dataApi.resetToDefaults();
            }
            const {snapshotExports} = data;
            try {
                for (const exportToLoad of snapshotExports) {
                    if (this.dataApi.getSnapshotIndex({id: exportToLoad.id}) >= 0) {
                        console.debug(`Already loaded snapshot ${exportToLoad.id}`);
                        continue;
                    }
                    this.dataApi.importSnapshot(exportToLoad);
                }
            } catch (error) {
                if (error instanceof SnapshotMissingError) {
                    console.error(`missing snapshot ${error.id}?`, error);
                    this.postMessage({type: "error", message: error.message});
                } else {
                    this.postMessage({type: "error", message: error.toString()});
                }
                return;
            }
            if (this.queuedUpdate) {
                const queuedUpdate = this.queuedUpdate;
                this.queuedUpdate = undefined;
                this.handleMessage(queuedUpdate);
            }
        }

        /** @param {Extract<MessageToPredictor, {type: "startUpdate"}>} data */
        startUpdate(data) {
            const {runData, snapshotHeritage} = data;
            const id = snapshotHeritage.at(-1);
            if (this.dataApi.getSnapshotIndex({id}) >= 0) {
                this.dataApi.getSnapshot({id}).applyState();
                this.predictor.workerUpdate(runData);
                return;
            }
            const requiredSnapshots = snapshotHeritage.filter(snapshotId => this.dataApi.getSnapshotIndex({id: snapshotId}) === -1);
            this.queuedUpdate = data;
            this.postMessage({type: "getSnapshots", snapshotIds: requiredSnapshots});
        }
    }

    global.IdleLoopsPredictorWorkerService = {
        /** @param {ConstructorParameters<typeof PredictorWorkerService>[0]} config */
        create(config) {
            return new PredictorWorkerService(config);
        },
    };
})(globalThis);
