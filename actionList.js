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
Action.GuidedTour = new Action("Guided Tour", {
    type: "progress",
    expMult: 1,
    townNum: 4,
    varName: "Tour",
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return towns[4].getLevel(this.varName) >= 1;
            case 2:
                return towns[4].getLevel(this.varName) >= 10;
            case 3:
                return towns[4].getLevel(this.varName) >= 20;
            case 4:
                return towns[4].getLevel(this.varName) >= 30;
            case 5:
                return towns[4].getLevel(this.varName) >= 40;
            case 6:
                return towns[4].getLevel(this.varName) >= 60;
            case 7:
                return towns[4].getLevel(this.varName) >= 80;
            case 8:
                return towns[4].getLevel(this.varName) >= 90;
            case 9:
                return towns[4].getLevel(this.varName) >= 100;
        }
        return false;
    },
    stats: {
        Per: 0.3,
        Con: 0.2,
        Cha: 0.3,
        Int: 0.1,
        Luck: 0.1
    },
	affectedBy: ["Buy Glasses"],
    canStart() {
        return resources.gold >= 10;
    },
    cost() {
        addResource("gold", -10);
    },
    manaCost() {
        return 2500;
    },
    visible() {
        return true;
    },
    unlocked() {
        return true;
    },
    finish() {
        towns[4].finishProgress(this.varName, 100 * (resources.glasses ? 2 : 1));
    },
});

Action.Canvass = new Action("Canvass", {
    type: "progress",
    expMult: 1,
    townNum: 4,
    varName: "Canvassed",
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return towns[4].getLevel(this.varName) >= 5;
            case 2:
                return towns[4].getLevel(this.varName) >= 15;
            case 3:
                return towns[4].getLevel(this.varName) >= 30;
            case 4:
                return towns[4].getLevel(this.varName) >= 50;
            case 5:
                return towns[4].getLevel(this.varName) >= 75;
            case 6:
                return towns[4].getLevel(this.varName) >= 100;
        }
        return false;
    },
    stats: {
        Con: 0.1,
        Cha: 0.5,
        Spd: 0.2,
        Luck: 0.2
    },
    manaCost() {
        return 4000;
    },
    visible() {
        return true;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 10;
    },
    finish() {
        towns[4].finishProgress(this.varName, 50);
    },
});

Action.Donate = new Action("Donate", {
    type: "normal",
    expMult: 1,
    townNum: 4,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return storyFlags.donatedToCharity;
        }
        return false;
    },
    stats: {
        Per: 0.2,
        Cha: 0.2,
        Spd: 0.2,
        Int: 0.4,
    },
    canStart() {
        return resources.gold >= 20;
    },
    manaCost() {
        return 2000;
    },
    visible() {
        return true;
    },
    unlocked() {
        return towns[4].getLevel("Canvassed") >= 5;
    },
    finish() {
        addResource("gold", -20);
        addResource("reputation", 1);
        setStoryFlag("donatedToCharity");
    },
});

Action.AcceptDonations = new Action("Accept Donations", {
    type: "limited",
    expMult: 1,
    townNum: 4,
    varName: "Donations",
    storyReqs(storyNum) {
        switch(storyNum){
            case 1: return storyFlags.receivedDonation;
            case 2: return towns[4][`good${this.varName}`] >= 1;
            case 3: return towns[4][`good${this.varName}`] >= 100;
            case 4: return towns[4][`good${this.varName}`] >= 250;
            case 5: return storyFlags.failedReceivedDonation;
        }
    },
    stats: {
        Con: 0.1,
        Cha: 0.2,
        Spd: 0.3,
        Luck: 0.4
    },
    canStart() {
        return resources.reputation > 0;
    },
    cost() {
        addResource("reputation", -1);
    },
    manaCost() {
        return 2000;
    },
    visible() {
        return true;
    },
    unlocked() {
        return towns[4].getLevel("Canvassed") >= 5;
    },
    finish() {
        setStoryFlag("receivedDonation");
        towns[4].finishRegular(this.varName, 5, () => {
            addResource("gold", 20);
            return 20;
        });
    },
});

function adjustDonations() {
    let town = towns[4];
    let base = Math.round(town.getLevel("Canvassed") * 5 * adjustContentFromPrestige());
    town.totalDonations = Math.floor(base * getSkillMod("Spatiomancy", 900, 1100, .5) + base * getSurveyBonus(town));
}

Action.TidyUp = new MultipartAction("Tidy Up", {
    type: "multipart",
    expMult: 1,
    townNum: 4,
    varName: "Tidy",
    storyReqs(storyNum) {
        switch(storyNum){
            case 1: return storyFlags.tidiedUp;
            case 5: return towns[4].totalTidy >= 100;
            case 6: return towns[4].totalTidy >= 1000;
            case 7: return towns[4].totalTidy >= 10000;
        }
    },
    stats: {
        Spd: 0.3,
        Dex: 0.3,
        Str: 0.2,
        Con: 0.2,
    },
    loopStats: ["Str", "Dex", "Spd", "Con"],
    manaCost() {
        return 10000;
    },
    loopCost(segment, loopCounter = towns[4].TidyLoopCounter) {
        return fibonacci(Math.floor((loopCounter + segment) - loopCounter / 3 + 0.0000001)) * 1000000; // Temp.
    },
    tickProgress(offset, _loopCounter, totalCompletions = towns[4].totalTidy) {
        return getSkillLevel("Practical") * Math.sqrt(1 + totalCompletions / 100);
    },
    loopsFinished(loopCounter = towns[4].TidyLoopCounter) {
        addResource("reputation", 1);
        addResource("gold", 5);
        setStoryFlag("tidiedUp");
    },
    segmentFinished() {
        // empty.
    },
    getPartName(loopCounter = towns[4].TidyLoopCounter) {
        return `${_txt(`actions>${getXMLName(this.name)}>label_part`)} ${numberToWords(Math.floor((loopCounter + 0.0001) / this.segments + 1))}`;
    },
    visible() {
        return towns[4].getLevel("Canvassed") >= 10;
    },
    unlocked(){
        return towns[4].getLevel("Canvassed") >= 30;
    },
    finish(){
        setStoryFlag("tidiedUp");
    },
});

Action.BuyManaZ5 = new Action("Buy Mana Z5", {
    type: "normal",
    expMult: 1,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.manaZ5Bought;
        }
    },
    stats: {
        Cha: 0.7,
        Int: 0.2,
        Luck: 0.1
    },
    manaCost() {
        return 100;
    },
    canStart() {
        return !portalUsed;
    },
    visible() {
        return true;
    },
    unlocked() {
        return true;
    },
    goldCost() {
        return Math.floor(50 * getSkillBonus("Mercantilism") * adjustGoldCostFromPrestige());
    },
    finish() {
        addMana(resources.gold * this.goldCost());
        resetResource("gold");
        setStoryFlag("manaZ5Bought");
    },
});

Action.SellArtifact = new Action("Sell Artifact", {
    type: "normal",
    expMult: 1,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum){
            case 1: return storyFlags.artifactSold;
        }
    },
    stats: {
        Cha: 0.4,
        Per: 0.3,
        Luck: 0.2,
        Soul: 0.1
    },
    canStart() {
        return resources.artifacts >= 1;
    },
    cost() {
        addResource("artifacts", -1);
    },
    manaCost() {
        return 500;
    },
    visible() {
        return towns[4].getLevel("Tour") >= 10;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 20;
    },
    finish() {
        setStoryFlag("artifactSold");
        addResource("gold", 50);
    },
});

Action.GiftArtifact = new Action("Gift Artifact", {
    type: "normal",
    expMult: 1,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.artifactDonated;
            case 2: return storyFlags.donated20Artifacts;
            case 3: return storyFlags.donated40Artifacts;
        }
    },
    stats: {
        Cha: 0.6,
        Luck: 0.3,
        Soul: 0.1
    },
    canStart() {
        return resources.artifacts >= 1;
    },
    cost() {
        addResource("artifacts", -1);
    },
    manaCost() {
        return 500;
    },
    visible() {
        return towns[4].getLevel("Tour") >= 10;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 20;
    },
    finish() {
        setStoryFlag("artifactDonated");
        addResource("favors", 1);
        if (resources["favors"] >= 20) setStoryFlag("donated20Artifacts");
        if (resources["favors"] >= 50) setStoryFlag("donated40Artifacts");
    },
});

Action.Mercantilism = new Action("Mercantilism", {
    type: "normal",
    expMult: 1,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return getSkillLevel("Mercantilism") >= 1;
            case 2: return getSkillLevel("Mercantilism") >= 30;
            case 3: return getSkillLevel("Mercantilism") >= 100;
            case 4: return getSkillLevel("Mercantilism") >= 500;
        }
    },
    stats: {
        Per: 0.2, // Temp
        Int: 0.7,
        Soul: 0.1
    },
    skills: {
        Mercantilism: 100
    },
    canStart() {
        return resources.reputation > 0;
    },
    manaCost() {
        return 10000; // Temp
    },
    cost() {
        addResource("reputation", -1);
    },
    visible() {
        return towns[4].getLevel("Tour") >= 20;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 30;
    },
    finish() {
        handleSkillExp(this.skills);
        //Needed for Mercantilism levelup
        view.requestUpdate("adjustGoldCosts");
    },
});

Action.CharmSchool = new Action("Charm School", {
    type: "normal",
    expMult: 4,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.charmSchoolVisited;
            case 2: return storyFlags.charmSchoolVisited && getTalent("Cha") >= 100;
            case 3: return storyFlags.charmSchoolVisited && getTalent("Cha") >= 1000;
            case 4: return storyFlags.charmSchoolVisited && getTalent("Cha") >= 10000;
            case 5: return storyFlags.charmSchoolVisited && getTalent("Cha") >= 100000;
        }
    },
    stats: {
        Cha: 0.8,
        Int: 0.2
    },
    allowed() {
        return trainingLimits;
    },
    manaCost() {
        return 2000;
    },
    visible() {
        return towns[4].getLevel("Tour") >= 20;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 30;
    },
    finish() {
        setStoryFlag("charmSchoolVisited");
    },
});

Action.Oracle = new Action("Oracle", {
    type: "normal",
    expMult: 4,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.oracleVisited;
            case 2: return storyFlags.oracleVisited && getTalent("Luck") >= 100;
            case 3: return storyFlags.oracleVisited && getTalent("Luck") >= 1000;
            case 4: return storyFlags.oracleVisited && getTalent("Luck") >= 10000;
            case 5: return storyFlags.oracleVisited && getTalent("Luck") >= 100000;
        }
    },
    stats: {
        Luck: 0.8,
        Soul: 0.2
    },
    allowed() {
        return trainingLimits;
    },
    manaCost() {
        return 2000;
    },
    visible() {
        return towns[4].getLevel("Tour") >= 30;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 40;
    },
    finish() {
        setStoryFlag("oracleVisited");
    },
});

Action.EnchantArmor = new Action("Enchant Armor", {
    type: "normal",
    expMult: 1,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.armorEnchanted;
            case 2: return storyFlags.enchanted10Armor;
            case 3: return storyFlags.enchanted20Armor;
        }
    },
    stats: {
        Cha: 0.6,
        Int: 0.2,
        Luck: 0.2
    },
    skills: {
        Crafting: 50
    },
    manaCost() {
        return 1000; // Temp
    },
    canStart() {
        return resources.favors >= 1 && resources.armor >= 1;
    },
    cost() {
        addResource("favors", -1);
        addResource("armor", -1);
    },
    visible() {
        return towns[4].getLevel("Tour") >= 30;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 40;
    },
    finish() {
        handleSkillExp(this.skills);
        addResource("enchantments", 1);
        setStoryFlag("armorEnchanted");
        if (resources["enchantments"] >= 10) setStoryFlag("enchanted10Armor");
        if (resources["enchantments"] >= 25) setStoryFlag("enchanted20Armor");
    },
});

