// @ts-check
"use strict";

class ClassNameNotFoundError extends TypeError { }

/**
 * @template {string} S
 * @typedef {S extends `${infer S1} ${infer S2}` ? `${S1}${WithoutSpaces<S2>}` : S} WithoutSpaces
 */

/**
 * @template {string} S
 * @param {S} name @returns {WithoutSpaces<S>}
 */
function withoutSpaces(name) {
    // @ts-ignore
    return name.replace(/ /gu, "");
}

/** @template {Action<any, any>} A @typedef {A extends Action<any, infer E> ? E : never} ExtrasOf */
/** @template {Action<any, any>} A @typedef {A extends Action<infer N, any> ? N : never} NameOf */
/** @template {Action<any, any>} A @typedef {A["varName"]} VarNameOf */
/** @template {Action<any, any>} A @typedef {A extends Action<any, infer E> ? number extends E["townNum"] ? never : E["townNum"] : never} TownNumOf */
/** @template {Action<any, any>} A @typedef {A extends Action<any, infer E> ? number extends E["type"] ? never : E["type"] : never} ActionTypeOf */
// reverse lookup
/** @template {AnyAction} A @typedef {A extends ActionConstructor[infer I extends ActionId] ? I : never} ActionIdOf */

// selection
/**
 * @template {number} TN townNum
 * @template {ActionType} T type
 * @typedef {ActionOfTownAndType<TN, T>["varName"]} ActionVarOfTownAndType
 */
/**
 * @template {number} TN townNum
 * @template {ActionType} T type
 * @typedef {Extract<AnyAction, {townNum: TN, type: T}>} ActionOfTownAndType
 */
/** @template {number} TN @typedef {ActionOfTownAndType<TN,any>} ActionOfTown */
/** @template {ActionType} T @typedef {ActionOfTownAndType<any,T>} ActionOfType */

/**
 * @typedef {Action<any>|MultipartAction<any>} AnyActionType
 * @typedef {typeof Action} ActionConstructor
 * @typedef {{
 *  [K in Exclude<keyof ActionConstructor, "prototype">]: ActionConstructor[K] extends Action<any, any> ? K : never
 * }[Exclude<keyof ActionConstructor, "prototype">]} ActionId
 *
 * @typedef {ActionConstructor[ActionId]} AnyAction
 *
 * @typedef {{
 *  [K in ActionId]: string extends VarNameOf<ActionConstructor[K]> ? never : VarNameOf<ActionConstructor[K]>
 * }[ActionId]} ActionVarName
 *
 * @typedef {{
 *  [K in ActionId]: string extends ActionTypeOf<ActionConstructor[K]> ? never : ActionTypeOf<ActionConstructor[K]> extends 'limited'|'normal' ? VarNameOf<ActionConstructor[K]> : never
 * }[ActionId]} StandardActionVarName
 *
 * @typedef {{
 *  [K in ActionId]: string extends ActionTypeOf<ActionConstructor[K]> ? never : ActionTypeOf<ActionConstructor[K]> extends 'progress' ? VarNameOf<ActionConstructor[K]> : never
 * }[ActionId]} ProgressActionVarName
 *
 * @typedef {{
 *  [K in ActionId]: ActionConstructor[K] extends MultipartAction<any> ? VarNameOf<ActionConstructor[K]> : never
 * }[ActionId]} MultipartActionVarName
 *
 * @typedef {{
 *  [K in ActionId]: string extends NameOf<ActionConstructor[K]> ? never : NameOf<ActionConstructor[K]>
 * }[ActionId]} ActionName
 */

/**
 * @template {ActionId|ActionName} N
 * @typedef {ActionId extends N ? AnyAction : N extends ActionId ? ActionConstructor[N] : WithoutSpaces<N> extends ActionId ? ActionConstructor[WithoutSpaces<N>] : never} LookupAction
 */
/**
 * @template {ActionId|ActionName} N
 * @typedef {ActionId extends N ? AnyAction : N extends ActionId ? ActionConstructor[N] : WithoutSpaces<N> extends ActionId ? ActionConstructor[WithoutSpaces<N>] : false} TryLookupAction
 */

/**
 * @template {ActionId|ActionName} N
 * @param {N} name @returns {TryLookupAction<N>}
 */
function getActionPrototype(name) {
    if (!name) return undefined;
    const nameWithoutSpaces = withoutSpaces(name);
    if (nameWithoutSpaces in Action && Action[nameWithoutSpaces] instanceof Action) {
        // @ts-ignore
        return Action[nameWithoutSpaces];
    }
    console.warn(`error trying to create ${name}`);
    return undefined;
}
/** @template T @typedef {{-readonly [K in keyof T]: T[K]}} Mutable */
/** @template {ActionId|ActionName} N @param {N} name @returns {Mutable<LookupAction<N>>} */
function translateClassNames(name) {
    // construct a new action object with appropriate prototype
    const nameWithoutSpaces = withoutSpaces(name);
    if (nameWithoutSpaces in Action) {
        return Object.create(Action[nameWithoutSpaces]);
    }
    throw new ClassNameNotFoundError(`error trying to create ${name}`);
}

