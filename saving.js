function startGame() {
    // load calls recalcInterval, which will start the callbacks
    load();
    setScreenSize();
}

function getSaveServiceApi() {
    const saveServiceApi = globalThis.IdleLoopsSaveService;
    if (!saveServiceApi) {
        throw new Error("[services/save] IdleLoopsSaveService is not available");
    }
    return saveServiceApi;
}

function getOptionsStoreApi() {
    const optionsStoreApi = globalThis.IdleLoopsOptionsStore;
    if (!optionsStoreApi) {
        throw new Error("[services/options] IdleLoopsOptionsStore is not available");
    }
    return optionsStoreApi;
}

function getCloudSaveServiceApi() {
    const cloudSaveServiceApi = globalThis.IdleLoopsCloudSaveService;
    if (!cloudSaveServiceApi) {
        throw new Error("[services/save] IdleLoopsCloudSaveService is not available");
    }
    return cloudSaveServiceApi;
}

function getSaveMigrationsApi() {
    const saveMigrationsApi = globalThis.IdleLoopsSaveMigrations;
    if (!saveMigrationsApi) {
        throw new Error("[services/save] IdleLoopsSaveMigrations is not available");
    }
    return saveMigrationsApi;
}

function cheat() {
    if (gameSpeed === 1) gameSpeed = 20;
    else gameSpeed = 1;
}

function cheatBonus()
{
    totalOfflineMs = 1000000000000000;
}

function cheatSurvey()
{
    for(let i= 0; i<9; i++)
    {
        const varName = "SurveyZ" + i
        towns[i][`exp${varName}`] = 505000;
        view.updateProgressAction({name: varName, town: towns[i]});
    }
}

function cheatProgress()
{
    for (const action of totalActionList)
    {
        if (action.type == "progress")
        {
            towns[action.townNum][`exp${action.varName}`] = 505000;
            view.updateProgressAction({name: action.varName, town: towns[action.townNum]});
        }
    }
    stonesUsed = {1:250, 3:250, 5:250, 6:250};
}

function cheatTalent(stat, targetTalentLevel)
{
    if (stat === "all" || stat === "All")
        for (const stat of statList)
            globalThis.IdleLoopsCharacterState.setTalentLevel(stats, stat, targetTalentLevel);
    else globalThis.IdleLoopsCharacterState.setTalentLevel(stats, stat, targetTalentLevel);
    view.updateStats();
}

function cheatSoulstone(stat, targetSS)
{
    if (stat === "all" || stat === "All")
        for (const stat in stats)
            globalThis.IdleLoopsCharacterState.setSoulstone(stats, stat, targetSS);
    else globalThis.IdleLoopsCharacterState.setSoulstone(stats, stat, targetSS);
    view.updateSoulstones();
}

function cheatSkill(skill, targetSkillLevel)
{
    if (skill === "all" || skill === "All")
        for (const skill of skillList)
            skills[skill].levelExp.setLevel(targetSkillLevel);
    else skills[skill].levelExp.setLevel(targetSkillLevel);
    view.updateSkills();
}


let mainTickLoop;
const defaultSaveName = "idleLoops1";
const challengeSaveName = "idleLoopsChallenge";
let saveName = defaultSaveName;

const selfIsWorker = typeof window === "undefined";
const selfIsGame = typeof View !== "undefined";

const timeNeededInitial = 5 * 50;
// eslint-disable-next-line prefer-const
let timer = timeNeededInitial;
// eslint-disable-next-line prefer-const
let timeNeeded = timeNeededInitial;
// eslint-disable-next-line prefer-const
let gameIsStopped = false;
const view = selfIsGame ? new View() : null;
const actions = new Actions();
const actionLog = selfIsGame ? new ActionLog() : null;
/**
 * @template {number} Count Number of towns
 * @template {any[]} [Towns=[]] Tuple of towns
 * @typedef {Towns["length"] extends Count ? Towns : TownList<Count, [...Towns, Town<Towns["length"]> & Record<string, number>]>} TownList
 */

const towns = /** @type {TownList<9>} */(/** @type {Town[]} */([]));
// accessor for typed towns with vars. CANNOT be used in actionList.js, will cause circular references
/** @type {<const TN extends TownNum>(townNum: TN) => Town<TN> & TownVars<TN>} */
function _town(townNum) {
    // @ts-ignore
    return towns[townNum];
}

// Both of the following express the same thing, but the first introduces a dependency on the action list.
/* * @typedef {TownNumOf<AnyAction>} TownNum */
/** @typedef {NumOfTown<towns[number]>} TownNum */

/** @type {TownNum} */
let curTown = 0;

function initializeTowns() {
    for (let i = 0; i <= 8; i++) {
        // @ts-ignore
        towns[i] = new Town(i);
    }
}

const statList = /** @type {const} */(["Dex", "Str", "Con", "Spd", "Per", "Cha", "Int", "Luck", "Soul"]);
/** @typedef {typeof statList[number]} StatName */
const stats = /** @type {{[K in StatName]: Stat}} */({});
let totalTalent = 0;
// eslint-disable-next-line prefer-const
let shouldRestart = true;

// let prestigeValues = {};

// let prestigeCurrentPoints = 0;
// let prestigeTotalPoints = 0;
// let completedCurrentPrestige = false;
// let completedAnyPrestige = true; // Set to false once method is setup to complete Current game

// eslint-disable-next-line prefer-const
let resources = {
    gold: 0,
    reputation: 0,
    herbs: 0,
    hide: 0,
    potions: 0,
    teamMembers: 0,
    armor: 0,
    blood: 0,
    artifacts: 0,
    favors: 0,
    enchantments: 0,
    houses: 0,
    pylons: 0,
    zombie: 0,
    map: 0,
    completedMap: 0,
    heart: 0,
    power: 0,
    glasses: false,
    supplies: false,
    pickaxe: false,
    loopingPotion: false,
    citizenship: false,
    pegasus: false,
    key: false,
    stone: false,
    wizardCollege: false,
};
let hearts = [];
const resourcesTemplate = copyObject(resources);
//Temp variables
// eslint-disable-next-line prefer-const
let guild = "";
let escapeStarted = false;
let portalUsed = false;
let stoneLoc = 0;

let curLoadout = 0;
/** @type {NextActionEntry[][]} */
let loadouts;
/** @type {string[] & {"-1"?: string}} */
let loadoutnames;
//let loadoutnames = ["1", "2", "3", "4", "5"];
const skillList = /** @type {const} */(["Combat", "Magic", "Practical", "Alchemy", "Crafting", "Dark", "Chronomancy", "Pyromancy", "Restoration", "Spatiomancy", "Mercantilism", "Divine", "Commune", "Wunderkind", "Gluttony", "Thievery", "Leadership", "Assassin"]);
/** @typedef {typeof skillList[number]} SkillName */
const skills = /** @type {{[K in SkillName]: Skill}} */({});
const buffList = /** @type {const} */(["Ritual",
    "Imbuement",
    "Imbuement2",
    "Feast",
    "Aspirant",
    "Heroism",
    "Imbuement3",
    "PrestigePhysical",
    "PrestigeMental",
    "PrestigeCombat",
    "PrestigeSpatiomancy",
    "PrestigeChronomancy",
    "PrestigeBartering",
    "PrestigeExpOverflow"
]);
/** @typedef {typeof buffList[number]} BuffName */
/** @typedef {Extract<BuffName, `Prestige${string}`>} PrestigeBuffName */

/** @returns {name is StatName} */
function isStatName(name) { return statList.includes(name); }
/** @returns {name is SkillName} */
function isSkillName(name) { return skillList.includes(name); }
/** @returns {name is BuffName} */
function isBuffName(name) { return buffList.includes(name); }