Action.WizardCollege = new MultipartAction("Wizard College", {
    type: "multipart",
    expMult: 1,
    townNum: 4,
    varName: "wizCollege",
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyVars.maxWizardGuildSegmentCleared >= 0;
            case 12: return storyVars.maxWizardGuildSegmentCleared >= 3;
            case 2: return storyVars.maxWizardGuildSegmentCleared >= 6;
            case 3: return storyVars.maxWizardGuildSegmentCleared >= 12;
            case 4: return storyVars.maxWizardGuildSegmentCleared >= 18;
            case 6: return storyVars.maxWizardGuildSegmentCleared >= 30;
            case 8: return storyVars.maxWizardGuildSegmentCleared >= 42;
            case 10: return storyVars.maxWizardGuildSegmentCleared >= 54;
            case 13: return storyVars.maxWizardGuildSegmentCleared >= 57;
        }
    },
    stats: {
        Int: 0.5,
        Soul: 0.3,
        Cha: 0.2
    },
    loopStats: ["Int", "Cha", "Soul"],
    manaCost() {
        return 10000;
    },
    allowed() {
        return 1;
    },
    canStart() {
        return resources.gold >= 500 && resources.favors >= 10;
    },
    cost() {
        addResource("gold", -500);
        addResource("favors", -10);
    },
    loopCost(segment, loopCounter = towns[4][`${this.varName}LoopCounter`]) {
        return precision3(Math.pow(1.3, loopCounter + segment)) * 1e7; // Temp
    },
    tickProgress(offset, _loopCounter, totalCompletions = towns[4][`total${this.varName}`]) {
        return (
            getSkillLevel("Magic") + getSkillLevel("Practical") + getSkillLevel("Dark") +
            getSkillLevel("Chronomancy") + getSkillLevel("Pyromancy") + getSkillLevel("Restoration") + getSkillLevel("Spatiomancy")) *
            Math.sqrt(1 + totalCompletions / 1000);
    },
    loopsFinished() {
        // empty.
    },
    segmentFinished() {
        curWizCollegeSegment++;
        view.requestUpdate("adjustManaCost", "Restoration");
        view.requestUpdate("adjustManaCost", "Spatiomancy");
        increaseStoryVarTo("maxWizardGuildSegmentCleared", curWizCollegeSegment);
    },
    getPartName() {
        return `${getWizCollegeRank().name}`;
    },
    getSegmentName(segment) {
        return `${getWizCollegeRank(segment % 3).name}`;
    },
    visible() {
        return towns[4].getLevel("Tour") >= 40;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 60;
    },
    finish() {
        globalThis.IdleLoopsResourceState.setResourceValue(resources, "wizardCollege", true);
        increaseStoryVarTo("maxWizardGuildSegmentCleared", 0);
    },
});
function getWizCollegeRank(offset) {
    let name = [
        "Initiate",
        "Student",
        "Apprentice",
        "Disciple",
        "Spellcaster",
        "Magician",
        "Wizard",
        "Great Wizard",
        "Grand Wizard",
        "Archwizard",
        "Sage",
        "Great Sage",
        "Grand Sage",
        "Archsage",
        "Magus",
        "Great Magus",
        "Grand Magus",
        "Archmagus",
        "Member of The Council of the Seven",
    ][Math.floor(curWizCollegeSegment / 3 + 0.00001)];
    const segment = (offset === undefined ? 0 : offset - (curWizCollegeSegment % 3)) + curWizCollegeSegment;
    let bonus = precision3(1 + 0.02 * Math.pow(segment, 1.05));
    if (name) {
        if (offset === undefined) {
            name += ["-", "", "+"][curWizCollegeSegment % 3];
        } else {
            name += ["-", "", "+"][offset % 3];
        }
    } else {
        name = "Chair of The Council of the Seven";
        bonus = 5;
    }
    name += `, Mult x${bonus}`;
    return { name, bonus };
}

Action.Restoration = new Action("Restoration", {
    type: "normal",
    expMult: 1,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return getSkillLevel("Restoration") >= 1;
            case 2: return getSkillLevel("Restoration") >= 50;
            case 3: return getSkillLevel("Restoration") >= 200;
            case 4: return getSkillLevel("Restoration") >= 500;
        }
    },
    stats: {
        Int: 0.5,
        Soul: 0.3,
        Con: 0.2
    },
    canStart() {
        return resources.wizardCollege;
    },
    affectedBy: ["Wizard College"],
    skills: {
        Restoration: 100
    },
    manaCost() {
        return 15000 / getWizCollegeRank().bonus;
    },
    visible() {
        return towns[4].getLevel("Tour") >= 40;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 60;
    },
    finish() {
        handleSkillExp(this.skills);
    },
});

Action.Spatiomancy = new Action("Spatiomancy", {
    type: "normal",
    expMult: 1,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return getSkillLevel("Spatiomancy") >= 1;
            case 2: return getSkillLevel("Spatiomancy") >= 50;
            case 3: return getSkillLevel("Spatiomancy") >= 200;
            case 4: return getSkillLevel("Spatiomancy") >= 600;
            case 5: return getSkillLevel("Spatiomancy") >= 1000;
            case 6: return getSkillLevel("Spatiomancy") >= 1500;
        }
    },
    stats: {
        Int: 0.6,
        Con: 0.2,
        Per: 0.1,
        Spd: 0.1,
    },
    affectedBy: ["Wizard College"],
    skills: {
        Spatiomancy: 100
    },
    canStart() {
        return resources.wizardCollege;
    },
    manaCost() {
        return 20000 / getWizCollegeRank().bonus;
    },
    visible() {
        return towns[4].getLevel("Tour") >= 40;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 60;
    },
    finish() {
        const oldSpatioSkill = getSkillLevel("Spatiomancy");
        handleSkillExp(this.skills);
        if (getSkillLevel("Spatiomancy") !== oldSpatioSkill) {
            view.requestUpdate("adjustManaCost", "Mana Geyser");
            view.requestUpdate("adjustManaCost", "Mana Well");
            adjustAll();
            for (const action of totalActionList) {
                if (towns[action.townNum].varNames.indexOf(action.varName) !== -1) {
                    view.requestUpdate("updateRegular", {name: action.varName, index: action.townNum});
                }
            }
        }
    },
});

Action.SeekCitizenship = new Action("Seek Citizenship", {
    type: "progress",
    expMult: 1,
    townNum: 4,
    varName: "Citizen",
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return towns[4].getLevel(this.varName) >= 1;
            case 2: return towns[4].getLevel(this.varName) >= 20;
            case 3: return towns[4].getLevel(this.varName) >= 40;
            case 4: return towns[4].getLevel(this.varName) >= 60;
            case 5: return towns[4].getLevel(this.varName) >= 80;
            case 6: return towns[4].getLevel(this.varName) >= 100;
            //case 7: return storyReqs.repeatedCitizenExam;
        }
    },
    stats: {
        Cha: 0.5,
        Int: 0.2,
        Luck: 0.2,
        Per: 0.1
    },
    manaCost() {
        return 1500; // Temp
    },
    visible() {
        return towns[4].getLevel("Tour") >= 60;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 80;
    },
    finish() {
        towns[4].finishProgress(this.varName, 100);
        //Todo: Figure out a way to check if this is the first time the Seek Citizenship
        //action was performed in a loop *after* the loop in which 100% was achieved,
        //and unlock the repeatedCitizenExam story.
    },
});

Action.BuildHousing = new Action("Build Housing", {
    type: "normal",
    expMult: 1,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.houseBuilt;
            case 2: return storyFlags.housesBuiltGodlike;
            case 3: return storyFlags.built50Houses;
        }
    },
    stats: {
        Str: 0.4,
        Con: 0.3,
        Dex: 0.2,
        Spd: 0.1
    },
    skills: {
        Crafting: 100
    },
    affectedBy: ["Crafting Guild"],
    canStart() {
        //Maximum crafting guild bonus is 10, maximum spatiomancy mult is 5.
        let maxHouses = Math.floor(getCraftGuildRank().bonus * getSkillMod("Spatiomancy",0,500,1));
        return guild === "Crafting" && towns[4].getLevel("Citizen") >= 100 && resources.houses < maxHouses;
    },
    manaCost() {
        return 2000;
    },
    visible() {
        return towns[4].getLevel("Citizen") >= 80;
    },
    unlocked() {
        return towns[4].getLevel("Citizen") >= 100;
    },
    finish() {
        addResource("houses", 1);
        handleSkillExp(this.skills);
        setStoryFlag("houseBuilt");
        if (resources.houses >= 10 && getCraftGuildRank().name == "Godlike")
            setStoryFlag("housesBuiltGodlike");
        if (resources.houses >= 50)
            setStoryFlag("built50Houses");
    },
});

Action.CollectTaxes = new Action("Collect Taxes", {
    type: "normal",
    expMult: 1,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.collectedTaxes;
            case 2: return storyFlags.collected50Taxes;
        }
    },
    stats: {
        Cha: 0.4,
        Spd: 0.2,
        Per: 0.2,
        Luck: 0.2
    },
    affectedBy: ["Build Housing"],
    canStart() {
        return resources.houses > 0;
    },
    allowed () {
        return 1;
    },
    manaCost() {
        return 10000;
    },
    visible() {
        return towns[4].getLevel("Citizen") >= 60;
    },
    unlocked() {
        return towns[4].getLevel("Citizen") >= 100 && getSkillLevel("Mercantilism") > 0;
    },
    finish() {
        const goldGain = Math.floor(resources.houses * getSkillLevel("Mercantilism") / 10);
        addResource("gold", goldGain);
        setStoryFlag("collectedTaxes");
        if (resources.houses >= 50)
            setStoryFlag("collected50Taxes");

        //Is this necessary? The return value for finish() seems unused.
        return goldGain;
    },
});

Action.Pegasus = new Action("Pegasus", {
    type: "normal",
    expMult: 1,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.acquiredPegasus;
            case 2: return storyFlags.acquiredPegasusWithTeam;
        }
    },
    stats: {
        Soul: 0.3,
        Cha: 0.2,
        Luck: 0.2,
        Int: 0.3
    },
    allowed() {
        return 1;
    },
    manaCost() {
        return 3000;
    },
    canStart() {
        return resources.gold >= 200 && resources.favors >= 20;
    },
    cost() {
        addResource("favors", -20);
        addResource("gold", -200);
    },
    visible() {
        return towns[4].getLevel("Tour") >= 70;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 90;
    },
    finish() {
        addResource("pegasus", true);
        setStoryFlag("acquiredPegasus");
        if (resources.teamMembers >= 5)
            setStoryFlag("acquiredPegasusWithTeam");
    },
});