/** @typedef {typeof limitedActions[number]} LimitedActionName */
/** @satisfies {ActionName[]} */
const limitedActions = [
    "Smash Pots",
    "Pick Locks",
    "Short Quest",
    "Long Quest",
    "Gather Herbs",
    "Wild Mana",
    "Hunt",
    "Gamble",
    "Gather Team",
    "Mana Geyser",
    "Mine Soulstones",
    "Take Artifacts",
    "Accept Donations",
    "Mana Well",
    "Destroy Pylons"
];
/** @typedef {typeof trainingActions[number]} TrainingActionName */
/** @satisfies {ActionName[]} */
const trainingActions = [
    "Train Speed",
    "Train Strength",
    "Train Dexterity",
    "Sit By Waterfall",
    "Read Books",
    "Bird Watching",
    "Oracle",
    "Charm School"
];
/** @param {ActionName} name @returns {name is LimitedActionName}  */
function hasLimit(name) {
    // @ts-ignore
    return limitedActions.includes(name);
}
/** @param {ActionName} name  */
function isTravel(name) {
    return getTravelNum(name) !== 0;
}
/** @param {ActionName} name  */
function getPossibleTravel(name) {
    if (name === "Face Judgement") return [1,2];
    const travelNum = getTravelNum(name);
    return travelNum ? [travelNum] : [];
}
/** @param {ActionName} name  */
function getTravelNum(name) {
    if (name === "Face Judgement" && resources.reputation <= 50) return 2;
    if (name === "Face Judgement" && resources.reputation >= 50) return 1;
    if (name === "Start Journey" || name === "Continue On" || name === "Start Trek" || name === "Fall From Grace" || name === "Journey Forth" || name === "Escape" || name === "Leave City" || name === "Guru") return 1;
    if (name === "Hitch Ride") return 2;
    if (name === "Underworld" || name === "Open Rift") return 5;
    if (name === "Open Portal") return -5;
    return 0;
}
/** @param {ActionName} name @returns {name is TrainingActionName} */
function isTraining(name) {
    // @ts-ignore
    return trainingActions.includes(name);
}

/** @template {ActionType} T @param {AnyAction} action @param {T} type @returns {action is ActionOfType<T>} */
function isActionOfType(action, type) {
    return action.type === type;
}

function getXMLName(name) {
    return name.toLowerCase().replace(/ /gu, "_");
}

function getTownName(index) {
    if (typeof index !== "number") return "";
    return _txt(`towns>town${index}>name`);
}

function getTownNames() {
    return Array.from({length: 9}, (_unused, index) => getTownName(index));
}

/** @typedef {"advance"|"growth"|"resource"|"shortcut"|"side"} ActionCategory */
/** @satisfies {ActionCategory[]} */
const actionCategories = ["advance", "growth", "resource", "shortcut", "side"];

const actionCategoryStrings = {
    "en-EN": {
        legendTitle: "View by role",
        legendHint: "Dim actions by role without hiding them.",
        legendHintActive: "Filtering by {label}. Click again to clear.",
        legendToggleShow: "Show role legend",
        legendToggleHide: "Hide role legend",
        primaryRole: "Primary role",
        categories: {
            advance: {
                label: "Advance",
                short: "Adv",
                description: "Mainly expands what you can do next.",
            },
            growth: {
                label: "Growth",
                short: "Grow",
                description: "Mainly improves the baseline for future loops.",
            },
            resource: {
                label: "Resource",
                short: "Res",
                description: "Mainly prepares the costs and materials other actions need.",
            },
            shortcut: {
                label: "Shortcut",
                short: "Short",
                description: "Mainly shortens routes or bypasses standard prerequisites.",
            },
            side: {
                label: "Side",
                short: "Side",
                description: "Mainly supports worldbuilding, special builds, or optional goals.",
            },
        },
        notes: {
            faceJudgement: "This branching action is affected by your current reputation.",
        },
    },
    "zh-CN": {
        legendTitle: "按功能查看",
        legendHint: "按功能弱过滤行动，不会隐藏按钮。",
        legendHintActive: "当前按“{label}”弱过滤，再点一次可清除。",
        legendToggleShow: "显示功能图例",
        legendToggleHide: "隐藏功能图例",
        primaryRole: "主要作用",
        categories: {
            advance: {
                label: "推进",
                short: "推进",
                description: "主要用于扩展后续可做的事情。",
            },
            growth: {
                label: "成长",
                short: "成长",
                description: "主要用于提高之后循环的基础能力。",
            },
            resource: {
                label: "资源",
                short: "资源",
                description: "主要用于准备其他行动需要的消耗与材料。",
            },
            shortcut: {
                label: "捷径",
                short: "捷径",
                description: "主要用于压缩路径或绕开常规前置。",
            },
            side: {
                label: "支线",
                short: "支线",
                description: "主要用于补完世界、特殊构筑或非必要目标。",
            },
        },
        notes: {
            faceJudgement: "这是分支推进行动，结果会受当前声望影响。",
        },
    },
};

function getActionCategoryLocale() {
    const lang = Localization.currentLang;
    return actionCategoryStrings[lang] ?? actionCategoryStrings["en-EN"];
}

/** @param {string} template @param {Record<string, string>} values */
function formatActionCategoryText(template, values) {
    return template.replace(/\{(\w+)\}/gu, (_match, key) => values[key] ?? "");
}

/** @param {ActionCategory} category */
function getActionCategoryInfo(category) {
    return getActionCategoryLocale().categories[category];
}

/** @param {ActionCategory} category */
function getActionCategoryLabel(category) {
    return getActionCategoryInfo(category).label;
}

/** @param {ActionCategory} category */
function getActionCategoryShortLabel(category) {
    return getActionCategoryInfo(category).short;
}

/** @param {ActionCategory} category */
function getActionCategoryDescription(category) {
    return getActionCategoryInfo(category).description;
}

function getActionCategoryLegendTitle() {
    return getActionCategoryLocale().legendTitle;
}

function getActionCategoryLegendHint(activeCategory) {
    if (activeCategory) {
        return formatActionCategoryText(getActionCategoryLocale().legendHintActive, {
            label: getActionCategoryLabel(activeCategory),
        });
    }
    return getActionCategoryLocale().legendHint;
}

function getActionCategoryLegendToggleText(collapsed) {
    return getActionCategoryLocale()[collapsed ? "legendToggleShow" : "legendToggleHide"];
}

function getActionCategoryPrimaryRoleText() {
    return getActionCategoryLocale().primaryRole;
}

/** @param {Action<any>|ActionName|string} action */
function getActionCategoryNote(action) {
    const name = typeof action === "string" ? action : action.name;
    if (name === "Face Judgement") {
        return getActionCategoryLocale().notes.faceJudgement;
    }
    return "";
}