const dungeonFloors = [6, 9, 20];
const trialFloors = [50, 100, 7, 1000, 25];
const buffHardCaps = {
    Ritual: 666,
    Imbuement: 500,
    Imbuement2: 500,
    Imbuement3: 7,
    Feast: 100,
    Aspirant: 20,
    Heroism: 50,
    PrestigePhysical: 100,
    PrestigeMental: 100,
    PrestigeCombat: 100,
    PrestigeSpatiomancy: 100,
    PrestigeChronomancy: 100,
    PrestigeBartering: 100,
    PrestigeExpOverflow: 100
};
const buffCaps = {
    Ritual: 666,
    Imbuement: 500,
    Imbuement2: 500,
    Imbuement3: 7,
    Feast: 100,
    Aspirant: 20,
    Heroism: 50,
    PrestigePhysical: 100,
    PrestigeMental: 100,
    PrestigeCombat: 100,
    PrestigeSpatiomancy: 100,
    PrestigeChronomancy: 100,
    PrestigeBartering: 100,
    PrestigeExpOverflow: 100
};
const buffs = /** @type {{[K in BuffName]: Buff}} */({});
const prestigeValues = {};
let goldInvested = 0;
let stonesUsed;
// eslint-disable-next-line prefer-const
let townShowing = 0;
// eslint-disable-next-line prefer-const
let actionStoriesShowing = false;
let townsUnlocked = [];
let completedActions = [];
let statShowing;
let skillShowing;
let buffShowing;
let curActionShowing;
let dungeonShowing;
let trainingLimits = 10;
let storyShowing = 0;
let storyMax = 0;
let unreadActionStories;

/** @typedef {keyof typeof storyFlags} StoryFlagName */
const storyFlags = {
    maxSQuestsInALoop: false,
    realMaxSQuestsInALoop: false,
    maxLQuestsInALoop: false,
    realMaxLQuestsInALoop: false,
    heal10PatientsInALoop: false,
    failedHeal: false,
    clearSDungeon: false,
    haggle: false,
    haggle15TimesInALoop: false,
    haggle16TimesInALoop: false,
    glassesBought: false,
    partyThrown: false,
    partyThrown2: false,
    strengthTrained: false,
    suppliesBought: false,
    suppliesBoughtWithoutHaggling: false,
    smallDungeonAttempted: false,
    satByWaterfall: false,
    dexterityTrained: false,
    speedTrained: false,
    birdsWatched: false,
    darkRitualThirdSegmentReached: false,
    brewed50PotionsInALoop: false,
    failedBrewPotions: false,
    failedBrewPotionsNegativeRep: false,
    potionBrewed: false,
    failedGamble: false,
    failedGambleLowMoney: false,
    potionSold: false,
    sell20PotionsInALoop: false,
    sellPotionFor100Gold: false,
    sellPotionFor1kGold: false,
    manaZ3Bought:false,
    advGuildTestsTaken: false,
    advGuildRankEReached: false,
    advGuildRankDReached: false,
    advGuildRankCReached: false,
    advGuildRankBReached: false,
    advGuildRankAReached: false,
    advGuildRankSReached: false,
    advGuildRankUReached: false,
    advGuildRankGodlikeReached: false,
    teammateGathered: false,
    fullParty: false,
    failedGatherTeam: false,
    largeDungeonAttempted: false,
    clearLDungeon: false,
    craftGuildTestsTaken: false,
    craftGuildRankEReached: false,
    craftGuildRankDReached: false,
    craftGuildRankCReached: false,
    craftGuildRankBReached: false,
    craftGuildRankAReached: false,
    craftGuildRankSReached: false,
    craftGuildRankUReached: false,
    craftGuildRankGodlikeReached: false,
    armorCrafted: false,
    craft10Armor: false,
    craft20Armor: false,
    failedCraftArmor: false,
    booksRead: false,
    pickaxeBought: false,
    heroTrial1Done: false,
    heroTrial10Done: false,
    heroTrial25Done: false,
    heroTrial50Done: false,
    charonPaid: false,
    loopingPotionMade: false,
    slay6TrollsInALoop: false,
    slay20TrollsInALoop: false,
    imbueMindThirdSegmentReached: false,
    imbueBodyThirdSegmentReached: false,
    failedImbueBody: false,
    judgementFaced: false,
    ignoredByGods: false,
    acceptedIntoValhalla: false,
    castIntoShadowRealm: false,
    spokeToGuru: false,
    fellFromGrace: false,
    donatedToCharity: false,
    receivedDonation: false,
    failedReceivedDonations: false,
    tidiedUp: false,
    manaZ5Bought: false,
    artifactSold: false,
    artifactDonated: false,
    donated20Artifacts: false,
    donated40Artifacts: false,
    charmSchoolVisited: false,
    oracleVisited: false,
    armorEnchanted: false,
    enchanted10Armor: false,
    enchanted20Armor: false,
    repeatedCitizenExam: false,
    houseBuilt: false,
    housesBuiltGodlike: false,
    built50Houses: false,
    collectedTaxes: false,
    collected50Taxes: false,
    acquiredPegasus: false,
    acquiredPegasusWithTeam: false,
    giantGuildTestTaken: false,
    giantGuildRankDReached: false,
    giantGuildRankCReached: false,
    giantGuildRankEReached: false,
    giantGuildRankBReached: false,
    giantGuildRankAReached: false,
    giantGuildRankSReached: false,
    giantGuildRankSSReached: false,
    giantGuildRankSSSReached: false,
    giantGuildRankUReached: false,
    giantGuildRankGodlikeReached: false,
    blessingSought: false,
    greatBlessingSought: false,
    feastAttempted: false,
    meanderIM100: false,
    wellDrawn: false,
    drew10Wells: false,
    drew15Wells: false,
    drewDryWell: false,
    attemptedRaiseZombie: false,
    failedRaiseZombie: false,
    spireAttempted: false,
    clearedSpire: false,
    spire10Pylons: false,
    spire20Pylons: false,
    suppliesPurchased: false,
    deadTrial1Done: false,
    deadTrial10Done: false,
    deadTrial25Done: false,
    monsterGuildTestTaken: false,
    monsterGuildRankDReached: false,
    monsterGuildRankCReached: false,
    monsterGuildRankBReached: false,
    monsterGuildRankAReached: false,
    monsterGuildRankSReached: false,
    monsterGuildRankSSReached: false,
    monsterGuildRankSSSReached: false,
    monsterGuildRankUReached: false,
    monsterGuildRankGodlikeReached: false,
    survivorRescued: false,
    rescued6Survivors: false,
    rescued20Survivors: false,
    buffetHeld: false,
    buffetFor1: false,
    buffetFor6: false,
    portalOpened: false,
    excursionAsGuildmember: false,
    explorerGuildTestTaken: false,
    mapTurnedIn: false,
    thiefGuildTestsTaken: false,
    thiefGuildRankEReached: false,
    thiefGuildRankDReached: false,
    thiefGuildRankCReached: false,
    thiefGuildRankBReached: false,
    thiefGuildRankAReached: false,
    thiefGuildRankSReached: false,
    thiefGuildRankUReached: false,
    thiefGuildRankGodlikeReached: false,
    assassinHeartDelivered: false,
    assassin4HeartsDelivered: false,
    assassin8HeartsDelivered: false,
    investedOne:false,
    investedTwo:false,
    interestCollected:false,
    collected1KInterest:false,
    collected1MInterest:false,
    collectedMaxInterest:false,
    seminarAttended:false,
    leadership10:false,
    leadership100:false,
    leadership1k:false,
    keyBought:false,
    trailSecretFaced:false,
    trailSecret1Done:false,
    trailSecret10Done:false,
    trailSecret100Done:false,
    trailSecret500Done:false,
    trailSecretAllDone:false,
    soulInfusionAttempted:false,
    trailGodsFaced:false,
    trailGods10Done:false,
    trailGods20Done:false,
    trailGods30Done:false,
    trailGods40Done:false,
    trailGods50Done:false,
    trailGods60Done:false,
    trailGods70Done:false,
    trailGods80Done:false,
    trailGods90Done:false,
    trailGodsAllDone:false,
    fightGods01:false,
    fightGods02:false,
    fightGods03:false,
    fightGods04:false,
    fightGods05:false,
    fightGods06:false,
    fightGods07:false,
    fightGods08:false,
    fightGods09:false,
    fightGods10:false,
    fightGods11:false,
    fightGods12:false,
    fightGods13:false,
    fightGods14:false,
    fightGods15:false,
    fightGods16:false,
    fightGods17:false,
    fightGods18:false,
};
const storyReqs = storyFlags; // compatibility alias, can be removed when we're sure it won't break anything

