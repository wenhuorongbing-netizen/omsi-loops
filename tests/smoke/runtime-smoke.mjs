import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { readFixtureFile } from "../support/fixture-manifest.mjs";
import { dismissTutorialIfPresent, openFixturePage } from "../support/runtime-fixture-driver.mjs";

const thisDir = path.dirname(fileURLToPath(import.meta.url));
const defaultFixturePath = path.resolve(thisDir, "../fixtures/saves/new-game.localstorage.json");

/**
 * @param {{
 *   baseUrl: string,
 *   fixturePath?: string,
 *   outputDir: string,
 *   languages?: string[],
 * }} options
 */
export async function runRuntimeSmoke({
    baseUrl,
    fixturePath = defaultFixturePath,
    outputDir,
    languages = ["zh-CN", "en-EN"],
}) {
    const fixture = readFixtureFile(fixturePath);
    fs.mkdirSync(outputDir, {recursive: true});

    const browser = await chromium.launch({headless: true});
    const results = [];

    try {
        for (const language of languages) {
            results.push(await runLanguageScenario({
                baseUrl,
                browser,
                fixturePath,
                language,
                outputDir,
            }));
        }
    } finally {
        await browser.close();
    }

    const summary = {
        fixture: fixture.name,
        scenarioCount: results.length,
        languages,
        results,
    };
    const resultsPath = path.join(outputDir, "results.json");
    fs.writeFileSync(resultsPath, JSON.stringify(summary, null, 2), "utf8");

    const errorMessages = results.flatMap(result => result.consoleErrors);
    if (errorMessages.length > 0) {
        throw new Error(`Smoke failed with ${errorMessages.length} console/page errors. See ${resultsPath}`);
    }
    if (results.some(result => !result.predictor.workerObserved)) {
        throw new Error(`Smoke failed to observe predictor worker creation. See ${resultsPath}`);
    }
    if (results.some(result => !result.compatBridge?.timerUsesAppContextBinding || !result.compatBridge?.dungeonsUsesAppContextBinding)) {
        throw new Error(`Smoke failed to verify AppContext-backed save globals. See ${resultsPath}`);
    }
    if (results.some(result =>
        !result.bootstrap?.hasContentRegistryGetter
        || !result.bootstrap?.hasContentDefinitionFactoryApi
        || !result.bootstrap?.hasContentHelperRegistryApi
        || !result.bootstrap?.hasRuntimeAdjustmentHelperRegistryApi
        || !result.bootstrap?.hasZoneDefinitionFactoryApi
        || !result.bootstrap?.hasForestPathDefinitionFactoryApi
        || !result.bootstrap?.hasMerchantonDefinitionFactoryApi
        || !result.bootstrap?.hasOlympusDefinitionFactoryApi
        || !result.bootstrap?.hasValhallaDefinitionFactoryApi
        || !result.bootstrap?.hasStartingtonDefinitionFactoryApi
        || !result.bootstrap?.hasJunglePathDefinitionFactoryApi
        || !result.bootstrap?.hasCommercevilleDefinitionFactoryApi
        || !result.bootstrap?.hasValleyOfOlympusDefinitionFactoryApi
        || !result.bootstrap?.hasZoneRegistryApi
        || !result.bootstrap?.hasActionMetadataRegistryApi
        || !result.bootstrap?.hasContentRuleRegistryApi
        || !result.bootstrap?.hasContentEffectRegistryApi
        || !result.bootstrap?.hasContentStoryRegistryApi
        || !result.bootstrap?.hasRuntimeHookRegistryApi
        || !result.bootstrap?.hasContentRegistryApi
        || !result.bootstrap?.hasSaveServiceApi
        || !result.bootstrap?.hasSaveMigrationsApi
        || !result.bootstrap?.hasOptionsStoreApi
        || !result.bootstrap?.hasCloudSaveServiceApi
        || !result.bootstrap?.hasPredictorBridgeApi
        || !result.bootstrap?.hasPredictorWorkerServiceApi
        || !result.bootstrap?.hasUiCloudSaveUiApi
        || !result.bootstrap?.hasUiLoadoutControllerApi
        || !result.bootstrap?.hasUiTownBrowserControllerApi
        || !result.bootstrap?.hasUiPlannerControllerApi
        || !result.bootstrap?.hasUiReadingShellControllerApi
        || !result.bootstrap?.hasUiAccessibilityControllerApi
        || !result.bootstrap?.hasGameLoopApi
        || !result.bootstrap?.hasRestartCoordinatorApi
        || !result.bootstrap?.hasOfflineProgressApi
        || !result.bootstrap?.hasGameSpeedApi
        || !result.bootstrap?.hasLagTrackerApi
        || !result.bootstrap?.hasRunBudgetApi
        || !result.bootstrap?.hasFrameGateApi
        || !result.bootstrap?.hasWorldStateApi
        || !result.bootstrap?.hasTownStateApi
        || !result.bootstrap?.hasResourceStateApi
        || !result.bootstrap?.hasTownProgressApi
        || !result.bootstrap?.hasMetaProgressionApi
        || !result.bootstrap?.hasPrestigeStateApi
        || !result.bootstrap?.hasBuffCapStateApi
        || !result.bootstrap?.hasRuntimeStateApi
        || !result.bootstrap?.hasCharacterStateApi
        || !result.bootstrap?.hasStoryStateApi
        || !result.bootstrap?.hasChallengeStateApi
        || !result.bootstrap?.hasQueueStoreApi
        || !result.bootstrap?.hasRunnerStateApi
        || !result.bootstrap?.hasRunnerFailureApi
        || !result.bootstrap?.hasRunnerSelectionApi
        || !result.bootstrap?.hasRunnerFormulasApi
        || !result.bootstrap?.hasRunnerTickApi
    )) {
        throw new Error(`Smoke failed to observe the extracted runtime core/service/UI seams. See ${resultsPath}`);
    }
    if (results.some(result =>
        result.bootstrap?.contentActionCount !== result.bootstrap?.totalActions
        || result.bootstrap?.contentZoneCount !== result.bootstrap?.townCount
        || !result.bootstrap?.usesExtractedSharedDefinitions
        || !result.bootstrap?.usesExtractedExplorationHelpers
        || !result.bootstrap?.usesExtractedRuntimeAdjustmentHelpers
        || !result.bootstrap?.usesExtractedBeginnersvilleDefinitions
        || !result.bootstrap?.usesExtractedForestPathDefinitions
        || !result.bootstrap?.usesExtractedMerchantonDefinitions
        || !result.bootstrap?.usesExtractedOlympusDefinitions
        || !result.bootstrap?.usesExtractedValhallaDefinitions
        || !result.bootstrap?.usesExtractedStartingtonDefinitions
        || !result.bootstrap?.usesExtractedJunglePathDefinitions
        || !result.bootstrap?.usesExtractedCommercevilleDefinitions
        || !result.bootstrap?.usesExtractedValleyOfOlympusDefinitions
        || !result.bootstrap?.contentHookCount
        || !result.bootstrap?.contentRuleHookCount
        || !result.bootstrap?.contentEffectHookCount
        || !result.bootstrap?.contentStoryHookCount
        || !result.bootstrap?.contentMetadataMatchesRuntime
        || !result.bootstrap?.faceJudgementTravelThresholdsMatchFinishLogic
        || !result.bootstrap?.faceJudgementRetainsTravelMetadata
        || result.bootstrap?.wanderMetadata?.type !== "progress"
        || result.bootstrap?.wanderMetadata?.zoneId !== "beginnersville"
        || result.bootstrap?.wanderMetadata?.category !== "advance"
        || result.bootstrap?.wanderVisibleDescriptor?.kind !== "rule"
        || result.bootstrap?.wanderVisibleDescriptor?.moduleId !== "legacy-action-rules"
        || result.bootstrap?.wanderStoryReqsDescriptor?.kind !== "story"
        || result.bootstrap?.smashPotsFinishDescriptor?.kind !== "effect"
        || result.bootstrap?.wanderHooks?.visible !== true
        || result.bootstrap?.wanderHooks?.unlocked !== true
        || result.bootstrap?.smashPotsCost?.manaCost !== 50
        || result.bootstrap?.smashPotsCost?.goldCost !== 100
    )) {
        throw new Error(`Smoke failed to verify the generated content metadata and hook registries. See ${resultsPath}`);
    }
    if (results.some(result =>
        !result.accessibility?.hasStatusLiveRegion
        || !result.accessibility?.hasAlertLiveRegion
        || !result.accessibility?.hasTimeBarProgressbar
        || !result.accessibility?.hasStoryControlPopup
    )) {
        throw new Error(`Smoke failed to verify the accessibility shell contract. See ${resultsPath}`);
    }
    if (results.some(result =>
        !result.viewport?.isActionsVisible1280
        || !result.viewport?.isActionsVisible1024
        || !result.viewport?.isActionsVisible390
    )) {
        throw new Error(`Smoke failed: primary action/town workspace is pushed below the first screen by the shell. See ${resultsPath}`);
    }
    if (results.some(result =>
        !result.saveBridge?.saveUsesAppContext
        || !result.saveBridge?.loadUsesAppContext
        || !result.saveBridge?.loadMatchesExpected
        || !result.saveBridge?.saveCollectionsUseAppContext
        || !result.saveBridge?.loadCollectionsUseAppContext
        || !result.saveBridge?.loadCollectionsMatchExpected
        || !result.saveBridge?.saveStoryCollectionsUseAppContext
        || !result.saveBridge?.loadStoryCollectionsUseAppContext
        || !result.saveBridge?.loadStoryCollectionsMatchExpected
        || !result.saveBridge?.savePrestigeUseAppContext
        || !result.saveBridge?.loadPrestigeUseAppContext
        || !result.saveBridge?.loadPrestigeMatchesExpected
        || !result.saveBridge?.saveBuffCapsUseAppContext
        || !result.saveBridge?.loadBuffCapsUseAppContext
        || !result.saveBridge?.loadBuffCapsMatchExpected
    )) {
        throw new Error(`Smoke failed to verify AppContext-backed save/load flow. See ${resultsPath}`);
    }

    return summary;
}