Action.FightFrostGiants = new MultipartAction("Fight Frost Giants", {
    type: "multipart",
    expMult: 1,
    townNum: 4,
    varName: "FightFrostGiants",
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.giantGuildTestTaken;
            case 2: return storyFlags.giantGuildRankEReached;
            case 3: return storyFlags.giantGuildRankDReached;
            case 4: return storyFlags.giantGuildRankCReached;
            case 5: return storyFlags.giantGuildRankBReached;
            case 6: return storyFlags.giantGuildRankAReached;
            case 7: return storyFlags.giantGuildRankSReached;
            case 8: return storyFlags.giantGuildRankSSReached;
            case 9: return storyFlags.giantGuildRankSSSReached;
            case 10: return storyFlags.giantGuildRankUReached;
            case 11: return storyFlags.giantGuildRankGodlikeReached;
        }
    },
    stats: {
        Str: 0.5,
        Con: 0.3,
        Per: 0.2,
    },
    skills: {
        Combat: 1500
    },
    loopStats: ["Per", "Con", "Str"],
    manaCost() {
        return 20000;
    },
    allowed() {
        return 1;
    },
    affectedBy: ["Pegasus"],
    canStart() {
        return resources.pegasus;
    },
    loopCost(segment, loopCounter = towns[4][`${this.varName}LoopCounter`]) {
        return precision3(Math.pow(1.3, loopCounter + segment)) * 1e7; // Temp
    },
    tickProgress(_offset, _loopCounter, totalCompletions = towns[4][`total${this.varName}`]) {
        return (getSelfCombat() *
            Math.sqrt(1 + totalCompletions / 1000));
    },
    loopsFinished() {
        handleSkillExp(this.skills);
    },
    segmentFinished() {
        curFightFrostGiantsSegment++;
        if (curFightFrostGiantsSegment >= 3) setStoryFlag("giantGuildRankEReached");
        if (curFightFrostGiantsSegment >= 9) setStoryFlag("giantGuildRankDReached");
        if (curFightFrostGiantsSegment >= 15) setStoryFlag("giantGuildRankCReached");
        if (curFightFrostGiantsSegment >= 21) setStoryFlag("giantGuildRankBReached");
        if (curFightFrostGiantsSegment >= 27) setStoryFlag("giantGuildRankAReached");
        if (curFightFrostGiantsSegment >= 33) setStoryFlag("giantGuildRankSReached");
        if (curFightFrostGiantsSegment >= 39) setStoryFlag("giantGuildRankSSReached");
        if (curFightFrostGiantsSegment >= 45) setStoryFlag("giantGuildRankSSSReached");
        if (curFightFrostGiantsSegment >= 51) setStoryFlag("giantGuildRankUReached");
        if (curFightFrostGiantsSegment >= 57) setStoryFlag("giantGuildRankGodlikeReached");
    },
    getPartName() {
        return `${getFrostGiantsRank().name}`;
    },
    getSegmentName(segment) {
        return `${getFrostGiantsRank(segment % 3).name}`;
    },
    visible() {
        return towns[4].getLevel("Citizen") >= 80 || storyFlags.acquiredPegasus;
    },
    unlocked() {
        return towns[4].getLevel("Citizen") >= 100;
    },
    finish() {
        setStoryFlag("giantGuildTestTaken");
    },
});
function getFrostGiantsRank(offset) {
    let name = [
        "Private",
        "Corporal",             //E
        "Specialist",
        "Sergeant",             //D
        "Staff Sergeant",
        "Sergeant First Class", //C
        "Master Sergeant",
        "Sergeant Major",       //B
        "Warrant Officer",
        "Chief Warrant Officer",//A
        "Second Lieutenant",
        "First Lieutenant",     //S
        "Major",
        "Lieutenant Colonel",   //SS
        "Colonel",
        "Lieutenant Commander", //SSS
        "Commander",
        "Captain",              //U
        "Rear Admiral",
        "Vice Admiral"          //godlike
    ][Math.floor(curFightFrostGiantsSegment / 3 + 0.00001)];
    const segment = (offset === undefined ? 0 : offset - (curFightFrostGiantsSegment % 3)) + curFightFrostGiantsSegment;
    let bonus = precision3(1 + 0.05 * Math.pow(segment, 1.05));
    if (name) {
        if (offset === undefined) {
            name += ["-", "", "+"][curFightFrostGiantsSegment % 3];
        } else {
            name += ["-", "", "+"][offset % 3];
        }
    } else {
        name = "Admiral";
        bonus = 10;
    }
    name += `, Mult x${bonus}`;
    return { name, bonus };
}

Action.SeekBlessing = new Action("Seek Blessing", {
    type: "normal",
    expMult: 5,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.blessingSought;
            case 2: return getSkillLevel("Divine") >= 1;
            case 3: return storyFlags.greatBlessingSought;
        }
    },
    stats: {
        Cha: 0.5,
        Luck: 0.5
    },
    skills: {
        Divine: 50
    },
    canStart() {
        return resources.pegasus;
    },
    allowed() {
        return 1;
    },
    affectedBy: ["Pegasus"],
    manaCost() {
        return 1000000;
    },
    visible() {
        return towns[4].getLevel("Citizen") >= 80 || storyFlags.acquiredPegasus;
    },
    unlocked() {
        return towns[4].getLevel("Citizen") >= 100;
    },
    finish() {
        setStoryFlag("blessingSought");
        if (getFrostGiantsRank().bonus >= 10) setStoryFlag("greatBlessingSought");
        // @ts-ignore
        this.skills.Divine = Math.floor(50 * getFrostGiantsRank().bonus);
        handleSkillExp(this.skills);
    },
});

Action.GreatFeast = new MultipartAction("Great Feast", {
    type: "multipart",
    expMult: 5,
    townNum: 4,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.feastAttempted;
            case 2: return getBuffLevel("Feast") >= 1;
        }
    },
    stats: {
        Spd: 0.1,
        Int: 0.1,
        Soul: 0.8
    },
    loopStats: ["Spd", "Int", "Soul"],
    manaCost() {
        return 5000000;
    },
    allowed() {
        return 1;
    },
    canStart(loopCounter = towns[this.townNum].GreatFeastLoopCounter) {
        return resources.reputation >= 100 && loopCounter === 0 && checkSoulstoneSac(this.goldCost()) && getBuffLevel("Feast") < getBuffCap("Feast");
    },
    loopCost(segment) {
        return 1000000000 * (segment * 5 + 1);
    },
    tickProgress(offset) {
        return getSkillLevel("Practical");
    },
    grantsBuff: "Feast",
    loopsFinished() {
        const spent = sacrificeSoulstones(this.goldCost());
        addBuffAmt("Feast", 1, this, "soulstone", spent);
        view.requestUpdate("updateSoulstones", null);
        view.requestUpdate("adjustGoldCost", {varName: "GreatFeast", cost: this.goldCost()});
    },
    getPartName() {
        return "Host Great Feast";
    },
    visible() {
        return towns[4].getLevel("Tour") >= 80;
    },
    unlocked() {
        return towns[4].getLevel("Tour") >= 100;
    },
    goldCost() {
        return Math.ceil(5000 * (getBuffLevel("Feast") + 1) * getSkillBonus("Gluttony"));
    },
    finish() {
        setStoryFlag("feastAttempted")
        view.requestUpdate("updateBuff", "Feast");
    },
});

Action.FallFromGrace = new Action("Fall From Grace", {
    type: "normal",
    expMult: 2,
    townNum: 4,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return storyFlags.fellFromGrace;
        }
        return false;
    },
    stats: {
        Dex: 0.4,
        Luck: 0.3,
        Spd: 0.2,
        Int: 0.1,
    },
    allowed() {
        return 1;
    },
    manaCost() {
        return 30000;
    },
    visible() {
        return true;
    },
    unlocked() {
        return getSkillLevel("Pyromancy") >= 200;
    },
    finish() {
        if (resources.reputation >= 0) {
            globalThis.IdleLoopsResourceState.setResourceValue(resources, "reputation", -1);
        }
        view.requestUpdate("updateResource", 'reputation');
        setStoryFlag("fellFromGrace");
        unlockTown(5);
    },
});

//====================================================================================================
//Zone 6 - Startington
//====================================================================================================
Action.Meander = new Action("Meander", {
    type: "progress",
    expMult: 1,
    townNum: 5,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return towns[5].getLevel("Meander") >= 1;
            case 2: return towns[5].getLevel("Meander") >= 2;
            case 3: return towns[5].getLevel("Meander") >= 5;
            case 4: return towns[5].getLevel("Meander") >= 15;
            case 5: return towns[5].getLevel("Meander") >= 25;
            case 6: return towns[5].getLevel("Meander") >= 50;
            case 7: return towns[5].getLevel("Meander") >= 75;
            case 8: return towns[5].getLevel("Meander") >= 100;
            case 9: return storyFlags.meanderIM100;
        }
    },
    stats: {
        Per: 0.2,
        Con: 0.2,
        Cha: 0.2,
        Spd: 0.3,
        Luck: 0.1
    },
    affectedBy: ["Imbue Mind"],
    manaCost() {
        return 2500;
    },
    visible() {
        return true;
    },
    unlocked() {
        return true;
    },
    finish() {
        if (getBuffLevel("Imbuement") >= 100) setStoryFlag("meanderIM100");
        towns[5].finishProgress(this.varName, getBuffLevel("Imbuement"));
    }
});
function adjustPylons() {
    let town = towns[5];
    let base = Math.round(town.getLevel("Meander") * 10 * adjustContentFromPrestige());
    town.totalPylons = Math.floor(base * getSkillMod("Spatiomancy", 1000, 1200, .5) + base * getSurveyBonus(town));
}

Action.ManaWell = new Action("Mana Well", {
    type: "limited",
    expMult: 1,
    townNum: 5,
    varName: "Wells",
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.wellDrawn;
            case 2: return storyFlags.drew10Wells;
            case 3: return storyFlags.drew15Wells;
            case 4: return storyFlags.drewDryWell;
        }
    },
    stats: {
        Str: 0.6,
        Per: 0.3,
        Int: 0.1,
    },
    manaCost() {
        return Math.ceil(2500 * getSkillBonus("Spatiomancy"));
    },
    canStart() {
        return true;
    },
    visible() {
        return true;
    },
    unlocked() {
        return towns[5].getLevel("Meander") >= 2;
    },
    goldCost() { // in this case, "amount of mana in well"
        return Math.max(5000 - Math.floor(10 * effectiveTime), 0);
    },
    finish() {
        towns[5].finishRegular(this.varName, 100, () => {
        let wellMana = this.goldCost();
        addMana(wellMana);
        if (wellMana === 0)
            setStoryFlag("drewDryWell");
        else
            setStoryFlag("wellDrawn");
        return wellMana;
        });
        if (towns[5].goodWells >= 10) setStoryFlag("drew10Wells");
        if (towns[5].goodWells >= 15) setStoryFlag("drew15Wells");
    },
});
function adjustWells() {
    let town = towns[5];
    let base = Math.round(town.getLevel("Meander") * 10 * adjustContentFromPrestige());
    town.totalWells = Math.floor(base + base * getSurveyBonus(town));
}

Action.DestroyPylons = new Action("Destroy Pylons", {
    type: "limited",
    expMult: 1,
    townNum: 5,
    varName: "Pylons",
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return towns[5].goodPylons >= 1;
            case 2: return towns[5].goodPylons >= 10;
            case 3: return towns[5].goodPylons >= 25;
        }
    },
    stats: {
        Str: 0.4,
        Dex: 0.3,
        Int: 0.3
    },
    manaCost() {
        return 10000;
    },
    visible() {
        return towns[5].getLevel("Meander") >= 1;
    },
    unlocked() {
        return towns[5].getLevel("Meander") >= 5;
    },
    finish() {
        towns[5].finishRegular(this.varName, 100, () => {
            addResource("pylons", 1);
            //view.requestUpdate("adjustManaCost", "The Spire");
            return 1;
        });
    },
});