/** @typedef {keyof typeof storyVars} StoryVarName */
const storyVars = {
    maxWizardGuildSegmentCleared: -1,
    maxZombiesRaised: -1,
};

/**
 * @satisfies {{
 *  storyFlags: {[K in StoryFlagName]?: (loadingFlags: Record<string, boolean>, loadingVars: Record<string, number>) => boolean},
 *  storyVars: {[K in StoryVarName]?: (loadingFlags: Record<string, boolean>, loadingVars: Record<string, number>) => number},
 * }}
 */
const storyInitializers = {
    storyFlags: {
    },
    storyVars: {
        maxWizardGuildSegmentCleared(loadingFlags, loadingVars) {
            if (loadingFlags["wizardGuildRankSSSReached"]) return 48;
            if (loadingFlags["wizardGuildRankSSReached"]) return 42;
            if (loadingFlags["wizardGuildRankSReached"]) return 36;
            if (loadingFlags["wizardGuildRankAReached"]) return 30;
            if (loadingFlags["wizardGuildRankBReached"]) return 24;
            if (loadingFlags["wizardGuildRankCReached"]) return 18;
            if (loadingFlags["wizardGuildRankDReached"]) return 12;
            if (loadingFlags["wizardGuildRankEReached"]) return 6;
            if (loadingFlags["wizardGuildTestTaken"]) return 0;
        },
    },
}


const curDate = new Date();
let totalOfflineMs = 0;
// eslint-disable-next-line prefer-const
let bonusSpeed = 1;
let bonusActive = false;
let currentLoop = 0;
const offlineRatio = 1;
let windowFps = 50;
let totals = {
    time: 0,
    effectiveTime: 0,
    borrowedTime: 0,
    loops: 0,
    actions: 0
};

/** @type {{challengeMode?: number, inChallenge?: boolean}} */
let challengeSave = {
    challengeMode: 0,
    inChallenge: false
};

let totalMerchantMana = 7500;

// eslint-disable-next-line prefer-const
let curAdvGuildSegment = 0;
// eslint-disable-next-line prefer-const
let curCraftGuildSegment = 0;
// eslint-disable-next-line prefer-const
let curWizCollegeSegment = 0;
// eslint-disable-next-line prefer-const
let curFightFrostGiantsSegment = 0;
// eslint-disable-next-line prefer-const
let curFightJungleMonstersSegment = 0;
// eslint-disable-next-line prefer-const
let curThievesGuildSegment = 0;
// eslint-disable-next-line prefer-const
let curGodsSegment = 0;

/** @type {AnyAction[]} */
let totalActionList = [];

function initializeActions() {
    totalActionList.length = 0;
    for (const prop in Action) {
        const action = Action[prop];
        totalActionList.push(action);
    }
}

let dungeons = [[], [], []];
/** @type {(any[] & {highestFloor?:number})[]} */
let trials = [[], [], [], [], []];

// register all the object variables assigned in this file
Data.registerAll({
    actions,
    towns,
    stats,
    resources,
    hearts,
    skills,
    buffs,
    prestigeValues,
    townsUnlocked,
    completedActions,
    storyFlags,
    storyVars,
    totals,
});

// If we want to be able to iterate through the scalar global variables, they have to be assigned to an object. If we want to read or write them programmatically, we have to
// be able to access a syntactic variable via indirection, which can only be done by eval (or its cousin, new Function).
// the shorthand object initializer syntax here is just an easy way to get variable names into a call.
const globalVariables = virtualizeGlobalVariables({
    timer,
    timeNeeded,
    curTown,
    totalTalent,
    shouldRestart,
    guild,
    escapeStarted,
    portalUsed,
    stoneLoc,
    goldInvested,
    stonesUsed,
    trainingLimits,
    storyMax,
    unreadActionStories,
    totalMerchantMana,
    curAdvGuildSegment,
    curCraftGuildSegment,
    curWizCollegeSegment,
    curFightFrostGiantsSegment,
    curFightJungleMonstersSegment,
    curThievesGuildSegment,
    curGodsSegment,
    dungeons,
    trials,
});

function getGlobalBindingAccessors() {
    const appContextFactory = globalThis.IdleLoopsAppContext;
    if (!appContextFactory || typeof appContextFactory.getLegacyAppContext !== "function") {
        return null;
    }
    try {
        return appContextFactory.getLegacyAppContext().globalBindings ?? null;
    } catch {
        return null;
    }
}

function getLegacyAppContext() {
    const appContextFactory = globalThis.IdleLoopsAppContext;
    if (!appContextFactory || typeof appContextFactory.getLegacyAppContext !== "function") {
        return null;
    }
    try {
        return appContextFactory.getLegacyAppContext();
    } catch {
        return null;
    }
}

function captureAppContextGlobals(names) {
    const appContext = getLegacyAppContext();
    if (!appContext || typeof appContext.captureGlobalState !== "function") {
        return null;
    }
    try {
        return appContext.captureGlobalState(names);
    } catch {
        return null;
    }
}

function applyAppContextGlobals(patch) {
    const appContext = getLegacyAppContext();
    if (!appContext || typeof appContext.applyGlobalState !== "function") {
        return null;
    }
    try {
        return appContext.applyGlobalState(patch);
    } catch {
        return null;
    }
}

function captureAppContextCollections(names) {
    const appContext = getLegacyAppContext();
    if (!appContext || typeof appContext.captureCollectionState !== "function") {
        return null;
    }
    try {
        return appContext.captureCollectionState(names);
    } catch {
        return null;
    }
}

function applyAppContextCollections(patch) {
    const appContext = getLegacyAppContext();
    if (!appContext || typeof appContext.applyCollectionState !== "function") {
        return null;
    }
    try {
        return appContext.applyCollectionState(patch);
    } catch {
        return null;
    }
}

function captureSaveGlobals() {
    return captureAppContextGlobals([
        "totalTalent",
        "goldInvested",
        "stonesUsed",
        "storyMax",
        "unreadActionStories",
    ]) ?? {
        totalTalent,
        goldInvested,
        stonesUsed,
        storyMax,
        unreadActionStories,
    };
}

function captureSaveCollections() {
    return captureAppContextCollections([
        "townsUnlocked",
        "completedActions",
        "challengeSave",
    ]) ?? {
        townsUnlocked: [...townsUnlocked],
        completedActions: [...completedActions],
        challengeSave: {...challengeSave},
    };
}

function captureSaveStoryCollections() {
    return captureAppContextCollections([
        "storyFlags",
        "storyVars",
        "totals",
    ]) ?? {
        storyFlags: {...storyFlags},
        storyVars: {...storyVars},
        totals: {...totals},
    };
}