async function runLanguageScenario({baseUrl, browser, fixturePath, language, outputDir}) {
    const runtime = await openFixturePage({
        browser,
        baseUrl,
        fixturePath,
        language,
    });
    try {
        const {page, scenarioUrl, consoleErrors, workerUrls} = runtime;
        await dismissTutorialIfPresent(page);

        const bootstrapState = await page.evaluate(() => ({
            hasBootstrapApi: !!globalThis.IdleLoopsBootstrap,
            hasBootstrapGame: typeof globalThis.IdleLoopsBootstrap?.bootstrapGame === "function",
            hasBootstrapPredictorWorker: typeof globalThis.IdleLoopsBootstrap?.bootstrapPredictorWorker === "function",
            hasGameSessionGetter: typeof globalThis.IdleLoopsBootstrap?.getGameSession === "function",
            hasContentRegistryGetter: typeof globalThis.IdleLoopsBootstrap?.getContentRegistry === "function",
            hasContentDefinitionFactoryApi: typeof globalThis.IdleLoopsLegacyDefinitionFactories?.registerSharedActionFactories === "function",
            hasContentHelperRegistryApi: typeof globalThis.IdleLoopsContentHelperRegistry?.getExplorationHelpers === "function",
            hasRuntimeAdjustmentHelperRegistryApi: typeof globalThis.IdleLoopsContentHelperRegistry?.getRuntimeAdjustmentHelpers === "function",
            hasZoneDefinitionFactoryApi: typeof globalThis.IdleLoopsZoneDefinitionFactories?.registerBeginnersvilleActions === "function",
            hasForestPathDefinitionFactoryApi: typeof globalThis.IdleLoopsZoneDefinitionFactories?.registerForestPathActions === "function",
            hasMerchantonDefinitionFactoryApi: typeof globalThis.IdleLoopsZoneDefinitionFactories?.registerMerchantonActions === "function",
            hasOlympusDefinitionFactoryApi: typeof globalThis.IdleLoopsZoneDefinitionFactories?.registerOlympusActions === "function",
            hasValhallaDefinitionFactoryApi: typeof globalThis.IdleLoopsZoneDefinitionFactories?.registerValhallaActions === "function",
            hasStartingtonDefinitionFactoryApi: typeof globalThis.IdleLoopsZoneDefinitionFactories?.registerStartingtonActions === "function",
            hasJunglePathDefinitionFactoryApi: typeof globalThis.IdleLoopsZoneDefinitionFactories?.registerJunglePathActions === "function",
            hasCommercevilleDefinitionFactoryApi: typeof globalThis.IdleLoopsZoneDefinitionFactories?.registerCommercevilleActions === "function",
            hasValleyOfOlympusDefinitionFactoryApi: typeof globalThis.IdleLoopsZoneDefinitionFactories?.registerValleyOfOlympusActions === "function",
            hasZoneRegistryApi: typeof globalThis.IdleLoopsZoneRegistry?.listZones === "function"
                && typeof globalThis.IdleLoopsZoneRegistry?.getZoneByTownNum === "function",
            hasActionMetadataRegistryApi: typeof globalThis.IdleLoopsActionMetadataRegistry?.listActionMetadata === "function"
                && typeof globalThis.IdleLoopsActionMetadataRegistry?.getActionMetadataById === "function",
            hasContentRuleRegistryApi: typeof globalThis.IdleLoopsLegacyActionRules?.hasRuleHook === "function"
                && typeof globalThis.IdleLoopsLegacyActionRules?.invokeRuleHook === "function",
            hasContentEffectRegistryApi: typeof globalThis.IdleLoopsLegacyActionEffects?.hasEffectHook === "function"
                && typeof globalThis.IdleLoopsLegacyActionEffects?.invokeEffectHook === "function",
            hasContentStoryRegistryApi: typeof globalThis.IdleLoopsLegacyStoryHooks?.hasStoryHook === "function"
                && typeof globalThis.IdleLoopsLegacyStoryHooks?.invokeStoryHook === "function",
            hasRuntimeHookRegistryApi: typeof globalThis.IdleLoopsRuntimeHookRegistry?.listRuntimeHooks === "function"
                && typeof globalThis.IdleLoopsRuntimeHookRegistry?.invokeRuntimeHook === "function",
            hasContentRegistryApi: typeof globalThis.IdleLoopsContentRegistry?.listActionMetadata === "function"
                && typeof globalThis.IdleLoopsContentRegistry?.listZones === "function"
                && typeof globalThis.IdleLoopsContentRegistry?.invokeRuntimeHook === "function",
            hasSaveServiceApi: typeof globalThis.IdleLoopsSaveService?.storeSaveJson === "function"
                && typeof globalThis.IdleLoopsSaveService?.createEncodedSaveData === "function",
            hasSaveMigrationsApi: typeof globalThis.IdleLoopsSaveMigrations?.applySavedOptions === "function"
                && typeof globalThis.IdleLoopsSaveMigrations?.migrateVersion75DungeonTotals === "function",
            hasOptionsStoreApi: typeof globalThis.IdleLoopsOptionsStore?.importLegacyPredictorSettings === "function"
                && typeof globalThis.IdleLoopsOptionsStore?.writeUpdateRate === "function",
            hasCloudSaveServiceApi: typeof globalThis.IdleLoopsCloudSaveService?.createCloudSaveFacade === "function",
            hasPredictorBridgeApi: typeof globalThis.IdleLoopsPredictorBridge?.createWorkerBridge === "function",
            hasPredictorWorkerServiceApi: typeof globalThis.IdleLoopsPredictorWorkerService?.create === "function",
            hasUiCloudSaveUiApi: typeof globalThis.IdleLoopsCloudSaveUI?.updateCloudSave === "function"
                && typeof globalThis.IdleLoopsCloudSaveUI?.askDeleteCloudSave === "function",
            hasUiLoadoutControllerApi: typeof globalThis.IdleLoopsLoadoutController?.initializeLoadoutManager === "function"
                && typeof globalThis.IdleLoopsLoadoutController?.updateLoadoutManager === "function",
            hasUiTownBrowserControllerApi: typeof globalThis.IdleLoopsTownBrowserController?.initializeActionCategoryLegend === "function"
                && typeof globalThis.IdleLoopsTownBrowserController?.updateTownBrowserTools === "function",
            hasUiPlannerControllerApi: typeof globalThis.IdleLoopsPlannerController?.initializePlannerShell === "function"
                && typeof globalThis.IdleLoopsPlannerController?.updatePlannerStatus === "function",
            hasUiReadingShellControllerApi: typeof globalThis.IdleLoopsReadingShellController?.initializeReadingShell === "function"
                && typeof globalThis.IdleLoopsReadingShellController?.setReadingPane === "function",
            hasUiAccessibilityControllerApi: typeof globalThis.IdleLoopsAccessibilityController?.initializeAccessibilityShell === "function"
                && typeof globalThis.IdleLoopsAccessibilityController?.announceStatus === "function",
            hasGameLoopApi: typeof globalThis.IdleLoopsGameLoop?.calculateBaseManaToBurn === "function"
                && typeof globalThis.IdleLoopsGameLoop?.executeBudgetedTicks === "function",
            hasRestartCoordinatorApi: typeof globalThis.IdleLoopsRestartCoordinator?.collectLoopCompletedActions === "function"
                && typeof globalThis.IdleLoopsRestartCoordinator?.shouldPauseBeforeRestart === "function",
            hasOfflineProgressApi: typeof globalThis.IdleLoopsOfflineProgress?.applyOfflineDelta === "function"
                && typeof globalThis.IdleLoopsOfflineProgress?.resolveBonusSpeed === "function",
            hasGameSpeedApi: typeof globalThis.IdleLoopsGameSpeed?.calculateSpeedMultiplier === "function"
                && typeof globalThis.IdleLoopsGameSpeed?.refreshDungeonChances === "function",
            hasLagTrackerApi: typeof globalThis.IdleLoopsLagTracker?.resetLagState === "function"
                && typeof globalThis.IdleLoopsLagTracker?.updateLagState === "function",
            hasRunBudgetApi: typeof globalThis.IdleLoopsRunBudget?.resolvePostExecutionBudget === "function",
            hasFrameGateApi: typeof globalThis.IdleLoopsFrameGate?.advanceFrameClock === "function"
                && typeof globalThis.IdleLoopsFrameGate?.consumeRadarUpdate === "function",
            hasWorldStateApi: typeof globalThis.IdleLoopsWorldState?.unlockTown === "function"
                && typeof globalThis.IdleLoopsWorldState?.createProgressionCollectionsSnapshot === "function"
                && typeof globalThis.IdleLoopsWorldState?.markCompletedAction === "function"
                && typeof globalThis.IdleLoopsWorldState?.applyProgressionCollections === "function",
            hasTownStateApi: typeof globalThis.IdleLoopsTownState?.getLevel === "function"
                && typeof globalThis.IdleLoopsTownState?.initializeTownActionState === "function",
            hasResourceStateApi: typeof globalThis.IdleLoopsResourceState?.applyResourceDelta === "function"
                && typeof globalThis.IdleLoopsResourceState?.setResourceValue === "function"
                && typeof globalThis.IdleLoopsResourceState?.buildResetResources === "function",
            hasTownProgressApi: typeof globalThis.IdleLoopsTownProgress?.restartRegularVars === "function"
                && typeof globalThis.IdleLoopsTownProgress?.applyProgressGain === "function",
            hasMetaProgressionApi: typeof globalThis.IdleLoopsMetaProgression?.increaseTrainingLimits === "function"
                && typeof globalThis.IdleLoopsMetaProgression?.addGoldInvestment === "function"
                && typeof globalThis.IdleLoopsMetaProgression?.incrementStoneUse === "function",
            hasPrestigeStateApi: typeof globalThis.IdleLoopsPrestigeState?.awardPrestigeCompletion === "function"
                && typeof globalThis.IdleLoopsPrestigeState?.applyPrestigeSnapshot === "function"
                && typeof globalThis.IdleLoopsPrestigeState?.replacePrestigeValues === "function",
            hasBuffCapStateApi: typeof globalThis.IdleLoopsBuffCapState?.normalizeBuffCapValue === "function"
                && typeof globalThis.IdleLoopsBuffCapState?.applyBuffCapInput === "function"
                && typeof globalThis.IdleLoopsBuffCapState?.applyBuffCapSnapshot === "function",
            hasRuntimeStateApi: typeof globalThis.IdleLoopsRuntimeState?.addManaToTimeBudget === "function"
                && typeof globalThis.IdleLoopsRuntimeState?.recordLoopTotals === "function"
                && typeof globalThis.IdleLoopsRuntimeState?.borrowOfflineTime === "function"
                && typeof globalThis.IdleLoopsRuntimeState?.applyTotalsSnapshot === "function",
            hasCharacterStateApi: typeof globalThis.IdleLoopsCharacterState?.applySkillExp === "function"
                && typeof globalThis.IdleLoopsCharacterState?.applyBuffAmount === "function"
                && typeof globalThis.IdleLoopsCharacterState?.applyStatExp === "function"
                && typeof globalThis.IdleLoopsCharacterState?.loadBuffSnapshot === "function"
                && typeof globalThis.IdleLoopsCharacterState?.setTalentLevel === "function"
                && typeof globalThis.IdleLoopsCharacterState?.setSoulstone === "function",
            hasStoryStateApi: typeof globalThis.IdleLoopsStoryState?.unlockGlobalStory === "function"
                && typeof globalThis.IdleLoopsStoryState?.setStoryFlag === "function"
                && typeof globalThis.IdleLoopsStoryState?.increaseStoryVarTo === "function"
                && typeof globalThis.IdleLoopsStoryState?.applyStoryCollections === "function",
            hasChallengeStateApi: typeof globalThis.IdleLoopsChallengeState?.createChallengeSaveSnapshot === "function"
                && typeof globalThis.IdleLoopsChallengeState?.applyChallengeSaveSnapshot === "function"
                && typeof globalThis.IdleLoopsChallengeState?.recordChallengeTownUnlock === "function",
            hasQueueStoreApi: typeof globalThis.IdleLoopsQueueStore?.createZoneSpans === "function"
                && typeof globalThis.IdleLoopsQueueStore?.closestValidIndexForAction === "function",
            hasRunnerStateApi: typeof globalThis.IdleLoopsRunnerState?.createCurrentActionsFromQueue === "function"
                && typeof globalThis.IdleLoopsRunnerState?.calculateTotalNeeded === "function",
            hasRunnerFailureApi: typeof globalThis.IdleLoopsRunnerFailure?.getFailureInfo === "function"
                && typeof globalThis.IdleLoopsRunnerFailure?.getStartFailureInfo === "function",
            hasRunnerSelectionApi: typeof globalThis.IdleLoopsRunnerSelection?.resolveNextValidAction === "function"
                && typeof globalThis.IdleLoopsRunnerSelection?.resetBlockedActionProgress === "function",
            hasRunnerFormulasApi: typeof globalThis.IdleLoopsRunnerFormulas?.setAdjustedTicks === "function"
                && typeof globalThis.IdleLoopsRunnerFormulas?.getMaxTicksForAction === "function"
                && typeof globalThis.calcSoulstoneMult === "function",
            hasRunnerTickApi: typeof globalThis.IdleLoopsRunnerTick?.resolveManaToSpend === "function"
                && typeof globalThis.IdleLoopsRunnerTick?.finalizeCompletedAction === "function",
            contentActionCount: globalThis.IdleLoopsActionMetadataRegistry?.listActionMetadata?.().length ?? -1,
            contentZoneCount: globalThis.IdleLoopsZoneRegistry?.listZones?.().length ?? -1,
            faceJudgementTravelThresholdsMatchFinishLogic: (() => {
                if (typeof getTravelNum !== "function"
                    || typeof resources === "undefined"
                    || typeof globalThis.IdleLoopsResourceState?.setResourceValue !== "function") {
                    return false;
                }
                const originalReputation = resources.reputation;
                globalThis.IdleLoopsResourceState.setResourceValue(resources, "reputation", 60);
                const positiveBranch = getTravelNum("Face Judgement");
                globalThis.IdleLoopsResourceState.setResourceValue(resources, "reputation", 0);
                const neutralBranch = getTravelNum("Face Judgement");
                globalThis.IdleLoopsResourceState.setResourceValue(resources, "reputation", -60);
                const negativeBranch = getTravelNum("Face Judgement");
                globalThis.IdleLoopsResourceState.setResourceValue(resources, "reputation", originalReputation);
                return positiveBranch === 1 && neutralBranch === 0 && negativeBranch === 2;
            })(),
            faceJudgementRetainsTravelMetadata: (() => {
                if (typeof getPossibleTravel !== "function") {
                    return false;
                }
                return getPossibleTravel("Face Judgement").length > 0;
            })(),
            usesExtractedSharedDefinitions: (() => {
                const registerFactories = globalThis.IdleLoopsLegacyDefinitionFactories?.registerSharedActionFactories;
                if (typeof registerFactories !== "function" || typeof MultipartAction !== "function") {
                    return false;
                }
                const sharedDefinitions = registerFactories({MultipartAction});
                return !!sharedDefinitions
                    && typeof Action !== "undefined"
                    && Action.AssassinZ0 instanceof sharedDefinitions.AssassinAction
                    && typeof adjustAllRocks === "function";
            })(),
            usesExtractedExplorationHelpers: (() => {
                const getHelpers = globalThis.IdleLoopsContentHelperRegistry?.getExplorationHelpers;
                if (typeof getHelpers !== "function") {
                    return false;
                }
                const extractedHelpers = getHelpers();
                return !!extractedHelpers
                    && extractedHelpers.fullyExploredZones === fullyExploredZones
                    && extractedHelpers.getExploreProgress === getExploreProgress
                    && extractedHelpers.getExploreSkill === getExploreSkill
                    && extractedHelpers.exchangeMap === exchangeMap;
            })(),
            usesExtractedRuntimeAdjustmentHelpers: (() => {
                const getHelpers = globalThis.IdleLoopsContentHelperRegistry?.getRuntimeAdjustmentHelpers;
                if (typeof getHelpers !== "function") {
                    return false;
                }
                const extractedHelpers = getHelpers();
                return !!extractedHelpers
                    && extractedHelpers.adjustDonations === adjustDonations
                    && extractedHelpers.adjustPylons === adjustPylons
                    && extractedHelpers.adjustWells === adjustWells
                    && extractedHelpers.adjustPockets === adjustPockets
                    && extractedHelpers.adjustWarehouses === adjustWarehouses
                    && extractedHelpers.adjustInsurance === adjustInsurance
                    && extractedHelpers.adjustTrainingExpMult === adjustTrainingExpMult;
            })(),
            usesExtractedBeginnersvilleDefinitions: (() => {
                const registerZoneDefinitions = globalThis.IdleLoopsZoneDefinitionFactories?.registerBeginnersvilleActions;
                if (typeof registerZoneDefinitions !== "function"
                    || typeof Action === "undefined"
                    || typeof MultipartAction !== "function"
                    || typeof DungeonAction !== "function"
                    || typeof lateGameActions === "undefined") {
                    return false;
                }
                const extractedDefinitions = registerZoneDefinitions({
                    Action,
                    MultipartAction,
                    DungeonAction,
                    lateGameActions,
                });
                return !!extractedDefinitions
                    && extractedDefinitions.adjustPots === adjustPots
                    && extractedDefinitions.adjustLocks === adjustLocks
                    && extractedDefinitions.adjustSQuests === adjustSQuests
                    && extractedDefinitions.adjustLQuests === adjustLQuests
                    && typeof Action.Map === "object"
                    && typeof Action.Wander === "object"
                    && lateGameActions.includes("Map");
            })(),
            usesExtractedForestPathDefinitions: (() => {
                const registerZoneDefinitions = globalThis.IdleLoopsZoneDefinitionFactories?.registerForestPathActions;
                if (typeof registerZoneDefinitions !== "function"
                    || typeof Action === "undefined"
                    || typeof MultipartAction !== "function") {
                    return false;
                }
                const extractedDefinitions = registerZoneDefinitions({
                    Action,
                    MultipartAction,
                });
                return !!extractedDefinitions
                    && extractedDefinitions.adjustWildMana === adjustWildMana
                    && extractedDefinitions.adjustHunt === adjustHunt
                    && extractedDefinitions.adjustHerbs === adjustHerbs
                    && typeof Action.ExploreForest === "object"
                    && typeof Action.ContinueOn === "object";
            })(),
            usesExtractedMerchantonDefinitions: (() => {
                const registerZoneDefinitions = globalThis.IdleLoopsZoneDefinitionFactories?.registerMerchantonActions;
                if (typeof registerZoneDefinitions !== "function"
                    || typeof Action === "undefined"
                    || typeof MultipartAction !== "function"
                    || typeof DungeonAction !== "function"
                    || typeof TrialAction !== "function") {
                    return false;
                }
                const extractedDefinitions = registerZoneDefinitions({
                    Action,
                    MultipartAction,
                    DungeonAction,
                    TrialAction,
                });
                return !!extractedDefinitions
                    && extractedDefinitions.adjustSuckers === adjustSuckers
                    && extractedDefinitions.getAdvGuildRank === getAdvGuildRank
                    && extractedDefinitions.getCraftGuildRank === getCraftGuildRank
                    && typeof Action.ExploreCity === "object"
                    && typeof Action.HeroesTrial === "object"
                    && typeof Action.StartTrek === "object";
            })(),
            usesExtractedOlympusDefinitions: (() => {
                const registerZoneDefinitions = globalThis.IdleLoopsZoneDefinitionFactories?.registerOlympusActions;
                if (typeof registerZoneDefinitions !== "function"
                    || typeof Action === "undefined"
                    || typeof MultipartAction !== "function") {
                    return false;
                }
                const extractedDefinitions = registerZoneDefinitions({
                    Action,
                    MultipartAction,
                });
                return !!extractedDefinitions
                    && extractedDefinitions.adjustGeysers === adjustGeysers
                    && extractedDefinitions.adjustMineSoulstones === adjustMineSoulstones
                    && extractedDefinitions.adjustArtifacts === adjustArtifacts
                    && typeof Action.ClimbMountain === "object"
                    && typeof Action.ImbueMind === "object"
                    && typeof Action.FaceJudgement === "object";
            })(),
            usesExtractedValhallaDefinitions: (() => {
                const registerZoneDefinitions = globalThis.IdleLoopsZoneDefinitionFactories?.registerValhallaActions;
                if (typeof registerZoneDefinitions !== "function"
                    || typeof Action === "undefined"
                    || typeof MultipartAction !== "function") {
                    return false;
                }
                const extractedDefinitions = registerZoneDefinitions({
                    Action,
                    MultipartAction,
                });
                return !!extractedDefinitions
                    && extractedDefinitions.getWizCollegeRank === getWizCollegeRank
                    && extractedDefinitions.getFrostGiantsRank === getFrostGiantsRank
                    && typeof Action.GuidedTour === "object"
                    && typeof Action.WizardCollege === "object"
                    && typeof Action.FallFromGrace === "object";
            })(),
            usesExtractedStartingtonDefinitions: (() => {
                const registerZoneDefinitions = globalThis.IdleLoopsZoneDefinitionFactories?.registerStartingtonActions;
                if (typeof registerZoneDefinitions !== "function"
                    || typeof Action === "undefined"
                    || typeof MultipartAction !== "function"
                    || typeof DungeonAction !== "function"
                    || typeof TrialAction !== "function") {
                    return false;
                }
                const extractedDefinitions = registerZoneDefinitions({
                    Action,
                    MultipartAction,
                    DungeonAction,
                    TrialAction,
                });
                return !!extractedDefinitions
                    && typeof Action.Meander === "object"
                    && typeof Action.TheSpire === "object"
                    && typeof Action.DeadTrial === "object";
            })(),
            usesExtractedJunglePathDefinitions: (() => {
                const registerZoneDefinitions = globalThis.IdleLoopsZoneDefinitionFactories?.registerJunglePathActions;
                if (typeof registerZoneDefinitions !== "function"
                    || typeof Action === "undefined"
                    || typeof MultipartAction !== "function") {
                    return false;
                }
                const extractedDefinitions = registerZoneDefinitions({
                    Action,
                    MultipartAction,
                });
                return !!extractedDefinitions
                    && extractedDefinitions.getFightJungleMonstersRank === getFightJungleMonstersRank
                    && typeof Action.ExploreJungle === "object"
                    && typeof Action.FightJungleMonsters === "object"
                    && typeof Action.OpenPortal === "object";
            })(),
            usesExtractedCommercevilleDefinitions: (() => {
                const registerZoneDefinitions = globalThis.IdleLoopsZoneDefinitionFactories?.registerCommercevilleActions;
                if (typeof registerZoneDefinitions !== "function"
                    || typeof Action === "undefined"
                    || typeof MultipartAction !== "function"
                    || typeof TrialAction !== "function") {
                    return false;
                }
                const extractedDefinitions = registerZoneDefinitions({
                    Action,
                    MultipartAction,
                    TrialAction,
                });
                return !!extractedDefinitions
                    && extractedDefinitions.getThievesGuildRank === getThievesGuildRank
                    && extractedDefinitions.totalAssassinations === totalAssassinations
                    && typeof Action.Excursion === "object"
                    && typeof Action.ThievesGuild === "object"
                    && typeof Action.LeaveCity === "object";
            })(),
            usesExtractedValleyOfOlympusDefinitions: (() => {
                const registerZoneDefinitions = globalThis.IdleLoopsZoneDefinitionFactories?.registerValleyOfOlympusActions;
                if (typeof registerZoneDefinitions !== "function"
                    || typeof Action === "undefined"
                    || typeof MultipartAction !== "function"
                    || typeof TrialAction !== "function") {
                    return false;
                }
                const extractedDefinitions = registerZoneDefinitions({
                    Action,
                    MultipartAction,
                    TrialAction,
                });
                return !!extractedDefinitions
                    && typeof Action.ImbueSoul === "object"
                    && typeof Action.GodsTrial === "object"
                    && typeof Action.RestoreTime === "object";
            })(),
            contentHookCount: globalThis.IdleLoopsRuntimeHookRegistry?.listRuntimeHooks?.().length ?? -1,
            contentRuleHookCount: globalThis.IdleLoopsRuntimeHookRegistry?.listRuntimeHooksByKind?.("rule")?.length ?? -1,
            contentEffectHookCount: globalThis.IdleLoopsRuntimeHookRegistry?.listRuntimeHooksByKind?.("effect")?.length ?? -1,
            contentStoryHookCount: globalThis.IdleLoopsRuntimeHookRegistry?.listRuntimeHooksByKind?.("story")?.length ?? -1,
            contentMetadataMatchesRuntime: (() => {
                const metadataEntries = globalThis.IdleLoopsActionMetadataRegistry?.listActionMetadata?.();
                if (!Array.isArray(metadataEntries) || !Array.isArray(totalActionList)) {
                    return false;
                }
                const runtimeEntries = totalActionList.map(action => ({
                    name: action.name,
                    varName: action.varName,
                    type: action.type,
                    townNum: action.townNum,
                    category: action.category,
                }));
                const metadataComparable = metadataEntries.map(entry => ({
                    name: entry.name,
                    varName: entry.varName,
                    type: entry.type,
                    townNum: entry.townNum,
                    category: entry.category,
                }));
                return JSON.stringify(metadataComparable) === JSON.stringify(runtimeEntries);
            })(),
            wanderMetadata: (() => {
                const metadata = globalThis.IdleLoopsActionMetadataRegistry?.getActionMetadata?.("Wander");
                if (!metadata) return null;
                return {
                    type: metadata.type,
                    zoneId: metadata.zoneId,
                    category: metadata.category,
                    storySetId: metadata.storySetId,
                };
            })(),
            wanderVisibleDescriptor: globalThis.IdleLoopsContentRegistry?.getRuntimeHookDescriptor?.("legacy:Wander:visible") ?? null,
            wanderStoryReqsDescriptor: globalThis.IdleLoopsContentRegistry?.getRuntimeHookDescriptor?.("legacy:Wander:storyReqs") ?? null,
            smashPotsFinishDescriptor: globalThis.IdleLoopsContentRegistry?.getRuntimeHookDescriptor?.("legacy:SmashPots:finish") ?? null,
            wanderHooks: (() => {
                const metadata = globalThis.IdleLoopsActionMetadataRegistry?.getActionMetadata?.("Wander");
                const registry = globalThis.IdleLoopsContentRegistry;
                if (!metadata || !registry) return null;
                return {
                    visible: metadata.visibleKey ? registry.invokeRuntimeHook(metadata.visibleKey) : null,
                    unlocked: metadata.unlockedKey ? registry.invokeRuntimeHook(metadata.unlockedKey) : null,
                };
            })(),
            smashPotsCost: (() => {
                const metadata = globalThis.IdleLoopsActionMetadataRegistry?.getActionMetadata?.("SmashPots");
                const registry = globalThis.IdleLoopsContentRegistry;
                if (!metadata?.costKey || !registry) return null;
                return registry.invokeRuntimeHook(metadata.costKey);
            })(),
            hasView: typeof view !== "undefined" && !!view,
            totalActions: typeof totalActionList !== "undefined" && Array.isArray(totalActionList) ? totalActionList.length : -1,
            townCount: typeof towns !== "undefined" && Array.isArray(towns) ? towns.length : -1,
            sessionAvailable: !!globalThis.IdleLoopsBootstrap?.getGameSession?.(),
        }));
        const compatBridgeState = await page.evaluate(() => {
            const session = globalThis.IdleLoopsBootstrap?.getGameSession?.();
            const appContext = session?.appContext;
            const timerDescriptor = Object.getOwnPropertyDescriptor(Data.rootObjects.globals, "timer");
            const dungeonsDescriptor = Object.getOwnPropertyDescriptor(Data.rootObjects.globals, "dungeons");
            return {
                sessionHasAppContext: !!appContext,
                timerUsesAppContextBinding: timerDescriptor?.get === appContext?.globalBindings?.timer?.get
                    && timerDescriptor?.set === appContext?.globalBindings?.timer?.set,
                dungeonsUsesAppContextBinding: dungeonsDescriptor?.get === appContext?.globalBindings?.dungeons?.get
                    && dungeonsDescriptor?.set === appContext?.globalBindings?.dungeons?.set,
            };
        });
        const accessibilityState = await page.evaluate(() => ({
            hasStatusLiveRegion: document.getElementById("accessibilityStatus")?.getAttribute("aria-live") === "polite",
            hasAlertLiveRegion: document.getElementById("accessibilityAlert")?.getAttribute("aria-live") === "assertive",
            hasTimeBarProgressbar: document.getElementById("timeBarContainer")?.getAttribute("role") === "progressbar",
            hasStoryControlPopup: document.getElementById("story_control")?.getAttribute("aria-controls") === "story_tooltip",
        }));
        const saveBridgeState = await page.evaluate(() => {
            const session = globalThis.IdleLoopsBootstrap?.getGameSession?.();
            const appContext = session?.appContext;
            if (!appContext) {
                return {
                    available: false,
                    saveUsesAppContext: false,
                    loadUsesAppContext: false,
                    loadMatchesExpected: false,
                    saveStoryCollectionsUseAppContext: false,
                    loadStoryCollectionsUseAppContext: false,
                    loadStoryCollectionsMatchExpected: false,
                    savePrestigeUseAppContext: false,
                    loadPrestigeUseAppContext: false,
                    loadPrestigeMatchesExpected: false,
                    saveBuffCapsUseAppContext: false,
                    loadBuffCapsUseAppContext: false,
                    loadBuffCapsMatchExpected: false,
                };
            }

            const originalCapture = appContext.captureGlobalState.bind(appContext);
            const originalApply = appContext.applyGlobalState.bind(appContext);
            const originalCaptureCollections = appContext.captureCollectionState.bind(appContext);
            const originalApplyCollections = appContext.applyCollectionState.bind(appContext);
            let capturedGlobalNames = [];
            let appliedGlobalKeys = [];
            let capturedCollectionNames = [];
            let appliedCollectionKeys = [];

            appContext.captureGlobalState = function captureGlobalStateSpy(names) {
                capturedGlobalNames.push([...(names ?? [])].sort());
                return originalCapture(names);
            };
            appContext.applyGlobalState = function applyGlobalStateSpy(patch) {
                appliedGlobalKeys.push(Object.keys(patch ?? {}).sort());
                return originalApply(patch);
            };
            appContext.captureCollectionState = function captureCollectionStateSpy(names) {
                capturedCollectionNames.push([...(names ?? [])].sort());
                return originalCaptureCollections(names);
            };
            appContext.applyCollectionState = function applyCollectionStateSpy(patch) {
                appliedCollectionKeys.push(Object.keys(patch ?? {}).sort());
                return originalApplyCollections(patch);
            };

            const hasCapturedNames = (calls, requiredNames) => {
                const sortedRequired = [...requiredNames].sort();
                return calls.some(call => JSON.stringify(call) === JSON.stringify(sortedRequired));
            };
            const hasAppliedKeys = (calls, requiredKeys) => {
                const sortedRequired = [...requiredKeys].sort();
                return calls.some(call => JSON.stringify(call) === JSON.stringify(sortedRequired));
            };
            const resetSpyState = () => {
                capturedGlobalNames = [];
                appliedGlobalKeys = [];
                capturedCollectionNames = [];
                appliedCollectionKeys = [];
            };

            try {
                const baselineCollections = session.captureCollectionState([
                    "storyFlags",
                    "storyVars",
                    "totals",
                    "prestigeValues",
                    "buffCaps",
                ]);
                session.applyGlobalPatch({
                    totalTalent: 4321,
                    goldInvested: 765,
                    stonesUsed: {1: 1, 3: 2, 5: 3, 6: 4},
                    storyMax: 11,
                    unreadActionStories: ["storyContainerSmokeSave"],
                });
                session.applyCollectionPatch({
                    townsUnlocked: [0, 1, 2],
                    completedActions: ["SmokeActionAlpha", "SmokeActionBeta", "FoundGlasses"],
                    challengeSave: {challengeMode: 5, inChallenge: true},
                    storyFlags: {
                        ...baselineCollections.storyFlags,
                        maxSQuestsInALoop: true,
                        potionBrewed: true,
                    },
                    storyVars: {
                        ...baselineCollections.storyVars,
                        maxWizardGuildSegmentCleared: 6,
                        maxZombiesRaised: 12,
                    },
                    totals: {
                        time: 111,
                        effectiveTime: 222,
                        borrowedTime: 3,
                        loops: 4,
                        actions: 5,
                    },
                });
                session.applyCollectionPatch({
                    prestigeValues: {
                        ...baselineCollections.prestigeValues,
                        prestigeCurrentPoints: 13,
                        prestigeTotalPoints: 21,
                        prestigeTotalCompletions: 2,
                        completedCurrentPrestige: true,
                        completedAnyPrestige: true,
                    },
                    buffCaps: {
                        ...baselineCollections.buffCaps,
                        Ritual: 123,
                        Heroism: 19,
                        PrestigePhysical: 77,
                    },
                });
                resetSpyState();
                const saved = JSON.parse(save());
                const saveGlobalCalls = [...capturedGlobalNames];
                const saveCollectionCalls = [...capturedCollectionNames];
                resetSpyState();

                const reloaded = structuredClone(saved);
                reloaded.totalTalent = 8765;
                reloaded.goldInvested = 234;
                reloaded.stonesUsed = {1: 9, 3: 8, 5: 7, 6: 6};
                reloaded.storyMax = 17;
                reloaded.unreadActionStories = ["storyContainerSmokeLoad"];
                reloaded.maxTown = 3;
                reloaded.completedActions = ["SmokeReloadedAction"];
                reloaded.challengeSave = {challengeMode: 7, inChallenge: false};
                reloaded.storyReqs = {
                    ...saved.storyReqs,
                    maxSQuestsInALoop: false,
                    potionBrewed: true,
                    clearSDungeon: true,
                };
                reloaded.storyVars = {
                    ...saved.storyVars,
                    maxWizardGuildSegmentCleared: 18,
                    maxZombiesRaised: 44,
                };
                reloaded.totals = {
                    time: 999,
                    effectiveTime: 777,
                    borrowedTime: 9,
                    loops: 21,
                    actions: 42,
                };
                reloaded.prestigeValues = {
                    prestigeCurrentPoints: 34,
                    prestigeTotalPoints: 55,
                    prestigeTotalCompletions: 8,
                    completedCurrentPrestige: false,
                    completedAnyPrestige: true,
                };
                reloaded.buffCaps = {
                    ...saved.buffCaps,
                    Ritual: 222,
                    Heroism: 27,
                    PrestigePhysical: 88,
                    PrestigeChronomancy: 66,
                };
                loadPrimarySaveGlobals(reloaded);
                loadStorySaveGlobals(reloaded);
                loadProgressionSaveCollections(reloaded);
                applyChallengeSaveState(reloaded.challengeSave);
                loadStorySaveCollections(reloaded);
                loadTotalsState(reloaded);
                loadPrestigeValuesState(reloaded);
                loadBuffCapsState(reloaded);
                const loadGlobalCalls = [...appliedGlobalKeys];
                const loadCollectionCalls = [...appliedCollectionKeys];

                const loaded = session.captureGlobalState([
                    "totalTalent",
                    "goldInvested",
                    "stonesUsed",
                    "storyMax",
                    "unreadActionStories",
                ]);
                const loadedCollections = session.captureCollectionState([
                    "townsUnlocked",
                    "completedActions",
                    "challengeSave",
                    "storyFlags",
                    "storyVars",
                    "totals",
                    "prestigeValues",
                    "buffCaps",
                ]);

                return {
                    available: true,
                    saveUsesAppContext: hasCapturedNames(saveGlobalCalls, [
                        "goldInvested",
                        "stonesUsed",
                        "storyMax",
                        "totalTalent",
                        "unreadActionStories",
                    ]),
                    loadUsesAppContext: hasAppliedKeys(loadGlobalCalls, [
                        "goldInvested",
                        "stonesUsed",
                        "totalTalent",
                        "trainingLimits",
                    ]) && hasAppliedKeys(loadGlobalCalls, [
                        "storyMax",
                        "unreadActionStories",
                    ]),
                    saveCollectionsUseAppContext: hasCapturedNames(saveCollectionCalls, [
                        "challengeSave",
                        "completedActions",
                        "townsUnlocked",
                    ]),
                    loadCollectionsUseAppContext: hasAppliedKeys(loadCollectionCalls, [
                        "challengeSave",
                    ]) && hasAppliedKeys(loadCollectionCalls, [
                        "completedActions",
                        "townsUnlocked",
                    ]),
                    saveStoryCollectionsUseAppContext: hasCapturedNames(saveCollectionCalls, [
                        "storyFlags",
                        "storyVars",
                        "totals",
                    ]),
                    loadStoryCollectionsUseAppContext: hasAppliedKeys(loadCollectionCalls, [
                        "storyFlags",
                        "storyVars",
                    ]) && hasAppliedKeys(loadCollectionCalls, [
                        "totals",
                    ]),
                    savePrestigeUseAppContext: hasCapturedNames(saveCollectionCalls, [
                        "prestigeValues",
                    ]),
                    loadPrestigeUseAppContext: hasAppliedKeys(loadCollectionCalls, [
                        "prestigeValues",
                    ]),
                    saveBuffCapsUseAppContext: hasCapturedNames(saveCollectionCalls, [
                        "buffCaps",
                    ]),
                    loadBuffCapsUseAppContext: hasAppliedKeys(loadCollectionCalls, [
                        "buffCaps",
                    ]),
                    savedValues: {
                        totalTalent: saved.totalTalent,
                        goldInvested: saved.goldInvested,
                        stonesUsed: saved.stonesUsed,
                        storyMax: saved.storyMax,
                        unreadActionStories: saved.unreadActionStories,
                        townsUnlocked: saved.townsUnlocked,
                        completedActions: saved.completedActions,
                        challengeSave: saved.challengeSave,
                        storyReqs: {
                            maxSQuestsInALoop: saved.storyReqs.maxSQuestsInALoop,
                            potionBrewed: saved.storyReqs.potionBrewed,
                        },
                        storyVars: {
                            maxWizardGuildSegmentCleared: saved.storyVars.maxWizardGuildSegmentCleared,
                            maxZombiesRaised: saved.storyVars.maxZombiesRaised,
                        },
                        totals: saved.totals,
                        prestigeValues: saved.prestigeValues,
                        buffCaps: {
                            Ritual: saved.buffCaps.Ritual,
                            Heroism: saved.buffCaps.Heroism,
                            PrestigePhysical: saved.buffCaps.PrestigePhysical,
                        },
                    },
                    loadedValues: loaded,
                    loadedCollections,
                    loadMatchesExpected: loaded.totalTalent === reloaded.totalTalent
                        && loaded.goldInvested === reloaded.goldInvested
                        && JSON.stringify(loaded.stonesUsed) === JSON.stringify(reloaded.stonesUsed)
                        && loaded.storyMax === reloaded.storyMax
                        && JSON.stringify(loaded.unreadActionStories) === JSON.stringify(reloaded.unreadActionStories),
                    loadCollectionsMatchExpected: JSON.stringify(loadedCollections.townsUnlocked) === JSON.stringify([0, 1, 2, 3])
                        && JSON.stringify(loadedCollections.completedActions) === JSON.stringify(["SmokeReloadedAction", "FoundGlasses"])
                        && JSON.stringify(loadedCollections.challengeSave) === JSON.stringify(reloaded.challengeSave),
                    loadStoryCollectionsMatchExpected: loadedCollections.storyFlags.maxSQuestsInALoop === false
                        && loadedCollections.storyFlags.potionBrewed === true
                        && loadedCollections.storyFlags.clearSDungeon === true
                        && loadedCollections.storyVars.maxWizardGuildSegmentCleared === 18
                        && loadedCollections.storyVars.maxZombiesRaised === 44
                        && JSON.stringify(loadedCollections.totals) === JSON.stringify(reloaded.totals),
                    loadPrestigeMatchesExpected: JSON.stringify(loadedCollections.prestigeValues) === JSON.stringify(reloaded.prestigeValues),
                    loadBuffCapsMatchExpected: JSON.stringify(loadedCollections.buffCaps) === JSON.stringify(reloaded.buffCaps),
                };
            } finally {
                appContext.captureGlobalState = originalCapture;
                appContext.applyGlobalState = originalApply;
                appContext.captureCollectionState = originalCaptureCollections;
                appContext.applyCollectionState = originalApplyCollections;
            }
        });

        const viewportState = await page.evaluate(() => {
            return {
                isActionsVisible1280: true,
                isActionsVisible1024: true,
                isActionsVisible390: true,
                isActionsVisible1280Classic: true,
                hasOverflow1280Classic: false,
                isActionsVisible1024Classic: true,
                hasOverflow1024Classic: false,
            };
        });

        // We run checks manually on viewport resizing, simulating the checks.
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.waitForTimeout(500);
        viewportState.isActionsVisible1280 = await page.evaluate(() => {
            const el = document.getElementById("actionsColumn");
            return el ? el.getBoundingClientRect().top < 720 : false;
        });

        await page.setViewportSize({ width: 1024, height: 768 });
        await page.waitForTimeout(500);
        viewportState.isActionsVisible1024 = await page.evaluate(() => {
            const el = document.getElementById("actionsColumn");
            return el ? el.getBoundingClientRect().top < 768 : false;
        });

        await page.setViewportSize({ width: 390, height: 844 });
        await page.waitForTimeout(500);
        viewportState.isActionsVisible390 = await page.evaluate(() => {
            const el = document.getElementById("actionsColumn");
            return el ? el.getBoundingClientRect().top < 844 : false;
        });

        // Classic preset metrics
        await page.evaluate(() => {
            const presetBtn = document.getElementById("uiPresetClassic");
            if (presetBtn) presetBtn.click();
        });

        await page.setViewportSize({ width: 1280, height: 720 });
        await page.waitForTimeout(500);
        const classic1280Metrics = await page.evaluate(() => {
            const el = document.getElementById("actionsColumn");
            const isVisible = el ? el.getBoundingClientRect().top < 720 : false;
            const overflow = document.documentElement.scrollWidth > 1280 || document.body.scrollWidth > 1280;
            return { isVisible, overflow };
        });
        viewportState.isActionsVisible1280Classic = classic1280Metrics.isVisible;
        viewportState.hasOverflow1280Classic = classic1280Metrics.overflow;

        await page.setViewportSize({ width: 1024, height: 768 });
        await page.waitForTimeout(500);
        const classic1024Metrics = await page.evaluate(() => {
            const el = document.getElementById("actionsColumn");
            const isVisible = el ? el.getBoundingClientRect().top < 768 : false;
            const overflow = document.documentElement.scrollWidth > 1024 || document.body.scrollWidth > 1024;
            return { isVisible, overflow };
        });
        viewportState.isActionsVisible1024Classic = classic1024Metrics.isVisible;
        viewportState.hasOverflow1024Classic = classic1024Metrics.overflow;

        // Revert preset
        await page.evaluate(() => {
            const presetBtn = document.getElementById("uiPresetCompact");
            if (presetBtn) presetBtn.click();
        });

        const workerEvent = page.waitForEvent("worker", {timeout: 5000}).catch(() => null);
        const predictorStateBefore = await page.locator("#plannerPredictorState").textContent();
        await page.evaluate(() => {
            setOption("predictor", true);
            clearList();
            actions.addAction("Wander", 1);
            view.requestUpdate("updateNextActions");
        });
        const predictorWorker = await workerEvent;
        await page.waitForTimeout(750);

        const predictorStateAfter = await page.locator("#plannerPredictorState").textContent();
        const queueState = await page.evaluate(() => ({
            queueLength: Array.isArray(actions?.next) ? actions.next.length : -1,
            predictorEnabled: !!options?.predictor,
            predictorBackgroundThread: !!options?.predictorBackgroundThread,
            trackedStat: options?.predictorTrackedStat ?? null,
        }));

        const screenshotPath = path.join(outputDir, `runtime-${language}.png`);
        await page.screenshot({path: screenshotPath, fullPage: true});

        return {
            language,
            url: scenarioUrl,
            bootstrap: bootstrapState,
            compatBridge: compatBridgeState,
            accessibility: accessibilityState,
            viewport: viewportState,
            saveBridge: saveBridgeState,
            queue: queueState,
            predictor: {
                stateBefore: predictorStateBefore?.trim() ?? "",
                stateAfter: predictorStateAfter?.trim() ?? "",
                workerObserved: !!predictorWorker,
                workerUrl: predictorWorker?.url() ?? null,
                workerUrls,
            },
            consoleErrors,
            screenshotPath,
        };
    } finally {
        await runtime.context.close();
    }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
    const baseUrl = process.argv[2];
    const outputDir = process.argv[3] ?? path.resolve(thisDir, "../../output/smoke/runtime");
    if (!baseUrl) {
        throw new Error("Usage: node tests/smoke/runtime-smoke.mjs <baseUrl> [outputDir]");
    }
    await runRuntimeSmoke({baseUrl, outputDir});
}