/** @type {Partial<Record<string, ActionCategory>>} */
const actionCategoryByName = Object.create(null);

/** @param {ActionCategory} category @param {string[]} names */
function assignActionCategory(category, names) {
    for (const name of names) {
        actionCategoryByName[name] = category;
    }
}

assignActionCategory("advance", [
    "Wander",
    "Meet People",
    "Investigate",
    "Start Journey",
    "Explore Forest",
    "Talk To Hermit",
    "Follow Flowers",
    "Clear Thicket",
    "Talk To Witch",
    "Continue On",
    "Explore City",
    "Get Drunk",
    "Start Trek",
    "Climb Mountain",
    "Decipher Runes",
    "Explore Cavern",
    "Check Walls",
    "Face Judgement",
    "Guided Tour",
    "Canvass",
    "Seek Citizenship",
    "Meander",
    "Journey Forth",
    "Explore Jungle",
    "Fight Jungle Monsters",
    "Escape",
    "Excursion",
    "Purchase Key",
    "Leave City",
    "Build Tower",
    "Gods Trial",
    "Challenge Gods",
    "Restore Time",
]);

assignActionCategory("growth", [
    "Buy Glasses",
    "Train Strength",
    "Warrior Lessons",
    "Mage Lessons",
    "Heal The Sick",
    "Fight Monsters",
    "Small Dungeon",
    "Sit By Waterfall",
    "Practical Magic",
    "Learn Alchemy",
    "Train Dexterity",
    "Train Speed",
    "Bird Watching",
    "Dark Magic",
    "Dark Ritual",
    "Adventure Guild",
    "Large Dungeon",
    "Crafting Guild",
    "Apprentice",
    "Mason",
    "Architect",
    "Read Books",
    "Buy Pickaxe",
    "Heroes Trial",
    "Chronomancy",
    "Looping Potion",
    "Pyromancy",
    "Imbue Mind",
    "Imbue Body",
    "Mercantilism",
    "Charm School",
    "Oracle",
    "Wizard College",
    "Restoration",
    "Spatiomancy",
    "Seek Blessing",
    "Fight Frost Giants",
    "Great Feast",
    "Dark Sacrifice",
    "The Spire",
    "Rescue Survivors",
    "Prepare Buffet",
    "Totem",
    "Explorers Guild",
    "Thieves Guild",
    "Guild Assassin",
    "Seminar",
    "Imbue Soul",
]);

assignActionCategory("resource", [
    "Map",
    "Smash Pots",
    "Pick Locks",
    "Buy Mana Z1",
    "Short Quest",
    "Long Quest",
    "Buy Supplies",
    "Haggle",
    "Wild Mana",
    "Gather Herbs",
    "Hunt",
    "Brew Potions",
    "Gamble",
    "Buy Mana Z3",
    "Sell Potions",
    "Gather Team",
    "Craft Armor",
    "Mana Geyser",
    "Mine Soulstones",
    "Hunt Trolls",
    "Take Artifacts",
    "Donate",
    "Accept Donations",
    "Tidy Up",
    "Buy Mana Z5",
    "Sell Artifact",
    "Gift Artifact",
    "Enchant Armor",
    "Build Housing",
    "Collect Taxes",
    "Mana Well",
    "Destroy Pylons",
    "Raise Zombie",
    "Purchase Supplies",
    "Dead Trial",
    "Pick Pockets",
    "Rob Warehouse",
    "Insurance Fraud",
    "Invest",
    "Collect Interest",
    "RuinsZ1",
    "RuinsZ3",
    "RuinsZ5",
    "RuinsZ6",
    "HaulZ1",
    "HaulZ3",
    "HaulZ5",
    "HaulZ6",
    "AssassinZ0",
    "AssassinZ1",
    "AssassinZ2",
    "AssassinZ3",
    "AssassinZ4",
    "AssassinZ5",
    "AssassinZ6",
    "AssassinZ7",
]);

assignActionCategory("shortcut", [
    "Hitch Ride",
    "Open Rift",
    "Old Shortcut",
    "Underworld",
    "Guru",
    "Pegasus",
    "Fall From Grace",
    "Open Portal",
]);

assignActionCategory("side", [
    "SurveyZ0",
    "SurveyZ1",
    "SurveyZ2",
    "SurveyZ3",
    "SurveyZ4",
    "SurveyZ5",
    "SurveyZ6",
    "SurveyZ7",
    "SurveyZ8",
    "Found Glasses",
    "Throw Party",
    "Secret Trial",
]);

const warnedAboutMissingActionCategories = new Set();

/** @param {Action<any>|ActionName|string} action */
function getActionCategory(action) {
    const name = typeof action === "string" ? action : action.name;
    const category = actionCategoryByName[name];
    if (category) return category;
    if (!warnedAboutMissingActionCategories.has(name)) {
        warnedAboutMissingActionCategories.add(name);
        console.warn(`Missing action category for ${name}; defaulting to side.`);
    }
    return "side";
}


// there are 4 types of actions
// 1: normal actions. normal actions have no additional UI (haggle, train strength)
// 2: progress actions. progress actions have a progress bar and use 100, 200, 300, etc. leveling system (wander, meet people)
// 3: limited actions. limited actions have town info for their limit, and a set of town vars for their "data"
// 4: multipart actions. multipart actions have multiple distinct parts to get through before repeating. they also get a bonus depending on how often you complete them