function captureSavePrestigeCollections() {
    return captureAppContextCollections([
        "prestigeValues",
    ]) ?? {
        prestigeValues: {...prestigeValues},
    };
}

function captureSaveBuffCollections() {
    return captureAppContextCollections([
        "buffCaps",
    ]) ?? {
        buffCaps: {...buffCaps},
    };
}

function loadPrimarySaveGlobals(toLoad) {
    let loadedTotalTalent = toLoad.totalTalent;
    if (loadedTotalTalent === undefined) {
        loadedTotalTalent = 0;
        for (const property in toLoad.stats) {
            if (toLoad.stats.hasOwnProperty(property)) {
                loadedTotalTalent += toLoad.stats[property].talent * 100;
            }
        }
    }
    const loadedGlobals = {
        totalTalent: loadedTotalTalent,
        trainingLimits: 10 + getBuffLevel("Imbuement"),
        goldInvested: toLoad.goldInvested === undefined ? 0 : toLoad.goldInvested,
        stonesUsed: toLoad.stonesUsed === undefined ? {1:0, 3:0, 5:0, 6:0} : toLoad.stonesUsed,
    };
    applyAppContextGlobals(loadedGlobals) ?? (() => {
        totalTalent = loadedGlobals.totalTalent;
        trainingLimits = loadedGlobals.trainingLimits;
        goldInvested = loadedGlobals.goldInvested;
        stonesUsed = loadedGlobals.stonesUsed;
    })();
    return loadedGlobals;
}

function loadStorySaveGlobals(toLoad) {
    const loadedGlobals = {
        storyMax: toLoad.storyMax === undefined ? 0 : toLoad.storyMax,
        unreadActionStories: toLoad.unreadActionStories === undefined
            || toLoad.unreadActionStories.find(s => !s.includes("storyContainer"))
            ? []
            : toLoad.unreadActionStories,
    };
    for (const name of loadedGlobals.unreadActionStories) {
        showNotification(name);
    }
    applyAppContextGlobals(loadedGlobals) ?? (() => {
        storyMax = loadedGlobals.storyMax;
        unreadActionStories = loadedGlobals.unreadActionStories;
    })();
    return loadedGlobals;
}

function loadStorySaveCollections(toLoad) {
    const loadedCollections = {
        storyFlags: {},
        storyVars: {},
    };
    for (const property in storyFlags) {
        loadedCollections.storyFlags[property] = toLoad.storyReqs?.hasOwnProperty(property)
            ? toLoad.storyReqs[property]
            : storyInitializers.storyFlags[property]?.(toLoad.storyReqs ?? {}, toLoad.storyVars ?? {}) ?? false;
    }
    for (const property in storyVars) {
        loadedCollections.storyVars[property] = toLoad.storyVars?.hasOwnProperty(property)
            ? toLoad.storyVars[property]
            : storyInitializers.storyVars[property]?.(toLoad.storyReqs ?? {}, toLoad.storyVars ?? {}) ?? -1;
    }
    applyAppContextCollections(loadedCollections)
        ?? globalThis.IdleLoopsStoryState.applyStoryCollections(storyFlags, storyVars, loadedCollections);
    return loadedCollections;
}

function loadPrestigeValuesState(toLoad) {
    const loadedPrestigeValues = {
        prestigeCurrentPoints: toLoad.prestigeValues?.prestigeCurrentPoints === undefined ? 0 : toLoad.prestigeValues.prestigeCurrentPoints,
        prestigeTotalPoints: toLoad.prestigeValues?.prestigeTotalPoints === undefined ? 0 : toLoad.prestigeValues.prestigeTotalPoints,
        prestigeTotalCompletions: toLoad.prestigeValues?.prestigeTotalCompletions === undefined ? 0 : toLoad.prestigeValues.prestigeTotalCompletions,
        completedCurrentPrestige: toLoad.prestigeValues?.completedCurrentPrestige === undefined ? 0 : toLoad.prestigeValues.completedCurrentPrestige,
        completedAnyPrestige: toLoad.prestigeValues?.completedAnyPrestige === undefined ? false : toLoad.prestigeValues.completedAnyPrestige,
    };
    applyAppContextCollections({
        prestigeValues: loadedPrestigeValues,
    }) ?? globalThis.IdleLoopsPrestigeState.replacePrestigeValues(prestigeValues, loadedPrestigeValues);
    return loadedPrestigeValues;
}

function loadBuffCapsState(toLoad) {
    const loadedBuffCaps = {};
    for (const property in buffCaps) {
        loadedBuffCaps[property] = toLoad.buffCaps?.hasOwnProperty(property) ? toLoad.buffCaps[property] : buffCaps[property];
    }
    applyAppContextCollections({
        buffCaps: loadedBuffCaps,
    }) ?? globalThis.IdleLoopsBuffCapState.applyBuffCapSnapshot(buffCaps, loadedBuffCaps);
    for (const property in loadedBuffCaps) {
        const element = inputElement(`buff${property}Cap`, false, false);
        if (element) {
            element.value = loadedBuffCaps[property];
        }
    }
    return loadedBuffCaps;
}

function loadTotalsState(toLoad) {
    const loadedTotals = {
        time: toLoad.totals?.time === undefined ? 0 : toLoad.totals.time,
        effectiveTime: toLoad.totals?.effectiveTime === undefined ? 0 : toLoad.totals.effectiveTime,
        borrowedTime: toLoad.totals?.borrowedTime ?? 0,
        loops: toLoad.totals?.loops === undefined ? 0 : toLoad.totals.loops,
        actions: toLoad.totals?.actions === undefined ? 0 : toLoad.totals.actions,
    };
    applyAppContextCollections({
        totals: loadedTotals,
    }) ?? globalThis.IdleLoopsRuntimeState.applyTotalsSnapshot(totals, loadedTotals);
    return loadedTotals;
}

function applyChallengeSaveState(value) {
    return applyAppContextCollections({
        challengeSave: value,
    })?.challengeSave ?? globalThis.IdleLoopsChallengeState.applyChallengeSaveSnapshot(challengeSave, value);
}

function loadProgressionSaveCollections(toLoad) {
    const loadedCollections = globalThis.IdleLoopsWorldState.createProgressionCollectionsSnapshot(toLoad);
    applyAppContextCollections(loadedCollections)
        ?? globalThis.IdleLoopsWorldState.applyProgressionCollections(townsUnlocked, completedActions, loadedCollections);
    return loadedCollections;
}

function createVirtualGlobalAccessor(name) {
    const get = /** @type {() => any} */(new Function(`return ${name};`));
    const set = /** @type {(any) => void} */(new Function("v__", `${name} = v__`));
    return {get, set};
}

function virtualizeGlobalVariables(variables) {
    const globals = Data.rootObjects.globals ?? {};
    const bindingAccessors = getGlobalBindingAccessors();
    for (const name in variables) {
        const accessor = bindingAccessors?.[name] ?? createVirtualGlobalAccessor(name);
        Object.defineProperty(globals, name, {
            get: accessor.get,
            set: accessor.set,
            enumerable: true,
            configurable: true,
        });
    }
    return Data.register("globals", globals);
}

/** @type {Notification} */
let pauseNotification = null;
const googleCloud = selfIsGame
    ? getCloudSaveServiceApi().createCloudSaveFacade(new GoogleCloud(), {
        view,
        delay,
        processSave,
        saveGame: save,
        currentSaveData,
        saveFileName,
        cloudSavedText(name) {
            return _txt("menu>save>cloud_saved").replace("{name}", name);
        },
    })
    : null;