Action.RaiseZombie = new Action("Raise Zombie", {
    type: "normal",
    expMult: 1,
    townNum: 5,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.attemptedRaiseZombie;
            case 3: return storyVars.maxZombiesRaised >= 10;
            case 4: return storyVars.maxZombiesRaised >= 25;
        }
    },
    stats: {
        Con: 0.4,
        Int: 0.3,
        Soul: 0.3
    },
    skills: {
        Dark: 100
    },
    canStart() {
        return resources.blood >= 1;
    },
    cost() {
        addResource("blood", -1);
    },
    manaCost() {
        return 10000;
    },
    visible() {
        return towns[5].getLevel("Meander") >= 15;
    },
    unlocked() {
        return getSkillLevel("Dark") >= 1000;
    },
    finish() {
        setStoryFlag("attemptedRaiseZombie");
        handleSkillExp(this.skills);
        addResource("zombie", 1);
        increaseStoryVarTo("maxZombiesRaised", resources.zombie);
    },
});

Action.DarkSacrifice = new Action("Dark Sacrifice", {
    type: "normal",
    expMult: 1,
    townNum: 5,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return getSkillLevel("Commune") >= 1;
            case 2: return getSkillLevel("Commune") >= 100;
            case 3: return getSkillLevel("Commune") >= 1000;
        }
    },
    stats: {
        Int: 0.2,
        Soul: 0.8
    },
    skills: {
        Commune: 100
    },
    canStart() {
        return resources.blood >= 1;
    },
    cost() {
        addResource("blood", -1);
    },
    manaCost() {
        return 20000;
    },
    visible() {
        return towns[5].getLevel("Meander") >= 25;
    },
    unlocked() {
        return getBuffLevel("Ritual") >= 60;
    },
    finish() {
        handleSkillExp(this.skills);
        view.requestUpdate("adjustGoldCost", {varName: "DarkRitual", cost: Action.DarkRitual.goldCost()});
    },
});

Action.TheSpire = new DungeonAction("The Spire", 2, {
    type: "multipart",
    expMult: 1,
    townNum: 5,
    varName: "TheSpire",
    storyReqs(storyNum) {
        switch(storyNum) {
            //TODO: decide on some reasonable/better floor requirements for progress stories.
            case 1: return storyFlags.spireAttempted;
            case 2: return towns[5].totalTheSpire >= 1000;
            case 3: return towns[5].totalTheSpire >= 5000;
            case 4: return storyFlags.clearedSpire;
            case 5: return storyFlags.spire10Pylons;
            case 6: return storyFlags.spire20Pylons;
        }
    },
    stats: {
        Str: 0.1,
        Dex: 0.1,
        Spd: 0.1,
        Con: 0.1,
        Per: 0.2,
        Int: 0.2,
        Soul: 0.2
    },
    skills: {
        Combat: 100
    },
    loopStats: ["Per", "Int", "Con", "Spd", "Dex", "Per", "Int", "Str", "Soul"],
    affectedBy: ["Team"],
    manaCost() {
        return 100000;
    },
    canStart(loopCounter = towns[this.townNum].TheSpireLoopCounter) {
        const curFloor = Math.floor((loopCounter) / this.segments + 0.0000001);
        return curFloor < dungeons[this.dungeonNum].length;
    },
    loopCost(segment, loopCounter = towns[this.townNum].TheSpireLoopCounter) {
        return precision3(Math.pow(2, Math.floor((loopCounter + segment) / this.segments + 0.0000001)) * 1e7);
    },
    tickProgress(_offset, loopCounter = towns[this.townNum].TheSpireLoopCounter) {
        const floor = Math.floor((loopCounter) / this.segments + 0.0000001);
        return getTeamCombat() * (1 + 0.1 * resources.pylons) *
        Math.sqrt(1 + dungeons[this.dungeonNum][floor].completed / 200);
    },
    grantsBuff: "Aspirant",
    loopsFinished(loopCounter = towns[this.townNum].TheSpireLoopCounter) {
        const curFloor = Math.floor((loopCounter) / this.segments + 0.0000001 - 1);
        this.finishDungeon(curFloor);
        if (curFloor >= getBuffLevel("Aspirant")) addBuffAmt("Aspirant", 1, this);
        if (curFloor == dungeonFloors[this.dungeonNum]-1) setStoryFlag("clearedSpire");
    },
    visible() {
        return towns[5].getLevel("Meander") >= 5;
    },
    unlocked() {
        return (getSkillLevel("Combat") + getSkillLevel("Magic")) >= 35;
    },
    finish() {
        handleSkillExp(this.skills);
        view.requestUpdate("updateBuff", "Aspirant");
        setStoryFlag("spireAttempted")
        if (resources.pylons >= 10) setStoryFlag("spire10Pylons");
        if (resources.pylons >= 25) setStoryFlag("spire20Pylons");
    },
});

Action.PurchaseSupplies = new Action("Purchase Supplies", {
    type: "normal",
    expMult: 1,
    townNum: 5,
    storyReqs(storyNum) {
        switch(storyNum) {
                case 1: return storyFlags.suppliesPurchased;
        }
    },
    stats: {
        Cha: 0.8,
        Luck: 0.1,
        Soul: 0.1
    },
    allowed() {
        return 1;
    },
    manaCost() {
        return 2000;
    },
    canStart() {
        return resources.gold >= 500 && !resources.supplies;
    },
    cost() {
        addResource("gold", -500);
    },
    visible() {
        return towns[5].getLevel("Meander") >= 50;
    },
    unlocked() {
        return towns[5].getLevel("Meander") >= 75;
    },
    finish() {
        setStoryFlag("suppliesPurchased")
        addResource("supplies", true);
    },
});

Action.DeadTrial = new TrialAction("Dead Trial", 4, {
    //25 floors
    type: "multipart",
    expMult: 0.25,
    townNum: 5,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.deadTrial1Done;
            case 2: return storyFlags.deadTrial10Done;
            case 3: return storyFlags.deadTrial25Done;
        }
    },
    stats: {
        Cha: 0.25,
        Int: 0.25,
        Luck: 0.25,
        Soul: 0.25
    },
    loopStats: ["Cha", "Int", "Luck", "Soul"],
    affectedBy: ["RaiseZombie"],
    baseScaling: 2, //Difficulty is raised to this exponent each floor
    exponentScaling: 1e9, //Difficulty is multiplied by this number each floor
    manaCost() {
        return 100000;
    },
    baseProgress() {
        //Determines what skills give progress to the trial
        return getZombieStrength();
    },
    floorReward() {
        //Rewards given per floor
        addResource("zombie", 1);
    },
    canStart() {
        return this.currentFloor() < trialFloors[this.trialNum];
    },
    visible() {
        return towns[this.townNum].getLevel("Survey") >= 100;
    },
    unlocked() {
        return towns[this.townNum].getLevel("Survey") >= 100;
    },
    finish() {
        if (this.currentFloor() >= 1) setStoryFlag("deadTrial1Done");
        if (this.currentFloor() >= 10) setStoryFlag("deadTrial10Done");
        if (this.currentFloor() >= 25) setStoryFlag("deadTrial25Done");
    },
});

Action.JourneyForth = new Action("Journey Forth", {
    type: "normal",
    expMult: 2,
    townNum: 5,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return townsUnlocked.includes(6);
        }
    },
    stats: {
        Con: 0.4,
        Per: 0.3,
        Spd: 0.3
    },
    allowed(checkActiveList) {
        return (checkActiveList ? getNumOnCurList : getNumOnList)("Open Portal") > 0 ? 2 : 1;
    },
    manaCost() {
        return 20000;
    },
    canStart() {
        return resources.supplies;
    },
    cost() {
        addResource("supplies", false);
    },
    visible() {
        return towns[5].getLevel("Meander") >= 75;
    },
    unlocked() {
        return towns[5].getLevel("Meander") >= 100;
    },
    finish() {
        unlockTown(6);
    },
    story(completed) {
        unlockGlobalStory(8);
    }
});

//====================================================================================================
//Zone 7 - Jungle Path
//====================================================================================================
Action.ExploreJungle = new Action("Explore Jungle", {
    type: "progress",
    expMult: 1,
    townNum: 6,
    varName: "ExploreJungle",
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return towns[6].getLevel(this.varName) >= 1;
            case 2: return towns[6].getLevel(this.varName) >= 10;
            case 3: return towns[6].getLevel(this.varName) >= 20;
            case 4: return towns[6].getLevel(this.varName) >= 40;
            case 5: return towns[6].getLevel(this.varName) >= 50;
            case 6: return towns[6].getLevel(this.varName) >= 60;
            case 7: return towns[6].getLevel(this.varName) >= 80;
            case 8: return towns[6].getLevel(this.varName) >= 100;
        }
    },
    stats: {
        Per: 0.2,
        Con: 0.2,
        Cha: 0.2,
        Spd: 0.3,
        Luck: 0.1
    },
    affectedBy: ["Fight Jungle Monsters"],
    manaCost() {
        return 25000;
    },
    visible() {
        return true;
    },
    unlocked() {
        return true;
    },
    finish() {
        towns[6].finishProgress(this.varName, 20 * getFightJungleMonstersRank().bonus);
        addResource("herbs", 1);
    }
});

Action.FightJungleMonsters = new MultipartAction("Fight Jungle Monsters", {
    type: "multipart",
    expMult: 1,
    townNum: 6,
    varName: "FightJungleMonsters",
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.monsterGuildTestTaken;
            case 2: return storyFlags.monsterGuildRankDReached;
            case 3: return storyFlags.monsterGuildRankCReached;
            case 4: return storyFlags.monsterGuildRankBReached;
            case 5: return storyFlags.monsterGuildRankAReached;
            case 6: return storyFlags.monsterGuildRankSReached;
            case 7: return storyFlags.monsterGuildRankSSReached;
            case 8: return storyFlags.monsterGuildRankSSSReached;
            case 9: return storyFlags.monsterGuildRankUReached;
            case 10: return storyFlags.monsterGuildRankGodlikeReached;
        }
    },
    stats: {
        Str: 0.3,
        Dex: 0.3,
        Per: 0.4,
    },
    skills: {
        Combat: 2000
    },
    loopStats: ["Dex", "Str", "Per"],
    manaCost() {
        return 30000;
    },
    canStart() {
        return true;
    },
    loopCost(segment, loopCounter = towns[6][`${this.varName}LoopCounter`]) {
        return precision3(Math.pow(1.3, loopCounter + segment)) * 1e8; // Temp
    },
    tickProgress(_offset, _loopCounter, totalCompletions = towns[6][`total${this.varName}`]) {
        return (getSelfCombat() *
            Math.sqrt(1 + totalCompletions / 1000));
    },
    loopsFinished() {
        handleSkillExp(this.skills);
    },
    segmentFinished() {
        curFightJungleMonstersSegment++;
        addResource("blood", 1);
        //Since the action stories are for having *slain* the beast,
        //unlock *after* the last segment of the beast in question.
        //I.e., the sloth fight is segments 6, 7 and 8, so the unlock
        //happens when the 8th segment is done and the current segment
        //is 9 or more.
        if (curFightJungleMonstersSegment >= 9) setStoryFlag("monsterGuildRankDReached");
        if (curFightJungleMonstersSegment >= 15) setStoryFlag("monsterGuildRankCReached");
        if (curFightJungleMonstersSegment >= 21) setStoryFlag("monsterGuildRankBReached");
        if (curFightJungleMonstersSegment >= 27) setStoryFlag("monsterGuildRankAReached");
        if (curFightJungleMonstersSegment >= 33) setStoryFlag("monsterGuildRankSReached");
        if (curFightJungleMonstersSegment >= 39) setStoryFlag("monsterGuildRankSSReached");
        if (curFightJungleMonstersSegment >= 45) setStoryFlag("monsterGuildRankSSSReached");
        if (curFightJungleMonstersSegment >= 51) setStoryFlag("monsterGuildRankUReached");
        if (curFightJungleMonstersSegment >= 57) setStoryFlag("monsterGuildRankGodlikeReached");
        // Additional thing?
    },
    getPartName() {
        return `${getFightJungleMonstersRank().name}`;
    },
    getSegmentName(segment) {
        return `${getFightJungleMonstersRank(segment % 3).name}`;
    },
    visible() {
        return true;
    },
    unlocked() {
        return true;
    },
    finish() {
        setStoryFlag("monsterGuildTestTaken");
    },
});
function getFightJungleMonstersRank(offset) {
    let name = [
        "Frog",
        "Toucan",
        "Sloth",     //D
        "Pangolin",
        "Python",    //C
        "Tapir",
        "Okapi",     //B
        "Bonobo",
        "Jaguar",    //A
        "Chimpanzee",
        "Annaconda", //S
        "Lion",
        "Tiger",     //SS
        "Bear",
        "Crocodile", //SSS
        "Rhino",
        "Gorilla",   //U
        "Hippo",
        "Elephant"   //godlike
    ][Math.floor(curFightJungleMonstersSegment / 3 + 0.00001)];
    const segment = (offset === undefined ? 0 : offset - (curFightJungleMonstersSegment % 3)) + curFightJungleMonstersSegment;
    let bonus = precision3(1 + 0.05 * Math.pow(segment, 1.05));
    if (name) {
        if (offset === undefined) {
            name += ["-", "", "+"][curFightJungleMonstersSegment % 3];
        } else {
            name += ["-", "", "+"][offset % 3];
        }
    } else {
        name = "Stampede";
        bonus = 10;
    }
    name += `, Mult x${bonus}`;
    return { name, bonus };
}