// type names are "normal", "progress", "limited", and "multipart".
// define one of these in the action, and they will create any additional UI elements that are needed
/** @typedef {"normal"|"progress"|"limited"|"multipart"} ActionType */
/** @typedef {"default"|"linear"} ProgressScalingType */
/** @satisfies {ActionType[]} */
const actionTypes = ["normal", "progress", "limited", "multipart"];
/**
 * @typedef {{
 *     type: ActionType,
 *     varName?: string,
 *     expMult: number,
 *     townNum: number,
 *     story?: (completed: number) => void,
 *     storyReqs?: (storyNum: number) => boolean,
 *     stats: Partial<Record<StatName, number>>,
 *     canStart?: (loopCounter?: number) => boolean,
 *     cost?: () => void,
 *     manaCost(): number,
 *     goldCost?: () => number,
 *     allowed?: () => number,
 *     visible(): boolean,
 *     unlocked(): boolean,
 *     finish(): void,
 *     skills?: Partial<Record<SkillName, number | (() => number)>>,
 *     grantsBuff?: BuffName,
 *     affectedBy?: readonly string[],
 *     progressScaling?: ProgressScalingType,
 * }} ActionExtras
 */

// exp mults are default 100%, 150% for skill training actions, 200% for actions that cost a resource, 300% for actions that cost 2 resources, and 500% for actions that cost soulstones
// todo: ^^ currently some actions are too high, but I am saving these balance changes for the z5/z6 update

// actions are all sorted below by town in order

/**
 * @template {string} N The name passed to the constructor
 * @template {ActionExtras} [E=ActionExtras] The extras parameter passed to the constructor
 */
class Action extends Localizable {
    /** @type {N} */
    name;
    /** @type {E extends {varName: infer VN extends string} ? VN : WithoutSpaces<N>} */
    varName;

    /**
     * @overload @param {N} name @param {E & ThisType<Action<N>>} extras
     * @constructor
     * @param {N} name @param {E} extras
     */
    constructor(name, extras) {
        super(`actions>${Action.xmlNameFor(name)}`);
        this.name = name;
        // many actions have to override this (in extras) for save compatibility, because the
        // varName is often used in parts of the game state
        this.varName = /** @type {any} */(withoutSpaces(name));
        Object.assign(this, extras);
    }

    static xmlNameFor(name) {
        return name.startsWith("Assassin") ? "assassin"
            : name.startsWith("Survey") ? "survey"
            : getXMLName(name);
    }

    get imageName() {
        return camelize(this.name);
    }

    /* eslint-disable no-invalid-this */
    // not all actions have tooltip2 or labelDone, but among actions that do, the XML format is
    // always the same; these are loaded lazily once (and then they become own properties of the
    // specific Action object)
    get tooltip() { return this.memoize("tooltip"); }
    get tooltip2() { return this.memoize("tooltip2"); }
    get label() { return this.memoize("label"); }
    get labelDone() { return this.memoize("labelDone", ">label_done"); }
    get labelGlobal() { return this.memoize("labelGlobal", ">label_global"); }
    get category() { return getActionCategory(this); }

    static {
        // listing these means they won't get stored even if memoized
        Data.omitProperties(this.prototype, ["tooltip", "tooltip2", "label", "labelDone", "labelGlobal"]);
    }

    // all actions to date with info text have the same info text, so presently this is
    // centralized here (function will not be called by the game code if info text is not
    // applicable)
    infoText() {
        return `${_txt("actions>tooltip>limited_numbers_intro")}
                <br><span class='bold'>①</span> ${_txt(`actions>${getXMLName(this.name)}>info_text1`)}
                <br><span class='bold'>②</span> ${_txt(`actions>${getXMLName(this.name)}>info_text2`)}
                <br><span class='bold'>③</span> ${_txt(`actions>${getXMLName(this.name)}>info_text3`)}
                <br><br>${_txt("actions>tooltip>limited_numbers_details")}
                <br><span class='bold'>${`${_txt("actions>tooltip>total_found")}: `}</span><div id='total${this.varName}'></div>
                <br><span class='bold'>${`${_txt("actions>tooltip>total_checked")}: `}</span><div id='checked${this.varName}'></div>`;
    };

    /** @param {SkillName} skill */
    teachesSkill(skill) {
        // if we don't give exp in the skill we don't teach it
        if (this.skills?.[skill] === undefined) return false;
        // if we have an unlock function and it references the skill, we don't teach it
        if (this.unlocked?.toString().search(`getSkillLevel\\("${skill}"\\)`) >= 0) return false;
        // if this is combat or magic and this isn't town 0, we don't teach it
        if ((skill === "Combat" || skill === "Magic") && this.townNum > 0) return false;
        // otherwise we do (as long as we actually give exp in it and it isn't zeroed out)
        const reward = this.skills[skill];
        const exp = typeof reward === "function" ? reward() : reward;
        return exp > 0;
    }

    getStoryTexts(rawStoriesDataForAction = this.txtsObj[0].children) {
        /** @type {{num: number, condition: string, conditionHTML: string, text: string}[]} */
        const storyTexts = [];

        for (const rawStoryData of rawStoriesDataForAction) {
            if (rawStoryData.nodeName.startsWith("story_")) {
                const num = parseInt(rawStoryData.nodeName.replace("story_", ""));
                const [conditionHTML, text] = rawStoryData.textContent.split("⮀");
                const condition = conditionHTML.replace(/^<b>|:<\/b>$/g,"")
                storyTexts.push({num, condition, conditionHTML, text});
            } else if (rawStoryData.nodeName === "story") {
                const num = parseInt(rawStoryData.getAttribute("num"));
                const condition = rawStoryData.getAttribute("condition");
                const conditionHTML = `<b>${condition}:</b> `;
                const text = rawStoryData.children.length > 0 ? rawStoryData.innerHTML : rawStoryData.textContent;
                storyTexts.push({num, condition, conditionHTML, text});
            }
        }
        return storyTexts;
    }
}

/**
 * @typedef {{
 *     loopStats: readonly StatName[],
 *     loopCost(segment: number, loopCounter?: number): number,
 *     tickProgress(offset: number, loopCounter?: number, totalCompletions?: number): number,
 *     segmentFinished?: (loopCounter?: number) => void,
 *     loopsFinished(loopCounter?: number): void,
 *     getSegmentName?: (segment: number) => string,
 *     getPartName(loopCounter?: number): string,
 *     completedTooltip?: () => string,
 * } & ActionExtras} MultipartActionExtras
 *
 */