const options = {
    theme: "normal",
    themeVariant: "",
    responsiveUI: true,
    actionLog: true,
    fractionalMana: false,
    keepCurrentList: false,
    repeatLastAction: false,
    addActionsToTop: false,
    pauseBeforeRestart: false,
    pauseOnFailedLoop: false,
    pauseOnComplete: false,
    speedIncrease10x: false,
    speedIncrease20x: false,
    speedIncreaseCustom: 5,
    speedIncreaseBackground: -1,
    bonusIsActive: false,
    highlightNew: true,
    statColors: true,
    statHints: false,
    simpleTooltips: false,
    pingOnPause: false,
    notifyOnPause: false,
    autoMaxTraining: false,
    hotkeys: true,
    predictor:  false,
    googleCloud: false,
    updateRate: 50,
    autosaveRate: 30,
    predictorTimePrecision: 1,
    predictorNextPrecision: 2,
    predictorActionWidth: 500,
    predictorRepeatPrediction: true,
    predictorSlowMode: false,
    predictorSlowTimer: 1,
    predictorTrackedStat: "Rsoul",
    predictorBackgroundThread: true,
};

/** @satisfies {readonly {[K in OptionName]: OptionType<K> extends number ? K : never}[OptionName][]} */
/** @typedef {keyof typeof options} OptionName */
/** @template {OptionName} N @typedef {typeof options[N]} OptionType */
/** @typedef {{[K in OptionName]: OptionType<K> extends number ? K : never}[OptionName]} NumericOptionName */
/** @typedef {{[K in OptionName]: OptionType<K> extends string ? K : never}[OptionName]} StringOptionName */
/** @typedef {{[K in OptionName]: OptionType<K> extends boolean ? K : never}[OptionName]} BooleanOptionName */

/** @satisfies {NumericOptionName[]} */
const numericOptions = [
    "speedIncreaseCustom",
    "speedIncreaseBackground",
    "updateRate",
    "autosaveRate",
    "predictorTimePrecision",
    "predictorNextPrecision",
    "predictorActionWidth",
    "predictorSlowTimer",
];
/** @satisfies {readonly StringOptionName[]} */
const stringOptions = [
    "theme",
    "themeVariant",
    "predictorTrackedStat",
];

/** @param {string} option @returns {option is NumericOptionName} */
function isNumericOption(option) {
    return numericOptions.includes(/** @type {NumericOptionName} */(option));
}

/** @param {string} option @returns {option is StringOptionName} */
function isStringOption(option) {
    return stringOptions.includes(/** @type {StringOptionName} */(option));
}

/** @param {string} option @returns {option is BooleanOptionName} */
function isBooleanOption(option) {
    // I'm explicitly deciding to leave this open-ended, so unknown options are treated as booleans
    return !numericOptions.includes(/** @type {NumericOptionName} */(option))
        && !stringOptions.includes(/** @type {StringOptionName} */(option));
}

// legacy predictor settings are in localStorage, use them as defaults if they exist
function importPredictorSettings() {
    /** @type {Record<string, OptionName>} */
    const settingsMap = {
        __proto__: null,
        timePrecision: "predictorTimePrecision",
        nextPrecision: "predictorNextPrecision",
        actionWidth: "predictorActionWidth",
        repeatPrediction: "predictorRepeatPrediction",
        slowMode: "predictorSlowMode",
        slowTimer: "predictorSlowTimer",
    };
    return getOptionsStoreApi().importLegacyPredictorSettings(localStorage, settingsMap, {
        isNumericOption,
        isStringOption,
    });
}
if (selfIsGame) {
    Object.assign(options, importPredictorSettings()); // override hardcoded defaults if not in worker
}

// The original forks will throw exceptions if there are unexpected properties in the options element. This list lets us
// check to see if a given option should go into "options" in the save, otherwise it belongs in "extraOptions".
/** @satisfies {Record<OptionName, boolean>} */
const isStandardOption = {
    theme: true,
    themeVariant: false,
    responsiveUI: false,
    actionLog: false,
    fractionalMana: false,
    keepCurrentList: true,
    repeatLastAction: true,
    addActionsToTop: true,
    pauseBeforeRestart: true,
    pauseOnFailedLoop: true,
    pauseOnComplete: true,
    speedIncrease10x: true,
    speedIncrease20x: true,
    speedIncreaseCustom: true,
    speedIncreaseBackground: false,
    bonusIsActive: false,
    highlightNew: true,
    statColors: true,
    statHints: false,
    simpleTooltips: false,
    pingOnPause: true,
    notifyOnPause: false,
    autoMaxTraining: true,
    hotkeys: true,
    predictor: false,
    googleCloud: false,
    updateRate: true,
    autosaveRate: true,
    predictorTimePrecision: false,
    predictorNextPrecision: false,
    predictorActionWidth: false,
    predictorRepeatPrediction: false,
    predictorSlowMode: false,
    predictorSlowTimer: false,
    predictorTrackedStat: false,
    predictorBackgroundThread: false,
};

// Some options set or clear an indicator class on the root element so CSS can respond. Record these here.
/** @type {Partial<Record<OptionName, string>>} */
const optionIndicatorClasses = {
    responsiveUI: "responsive",
    statColors: "use-stat-colors",
    statHints: "show-stat-hints",
    simpleTooltips: "use-simple-tooltips",
    predictor: "usePredictor",
};

const quickSettingOptions = new Set([
    "responsiveUI",
    "actionLog",
    "predictor",
    "statColors",
    "highlightNew",
    "hotkeys",
    "simpleTooltips",
]);

 /** @type {{[K in OptionName]?: (value: OptionType<K>, init: boolean, getInput: () => HTMLValueElement) => void}} */
const optionValueHandlers = {
    notifyOnPause(value, init, getInput) {
        const input = /** @type {HTMLInputElement} */(getInput());
        if (value && !init) {
            if (Notification && Notification.permission === "default") {
                input.checked = false;
                input.indeterminate = true;
                Notification.requestPermission(_ => {
                    input.indeterminate = false;
                    input.checked = value;
                    setOption("notifyOnPause", value);
                });
            } else if (Notification && Notification.permission === "denied") {
                input.checked = false;
                input.indeterminate = false;
                alert(_txt("menu>save>notification_permission_denied"));
            } else if (!Notification || Notification.permission !== "granted") {
                input.checked = false;
                input.indeterminate = false;
            }
        } else if (!value) {
            options.notifyOnPause = false;
            input.checked = false;
            input.indeterminate = false;
        }
    },
    updateRate(value, init) {
        if (!init) recalcInterval(value);
    },
    actionLog(value, init) {
        document.getElementById("actionLogContainer").style.display = value ? "" : "none";
        document.getElementById("navbar_action_log").style.display = value ? "" : "none";
    },
    predictor(value, init) {
        getOptionsStoreApi().writePredictorToggle(localStorage, value);
    },
    googleCloud(value, init, getInput) {
        if (value) {
            googleCloud.init();
            document.getElementById("cloud_save").style.display="";
        } else {
            document.getElementById("cloud_save").style.display="none";
        }
        if (!init && !value) googleCloud.revoke();
    },
    speedIncrease10x: checkExtraSpeed,
    speedIncrease20x: checkExtraSpeed,
    speedIncreaseCustom: checkExtraSpeed,
    speedIncreaseBackground(value, init) {
        checkExtraSpeed();
        if (typeof value === "number" && !isNaN(value) && value < 1 && value >= 0) {
            document.getElementById("speedIncreaseBackgroundWarning").style.display = "";
        } else {
            document.getElementById("speedIncreaseBackgroundWarning").style.display = "none";
        }
    },
    bonusIsActive(value, init) {
        if (!value !== !isBonusActive()) {
            toggleOffline();
        }
    },
    repeatLastAction() {
        if (options.predictor) {
            view.requestUpdate("updateNextActions");
        }
    },
    predictorActionWidth(value) {
        document.documentElement.style.setProperty("--predictor-actions-width", `${value}px`);
    },
    predictorTimePrecision(value) {
        if (value > 10) {
            setOption("predictorTimePrecision", 10);
        }
        if (value < 1) {
            setOption("predictorTimePrecision", 1);
        }
    },
    predictorNextPrecision(value) {
        if (value > 10) {
            setOption("predictorNextPrecision", 10);
        }
        if (value < 1) {
            setOption("predictorNextPrecision", 1);
        }
    },
    predictorTrackedStat(value, init) {
        if (!init) {
            view.requestUpdate("updateNextActions");
        }
    },
    predictorBackgroundThread(value, init) {
        if (!value && !init) {
            Koviko.instance.terminateWorker();
        }
    }
};