Action.RescueSurvivors = new MultipartAction("Rescue Survivors", {
    type: "multipart",
    expMult: 1,
    townNum: 6,
    varName: "Rescue",
    storyReqs(storyNum) {
        switch(storyNum) {
                case 1: return storyFlags.survivorRescued;
                case 2: return storyFlags.rescued6Survivors;
                case 3: return storyFlags.rescued20Survivors;
        }
    },
    stats: {
        Per: 0.4,
        Dex: 0.2,
        Cha: 0.2,
        Spd: 0.2
    },
    skills: {
        Restoration: 25
    },
    loopStats: ["Per", "Spd", "Cha"],
    manaCost() {
        return 25000;
    },
    canStart() {
        return true;
    },
    loopCost(segment, loopCounter = towns[6].RescueLoopCounter) {
        return fibonacci(2 + Math.floor((loopCounter + segment) / this.segments + 0.0000001)) * 5000;
    },
    tickProgress(offset, loopCounter, totalCompletions = towns[6].totalRescue) {
        return getSkillLevel("Magic") * Math.max(getSkillLevel("Restoration") / 100, 1) * Math.sqrt(1 + totalCompletions / 100);
    },
    loopsFinished(loopCounter = towns[6].RescueLoopCounter) {
        addResource("reputation", 4);
        setStoryFlag("survivorRescued");
        if (loopCounter >= 6*3) setStoryFlag("rescued6Survivors");
        if (loopCounter >= 20*3) setStoryFlag("rescued20Survivors");
    },
    getPartName(loopCounter = towns[6].RescueLoopCounter) {
        return `${_txt(`actions>${getXMLName(this.name)}>label_part`)} ${numberToWords(Math.floor((loopCounter + 0.0001) / this.segments + 1))}`;
    },
    visible() {
        return towns[6].getLevel("ExploreJungle") >= 10;
    },
    unlocked() {
        return towns[6].getLevel("ExploreJungle") >= 20;
    },
    finish() {
        handleSkillExp(this.skills);
    },
});

Action.PrepareBuffet = new Action("Prepare Buffet", {
    type: "normal",
    expMult: 1,
    townNum: 6,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.buffetHeld;
            case 2: return storyFlags.buffetFor1;
            case 3: return storyFlags.buffetFor6;
            case 4: return getSkillLevel("Gluttony") >= 10;
            case 5: return getSkillLevel("Gluttony") >= 100;
        }
    },
    stats: {
        Con: 0.3,
        Per: 0.1,
        Int: 0.6
    },
    skills: {
        Alchemy: 25,
        Gluttony: 5
    },
    canStart() {
        return resources.herbs >= 10 && resources.blood > 0;
    },
    cost() {
        addResource("herbs", -10);
        addResource("blood", -1);
    },
    manaCost() {
        return 30000;
    },
    visible() {
        return towns[6].getLevel("ExploreJungle") >= 15;
    },
    unlocked() {
        return towns[6].getLevel("ExploreJungle") >= 20;
    },
    finish() {
        // @ts-ignore
        this.skills.Gluttony = Math.floor(towns[6].RescueLoopCounter * 5);
        handleSkillExp(this.skills);
        setStoryFlag("buffetHeld");
        if (towns[6].RescueLoopCounter >= 1) setStoryFlag("buffetFor1");
        if (towns[6].RescueLoopCounter >= 6) setStoryFlag("buffetFor6");
    },
});

Action.Totem = new Action("Totem", {
    type: "normal",
    expMult: 1,
    townNum: 6,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return getSkillLevel("Wunderkind") >= 1;
            case 2: return getSkillLevel("Wunderkind") >= 5;
            case 3: return getSkillLevel("Wunderkind") >= 60;
            case 4: return getSkillLevel("Wunderkind") >= 360;
        }
    },
    stats: {
        Con: 0.3,
        Per: 0.2,
        Soul: 0.5
    },
    skills: {
        Wunderkind: 100
    },
    canStart() {
        return resources.loopingPotion;
    },
    cost() {
        addResource("loopingPotion", false);
    },
    manaCost() {
        return 30000;
    },
    visible() {
        return towns[6].getLevel("ExploreJungle") >= 25;
    },
    unlocked() {
        return towns[6].getLevel("ExploreJungle") >= 50;
    },
    finish() {
        handleSkillExp(this.skills);
    },
});

Action.Escape = new Action("Escape", {
    type: "normal",
    expMult: 2,
    townNum: 6,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return townsUnlocked.includes(7);
        }
    },
    stats: {
        Dex: 0.2,
        Spd: 0.8
    },
    allowed() {
        return 1;
    },
    canStart() {
        if (escapeStarted) return true;
        else if (effectiveTime < 60) {
            escapeStarted = true;
            return true;
        }
        else return false;
    },
    manaCost() {
        return 50000;
    },
    visible() {
        return towns[6].getLevel("ExploreJungle") >= 75;
    },
    unlocked() {
        return towns[6].getLevel("ExploreJungle") >= 100;
    },
    finish() {
        unlockTown(7);
    },
    story(completed) {
        //FIXME: This will (unfortunately) give the story completion for creating the looping potion, even
        //if the player didn't, because completing story N will also complete all stories less than N.
        unlockGlobalStory(10);
    },
});

Action.OpenPortal = new Action("Open Portal", {
    type: "normal",
    expMult: 1,
    townNum: 6,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.portalOpened;
        }
    },
    stats: {
        Int: 0.2,
        Luck: 0.1,
        Soul: 0.7
    },
    skills: {
        Restoration: 2500
    },
    allowed() {
        return 1;
    },
    manaCost() {
        return 50000;
    },
    visible() {
        return getExploreProgress() > 50;
    },
    unlocked() {
        return getExploreProgress() >= 75 && getSkillLevel("Restoration") >= 1000;
    },
    canStart() {
        return getSkillLevel("Restoration") >= 1000;
    },
    finish() {
        portalUsed = true;
        setStoryFlag("portalOpened");
        handleSkillExp(this.skills);
        unlockTown(1);
    },
});

//====================================================================================================
//Zone 8 - Commerceville
//====================================================================================================
Action.Excursion = new Action("Excursion", {
    type: "progress",
    expMult: 1,
    townNum: 7,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return towns[7].getLevel("Excursion") >= 1;
            case 2: return towns[7].getLevel("Excursion") >= 10;
            case 3: return towns[7].getLevel("Excursion") >= 25;
            case 4: return towns[7].getLevel("Excursion") >= 40;
            case 5: return towns[7].getLevel("Excursion") >= 60;
            case 6: return towns[7].getLevel("Excursion") >= 80;
            case 7: return towns[7].getLevel("Excursion") >= 100;
            case 8: return storyFlags.excursionAsGuildmember;
        }
    },
    stats: {
        Per: 0.2,
        Con: 0.2,
        Cha: 0.2,
        Spd: 0.3,
        Luck: 0.1
    },
    affectedBy: ["Buy Glasses"],
    manaCost() {
        return 25000;
    },
    canStart() {
        return resources.gold >= this.goldCost();
    },
    visible() {
        return true;
    },
    unlocked() {
        return true;
    },
    goldCost() {
        return (guild === "Thieves" || guild === "Explorer") ? 2 : 10;
    },
    finish() {
        if (guild === "Thieves" || guild === "Explorer") setStoryFlag("excursionAsGuildmember");
        towns[7].finishProgress(this.varName, 50 * (resources.glasses ? 2 : 1));
        addResource("gold", -1 * this.goldCost());
    }
});
function adjustPockets() {
    let town = towns[7];
    let base = Math.round(town.getLevel("Excursion") * adjustContentFromPrestige());
    town.totalPockets = Math.floor(base * getSkillMod("Spatiomancy", 1100, 1300, .5) + base * getSurveyBonus(town));
    view.requestUpdate("updateActionTooltips", null);
}
function adjustWarehouses() {
    let town = towns[7];
    let base = Math.round(town.getLevel("Excursion") / 2.5 * adjustContentFromPrestige());
    town.totalWarehouses = Math.floor(base * getSkillMod("Spatiomancy", 1200, 1400, .5) + base * getSurveyBonus(town));
    view.requestUpdate("updateActionTooltips", null);
}
function adjustInsurance() {
    let town = towns[7];
    let base = Math.round(town.getLevel("Excursion") / 10 * adjustContentFromPrestige());
    town.totalInsurance = Math.floor(base * getSkillMod("Spatiomancy", 1300, 1500, .5) + base * getSurveyBonus(town));
    view.requestUpdate("updateActionTooltips", null);
}