// same as Action, but contains shared code to load segment names for multipart actions.
// (constructor takes number of segments as a second argument)
/**
 * @template {string} N The name passed to the constructor
 * @template {MultipartActionExtras} [E=MultipartActionExtras] The extras parameter passed to the constructor
 * @extends {Action<N,E>}
 */
class MultipartAction extends Action {
    /** @type {number} */
    segments;

    /**
     * @param {N} name @param {E & ThisType<MultipartAction<N>>} extras
     */
    constructor(name, extras) {
        super(name, extras);
        this.segments = (extras.varName === "Fight") ? 3 : extras.loopStats.length;
    }

    // lazily calculate segment names when explicitly requested (to give chance for localization
    // code to be loaded first)

    /** @returns {string[]} */
    get segmentNames() {
        return this.memoizeValue("segmentNames",  Array.from(
            this.txtsObj.find(">segment_names>name")
        ).map(elt => elt.textContent));
    }

    /** @returns {string[]} */
    get altSegmentNames() {
        return this.memoizeValue("altSegmentNames",  Array.from(
            this.txtsObj.find(">segment_alt_names>name")
        ).map(elt => elt.textContent));
    }

    /** @returns {string[]} */
    get segmentModifiers() {
        return this.memoizeValue("segmentModifiers",  Array.from(
            this.txtsObj.find(">segment_modifiers>segment_modifier")
        ).map(elt => elt.textContent));
    }

    static {
        // listing these means they won't get stored even if memoized
        Data.omitProperties(this.prototype, ["segmentNames", "altSegmentNames", "segmentModifiers"]);
    }

    /** @param {number} segment  */
    getSegmentName(segment) {
        return this.segmentNames[segment % this.segmentNames.length];
    }

    /** @param {number} offset /** @param {number} [loopCounter] @param {number} [totalCompletions] */
    canMakeProgress(offset, loopCounter, totalCompletions) {
        // some actions with a tickProgress (like Small Dungeon) will throw an exception if tickProgress
        // is called after they're already complete. Turn that into a boolean.
        try {
            return this.tickProgress(offset, loopCounter, totalCompletions) > 0;
        } catch {
            return false;
        }
    }
}

/**
 * @typedef {{
 *      completedTooltip(): string;
 *      getPartName(loopCounter?: number): string;
 * }} DungeonActionImpl
 * @typedef {{
 * } & Omit<MultipartActionExtras, keyof DungeonActionImpl>} DungeonActionExtras
 */
// same as MultipartAction, but includes shared code to generate dungeon completion tooltip
// as well as specifying 7 segments (constructor takes dungeon ID number as a second
// argument)
/**
 * @template {string} N The name passed to the constructor
 * @template {DungeonActionExtras} [E=DungeonActionExtras] The extras parameter passed to the constructor
 * @extends {MultipartAction<N,E&DungeonActionImpl>}
 */
class DungeonAction extends MultipartAction {
    /** @type {number} */
    dungeonNum;

    /**
     * @param {N} name @param {number} dungeonNum, @param {E & ThisType<DungeonAction<N>>} extras
     */
    constructor(name, dungeonNum, extras) {
        // @ts-ignore
        super(name, extras);
        this.dungeonNum = dungeonNum;
    }

    // @ts-ignore
    completedTooltip() {
        let ssDivContainer = "";
        if (this.dungeonNum < 3) {
            for (let i = 0; i < dungeons[this.dungeonNum].length; i++) {
                ssDivContainer += `Floor ${i + 1} |
                                    <div class='bold'>${_txt(`actions>${getXMLName(this.name)}>chance_label`)} </div> <div id='soulstoneChance${this.dungeonNum}_${i}'></div>% -
                                    <div class='bold'>${_txt(`actions>${getXMLName(this.name)}>last_stat_label`)} </div> <div id='soulstonePrevious${this.dungeonNum}_${i}'>NA</div> -
                                    <div class='bold'>${_txt(`actions>${getXMLName(this.name)}>label_done`)}</div> <div id='soulstoneCompleted${this.dungeonNum}_${i}'></div><br>`;
            }
        }
        return _txt(`actions>${getXMLName(this.name)}>completed_tooltip`) + ssDivContainer;
    };
    getPartName(loopCounter = towns[this.townNum][`${this.varName}LoopCounter`] + 0.0001) {
        const floor = Math.floor((loopCounter) / this.segments + 1);
        return `${_txt(`actions>${getXMLName(this.name)}>label_part`)} ${floor <= dungeons[this.dungeonNum].length ? numberToWords(floor) : _txt(`actions>${getXMLName(this.name)}>label_complete`)}`;
    };
}

/**
 * @typedef {{
 *      completedTooltip(): string;
 *      getPartName(loopCounter?: number): string;
 *      currentFloor(loopCounter?: number): number;
 *      loopCost(segment: number, loopCounter?: number): number;
 *      tickProgress(offset: number, loopCounter?: number, totalCompletions?: number): number;
 *      loopsFinished(loopCounter?: number): void;
 * }} TrialActionImpl
 * @typedef {{
 *    floorReward(): void,
 *    baseProgress(): number,
 *    baseScaling: number,
 *    exponentScaling?: number,
 * } & Omit<MultipartActionExtras, keyof TrialActionImpl>} TrialActionExtras
 */
/**
 * @template {string} N The name passed to the constructor
 * @template {TrialActionExtras} [E=TrialActionExtras] The extras parameter passed to the constructor
 * @extends {MultipartAction<N,E&TrialActionImpl>}
 * @implements {TrialActionImpl}
 */