/** @type {<K extends OptionName>(option: K, value: OptionType<K>, init: boolean, getInput: () => HTMLValueElement) => void} */
function handleOption(option, value, init, getInput) {
    optionValueHandlers[option]?.(value, init, getInput);
    // The handler can change the value of the option. Recheck when setting or clearing the indicator class.
    if (option in optionIndicatorClasses) {
        document.documentElement.classList.toggle(optionIndicatorClasses[option], !!options[option]);
    }
    if (selfIsGame && typeof view?.updateQuickSettings === "function" && quickSettingOptions.has(option)) {
        view.updateQuickSettings();
    }
    if (selfIsGame && typeof view?.updateHotkeyReferencePanels === "function" && option === "hotkeys") {
        view.updateHotkeyReferencePanels();
    }
    if (selfIsGame && typeof view?.updateMobileReadingState === "function" && option === "responsiveUI") {
        view.updateMobileReadingState();
    }
    if (selfIsGame && typeof view?.renderInspector === "function" && option === "simpleTooltips") {
        view.renderInspector();
    }
}

/** @template {OptionName} K @param {K} option @param {OptionType<K>} value */
function setOption(option, value, updateUI = false) {
    const oldValue = options[option];
    options[option] = value;
    handleOption(option, value, false, () => valueElement(`${option}Input`));
    if (options[option] !== oldValue) {
        save();
    }
    if (updateUI && (options[option] !== oldValue || options[option] !== value)) {
        loadOption(option, options[option], false);
    }
}

/** @template {OptionName} K @param {K} option @param {OptionType<K>} value */
function loadOption(option, value, callHandler = true) {
    const input = valueElement(`${option}Input`, false); // this is allowed to have errors
    if (!input) return;
    if (input instanceof HTMLInputElement && input.type === "checkbox") input.checked = !!value;
    else if (option === "speedIncreaseBackground" && (typeof value !== "number" || isNaN(value) || value < 0)) input.value = "";
    else input.value = String(value);
    handleOption(option, value, true, () => input);
}

function showPauseNotification(message) {
    pauseNotification = new Notification("Idle Loops", { icon: "favicon-32x32.png", body: message, tag: "paused", renotify: true });
}

function clearPauseNotification() {
    if (pauseNotification) {
        pauseNotification.close();
        pauseNotification = null;
    }
}

function closeTutorial() {
    document.getElementById("tutorial").style.display = "none";
}

function clearSave() {
    getSaveServiceApi().clearSaveSlots(window.localStorage, [defaultSaveName, challengeSaveName]);
    location.reload();
}

let defaultsRecorded = false;
function loadDefaults() {
    if (defaultsRecorded) {
        Data.resetToDefaults();
    }
    initializeStats();
    initializeSkills();
    initializeBuffs();
    initializeActions();
    initializeTowns();
    globalThis.IdleLoopsPrestigeState.resetPrestigeValues(prestigeValues);
    Data.recordDefaults();
    defaultsRecorded = true;
}

function loadUISettings() {
    const height = getOptionsStoreApi().readActionListHeight(localStorage) ?? "";
    if (height !== "") document.documentElement.style.setProperty("--action-list-height", height);
}

function saveUISettings() {
    const height = document.documentElement.style.getPropertyValue("--action-list-height");
    getOptionsStoreApi().writeActionListHeight(localStorage, height);
}

function needsDataSnapshots() {
    return options.predictor && options.predictorBackgroundThread;
}

function load(inChallenge, saveJson = getSaveServiceApi().readSaveJson(window.localStorage, saveName)) {
    loadDefaults();
    loadUISettings();

    loadouts = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
    loadoutnames = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
    // loadoutnames[-1] is what displays in the loadout renaming box when no loadout is selected
    // It isn't technically part of the array, just a property on it, so it doesn't count towards loadoutnames.length
    loadoutnames[-1] = getLoadoutNameDefault();

    let toLoad = {};
    // has a save file
    if (saveJson && saveJson !== "null") {
        closeTutorial();
        toLoad = JSON.parse(saveJson);
    }

    console.log("Loading game from: " + saveName + " inChallenge: " + inChallenge);

    const loadedChallengeSave = globalThis.IdleLoopsChallengeState.createChallengeSaveSnapshot(toLoad.challengeSave ?? {});
    if (inChallenge !== undefined) {
        loadedChallengeSave.inChallenge = inChallenge;
    }
    applyChallengeSaveState(loadedChallengeSave);

    const activeChallengeSave = captureSaveCollections().challengeSave;
    console.log("Challenge Mode: " + activeChallengeSave.challengeMode + " In Challenge: " + activeChallengeSave.inChallenge);


    if (saveName === defaultSaveName && activeChallengeSave.inChallenge === true) {
        console.log("Switching to challenge save");
        saveName = challengeSaveName;
        load(true);
        return;
    }

    if (activeChallengeSave.challengeMode !== 0)
        saveName = challengeSaveName;

    doLoad(toLoad);
}