Action.ExplorersGuild = new Action("Explorers Guild", {
    //Note: each time the 'survey' action is performed, one 'map' is exchanged for a
    //'completed map'; not just when a zone is 100% surveyed.
    type: "normal",
    expMult: 1,
    townNum: 7,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.explorerGuildTestTaken;
            case 2: return storyFlags.mapTurnedIn;
            case 3: return fullyExploredZones() >= 1;
            case 4: return fullyExploredZones() >= 4;
            case 5: return fullyExploredZones() >= towns.length;
        }
    },
    stats: {
        Per: 0.3,
        Cha: 0.3,
        Int: 0.2,
        Luck: 0.2
    },
    manaCost() {
        return 65000;
    },
    allowed() {
        return 1;
    },
    canStart() {
        return guild === "";
    },
    visible() {
        return towns[7].getLevel("Excursion") >= 5;
    },
    unlocked() {
        return towns[7].getLevel("Excursion") >= 10;
    },
    finish() {
        setStoryFlag("explorerGuildTestTaken");
        if (getExploreSkill() == 0) towns[this.townNum].finishProgress("SurveyZ"+this.townNum, 100);
        if (resources.map === 0) addResource("map", 30);
        if (resources.completedMap > 0) {
            exchangeMap();
            setStoryFlag("mapTurnedIn");
        }
        guild = "Explorer";
        view.requestUpdate("adjustGoldCost", {varName: "Excursion", cost: Action.Excursion.goldCost()});
    }
});
function fullyExploredZones() {
    let fullyExplored = 0;
    towns.forEach((town, index) => {
        if (town.getLevel(`SurveyZ${index}`) == 100) fullyExplored++;
    })
    return fullyExplored;
}
function getTotalExploreProgress() {
    //TotalExploreProgress == total of all zones' survey progress.
    let totalExploreProgress = 0;
    towns.forEach((town, index) => {
        if (town.getLevel("SurveyZ"+index)) totalExploreProgress += town.getLevel("SurveyZ"+index);
    });
    return totalExploreProgress;
}
function getExploreProgress() {
    //ExploreProgress == mean of all zones' survey progress, rounded down.
    const totalExploreProgress = getTotalExploreProgress();
    if (totalExploreProgress == 0) return 0;
    else return Math.max(Math.floor(totalExploreProgress / towns.length), 1);
}
function getExploreExp() {
    //ExploreExp == total survey exp across all zones
    let totalExploreExp = 0;
    towns.forEach((town, index) => {
        if (town.getLevel("SurveyZ"+index)) totalExploreExp += town[`expSurveyZ${index}`];
    });
    return totalExploreExp;
}
function getExploreExpSinceLastProgress() {
    const totalExploreProgress = getTotalExploreProgress();
    if (totalExploreProgress === 100 * towns.length) return 1;
    let levelsSinceLastProgress = totalExploreProgress <= 1 ? 1
                                : totalExploreProgress < towns.length * 2 ? totalExploreProgress - 1
                                : totalExploreProgress % towns.length + 1;
    /** @type {{[I in TownNum]?: number}} */
    const levelsPerTown = {};
    /** @param {Town} town  */
    function expSinceLast(town) {
        const varName = `SurveyZ${town.index}`;
        const level = town.getLevel(varName) - (levelsPerTown[town.index] ?? 0);
        if (level === 0 || level === 100) return Infinity;
        if (levelsPerTown[town.index]) {
            return getExpOfSingleLevel(level);
        } else {
            const curExp = town[`exp${varName}`];
            return curExp - getExpOfLevel(level) + 1;
        }
    }
    const townsByExpOrder = [...towns].sort((a, b) => expSinceLast(a) - expSinceLast(b));
    let totalExpGained = 0;
    while (levelsSinceLastProgress--) {
        totalExpGained += expSinceLast(townsByExpOrder[0]);
        const index = townsByExpOrder[0].index;
        levelsPerTown[index] ??= 0;
        levelsPerTown[index]++;
        townsByExpOrder.sort((a, b) => expSinceLast(a) - expSinceLast(b));
    }
    return totalExpGained;
}
function getExploreExpToNextProgress() {
    const totalExploreProgress = getTotalExploreProgress();
    if (totalExploreProgress === 100 * towns.length) return 0;
    let levelsToNextProgress = totalExploreProgress === 0 ? 1
                             : totalExploreProgress < towns.length * 2 ? towns.length * 2 - totalExploreProgress
                             : towns.length - (totalExploreProgress % towns.length);
    /** @type {{[I in TownNum]?: number}} */
    const levelsPerTown = {};
    /** @param {Town} town  */
    function expToNext(town) {
        const varName = `SurveyZ${town.index}`;
        const level = town.getLevel(varName) + (levelsPerTown[town.index] ?? 0);
        if (level >= 100) return Infinity;
        if (levelsPerTown[town.index]) {
            // we're at a level boundary so we can shortcut
            return getExpOfSingleLevel(level + 1);
        } else {
            return getExpOfLevel(level + 1) - town[`exp${varName}`];
        }
    }
    const townsByExpOrder = [...towns].sort((a, b) => expToNext(a) - expToNext(b));
    let totalExpNeeded = 0;
    while (levelsToNextProgress--) {
        totalExpNeeded += expToNext(townsByExpOrder[0]);
        const index = townsByExpOrder[0].index;
        levelsPerTown[index] ??= 0;
        levelsPerTown[index]++;
        townsByExpOrder.sort((a, b) => expToNext(a) - expToNext(b));
    }
    return totalExpNeeded;
}
function getExploreSkill() {
    return Math.floor(Math.sqrt(getExploreProgress()));
}
function exchangeMap() {
    let unfinishedSurveyZones = [];
    towns.forEach((town, index) => {
        if (town.getLevel("Survey") < 100) unfinishedSurveyZones.push(index);
    });
    //For each completed map, give 2*ExploreSkill survey exp to a random unfinished zone's
    //survey progress (if no unfinished zones remain, skip all of this.)
    while (resources.completedMap > 0 && unfinishedSurveyZones.length > 0) {
        let rand = unfinishedSurveyZones[Math.floor(Math.random() * unfinishedSurveyZones.length)];
        let name = "expSurveyZ"+rand;
        towns[rand][name] += getExploreSkill() * 2;
        if (towns[rand][name] >= 505000) {
            towns[rand][name] = 505000;
            for(var i = 0; i < unfinishedSurveyZones.length; i++)
                if ( unfinishedSurveyZones[i] === rand)
                    unfinishedSurveyZones.splice(i, 1);
        }
        view.requestUpdate("updateProgressAction", {name: "SurveyZ"+rand, town: towns[rand]});
        addResource("completedMap", -1);
    }
}

Action.ThievesGuild = new MultipartAction("Thieves Guild", {
    type: "multipart",
    expMult: 2,
    townNum: 7,
    varName: "ThievesGuild",
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.thiefGuildTestsTaken;
            case 2: return storyFlags.thiefGuildRankEReached;
            case 3: return storyFlags.thiefGuildRankDReached;
            case 4: return storyFlags.thiefGuildRankCReached;
            case 5: return storyFlags.thiefGuildRankBReached;
            case 6: return storyFlags.thiefGuildRankAReached;
            case 7: return storyFlags.thiefGuildRankSReached;
            case 8: return storyFlags.thiefGuildRankUReached;
            case 9: return storyFlags.thiefGuildRankGodlikeReached;
        }
    },
    stats: {
        Dex: 0.4,
        Per: 0.3,
        Spd: 0.3
    },
    skills: {
        Thievery: 50,
        Practical: 50
    },
    loopStats: ["Per", "Dex", "Spd"],
    manaCost() {
        return 75000;
    },
    allowed() {
        return 1;
    },
    canStart() {
        return guild === "" && resources.reputation < 0;
    },
    loopCost(segment, loopCounter = towns[7][`${this.varName}LoopCounter`]) {
        return precision3(Math.pow(1.2, loopCounter + segment)) * 5e8;
    },
    tickProgress(_offset, _loopCounter, totalCompletions = towns[7][`total${this.varName}`]) {
        return (getSkillLevel("Practical") +
                getSkillLevel("Thievery")) *
                Math.sqrt(1 + totalCompletions / 1000);
    },
    loopsFinished() {
    },
    segmentFinished() {
        curThievesGuildSegment++;
        handleSkillExp(this.skills);
        addResource("gold", 10);
    },
    getPartName() {
        return `Rank ${getThievesGuildRank().name}`;
    },
    getSegmentName(segment) {
        return `Rank ${getThievesGuildRank(segment % 3).name}`;
    },
    visible() {
        return towns[7].getLevel("Excursion") >= 20;
    },
    unlocked() {
        return towns[7].getLevel("Excursion") >= 25;
    },
    finish() {
        guild = "Thieves";
        view.requestUpdate("adjustGoldCost", {varName: "Excursion", cost: Action.Excursion.goldCost()});
        handleSkillExp(this.skills);
        setStoryFlag("thiefGuildTestsTaken");
        if (curThievesGuildSegment >= 3) setStoryFlag("thiefGuildRankEReached");
        if (curThievesGuildSegment >= 6) setStoryFlag("thiefGuildRankDReached");
        if (curThievesGuildSegment >= 9) setStoryFlag("thiefGuildRankCReached");
        if (curThievesGuildSegment >= 12) setStoryFlag("thiefGuildRankBReached");
        if (curThievesGuildSegment >= 15) setStoryFlag("thiefGuildRankAReached");
        if (curThievesGuildSegment >= 18) setStoryFlag("thiefGuildRankSReached");
        if (curThievesGuildSegment >= 30) setStoryFlag("thiefGuildRankUReached");
        if (curThievesGuildSegment >= 42) setStoryFlag("thiefGuildRankGodlikeReached");
    },
});
function getThievesGuildRank(offset) {
    let name = ["F", "E", "D", "C", "B", "A", "S", "SS", "SSS", "SSSS", "U", "UU", "UUU", "UUUU"][Math.floor(curThievesGuildSegment / 3 + 0.00001)];

    const segment = (offset === undefined ? 0 : offset - (curThievesGuildSegment % 3)) + curThievesGuildSegment;
    let bonus = precision3(1 + segment / 20 + Math.pow(segment, 2) / 300);
    if (name) {
        if (offset === undefined) {
            name += ["-", "", "+"][curThievesGuildSegment % 3];
        } else {
            name += ["-", "", "+"][offset % 3];
        }
    } else {
        name = "Godlike";
        bonus = 10;
    }
    name += `, Mult x${bonus}`;
    return { name, bonus };
}

Action.PickPockets = new Action("Pick Pockets", {
    type: "progress",
    expMult: 1.5,
    townNum: 7,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return towns[7].getLevel("PickPockets") >= 1;
            case 2: return towns[7].getLevel("PickPockets") >= 10;
            case 3: return towns[7].getLevel("PickPockets") >= 20;
            case 4: return towns[7].getLevel("PickPockets") >= 40;
            case 5: return towns[7].getLevel("PickPockets") >= 60;
            case 6: return towns[7].getLevel("PickPockets") >= 80;
            case 7: return towns[7].getLevel("PickPockets") >= 100;
        }
    },
    stats: {
        Dex: 0.4,
        Spd: 0.4,
        Luck: 0.2
    },
    skills: {
        Thievery() {
            return 10 * (1 + towns[7].getLevel("PickPockets") / 100);
        }
    },
    affectedBy: ["Thieves Guild"],
    allowed() {
        return towns[7].totalPockets;
    },
    canStart() {
        return guild === "Thieves";
    },
    manaCost() {
        return 20000;
    },
    visible() {
        return getSkillLevel("Thievery") > 0;
    },
    unlocked() {
        return getSkillLevel("Thievery") > 0;
    },
    goldCost() {
        return Math.floor(2 * getSkillBonus("Thievery"));
    },
    finish() {
        towns[7].finishProgress(this.varName, 30 * getThievesGuildRank().bonus);
        handleSkillExp(this.skills);
        view.requestUpdate("adjustExpGain", Action.ThievesGuild);
        const goldGain = Math.floor(this.goldCost() * getThievesGuildRank().bonus);
        addResource("gold", goldGain);
        return goldGain;
    },
});