class TrialAction extends MultipartAction {
    /** @type {number} */
    trialNum;
    /**
     * @param {N} name @param {number} trialNum, @param {E & ThisType<E & TrialAction<N>>} extras
     */
    constructor(name, trialNum, extras) {
        // @ts-ignore
        super(name, extras);
        this.trialNum = trialNum;
    }
    // @ts-ignore
    completedTooltip() {
        return this.name + ` Highest Floor: <div id='trial${this.trialNum}HighestFloor'>0</div><br>
        Current Floor: <div id='trial${this.trialNum}CurFloor'>0</div> - Completed <div id='trial${this.trialNum}CurFloorCompleted'>x</div> times<br>
        Last Floor: <div id='trial${this.trialNum}LastFloor'>N/A</div> - Completed <div id='trial${this.trialNum}LastFloorCompleted'>N/A</div> times<br>`;
    }
    getPartName(loopCounter = towns[this.townNum][`${this.varName}LoopCounter`]) {
        const floor = Math.floor((loopCounter + 0.0001) / this.segments + 1);
        return `${_txt(`actions>${getXMLName(this.name)}>label_part`)} ${floor <= trials[this.trialNum].length ? numberToWords(floor) : _txt(`actions>${getXMLName(this.name)}>label_complete`)}`;
    };
    currentFloor(loopCounter = towns[this.townNum][`${this.varName}LoopCounter`]) {
        return Math.floor(loopCounter / this.segments + 0.0000001);
    }
    /** @param {number} segment  */
    loopCost(segment, loopCounter = towns[this.townNum][`${this.varName}LoopCounter`]) {
        return precision3(Math.pow(this.baseScaling, Math.floor((loopCounter + segment) / this.segments + 0.0000001)) * this.exponentScaling * getSkillBonus("Assassin"));
    }
    /** @param {number} offset  */
    tickProgress(offset, loopCounter) {
        return this.baseProgress() *
            Math.sqrt(1 + trials[this.trialNum][this.currentFloor(loopCounter)].completed / 200);
    }
    loopsFinished(loopCounter) {
        const finishedFloor = this.currentFloor(loopCounter) - 1;
        //console.log("Finished floor: " + finishedFloor + " Current Floor: " + this.currentFloor());
        trials[this.trialNum][finishedFloor].completed++;
        if (finishedFloor > trials[this.trialNum].highestFloor || trials[this.trialNum].highestFloor === undefined) trials[this.trialNum].highestFloor = finishedFloor;
        view.requestUpdate("updateTrialInfo", {trialNum: this.trialNum, curFloor: this.currentFloor(loopCounter)});
        this.floorReward();
    }
}

const legacyDefinitionFactories = globalThis.IdleLoopsLegacyDefinitionFactories;
if (!legacyDefinitionFactories || typeof legacyDefinitionFactories.registerSharedActionFactories !== "function") {
    throw new Error("[content] IdleLoopsLegacyDefinitionFactories.registerSharedActionFactories is not available");
}
const {
    AssassinAction,
    SurveyAction,
    RuinsAction,
    HaulAction,
    adjustRocks,
    adjustAllRocks,
} = legacyDefinitionFactories.registerSharedActionFactories({MultipartAction});

Action.SurveyZ0 = new Action("SurveyZ0", SurveyAction(0));
Action.SurveyZ1 = new Action("SurveyZ1", SurveyAction(1));
Action.SurveyZ2 = new Action("SurveyZ2", SurveyAction(2));
Action.SurveyZ3 = new Action("SurveyZ3", SurveyAction(3));
Action.SurveyZ4 = new Action("SurveyZ4", SurveyAction(4));
Action.SurveyZ5 = new Action("SurveyZ5", SurveyAction(5));
Action.SurveyZ6 = new Action("SurveyZ6", SurveyAction(6));
Action.SurveyZ7 = new Action("SurveyZ7", SurveyAction(7));
Action.SurveyZ8 = new Action("SurveyZ8", SurveyAction(8));

Action.RuinsZ1 = new Action("RuinsZ1", RuinsAction(1));
Action.RuinsZ3 = new Action("RuinsZ3", RuinsAction(3));
Action.RuinsZ5 = new Action("RuinsZ5", RuinsAction(5));
Action.RuinsZ6 = new Action("RuinsZ6", RuinsAction(6));

Action.HaulZ1 = new Action("HaulZ1", HaulAction(1));
Action.HaulZ3 = new Action("HaulZ3", HaulAction(3));
Action.HaulZ5 = new Action("HaulZ5", HaulAction(5));
Action.HaulZ6 = new Action("HaulZ6", HaulAction(6));

//====================================================================================================
//Assassination Actions
//====================================================================================================

Action.AssassinZ0 = new AssassinAction("AssassinZ0", {
    townNum: 0,
});
Action.AssassinZ1 = new AssassinAction("AssassinZ1", {
    townNum: 1,
});
Action.AssassinZ2 = new AssassinAction("AssassinZ2", {
    townNum: 2,
});
Action.AssassinZ3 = new AssassinAction("AssassinZ3", {
    townNum: 3,
});
Action.AssassinZ4 = new AssassinAction("AssassinZ4", {
    townNum: 4,
});
Action.AssassinZ5 = new AssassinAction("AssassinZ5", {
    townNum: 5,
});
Action.AssassinZ6 = new AssassinAction("AssassinZ6", {
    townNum: 6,
});
Action.AssassinZ7 = new AssassinAction("AssassinZ7", {
    townNum: 7,
});

/** @type {string[]} */
const lateGameActions = Object.values(Action).filter(a => a instanceof Action).map(a => a.name);