function doLoad(toLoad) {
    for (const property of Object.getOwnPropertyNames(toLoad.stats ?? {})) {
        if (property in stats) {
            stats[property].load(toLoad.stats[property]);
        }
    }


    for (const property of Object.getOwnPropertyNames(toLoad.skills ?? {})) {
        if (property in skills) {
            skills[property].load(toLoad.skills[property]);
        }
    }

    globalThis.IdleLoopsCharacterState.loadBuffSnapshot(buffs, toLoad.buffs, buffHardCaps);

    loadBuffCapsState(toLoad);
    loadPrestigeValuesState(toLoad);

    loadStorySaveCollections(toLoad);

    if (toLoad.actionLog !== undefined) {
        actionLog.load(toLoad.actionLog);
        actionLog.loadRecent();
    } else {
        actionLog.initialize();
    }
    if (actionLog.entries.length === 0) {
        actionLog.addGlobalStory(0);
    }

    loadPrimarySaveGlobals(toLoad);

    loadProgressionSaveCollections(toLoad);
    actions.clearActions();
    if (toLoad.nextList) {
        for (const action of toLoad.nextList) {
            if (action.name === "Sell Gold") {
                action.name = "Buy Mana";
            }
            if (action.name === "Buy Mana Challenge")
                action.name = "Buy Mana Z1";
            if (action.name === "Tournament") {
                action.name = "Buy Pickaxe";
            }
            if (action.name === "Train Dex") {
                action.name = "Train Dexterity";
            }
            if (action.name === "Buy Mana") {
                action.name = "Buy Mana Z1";
            }
            if (action.name === "Purchase Mana") {
                action.name = "Buy Mana Z3";
            }
            if(totalActionList.some(x => x.name === action.name))
                actions.addActionRecord(action, -1, false);
        }
    }

    if (toLoad.loadouts) {
        for (let i = 0; i < loadouts.length; i++) {
            if (!toLoad.loadouts[i]) {
                continue;
            }
            //Translates old actions that no longer exist
            for (const action of toLoad.loadouts[i]) {
                if (action.name === "Sell Gold") {
                    action.name = "Buy Mana";
                }
                if (action.name === "Tournament") {
                    action.name = "Buy Pickaxe";
                }
                if (action.name === "Train Dex") {
                    action.name = "Train Dexterity";
                }
                if (action.name === "Buy Mana") {
                    action.name = "Buy Mana Z1";
                }
                if (action.name === "Purchase Mana") {
                    action.name = "Buy Mana Z3";
                }
                if(totalActionList.some(x => x.name === action.name))
                    loadouts[i].push(action);
            }
        }
    }
    for (let i = 0; i < loadoutnames.length; i++) {
        loadoutnames[i] = getDefaultLoadoutName(i + 1);
    }
    if (toLoad.loadoutnames) {
        for (let i = 0; i < loadoutnames.length; i++) {
            if(toLoad.loadoutnames[i] != undefined && toLoad.loadoutnames != "")
                loadoutnames[i] = toLoad.loadoutnames[i];
            else
                loadoutnames[i] = getDefaultLoadoutName(i + 1);
        }
    }
    curLoadout = toLoad.curLoadout;
    const elem = typeof document === "undefined" ? undefined : document.getElementById(`load${curLoadout}`);
    if (elem) {
        removeClassFromDiv(document.getElementById(`load${curLoadout}`), "unused");
    }

    /*if (toLoad.dungeons) {
        if (toLoad.dungeons.length < dungeons.length) {
            toLoad.dungeons.push([]);
        }
    }*/
    dungeons = [[], [], []];
    const level = { ssChance: 1, completed: 0 };
    let floors = 0;
    if(toLoad.dungeons === undefined) toLoad.dungeons = copyArray(dungeons);
    for (let i = 0; i < dungeons.length; i++) {
        floors = dungeonFloors[i];
        for (let j = 0; j < floors; j++) {
            if (toLoad.dungeons[i] != undefined && toLoad.dungeons && toLoad.dungeons[i][j]) {
                dungeons[i][j] = toLoad.dungeons[i][j];
            } else {
                dungeons[i][j] = copyArray(level);
            }
            dungeons[i][j].lastStat = "NA";
        }
    }

    trials = [[], [], [], [], []];
    const trialLevel = {completed: 0};
    if(toLoad.trials === undefined) toLoad.trials = copyArray(trials);
    for (let i = 0; i < trials.length; i++) {
        floors = trialFloors[i];
        trials[i].highestFloor = 0;
        for (let j = 0; j < floors; j++) {
            if (toLoad.trials[i] != undefined && toLoad.trials && toLoad.trials[i][j]) {
                trials[i][j] = toLoad.trials[i][j];
                if (trials[i][j].completed > 0) trials[i].highestFloor = j;
            } else {
                trials[i][j] = copyArray(trialLevel);
            }
        }
    }

    getSaveMigrationsApi().applySavedOptions(
        options,
        toLoad,
        getOptionsStoreApi().readUpdateRate(window.localStorage),
    );

    /** @type {string[]} */
    const hiddenVarNames = toLoad.hiddenVars?.slice() ?? [];

    for (const town of towns) {
        const hiddenVars = hiddenVarNames.shift() ?? [];
        town.hiddenVars.clear()
        for (const action of town.totalActionList) {
            if ((action.visible?.() ?? true) && (action.unlocked?.() ?? true)) {
                if (hiddenVars.includes(action.varName)) {
                    town.hiddenVars.add(action.varName);
                }
                if (action.name.startsWith("Survey") && hiddenVars.includes(`${action.varName}Global`)) {
                    town.hiddenVars.add(`${action.varName}Global`);
                }
            }
            if (action.type === "progress")
                town[`exp${action.varName}`] = toLoad[`exp${action.varName}`] === undefined ? 0 : toLoad[`exp${action.varName}`];
            else if (action.type === "multipart")
                town[`total${action.varName}`] = toLoad[`total${action.varName}`] === undefined ? 0 : toLoad[`total${action.varName}`];
            else if (action.type === "limited") {
                const varName = action.varName;
                if (toLoad[`total${varName}`] !== undefined)
                    town[`total${varName}`] = toLoad[`total${varName}`];
                if (toLoad[`checked${varName}`] !== undefined)
                    town[`checked${varName}`] = toLoad[`checked${varName}`];
                if (toLoad[`good${varName}`] !== undefined)
                    town[`good${varName}`] = toLoad[`good${varName}`];
                if (toLoad[`good${varName}`] !== undefined)
                    town[`goodTemp${varName}`] = toLoad[`good${varName}`];
            }
        }
    }

    loadChallenge();
    view.initalize();

    for (const town of towns) {
        for (const action of town.totalActionList) {
            if (action.type === "limited") {
                const varName = action.varName;
                if (toLoad[`searchToggler${varName}`] !== undefined) {
                    inputElement(`searchToggler${varName}`).checked = toLoad[`searchToggler${varName}`];
                }
                view.updateRegular({name: action.varName, index: town.index});
            }
        }
    }

    totalOfflineMs = toLoad.totalOfflineMs === undefined ? 0 : toLoad.totalOfflineMs; // must load before options

    for (const option of typedKeys(options)) {
        loadOption(option, options[option]);
    }
    storyShowing = toLoad.storyShowing === undefined ? 0 : toLoad.storyShowing;
    loadStorySaveGlobals(toLoad);

    const loadedTotals = loadTotalsState(toLoad);
    currentLoop = loadedTotals.loops;
    view.updateTotals();
    console.log("Updating prestige values from load")
    view.updatePrestigeValues();

    // capped at 1 month of gain
    addOffline(Math.min(Math.floor((Date.now() - Date.parse(toLoad.date)) * offlineRatio), 2678400000));

    getSaveMigrationsApi().migrateVersion75DungeonTotals(toLoad, towns, dungeons);

    //Handle players on previous challenge system
    if (getSaveMigrationsApi().needsLegacyChallengeMigration(toLoad)) {
        const challengeMigration = getSaveMigrationsApi().createLegacyChallengeMigration(
            captureSaveCollections().challengeSave,
            toLoad.challenge,
        );
        applyChallengeSaveState(challengeMigration.bootstrap);
        save();

        applyChallengeSaveState(challengeMigration.finalize);
        saveName = challengeSaveName;
        save();
        location.reload();
    }

    if(getExploreProgress() >= 100) addResource("glasses", true);

    adjustAll();

    Data.recordBase();

    view.updateLoadoutNames();
    view.changeStatView();
    view.updateNextActions();
    view.updateMultiPartActions();
    view.updateStories(true);
    view.update();
    recalcInterval(options.updateRate);
    pauseGame();
}