Action.RobWarehouse = new Action("Rob Warehouse", {
    type: "progress",
    expMult: 2,
    townNum: 7,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return towns[7].getLevel("RobWarehouse") >= 1;
            case 2: return towns[7].getLevel("RobWarehouse") >= 10;
            case 3: return towns[7].getLevel("RobWarehouse") >= 20;
            case 4: return towns[7].getLevel("RobWarehouse") >= 40;
            case 5: return towns[7].getLevel("RobWarehouse") >= 60;
            case 6: return towns[7].getLevel("RobWarehouse") >= 80;
            case 7: return towns[7].getLevel("RobWarehouse") >= 100;
        }
    },
    stats: {
        Dex: 0.4,
        Spd: 0.2,
        Int: 0.2,
        Luck: 0.2
    },
    skills: {
        Thievery() {
            return 20 * (1 + towns[7].getLevel("RobWarehouse") / 100);
        }
    },
    affectedBy: ["Thieves Guild"],
    allowed() {
        return towns[7].totalWarehouses;
    },
    canStart() {
        return guild === "Thieves";
    },
    manaCost() {
        return 50000;
    },
    visible() {
        return towns[7].getLevel("PickPockets") >= 25;
    },
    unlocked() {
        return towns[7].getLevel("PickPockets") >= 100;
    },
    goldCost() {
        return Math.floor(20 * getSkillBonus("Thievery"));
        },
    finish() {
        towns[7].finishProgress(this.varName, 20 * getThievesGuildRank().bonus);
        handleSkillExp(this.skills);
        view.requestUpdate("adjustExpGain", Action.ThievesGuild);
        const goldGain = Math.floor(this.goldCost() * getThievesGuildRank().bonus);
        addResource("gold", goldGain);
        return goldGain;
    },
});

Action.InsuranceFraud = new Action("Insurance Fraud", {
    type: "progress",
    expMult: 2.5,
    townNum: 7,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return towns[7].getLevel("InsuranceFraud") >= 1;
            case 2: return towns[7].getLevel("InsuranceFraud") >= 10;
            case 3: return towns[7].getLevel("InsuranceFraud") >= 20;
            case 4: return towns[7].getLevel("InsuranceFraud") >= 40;
            case 5: return towns[7].getLevel("InsuranceFraud") >= 60;
            case 6: return towns[7].getLevel("InsuranceFraud") >= 75;
            case 7: return towns[7].getLevel("InsuranceFraud") >= 100;
        }
    },
    stats: {
        Dex: 0.2,
        Spd: 0.2,
        Int: 0.3,
        Luck: 0.3
    },
    skills: {
        Thievery() {
            return 40 * (1 + towns[7].getLevel("InsuranceFraud") / 100);
        }
    },
    affectedBy: ["Thieves Guild"],
    allowed() {
        return towns[7].totalInsurance;
    },
    canStart() {
        return guild === "Thieves";
    },
    manaCost() {
        return 100000;
    },
    visible() {
        return towns[7].getLevel("RobWarehouse") >= 50;
    },
    unlocked() {
        return towns[7].getLevel("RobWarehouse") >= 100;
    },
    goldCost() {
        return Math.floor(200 * getSkillBonus("Thievery"));
    },
    finish() {
        towns[7].finishProgress(this.varName, 10 * getThievesGuildRank().bonus);
        handleSkillExp(this.skills);
        view.requestUpdate("adjustExpGain", Action.ThievesGuild);
        const goldGain = Math.floor(this.goldCost() * getThievesGuildRank().bonus);
        addResource("gold", goldGain);
        return goldGain;
    },
});

Action.GuildAssassin = new Action("Guild Assassin", {
    type: "normal",
    expMult: 1,
    townNum: 7,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return getSkillLevel("Assassin") > 0;
            case 2: return storyFlags.assassinHeartDelivered;
            case 3: return totalAssassinations() >= 4;
            case 4: return storyFlags.assassin4HeartsDelivered;
            case 5: return totalAssassinations() >= 8;
            case 6: return storyFlags.assassin8HeartsDelivered;
        }
    },
    stats: {
        Per: 0.1,
        Cha: 0.3,
        Dex: 0.4,
        Luck: 0.2
    },
    skills: {
        Assassin: 100
    },
    manaCost() {
        return 100000;
    },
    allowed() {
        return 1;
    },
    canStart() {
        return guild === "";
    },
    visible() {
        return towns[this.townNum].getLevel("InsuranceFraud") >= 75;
    },
    unlocked() {
        return towns[this.townNum].getLevel("InsuranceFraud") >= 100;
    },
    finish() {
        if (resources.heart >= 1) setStoryFlag("assassinHeartDelivered");
        if (resources.heart >= 4) setStoryFlag("assassin4HeartsDelivered");
        if (resources.heart >= 8) setStoryFlag("assassin8HeartsDelivered");
        let assassinExp = 0;
        if (getSkillLevel("Assassin") === 0) assassinExp = 100;
        if (resources.heart > 0) assassinExp = 100 * Math.pow(resources.heart, 2);
        this.skills.Assassin = assassinExp;
        handleSkillExp(this.skills);
        globalThis.IdleLoopsResourceState.setResourceValue(resources, "heart", 0);
        guild = "Assassin";
    }
});

function totalAssassinations(){
    //Counts all zones with at least one successful assassination.
    let total = 0;
    for (var i = 0; i < towns.length; i++)
    {
        if (towns[i][`totalAssassinZ${i}`] > 0) total++
    }
    return total;
}

Action.Invest = new Action("Invest", {
    type: "normal",
    expMult: 1,
    townNum: 7,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.investedOne;
            case 2: return storyFlags.investedTwo;
            case 3: return goldInvested >= 1000000;
            case 4: return goldInvested >= 1000000000;
            case 5: return goldInvested == 999999999999;
        }
    },
    stats: {
        Con: 0.4,
        Per: 0.3,
        Spd: 0.3
    },
    skills: {
        Mercantilism: 100
    },
    allowed() {
        return 1;
    },
    manaCost() {
        return 50000;
    },
    canStart() {
        return resources.gold > 0;
    },
    visible() {
        return true;
    },
    unlocked() {
        return true;
    },
    finish() {
        handleSkillExp(this.skills);
        //Needed for Mercantilism levelup
        view.requestUpdate("adjustGoldCosts");

        //Looks like something (maybe very high accelerations?) can give you a gold value of NaN.  If so, don't corrupt
        //the save file
        if (isFinite(resources.gold))
        {
            goldInvested = globalThis.IdleLoopsMetaProgression.addGoldInvestment(goldInvested, resources.gold);

            //Don't reset the gold value if it's NaN.  This should make it a bit easier to see what went wrong.
            resetResource("gold");
        }
        if (storyFlags.investedOne) setStoryFlag("investedTwo");
        setStoryFlag("investedOne");
        view.requestUpdate("updateActionTooltips", null);
    },
});

Action.CollectInterest = new Action("Collect Interest", {
    type: "normal",
    expMult: 1,
    townNum: 7,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.interestCollected;
            case 2: return storyFlags.collected1KInterest;
            case 3: return storyFlags.collected1MInterest;
            case 4: return storyFlags.collectedMaxInterest;
        }
    },
    stats: {
        Con: 0.4,
        Per: 0.3,
        Spd: 0.3
    },
    skills: {
        Mercantilism: 50
    },
    allowed() {
        return 1;
    },
    manaCost() {
        return 1;
    },
    canStart() {
        return true;
    },
    visible() {
        return true;
    },
    unlocked() {
        return true;
    },
    finish() {
        handleSkillExp(this.skills);
        //Needed for Mercantilism levelup
        view.requestUpdate("adjustGoldCosts");

        let interestGold = Math.floor(goldInvested * .001);
        addResource("gold", interestGold);
        setStoryFlag("interestCollected");
        if (interestGold >= 1000) setStoryFlag("collected1KInterest");
        if (interestGold >= 1000000) setStoryFlag("collected1MInterest");
        if (interestGold >= 999999999) setStoryFlag("collectedMaxInterest");
        return interestGold;
    },
});

Action.Seminar = new Action("Seminar", {
    type: "normal",
    expMult: 1,
    townNum: 7,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.seminarAttended;
            case 2: return storyFlags.leadership10;
            case 3: return storyFlags.leadership100;
            case 4: return storyFlags.leadership1k;
        }
    },
    stats: {
        Cha: 0.8,
        Luck: 0.1,
        Soul: 0.1
    },
    skills: {
        Leadership: 200
    },
    manaCost() {
        return 20000;
    },
    canStart() {
        return resources.gold >= 1000;
    },
    cost() {
        addResource("gold", -1000);
    },
    visible() {
        return towns[this.townNum].getLevel("Survey") >= 100;
    },
    unlocked() {
        return towns[this.townNum].getLevel("Survey") >= 100;
    },
    goldCost() {
        return 1000;
    },
    finish() {
        handleSkillExp(this.skills);
        let leadershipLevel = getSkillLevel("Leadership");
        if (leadershipLevel >= 10) setStoryFlag("leadership10");
        if (leadershipLevel >= 100) setStoryFlag("leadership100");
        if (leadershipLevel >= 1000) setStoryFlag("leadership1k");
        setStoryFlag("seminarAttended");
    },
});

Action.PurchaseKey = new Action("Purchase Key", {
    type: "normal",
    expMult: 1,
    townNum: 7,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.keyBought;
        }
    },
    stats: {
        Cha: 0.8,
        Luck: 0.1,
        Soul: 0.1
    },
    allowed() {
        return 1;
    },
    manaCost() {
        return 20000;
    },
    canStart() {
        return resources.gold >= 1000000 && !resources.key;
    },
    cost() {
        addResource("gold", -1000000);
    },
    visible() {
        return true;
    },
    unlocked() {
        return true;
    },
    goldCost() {
        return 1000000;
    },
    finish() {
        addResource("key", true);
        setStoryFlag("keyBought");
    },
});

Action.SecretTrial = new TrialAction("Secret Trial", 3, {
    //1000 floors
    type: "multipart",
    expMult: 0,
    townNum: 7,
    varName: "STrial",
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.trailSecretFaced;
            case 2: return storyFlags.trailSecret1Done;
            case 3: return storyFlags.trailSecret10Done;
            case 4: return storyFlags.trailSecret100Done;
            case 5: return storyFlags.trailSecret500Done;
            case 6: return storyFlags.trailSecretAllDone;
        }
    },
    stats: {
        Dex: 0.11,
        Str: 0.11,
        Con: 0.11,
        Spd: 0.11,
        Per: 0.11,
        Cha: 0.11,
        Int: 0.11,
        Luck: 0.11,
        Soul: 0.11
    },
    loopStats: ["Dex", "Str", "Con", "Spd", "Per", "Cha", "Int", "Luck", "Soul"],
    affectedBy: ["Team"],
    baseScaling: 1.25,
    exponentScaling: 1e10,
    manaCost() {
        return 100000;
    },
    canStart() {
        return this.currentFloor() < trialFloors[this.trialNum];
    },
    baseProgress() {
        return getTeamCombat();
    },
    floorReward() {
        //None
    },
    visible() {
        return storyMax >= 12 && getBuffLevel("Imbuement3") >= 7;
    },
    unlocked() {
        return storyMax >= 12 && getBuffLevel("Imbuement3") >= 7;
    },
    finish() {
        setStoryFlag("trailSecretFaced");
        let floor = this.currentFloor();
        if (floor >= 1) setStoryFlag("trailSecret1Done");
        if (floor >= 10) setStoryFlag("trailSecret10Done");
        if (floor >= 100) setStoryFlag("trailSecret100Done");
        if (floor >= 500) setStoryFlag("trailSecret500Done");
        if (floor == 1000) setStoryFlag("trailSecretAllDone");
    },
});

Action.LeaveCity = new Action("Leave City", {
    type: "normal",
    expMult: 2,
    townNum: 7,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return townsUnlocked.includes(8);
        }
    },
    stats: {
        Con: 0.4,
        Per: 0.3,
        Spd: 0.3
    },
    allowed() {
        return 1;
    },
    manaCost() {
        return 100000;
    },
    cost() {
        addResource("key", false);
    },
    canStart() {
        return resources.key;
    },
    visible() {
        return true;
    },
    unlocked() {
        return true;
    },
    finish() {
        unlockTown(8);
    },
    story(completed) {
        unlockGlobalStory(11);
    }
});