//====================================================================================================
//Zone 1 - Beginnersville
//====================================================================================================
const zoneDefinitionFactories = globalThis.IdleLoopsZoneDefinitionFactories;
const contentHelperRegistry = globalThis.IdleLoopsContentHelperRegistry;
if (!contentHelperRegistry || typeof contentHelperRegistry.getExplorationHelpers !== "function") {
    throw new Error("[content] IdleLoopsContentHelperRegistry.getExplorationHelpers is not available");
}
const {
    fullyExploredZones,
    getTotalExploreProgress,
    getExploreProgress,
    getExploreExp,
    getExploreExpSinceLastProgress,
    getExploreExpToNextProgress,
    getExploreSkill,
    exchangeMap,
} = contentHelperRegistry.getExplorationHelpers();
if (typeof contentHelperRegistry.getRuntimeAdjustmentHelpers !== "function") {
    throw new Error("[content] IdleLoopsContentHelperRegistry.getRuntimeAdjustmentHelpers is not available");
}
const {
    adjustDonations,
    adjustPylons,
    adjustWells,
    adjustPockets,
    adjustWarehouses,
    adjustInsurance,
    adjustTrainingExpMult,
} = contentHelperRegistry.getRuntimeAdjustmentHelpers();
if (!zoneDefinitionFactories || typeof zoneDefinitionFactories.registerBeginnersvilleActions !== "function") {
    throw new Error("[content] IdleLoopsZoneDefinitionFactories.registerBeginnersvilleActions is not available");
}
const {
    adjustPots,
    adjustLocks,
    adjustSQuests,
    adjustLQuests,
} = zoneDefinitionFactories.registerBeginnersvilleActions({
    Action,
    MultipartAction,
    DungeonAction,
    lateGameActions,
});

//====================================================================================================
//Zone 2 - Forest Path
//====================================================================================================
if (!zoneDefinitionFactories || typeof zoneDefinitionFactories.registerForestPathActions !== "function") {
    throw new Error("[content] IdleLoopsZoneDefinitionFactories.registerForestPathActions is not available");
}
const {
    adjustWildMana,
    adjustHunt,
    adjustHerbs,
} = zoneDefinitionFactories.registerForestPathActions({
    Action,
    MultipartAction,
});

function checkSoulstoneSac(amount) {
    let sum = 0;
    for (const stat in stats)
        sum += stats[stat].soulstone;
    return sum >= amount ? true : false;
}

/** @type {(amount: number, parameter?: number, stonesSpent?: Partial<Record<StatName, number>>, sortedStats?: Stat[]) => Partial<Record<StatName, number>>} */
let sacrificeSoulstones = sacrificeSoulstonesBySegments;

/** @param {Partial<Record<StatName, number>>} [stonesSpent] */
function sacrificeSoulstonesBySegments(amount, segments = 9, stonesSpent = {}, sortedStats = Object.values(stats).sort(Stat.compareSoulstoneDescending)) {
    // console.log(`Sacrificing ${amount} soulstones in ${segments} segments from stats: ${sortedStats.map(s=>`${s.name} ${s.soulstone}`).join(", ")}`, sortedStats);
    while (amount > 0) {
        // pull off the front of the list, since its sort order may change
        const highestSoulstoneStat = sortedStats.shift();
        const count = Math.min(Math.ceil(amount / segments), highestSoulstoneStat.soulstone); // don't spend more than ss we have in this stat (edge case for if you're spending all your ss)
        highestSoulstoneStat.soulstone -= count;
        stonesSpent[highestSoulstoneStat.name] ??= 0;
        stonesSpent[highestSoulstoneStat.name] += count;
        amount -= count;
        // console.log(`Sacrificed ${count} soulstones from ${highestSoulstoneStat.name}, now ${highestSoulstoneStat.soulstone}, ${amount} remaining to sacrifice`);
        // put it back in the list in the proper place
        if (highestSoulstoneStat.soulstone <= sortedStats.at(-1).soulstone) {
            // ...which is the end if the stats were roughly in sync
            sortedStats.push(highestSoulstoneStat);
        } else {
            // ... or somewhere in the list if they weren't
            sortedStats.splice(sortedStats.findIndex(s => highestSoulstoneStat.soulstone > s.soulstone), 0, highestSoulstoneStat);
        }
        if (segments > 0) segments--; // 1 less segment remains, unless we hit the edge case above in the second-to-last stat
    }
    return stonesSpent;
}

/** @param {Partial<Record<StatName, number>>} [stonesSpent] @param {Stat[]} [sortedStats] */
function sacrificeSoulstonesProportional(amount, power = 1, stonesSpent = {}, sortedStats = Object.values(stats)) { //initializer does not sort because we do every loop anyway
    // extremely unlikely that we have to use more than one iteration for typical cases, but some powers can cause degenerate behavior
    while (amount > 0) {
        // (re-)sort stats by soulstone count of stats, high to low
        sortedStats.sort(Stat.compareSoulstoneDescending);
        // edge case: only handle stats with soulstones, remove those with 0
        while (sortedStats.at(-1).soulstone === 0) sortedStats.pop();
        // make parallel array of ss raised to specified power (negative powers would cause problems without the above filter)
        const stonePowers = sortedStats.map(s => Math.pow(s.soulstone, power));
        let totalPower = stonePowers.reduce((a,b) => a + b);
        for (const [i, stat] of sortedStats.entries()) {
            // power ratio determines how much of amount we will consume.
            const ratio = i === sortedStats.length - 1 ? 1 // force a ratio of 1 for the last stat to avoid floating-point error
                        : stonePowers[i] / totalPower;
            // try to spend that much, limited by the amount of ss we have in this stat
            const count = Math.min(Math.round(amount * ratio), stat.soulstone);
            stat.soulstone -= count;
            stonesSpent[stat.name] ??= 0;
            stonesSpent[stat.name] += count;
            totalPower -= stonePowers[i];
            amount -= count;
            if (amount === 0) break;
        }
    }
    return stonesSpent;
}

