importScripts(
    "data.js",
    "localization.js",
    "helpers.js",
    "src/services/save/save-service.js",
    "src/services/save/save-migrations.js",
    "src/services/options/options-store.js",
    "src/services/save/cloud-save-service.js",
    "src/services/predictor/predictor-bridge.js",
    "src/services/predictor/predictor-worker-service.js",
    "src/content/definitions/legacy-shared-actions.js",
    "src/content/helpers/exploration-helpers.js",
    "src/content/helpers/runtime-adjustment-helpers.js",
    "src/content/definitions/beginnersville-actions.js",
    "src/content/definitions/forest-path-actions.js",
    "src/content/definitions/merchanton-actions.js",
    "src/content/definitions/olympus-actions.js",
    "src/content/definitions/valhalla-actions.js",
    "src/content/definitions/startington-actions.js",
    "src/content/definitions/jungle-path-actions.js",
    "src/content/definitions/commerceville-actions.js",
    "src/content/definitions/valley-of-olympus-actions.js",
    "actionList.js",
    "src/content/zone-registry.js",
    "generated/action-metadata-registry.js",
    "src/content/action-metadata-registry.js",
    "src/content/rules/legacy-action-rules.js",
    "src/content/effects/legacy-action-effects.js",
    "src/content/stories/legacy-story-hooks.js",
    "src/content/runtime-hook-registry.js",
    "src/content/content-registry.js",
    "src/core/loop/game-loop.js",
    "src/core/loop/restart-coordinator.js",
    "src/core/loop/offline-progress.js",
    "src/core/loop/game-speed.js",
    "src/core/loop/lag-tracker.js",
    "src/core/loop/run-budget.js",
    "src/core/loop/frame-gate.js",
    "src/core/progression/world-state.js",
    "driver.js",
    "stats.js",
    "src/core/queue/queue-store.js",
    "src/core/runner/current-action-state.js",
    "src/core/runner/action-failure.js",
    "src/core/runner/next-valid-action.js",
    "src/core/runner/action-formulas.js",
    "src/core/runner/action-tick.js",
    "actions.js",
    "src/core/domain/town-state.js",
    "src/core/domain/resource-state.js",
    "src/core/progression/town-progress.js",
    "src/core/progression/meta-progression.js",
    "src/core/progression/prestige-state.js",
    "src/core/progression/buff-cap-state.js",
    "src/core/progression/runtime-state.js",
    "src/core/progression/character-state.js",
    "src/core/progression/story-state.js",
    "src/core/progression/challenge-state.js",
    "town.js",
    "prestige.js",
    "src/app/legacy-globals.js",
    "src/app/app-context.js",
    "src/app/game-session.js",
    "saving.js",
    "predictor.js",
    "src/app/bootstrap.js"
);

/**
 * @typedef {{
 *  type: "setOptions",
 *  options: typeof options,
 * } | {
 *  type: "verifyDefaultIds",
 *  idRefs: SnapshotIdMap,
 * } | {
 *  type: "importSnapshots",
 *  snapshotExports: SnapshotExport[],
 *  resetToDefaults?: boolean,
 * } | {
 *  type: "startUpdate",
 *  runData: PredictorRunData,
 *  snapshotHeritage: number[],
 * }} MessageToPredictor 
 * 
 * @typedef {{
 *  type: "error",
 *  message: string,
 * } | {
 *  type: "getSnapshots",
 *  snapshotIds: number[],
 * } | {
 *  type: "update",
 *  id: number,
 *  i: number,
 *  state: PredictorRunState,
 *  isValid: boolean,
 * } | {
 *  type: "endUpdate",
 *  id: number,
 *  runData: PredictorRunData,
 * }} MessageFromPredictor
 */

console.log("starting predictor worker");

const predictor = IdleLoopsBootstrap.bootstrapPredictorWorker();
const predictorWorkerService = IdleLoopsPredictorWorkerService.create({
    predictor,
    dataApi: Data,
    postMessage: self.postMessage.bind(self),
});

/** @param {MessageEvent<MessageToPredictor>} e */
onmessage = e => {
    predictorWorkerService.handleMessage(e.data);
}