function doSave() {
    const toSave = {};
    const saveGlobals = captureSaveGlobals();
    const saveCollections = captureSaveCollections();
    const saveStoryCollections = captureSaveStoryCollections();
    const savePrestigeCollections = captureSavePrestigeCollections();
    const saveBuffCollections = captureSaveBuffCollections();
    toSave.curLoadout = curLoadout;
    toSave.dungeons = dungeons;
    toSave.trials = trials;
    toSave.townsUnlocked = saveCollections.townsUnlocked;
    toSave.completedActions = saveCollections.completedActions;

    toSave.stats = stats;
    toSave.totalTalent = saveGlobals?.totalTalent ?? totalTalent;
    toSave.skills = skills;
    toSave.buffs = buffs;
    toSave.prestigeValues = savePrestigeCollections.prestigeValues;
    toSave.goldInvested = saveGlobals?.goldInvested ?? goldInvested;
    toSave.stonesUsed = saveGlobals?.stonesUsed ?? stonesUsed;
    toSave.version75 = true;

    /** @type {string[][]} */
    const hiddenVars = [];

    for (const town of towns) {
        hiddenVars.push(Array.from(town.hiddenVars));
        for (const action of town.totalActionList) {
            if (action.type === "progress") {
                toSave[`exp${action.varName}`] = town[`exp${action.varName}`];
            } else if (action.type === "multipart") {
                toSave[`total${action.varName}`] = town[`total${action.varName}`];
            } else if (action.type === "limited") {
                const varName = action.varName;
                toSave[`total${varName}`] = town[`total${varName}`];
                toSave[`checked${varName}`] = town[`checked${varName}`];
                toSave[`good${varName}`] = town[`good${varName}`];
                toSave[`goodTemp${varName}`] = town[`good${varName}`];
                if (document.getElementById(`searchToggler${varName}`)) {
                    toSave[`searchToggler${varName}`] = inputElement(`searchToggler${varName}`).checked;
                }
            }
        }
    }
    toSave.hiddenVars = hiddenVars;
    toSave.nextList = actions.next;
    toSave.loadouts = loadouts;
    toSave.loadoutnames = loadoutnames;
    toSave.options = {};
    toSave.extraOptions = {}; // to avoid crashing when exporting to lloyd, etc
    for (const option in options) {
        if (isStandardOption[option]) {
            toSave.options[option] = options[option];
        } else {
            toSave.extraOptions[option] = options[option];
        }
    }
    toSave.storyShowing = storyShowing;
    toSave.storyMax = saveGlobals?.storyMax ?? storyMax;
    toSave.storyReqs = saveStoryCollections.storyFlags; // save uses the legacy name "storyReqs" for compatibility
    toSave.storyVars = saveStoryCollections.storyVars;
    toSave.unreadActionStories = saveGlobals?.unreadActionStories ?? unreadActionStories;
    toSave.actionLog = actionLog;
    toSave.buffCaps = saveBuffCollections.buffCaps;

    toSave.date = new Date();
    toSave.totalOfflineMs = totalOfflineMs;
    toSave.totals = saveStoryCollections.totals;

    toSave.challengeSave = saveCollections.challengeSave;

    return toSave;
}

function save() {
    const toSave = doSave();
    const saveJson = JSON.stringify(toSave);
    storeSaveJson(saveJson);
    getOptionsStoreApi().writeUpdateRate(window.localStorage, options.updateRate);
    return saveJson;
}

function currentSaveData() {
    return getSaveServiceApi().createEncodedSaveData(
        getSaveServiceApi().readSaveJson(window.localStorage, saveName),
        LZString,
    );
}

function exportSave() {
    const saveJson = save();
    // idle loops save version 01. patch v0.94, moved from old save system to lzstring base 64
    inputElement("exportImport").value = getSaveServiceApi().createEncodedSaveData(saveJson, LZString);
    inputElement("exportImport").select();
    if (!document.execCommand("copy")) {
        alert(_txt("menu>save>copy_failed"));
    }
}

function importSave() {
    const saveData = inputElement("exportImport").value;
    processSave(saveData);
}

function processSave(saveData) {
    if (saveData === "") {
        if (confirm(_txt("menu>save>confirm_delete"))) {
            applyChallengeSaveState({
                challengeMode: 0,
                inChallenge: false,
            });
            clearSave();
        } else {
            return;
        }
    }
    let saveJson = "";
    // idle loops save version 01. patch v0.94, moved from old save system to lzstring base 64
    saveJson = getSaveServiceApi().decodeSaveData(saveData, {
        compressor: LZString,
        decodeLegacy: decode,
    });
    if (saveJson) {
        storeSaveJson(saveJson);
    }
    actions.clearActions();
    actions.current = [];
    load(null, saveJson);
    pauseGame();
    restart();
}

let overquotaWarned = false;
function storeSaveJson(saveJson) {
    getSaveServiceApi().storeSaveJson(window.localStorage, saveName, saveJson, {
        onQuotaExceeded() {
            if (!overquotaWarned) {
                alert(_txt("menu>save>quota_exceeded").replace(/<br>/gu, "\n"));
                overquotaWarned = true;
            }
        }
    });
}

function saveFileName() {
    const gameName = document.title.replace('*PAUSED* ','');
    const version = document.querySelector('#changelog > li[data-verNum]').firstChild.textContent.trim();
    return getSaveServiceApi().buildSaveFileName(gameName, version, totals.loops);
}

function exportSaveFile() {
    const saveJson = save();
    const saveData = getSaveServiceApi().createEncodedSaveData(saveJson, LZString);
    const a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-8,' + saveData);
    a.setAttribute('download', saveFileName());
    a.setAttribute('id', 'downloadSave');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function openSaveFile() {
    document.getElementById('SaveFileInput').click();
}

function importSaveFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        const saveData = e.target.result;
        processSave(saveData);
    }
    reader.readAsText(file)
}

function exportCurrentList() {
    let toReturn = "";
    for (const action of actions.next) {
        toReturn += `${action.loops}x ${action.name}`;
        toReturn += "\n";
    }
    textAreaElement("exportImportList").value = toReturn.slice(0, -1);
    textAreaElement("exportImportList").select();
    document.execCommand("copy");
}

function importCurrentList() {
    const toImport = textAreaElement("exportImportList").value.split("\n");
    actions.clearActions();
    for (let i = 0; i < toImport.length; i++) {
        if (!toImport[i]) {
            continue;
        }
        const name = /** @type {ActionName} */(toImport[i].substr(toImport[i].indexOf("x") + 1).trim());
        const loops = toImport[i].substr(0, toImport[i].indexOf("x"));
        try {
            const action = getActionPrototype(name);
            if (action.unlocked()) {
                actions.addActionRecord({ name, loops: Number(loops), disabled: false }, -1, false);
            }
        } catch (e) {
            if (e instanceof ClassNameNotFoundError) {
                console.log(e.message);
            } else {
                throw e;
            }
        }
    }
    view.updateNextActions();
}

function beginChallenge(challengeNum) {
    console.log("Beginning Challenge");
    if (getSaveServiceApi().hasSaveSlot(window.localStorage, challengeSaveName)) {
        if (confirm(_txt("menu>challenges>confirm_begin")))
            getSaveServiceApi().clearSaveSlot(window.localStorage, challengeSaveName);
        else
            return false;
    }
    if (challengeSave.challengeMode === 0) {
        applyChallengeSaveState(globalThis.IdleLoopsChallengeState.createChallengeSaveSnapshot(challengeSave, {
            inChallenge: true,
        }));
        save();
        console.log ("Saving to: " + saveName);
    }
    applyChallengeSaveState(globalThis.IdleLoopsChallengeState.createChallengeSaveSnapshot(challengeSave, {
        challengeMode: challengeNum,
    }));
    saveName = challengeSaveName;
    load(true);
    totalOfflineMs = 1000000;
    save();
    pauseGame();
    restart();
}

function exitChallenge() {
    if (challengeSave.challengeMode !== 0) {
        saveName = defaultSaveName;
        load(false);
        save();
        location.reload();
    }
}

function resumeChallenge() {
    if (challengeSave.challengeMode === 0 && getSaveServiceApi().hasSaveSlot(window.localStorage, challengeSaveName)) {
        applyChallengeSaveState(globalThis.IdleLoopsChallengeState.createChallengeSaveSnapshot(challengeSave, {
            inChallenge: true,
        }));
        save();
        saveName = challengeSaveName;
        load(true);
        save();
        pauseGame();
        restart();
    }
}