/** @param {Partial<Record<StatName, number>>} [stonesSpent] @param {Stat[]} [sortedStats]  */
function sacrificeSoulstonesToEquality(amount, allowedDifference = 0, stonesSpent = {}, sortedStats = Object.values(stats).sort(Stat.compareSoulstoneDescending)) {
    let maxSoulstone = sortedStats[0].soulstone; // what's the highest number of soulstones among stats?
    let minSoulstone = sortedStats.at(-1).soulstone; // and the lowest?
    let statsAtMaximum = 1; // how many stats have the same number of soulstones as the highest?

    while (amount > 0 && minSoulstone < maxSoulstone - allowedDifference) {
        // extend statsAtMaximum appropriately. we know there will be at least one stat not at maximum bc of the above check
        while (sortedStats[statsAtMaximum].soulstone === maxSoulstone) {
            statsAtMaximum++;
        }
        // find the second-highest count of soulstones between the remaining stats and whatever would satisfy our allowedDifference
        const submaxSoulstone = Math.max(sortedStats[statsAtMaximum].soulstone, minSoulstone + allowedDifference);

        // we can spend up to the difference between the highest number of soulstones and the submax, times the number of stats at that level
        const stonesAvailable = (maxSoulstone - submaxSoulstone) * statsAtMaximum;

        if (stonesAvailable >= amount) {
            // sacrifice all remaining soulstones equally from the highest stats
            return sacrificeSoulstonesBySegments(amount, statsAtMaximum, stonesSpent, sortedStats);
        } else {
            // sacrifice soulstones from the highest stats to bring them down to the submax level
            sacrificeSoulstonesBySegments(stonesAvailable, statsAtMaximum, stonesSpent, sortedStats);
            amount -= stonesAvailable;
            maxSoulstone = sortedStats[0].soulstone;
        }
    }
    if (amount > 0) {
        // all stats already close enough to equality, just sacrifice equal numbers from each stat
        sacrificeSoulstonesProportional(amount, 0, stonesSpent, sortedStats);
    }
    return stonesSpent;
}

Action.ContinueOn = new Action("Continue On", {
    type: "normal",
    expMult: 2,
    townNum: 1,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return townsUnlocked.includes(2);
        }
        return false;
    },
    stats: {
        Con: 0.4,
        Per: 0.2,
        Spd: 0.4
    },
    allowed(checkActiveList) {
        return (checkActiveList ? getNumOnCurList : getNumOnList)("Open Portal") > 0 ? 2 : 1;
    },
    manaCost() {
        return Math.ceil(8000 - (60 * towns[1].getLevel("Shortcut")));
    },
    visible() {
        return true;
    },
    unlocked() {
        return true;
    },
    finish() {
        unlockTown(2);
    },
    story(completed) {
        unlockGlobalStory(4);
    }
});

//====================================================================================================
//Zone 3 - Merchanton
//====================================================================================================
if (!zoneDefinitionFactories || typeof zoneDefinitionFactories.registerMerchantonActions !== "function") {
    throw new Error("[content] IdleLoopsZoneDefinitionFactories.registerMerchantonActions is not available");
}
const {
    adjustSuckers,
    getAdvGuildRank,
    getCraftGuildRank,
} = zoneDefinitionFactories.registerMerchantonActions({
    Action,
    MultipartAction,
    DungeonAction,
    TrialAction,
});

//====================================================================================================
//Zone 4 - Mt Olympus
//====================================================================================================
if (!zoneDefinitionFactories || typeof zoneDefinitionFactories.registerOlympusActions !== "function") {
    throw new Error("[content] IdleLoopsZoneDefinitionFactories.registerOlympusActions is not available");
}
const {
    adjustGeysers,
    adjustMineSoulstones,
    adjustArtifacts,
} = zoneDefinitionFactories.registerOlympusActions({
    Action,
    MultipartAction,
});

//====================================================================================================
//Zone 5 - Valhalla
//====================================================================================================
if (!zoneDefinitionFactories || typeof zoneDefinitionFactories.registerValhallaActions !== "function") {
    throw new Error("[content] IdleLoopsZoneDefinitionFactories.registerValhallaActions is not available");
}
const {
    getWizCollegeRank,
    getFrostGiantsRank,
} = zoneDefinitionFactories.registerValhallaActions({
    Action,
    MultipartAction,
});

//====================================================================================================
//Zone 6 - Startington
//====================================================================================================
if (!zoneDefinitionFactories || typeof zoneDefinitionFactories.registerStartingtonActions !== "function") {
    throw new Error("[content] IdleLoopsZoneDefinitionFactories.registerStartingtonActions is not available");
}
const {
} = zoneDefinitionFactories.registerStartingtonActions({
    Action,
    MultipartAction,
    DungeonAction,
    TrialAction,
});

//====================================================================================================
//Zone 7 - Jungle Path
//====================================================================================================
if (!zoneDefinitionFactories || typeof zoneDefinitionFactories.registerJunglePathActions !== "function") {
    throw new Error("[content] IdleLoopsZoneDefinitionFactories.registerJunglePathActions is not available");
}
const {
    getFightJungleMonstersRank,
} = zoneDefinitionFactories.registerJunglePathActions({
    Action,
    MultipartAction,
});

//====================================================================================================
//Zone 8 - Commerceville
//====================================================================================================
if (!zoneDefinitionFactories || typeof zoneDefinitionFactories.registerCommercevilleActions !== "function") {
    throw new Error("[content] IdleLoopsZoneDefinitionFactories.registerCommercevilleActions is not available");
}
const {
    getThievesGuildRank,
    totalAssassinations,
} = zoneDefinitionFactories.registerCommercevilleActions({
    Action,
    MultipartAction,
    TrialAction,
});

//====================================================================================================
//Zone 9 - Valley of Olympus
//====================================================================================================
if (!zoneDefinitionFactories || typeof zoneDefinitionFactories.registerValleyOfOlympusActions !== "function") {
    throw new Error("[content] IdleLoopsZoneDefinitionFactories.registerValleyOfOlympusActions is not available");
}
const {
} = zoneDefinitionFactories.registerValleyOfOlympusActions({
    Action,
    MultipartAction,
    TrialAction,
});


const actionsWithGoldCost = Object.values(Action).filter(
    action => action.goldCost !== undefined
);
