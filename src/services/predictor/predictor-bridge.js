"use strict";

(function initPredictorBridge(global) {
    class PredictorWorkerBridge {
        /**
         * @param {{
         *   isEnabled: () => boolean,
         *   createWorker: () => Omit<Worker, 'postMessage'> & {postMessage(message: MessageToPredictor): void},
         *   createInitMessages: () => MessageToPredictor[],
         *   resolveSnapshotExports: (snapshotIds: number[]) => SnapshotExport[]|null,
         *   onWorkerError?: (data: Extract<MessageFromPredictor, {type: "error"}>) => void,
         * }} config
         */
        constructor(config) {
            this.config = config;
            /** @type {(Omit<Worker, 'postMessage'> & {postMessage(message: MessageToPredictor): void})|null} */
            this.worker = null;
            /** @type {Record<number, {resolve: (data: MessageFromPredictor) => void, reject: (error: any) => void}>} */
            this.channelAwaiters = {};
            /** @type {Record<number, MessageFromPredictor[]>} */
            this.channelQueues = {};
            this.workerDisabled = false;
            this.handleMessageEvent = this.handleMessageEvent.bind(this);
        }

        ensureWorker() {
            if (!this.worker && this.config.isEnabled() && !this.workerDisabled) {
                this.worker = this.config.createWorker();
                this.worker.onmessage = this.handleMessageEvent;
                for (const message of this.config.createInitMessages()) {
                    this.worker.postMessage(message);
                }
            }
            return this.worker;
        }

        terminate() {
            if (this.worker) {
                this.worker.terminate();
                this.worker = null;
            }
        }

        /** @param {MessageToPredictor} message */
        postMessage(message) {
            const worker = this.ensureWorker();
            if (!worker) return false;
            worker.postMessage(message);
            return true;
        }

        /** @param {number} channel @returns {Promise<MessageFromPredictor>} */
        nextMessage(channel) {
            return new Promise((resolve, reject) => {
                const message = this.channelQueues[channel]?.shift();
                if (message) {
                    if (this.channelQueues[channel].length === 0) {
                        delete this.channelQueues[channel];
                    }
                    resolve(message);
                } else {
                    this.channelAwaiters[channel]?.reject("channel overridden");
                    this.channelAwaiters[channel] = {resolve, reject};
                }
            });
        }

        /** @param {MessageEvent<MessageFromPredictor>} event */
        handleMessageEvent(event) {
            this.handleMessage(event.data);
        }

        /** @param {MessageFromPredictor} data */
        handleMessage(data) {
            if (data.type === "error") {
                this.terminate();
                this.workerDisabled = true;
                this.config.onWorkerError?.(data);
                return;
            }
            if (data.type === "getSnapshots") {
                const snapshotExports = this.config.resolveSnapshotExports(data.snapshotIds);
                if (snapshotExports && snapshotExports.length === data.snapshotIds.length) {
                    this.postMessage({type: "importSnapshots", snapshotExports});
                } else {
                    console.debug(`Only found ${snapshotExports?.length ?? 0} of ${data.snapshotIds.length} requested snapshots. Ignoring request, probably stale.`, data.snapshotIds);
                }
                return;
            }
            const channel = data.id || 0;
            const awaiter = this.channelAwaiters[channel];
            if (awaiter) {
                awaiter.resolve(data);
                delete this.channelAwaiters[channel];
            } else {
                (this.channelQueues[channel] ??= []).push(data);
            }
        }
    }

    global.IdleLoopsPredictorBridge = {
        /** @param {ConstructorParameters<typeof PredictorWorkerBridge>[0]} config */
        createWorkerBridge(config) {
            return new PredictorWorkerBridge(config);
        },
    };
})(globalThis);