//====================================================================================================
//Zone 9 - Valley of Olympus
//====================================================================================================
Action.ImbueSoul = new MultipartAction("Imbue Soul", {
    type: "multipart",
    expMult: 5,
    townNum: 8,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.soulInfusionAttempted;
            //Protect these with a check for soulInfusionAttempted, so they don't "finish" instantly
            //on prestige.
            case 2: return storyFlags.soulInfusionAttempted && buffs["Imbuement3"].amt > 0;
            case 3: return storyFlags.soulInfusionAttempted && buffs["Imbuement3"].amt > 6;
            case 4: return storyFlags.soulInfusionAttempted &&
                        buffs["Imbuement"].amt > 499 &&
                        buffs["Imbuement2"].amt > 499 &&
                        buffs["Imbuement3"].amt > 6;
        }
    },
    stats: {
        Soul: 1.0
    },
    loopStats: ["Soul", "Soul", "Soul"],
    manaCost() {
        return 5000000;
    },
    allowed() {
        return 1;
    },
    canStart(loopCounter = towns[8].ImbueSoulLoopCounter) {
        return loopCounter === 0 && getBuffLevel("Imbuement") > 499 && getBuffLevel("Imbuement2") > 499 && getBuffLevel("Imbuement3") < 7;
    },
    loopCost(segment) {
        return 100000000 * (segment * 5 + 1);
    },
    tickProgress(offset) {
        return getSkillLevel("Magic");
    },
    grantsBuff: "Imbuement3",
    loopsFinished() {
        for (const stat of globalThis.IdleLoopsCharacterState.resetTalentAndSoulstones(stats, statList)) {
            view.requestUpdate("updateStat", stat);
        }
        globalThis.IdleLoopsCharacterState.resetBuffAmounts(buffs, ["Imbuement", "Imbuement2"]);
        trainingLimits = globalThis.IdleLoopsMetaProgression.resetTrainingLimits();
        addBuffAmt("Imbuement3", 1, this, "imbuement3");
        view.updateBuffs();
        view.updateStats();
        view.requestUpdate("updateSoulstones", null);
    },
    getPartName() {
        return "Imbue Soul";
    },
    visible() {
        return true;
    },
    unlocked() {
        return getBuffLevel("Imbuement") > 499 && getBuffLevel("Imbuement2") > 499;
    },
    finish() {
        setStoryFlag("soulInfusionAttempted")
        view.requestUpdate("updateBuff", "Imbuement3");
        capAllTraining();
        adjustTrainingExpMult();
    },
});

function adjustTrainingExpMult() {
    for (let actionName of trainingActions)
    {
        const actionProto = getActionPrototype(actionName);
        // @ts-ignore shh we're pretending it's frozen
        actionProto.expMult = 4 + getBuffLevel("Imbuement3");
        view.adjustExpMult(actionName);
    }
}

Action.BuildTower = new Action("Build Tower", {
    type: "progress",
    progressScaling: "linear",
    expMult: 1,
    townNum: 8,
    storyReqs(storyNum) {
        let buildingProg = towns[this.townNum].expBuildTower / 505;
        switch(storyNum) {
            case 1: return buildingProg >= 1;
            case 2: return buildingProg >= 10;
            case 3: return buildingProg >= 100;
            case 4: return buildingProg >= 250;
            case 5: return buildingProg >= 500;
            case 6: return buildingProg >= 750;
            case 7: return buildingProg >= 999;
        }
    },
    stats: {
        Dex: 0.1,
        Str: 0.3,
        Con: 0.3,
        Per: 0.2,
        Spd: 0.1
    },
    affectedBy: ["Temporal Stone"],
    manaCost() {
        return 250000;
    },
    canStart() {
        return resources.stone;
    },
    visible() {
        return true;
    },
    unlocked() {
        return true;
    },
    finish() {
        stonesUsed = globalThis.IdleLoopsMetaProgression.incrementStoneUse(stonesUsed, stoneLoc);
        towns[this.townNum].finishProgress(this.varName, 505);
        addResource("stone", false);
        if (towns[this.townNum].getLevel(this.varName) >= 100) {
            stonesUsed = globalThis.IdleLoopsMetaProgression.createMaxedStoneUseState();
        }
        adjustRocks(stoneLoc);
    },
});

Action.GodsTrial = new TrialAction("Gods Trial", 1, {
    //100 floors
    type: "multipart",
    expMult: 0.2,
    townNum: 8,
    varName: "GTrial",
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.trailGodsFaced;
            case 2: return storyFlags.trailGods10Done;
            case 3: return storyFlags.trailGods20Done;
            case 4: return storyFlags.trailGods30Done;
            case 5: return storyFlags.trailGods40Done;
            case 6: return storyFlags.trailGods50Done;
            case 7: return storyFlags.trailGods60Done;
            case 8: return storyFlags.trailGods70Done;
            case 9: return storyFlags.trailGods80Done;
            case 10: return storyFlags.trailGods90Done;
            case 11: return storyFlags.trailGodsAllDone;
        }
    },
    stats: {
        Dex: 0.11,
        Str: 0.11,
        Con: 0.11,
        Spd: 0.11,
        Per: 0.11,
        Cha: 0.11,
        Int: 0.11,
        Luck: 0.11,
        Soul: 0.11
    },
    skills: {
        Combat: 250,
        Pyromancy: 50,
        Restoration: 50
    },
    loopStats: ["Dex", "Str", "Con", "Spd", "Per", "Cha", "Int", "Luck", "Soul"],
    affectedBy: ["Team"],
    baseScaling: 1.3,
    exponentScaling: 1e7,
    manaCost() {
        return 50000;
    },
    canStart() {
        return this.currentFloor() < trialFloors[this.trialNum] && resources.power < 7;
    },
    baseProgress() {
        return getTeamCombat();
    },
    floorReward() {
        setStoryFlag("trailGodsFaced");
        if (this.currentFloor() >= 10) setStoryFlag("trailGods10Done");
        if (this.currentFloor() >= 20) setStoryFlag("trailGods20Done");
        if (this.currentFloor() >= 30) setStoryFlag("trailGods30Done");
        if (this.currentFloor() >= 40) setStoryFlag("trailGods40Done");
        if (this.currentFloor() >= 50) setStoryFlag("trailGods50Done");
        if (this.currentFloor() >= 60) setStoryFlag("trailGods60Done");
        if (this.currentFloor() >= 70) setStoryFlag("trailGods70Done");
        if (this.currentFloor() >= 80) setStoryFlag("trailGods80Done");
        if (this.currentFloor() >= 90) setStoryFlag("trailGods90Done");

        if (this.currentFloor() === trialFloors[this.trialNum]) //warning: the predictor assumes the old behavior, but this is clearly the intended
        {
            setStoryFlag("trailGodsAllDone");
            addResource("power", 1);
        }
    },
    visible() {
        return towns[this.townNum].getLevel("BuildTower") >= 100;
    },
    unlocked() {
        return towns[this.townNum].getLevel("BuildTower") >= 100;
    },
    finish() {
        handleSkillExp(this.skills);
    },
});

Action.ChallengeGods = new TrialAction("Challenge Gods", 2, {
    //7 floors
    type: "multipart",
    expMult: 0.5,
    townNum: 8,
    varName: "GFight",
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyFlags.fightGods01;
            case 2: return storyFlags.fightGods02;
            case 3: return storyFlags.fightGods03;
            case 4: return storyFlags.fightGods04;
            case 5: return storyFlags.fightGods05;
            case 6: return storyFlags.fightGods06;
            case 7: return storyFlags.fightGods07;
            case 8: return storyFlags.fightGods08;
            case 9: return storyFlags.fightGods09;
            case 10: return storyFlags.fightGods10;
            case 11: return storyFlags.fightGods11;
            case 12: return storyFlags.fightGods12;
            case 13: return storyFlags.fightGods13;
            case 14: return storyFlags.fightGods14;
            case 15: return storyFlags.fightGods15;
            case 16: return storyFlags.fightGods16;
            case 17: return storyFlags.fightGods17;
            case 18: return storyFlags.fightGods18;
        }
    },
    stats: {
        Dex: 0.11,
        Str: 0.11,
        Con: 0.11,
        Spd: 0.11,
        Per: 0.11,
        Cha: 0.11,
        Int: 0.11,
        Luck: 0.11,
        Soul: 0.11
    },
    skills: {
        Combat: 500,
    },
    loopStats: ["Dex", "Str", "Con", "Spd", "Per", "Cha", "Int", "Luck", "Soul"],
    baseScaling: 2,
    exponentScaling: 1e16,
    manaCost() {
        return 50000;
    },
    canStart() {
        return this.currentFloor() < trialFloors[this.trialNum] && resources.power > 0 && resources.power < 8;
    },
    baseProgress() {
        return getSelfCombat();
    },
    floorReward() {
        addResource("power", 1);
    },
    visible() {
        return towns[this.townNum].getLevel("BuildTower") >= 100;
    },
    unlocked() {
        return towns[this.townNum].getLevel("BuildTower") >= 100;
    },
    finish() {
        handleSkillExp(this.skills);
    },
    segmentFinished() {
        curGodsSegment++;
        //Round 7 is segments 55 through 63
        switch(curGodsSegment) {
            case 1:
                setStoryFlag("fightGods01");
                break;
            case 2:
                setStoryFlag("fightGods03");
                break;
            case 3:
                setStoryFlag("fightGods05");
                break;
            case 4:
                setStoryFlag("fightGods07");
                break;
            case 5:
                setStoryFlag("fightGods09");
                break;
            case 6:
                setStoryFlag("fightGods11");
                break;
            case 7:
                setStoryFlag("fightGods13");
                break;
            case 8:
                setStoryFlag("fightGods15");
                break;
            case 9:
                setStoryFlag("fightGods17");
                break;
            case 55:
                if (getTalent("Dex") > 500000) setStoryFlag("fightGods02");
                break;
            case 56:
                if (getTalent("Str") > 500000) setStoryFlag("fightGods04");
                break;
            case 57:
                if (getTalent("Con") > 500000) setStoryFlag("fightGods06");
                break;
            case 58:
                if (getTalent("Spd") > 500000) setStoryFlag("fightGods08");
                break;
            case 59:
                if (getTalent("Per") > 500000) setStoryFlag("fightGods10");
                break;
            case 60:
                if (getTalent("Cha") > 500000) setStoryFlag("fightGods12");
                break;
            case 61:
                if (getTalent("Int") > 500000) setStoryFlag("fightGods14");
                break;
            case 62:
                if (getTalent("Luck")> 500000) setStoryFlag("fightGods16");
                break;
            case 63:
                if (getTalent("Soul")> 500000) setStoryFlag("fightGods18");
                break;
            default: break;
        }
    },
});

Action.RestoreTime = new Action("Restore Time", {
    type: "normal",
    expMult: 0,
    townNum: 8,
    storyReqs(storyNum) {
        switch(storyNum) {
            case 1: return storyMax >= 12;
        }
    },
    stats: {
        Luck: 0.5,
        Soul: 0.5,
    },
    allowed() {
        return 1;
    },
    manaCost() {
        return 7777777;
    },
    canStart() {
        return resources.power >= 8;
    },
    visible() {
        return towns[this.townNum].getLevel("BuildTower") >= 100;
    },
    unlocked() {
        return towns[this.townNum].getLevel("BuildTower") >= 100;
    },
    finish() {
        addResource("reputation", 9999999);
        completedCurrentGame();
    },
    story(completed) {
        unlockGlobalStory(12);
    }
});

const actionsWithGoldCost = Object.values(Action).filter(
    action => action.goldCost !== undefined
);
