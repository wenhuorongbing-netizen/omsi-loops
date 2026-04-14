"use strict";

let screenSize;

class View {
    initalize() {
        this.createTravelMenu();
        this.createStats();
        this.updateStats();
        this.updateSkills();
        this.adjustDarkRitualText();
        this.updateBuffs();
        this.updateTime();
        this.updateCurrentActionsDivs();
        this.updateTotalTicks();
        this.updateAddAmount(1);
        this.initializeActionCategoryLegend();
        this.initializeTownBrowserTools();
        this.createTownActions();
        this.updateProgressActions();
        this.updateLockedHidden();
        this.updateSoulstones();
        this.showTown(0);
        this.showActions(false);
        this.updateTrainingLimits();
        this.changeStatView();
        this.changeTheme(true);
        this.adjustGoldCosts();
        this.adjustExpGains();
        this.updateTeamCombat();
        this.updateLoadoutNames();
        this.updateResources();
        this.updateTrials();
        if (storyMax >= 12)
            setInterval(() => {
                view.updateStories();
                view.updateLockedHidden();
            }, 20000);
        else
            setInterval(() => {
                view.updateStories();
                view.updateLockedHidden();
            }, 2000);
        adjustAll();
        this.updateActionTooltips();
        this.initActionLog();
        this.initializeReadingShell();
        this.initializePlannerShell();
        this.initializeLoadoutManager();
        document.body.removeEventListener("mouseover", this.mouseoverHandler);
        document.body.addEventListener("mouseover", this.mouseoverHandler, {passive: true});
        document.body.removeEventListener("focusin", this.mouseoverHandler);
        document.body.addEventListener("focusin", this.mouseoverHandler, {passive: true});
        document.body.removeEventListener("click", this.documentClickHandler);
        document.body.addEventListener("click", this.documentClickHandler);
        document.removeEventListener("keydown", this.keydownHandler);
        document.addEventListener("keydown", this.keydownHandler);
        document.removeEventListener("predictor-update", this.predictorUpdateHandler);
        document.addEventListener("predictor-update", this.predictorUpdateHandler);
        window.removeEventListener("resize", this.responsiveLayoutHandler);
        window.addEventListener("resize", this.responsiveLayoutHandler, {passive: true});
        window.addEventListener("modifierkeychange", this.modifierkeychangeHandler);
        /** @type {WeakMap<HTMLElement, Element | false>} */
        this.tooltipTriggerMap = new WeakMap();
        this.mouseoverCount = 0;
    };

    constructor() {
        this.mouseoverHandler = this.mouseoverHandler.bind(this);
        this.modifierkeychangeHandler = this.modifierkeychangeHandler.bind(this);
        this.documentClickHandler = this.documentClickHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.predictorUpdateHandler = this.predictorUpdateHandler.bind(this);
        this.responsiveLayoutHandler = this.responsiveLayoutHandler.bind(this);
        const savedFilter = window.localStorage.getItem("actionCategoryFilter");
        this.actionCategoryFilter = actionCategories.includes(/** @type {ActionCategory} */(savedFilter))
            ? /** @type {ActionCategory} */(savedFilter)
            : "";
        this.actionCategoryLegendCollapsed = window.localStorage.getItem("actionCategoryLegendCollapsed") === "true";
        this.readingPane = /** @type {"inspector"|"chronicle"|"character"} */("character");
        this.inspectorTab = /** @type {"summary"|"story"|"numbers"} */("summary");
        this.chronicleTab = /** @type {"log"|"chapters"|"stories"} */("log");
        this.chronicleChapter = 0;
        this.chronicleLogFilter = /** @type {"all"|"story"|"chapter"|"growth"|"soulstone"} */(window.localStorage.getItem("chronicleLogFilter") || "all");
        this.chronicleStoryFilter = /** @type {"all"|"unread"|"incomplete"|"currentTown"} */(window.localStorage.getItem("chronicleStoryFilter") || "all");
        this.predictorState = /** @type {"off"|"running"|"ready"|"stale"} */("off");
        this.inspectorSelection = null;
        this.guiLanguage = "";
        this.townActionSearch = window.localStorage.getItem("townActionSearch") ?? "";
        try {
            this.townQuickFilters = JSON.parse(window.localStorage.getItem("townQuickFilters") ?? "{}");
        } catch {
            this.townQuickFilters = {};
        }
        try {
            this.loadoutSaveTimes = JSON.parse(window.localStorage.getItem("loadoutSaveTimes") ?? "{}");
        } catch {
            this.loadoutSaveTimes = {};
        }
        this.loadoutManagerOpen = window.localStorage.getItem("loadoutManagerOpen") === "true";
        const savedPreset = window.localStorage.getItem("uiPreset");
        this.uiPreset = ["classic", "planner", "reader", "compact"].includes(savedPreset)
            ? savedPreset
            : "classic";
        const savedDensity = window.localStorage.getItem("uiDensity");
        this.uiDensity = ["compact", "standard", "large"].includes(savedDensity)
            ? savedDensity
            : "standard";
        this.queueCompactRepeats = window.localStorage.getItem("queueCompactRepeats") === "true";
        try {
            const pinnedTrackedResources = JSON.parse(window.localStorage.getItem("pinnedTrackedResources") ?? "[]");
            this.pinnedTrackedResources = Array.isArray(pinnedTrackedResources)
                ? pinnedTrackedResources.filter(resource => typeof resource === "string")
                : [];
        } catch {
            this.pinnedTrackedResources = [];
        }
    }

    /** @param {UIEvent} event */
    mouseoverHandler(event) {
        if (!(event.target instanceof HTMLElement)) return;
        const trigger = this.getClosestTrigger(event.target);
        this.mouseoverCount++;
        if (trigger) {
            let tooltipSelector = "";
            for (const cls of trigger.classList) {
                if (cls.startsWith("showthat")) {
                    tooltipSelector = `.showthis${cls.slice(8)}`;
                    break;
                }
            }
            if (tooltipSelector === "") {
                console.warn("Could not find tooltip class for trigger! Using generic selector", trigger);
                tooltipSelector = ".showthis,.showthisO,.showthis2,.showthisH,.showthisloadout,.showthisstory";
            }
            for (const tooltip of trigger.querySelectorAll(tooltipSelector)) {
                if (tooltip instanceof HTMLElement)
                    this.fixTooltipPosition(tooltip, trigger, event.target);
            }
        }
    };

    modifierkeychangeHandler() {
        htmlElement("clearList").textContent = shiftDown ? _txt("actions>tooltip>clear_disabled") : _txt("actions>tooltip>clear_list");
    }

    /** @param {HTMLElement} element */
    getClosestTrigger(element) {
        let trigger = this.tooltipTriggerMap.get(element);
        if (trigger == null) {
            trigger = element.closest(".showthat,.showthatO,.showthat2,.showthatH,.showthatloadout,.showthatstory") || false;
            this.tooltipTriggerMap.set(element, trigger);
        }
        return trigger;
    };

    isChineseLanguage() {
        return Localization.currentLang?.startsWith("zh");
    }

    getGuiText(key) {
        const texts = this.isChineseLanguage()
            ? {
                inspector: "检视",
                chronicle: "纪事",
                character: "角色",
                summary: "摘要",
                story: "故事",
                numbers: "数值",
                log: "日志",
                chapters: "章节",
                stories: "行动故事",
                inspectorEmpty: "点击一个行动、故事卡、队列项或日志条目，就会在这里固定显示详情。",
                noStory: "这个对象目前没有可读故事。",
                noNumbers: "这个对象目前没有额外数值说明。",
                noChronicleStories: "当前还没有可读的行动故事。",
                area: "区域",
                role: "功能",
                type: "类型",
                tags: "标签",
                source: "来源",
                queuedLoops: "队列次数",
                queueState: "队列状态",
                selected: "已选中",
                nothingSelected: "未选中对象",
                predictor: "预测器",
                predictorOff: "关闭",
                predictorRunning: "运行中",
                predictorReady: "已完成",
                predictorStale: "过期",
                chapter: "章节",
                actionTypeNormal: "普通",
                actionTypeProgress: "推进条",
                actionTypeLimited: "有限",
                actionTypeMultipart: "多段",
                tagTravel: "旅行",
                tagTeaching: "教学",
                tagTrial: "试炼",
                tagDungeon: "地下城",
                tagBuff: "增益",
                sourceAction: "行动面板",
                sourceStory: "故事卡",
                sourceQueue: "队列",
                sourceLog: "日志",
                queueEnabled: "启用",
                queueDisabled: "停用",
                queueCollapsed: "折叠",
                chapterPrefix: "第",
                chapterSuffix: "章",
            }
            : {
                inspector: "Inspector",
                chronicle: "Chronicle",
                character: "Character",
                summary: "Summary",
                story: "Story",
                numbers: "Numbers",
                log: "Log",
                chapters: "Chapters",
                stories: "Action Stories",
                inspectorEmpty: "Click an action, story card, queue row, or log entry to pin its details here.",
                noStory: "This item does not currently have readable story text.",
                noNumbers: "This item does not currently have extra numeric context.",
                noChronicleStories: "There are no readable action stories yet.",
                area: "Area",
                role: "Role",
                type: "Type",
                tags: "Tags",
                source: "Source",
                queuedLoops: "Queued Loops",
                queueState: "Queue State",
                selected: "Selected",
                nothingSelected: "Nothing selected",
                predictor: "Predictor",
                predictorOff: "Off",
                predictorRunning: "Running",
                predictorReady: "Ready",
                predictorStale: "Stale",
                chapter: "Chapter",
                actionTypeNormal: "Normal",
                actionTypeProgress: "Progress",
                actionTypeLimited: "Limited",
                actionTypeMultipart: "Multipart",
                tagTravel: "Travel",
                tagTeaching: "Teaching",
                tagTrial: "Trial",
                tagDungeon: "Dungeon",
                tagBuff: "Buff",
                sourceAction: "Action Panel",
                sourceStory: "Story Card",
                sourceQueue: "Queue",
                sourceLog: "Log",
                queueEnabled: "Enabled",
                queueDisabled: "Disabled",
                queueCollapsed: "Collapsed",
                chapterPrefix: "Chapter ",
                chapterSuffix: "",
            };
        const extraTexts = this.isChineseLanguage()
            ? {
                townSummaryVisible: "当前可见",
                townSummaryUnread: "未读故事",
                townSummaryShortcut: "快捷路线",
                townSearchPlaceholder: "搜索已见行动",
                townFilterNew: "仅看新内容",
                townFilterUnread: "仅看未读故事",
                townFilterTravelTrial: "仅看旅行/试炼",
                townFilterOff: "未启用",
                queueZoneSeparator: "区域",
            }
            : {
                townSummaryVisible: "Visible",
                townSummaryUnread: "Unread Stories",
                townSummaryShortcut: "Shortcuts",
                townSearchPlaceholder: "Search seen actions",
                townFilterNew: "New Only",
                townFilterUnread: "Unread Stories",
                townFilterTravelTrial: "Travel / Trial",
                townFilterOff: "Off",
                queueZoneSeparator: "Zone",
            };
        const panelTexts = this.isChineseLanguage()
            ? {
                loadoutNoSelection: "未选择预设",
                loadoutSelected: "当前预设",
                loadoutEmpty: "空预设",
                loadoutActions: "项行动",
                loadoutSavedAt: "上次保存",
                loadoutMatchesCurrent: "与当前队列一致",
                loadoutDiffersCurrent: "与当前队列不同",
                loadoutReplaceWarning: "从预设载入会替换当前队列。",
                quickSettingOn: "开",
                quickSettingOff: "关",
                queueCapAction: "封顶",
                queueAddLoop: "增加次数",
                queueRemoveLoop: "减少次数",
                queueSplit: "拆分",
                queueCollapse: "折叠区域",
                queueMoveUp: "上移",
                queueMoveDown: "下移",
                queueDisable: "启用/停用",
                queueRemove: "移除",
                buffGroupTrials: "试炼 / 高塔",
                buffGroupRitual: "献祭 / 灌注",
                buffGroupFeast: "盛宴",
                buffGroupPrestige: "威望",
            }
            : {
                loadoutNoSelection: "No loadout selected",
                loadoutSelected: "Selected Loadout",
                loadoutEmpty: "Empty Slot",
                loadoutActions: "actions",
                loadoutSavedAt: "Saved",
                loadoutMatchesCurrent: "Matches the current queue",
                loadoutDiffersCurrent: "Differs from the current queue",
                loadoutReplaceWarning: "Loading a loadout will replace the current queue.",
                quickSettingOn: "On",
                quickSettingOff: "Off",
                queueCapAction: "Cap action",
                queueAddLoop: "Add loops",
                queueRemoveLoop: "Remove loops",
                queueSplit: "Split row",
                queueCollapse: "Collapse zone",
                queueMoveUp: "Move up",
                queueMoveDown: "Move down",
                queueDisable: "Enable or disable",
                queueRemove: "Remove action",
                buffGroupTrials: "Trials / Spire",
                buffGroupRitual: "Sacrifice / Imbuement",
                buffGroupFeast: "Feast",
                buffGroupPrestige: "Prestige",
            };
        panelTexts.plannerPredictorHeading = this.isChineseLanguage() ? "\u9884\u6d4b\u5668" : "Predictor";
        panelTexts.plannerViewHeading = this.isChineseLanguage() ? "\u5e03\u5c40" : "Layout";
        panelTexts.quickSettingsToggles = this.isChineseLanguage() ? "\u5e38\u7528\u5f00\u5173" : "Toggles";
        panelTexts.quickSettingsDensity = this.isChineseLanguage() ? "\u754c\u9762\u5bc6\u5ea6" : "Density";
        panelTexts.densityCompact = this.isChineseLanguage() ? "\u7d27\u51d1" : "Compact";
        panelTexts.densityStandard = this.isChineseLanguage() ? "\u6807\u51c6" : "Standard";
        panelTexts.densityLarge = this.isChineseLanguage() ? "\u5927\u5b57" : "Large";
        panelTexts.chronicleLogAll = this.isChineseLanguage() ? "\u5168\u90e8" : "All";
        panelTexts.chronicleLogStory = this.isChineseLanguage() ? "\u884c\u52a8\u6545\u4e8b" : "Stories";
        panelTexts.chronicleLogChapter = this.isChineseLanguage() ? "\u4e3b\u7ebf\u7ae0\u8282" : "Chapters";
        panelTexts.chronicleLogGrowth = this.isChineseLanguage() ? "\u6210\u957f" : "Growth";
        panelTexts.chronicleLogSoulstone = this.isChineseLanguage() ? "\u9b42\u77f3" : "Soulstones";
        panelTexts.chronicleStoriesAll = this.isChineseLanguage() ? "\u5168\u90e8" : "All";
        panelTexts.chronicleStoriesUnread = this.isChineseLanguage() ? "\u672a\u8bfb" : "Unread";
        panelTexts.chronicleStoriesIncomplete = this.isChineseLanguage() ? "\u672a\u8865\u5b8c" : "Incomplete";
        panelTexts.chronicleStoriesCurrentTown = this.isChineseLanguage() ? "\u5f53\u524d\u533a\u57df" : "Current Area";
        panelTexts.chronicleVisible = this.isChineseLanguage() ? "\u53ef\u89c1" : "Visible";
        panelTexts.chronicleCompleted = this.isChineseLanguage() ? "\u5df2\u8865\u5b8c" : "Completed";
        panelTexts.chronicleZones = this.isChineseLanguage() ? "\u533a\u57df" : "Areas";
        panelTexts.chronicleMatching = this.isChineseLanguage() ? "\u5339\u914d" : "Matching";
        panelTexts.chronicleEntries = this.isChineseLanguage() ? "\u6761\u76ee" : "Entries";
        panelTexts.noChronicleLog = this.isChineseLanguage() ? "\u5f53\u524d\u8fc7\u6ee4\u6761\u4ef6\u4e0b\u6682\u65e0\u65e5\u5fd7\u6761\u76ee\u3002" : "No log entries match the current filter.";
        panelTexts.quickSettingsHelp = this.isChineseLanguage() ? "\u5e2e\u52a9" : "Help";
        panelTexts.simpleTooltips = this.isChineseLanguage() ? "\u7b80\u5316\u63d0\u793a" : "Simple Tooltips";
        panelTexts.simpleTooltipsTooltip = this.isChineseLanguage()
            ? "\u4e00\u952e\u964d\u4f4e hover \u63d0\u793a\u7684\u5bc6\u5ea6\uff0c\u5b8c\u6574\u6570\u503c\u4ecd\u4fdd\u7559\u5728 Inspector \u91cc\u3002"
            : "Reduce hover tooltip density in one click. Full detail stays available in the Inspector.";
        panelTexts.simpleTooltipHint = this.isChineseLanguage()
            ? "\u5df2\u542f\u7528\u7b80\u5316\u63d0\u793a\uff1a\u8fd9\u91cc\u53ea\u4fdd\u7559\u57fa\u7840\u4fe1\u606f\uff0c\u5b8c\u6574\u6570\u503c\u8bf7\u5728 Inspector \u91cc\u67e5\u770b\u3002"
            : "Simple Tooltips is on: hover shows only the essentials. Open the Inspector for the full numeric breakdown.";
        panelTexts.viewHotkeys = this.isChineseLanguage() ? "\u67e5\u770b\u952e\u4f4d" : "View Hotkeys";
        panelTexts.hotkeyReferenceTitle = this.isChineseLanguage() ? "\u952e\u4f4d\u53c2\u8003" : "Hotkey Reference";
        panelTexts.hotkeyReferenceIntro = this.isChineseLanguage()
            ? "\u70ed\u952e\u53ea\u5728\u5f00\u542f Hotkeys\uff0c\u4e14\u672a\u805a\u7126\u6587\u672c\u8f93\u5165\u6846\u65f6\u751f\u6548\u3002"
            : "Hotkeys work when Hotkeys is enabled and text inputs are not focused.";
        panelTexts.hotkeyStatusOn = this.isChineseLanguage() ? "\u5df2\u542f\u7528" : "Enabled";
        panelTexts.hotkeyStatusOff = this.isChineseLanguage() ? "\u5df2\u5173\u95ed" : "Disabled";
        return texts[key] ?? extraTexts[key] ?? panelTexts[key] ?? key;
    }

    initializeReadingShell() {
        const chronicleLogPane = htmlElement("chronicleLogBody");
        const actionLogContainer = htmlElement("actionLogContainer");
        if (actionLogContainer.parentElement !== chronicleLogPane) {
            chronicleLogPane.appendChild(actionLogContainer);
        }
        this.refreshGuiLanguage(true);
        this.setReadingPane(this.readingPane);
        this.setInspectorTab(this.inspectorTab);
        this.setChronicleTab(this.chronicleTab);
        this.renderChronicleLogControls();
        this.renderChronicleChapters();
        this.renderChronicleStories();
        this.renderInspector();
        this.updateMobileReadingState();
    }

    initializePlannerShell() {
        this.applyUiPreset();
        this.applyUiDensity();
        this.setPredictorState(options.predictor ? "running" : "off");
        this.updateUiPresetButtons();
        this.updateUiDensityButtons();
        this.updateQueueRepeatToggle();
        this.updatePlannerStatus();
        this.updateQuickSettings();
        this.updateHotkeyReferencePanels();
    }

    getHotkeyReferenceSections() {
        if (this.isChineseLanguage()) {
            return [
                {
                    title: "\u64ad\u653e\u4e0e\u5faa\u73af",
                    items: [
                        ["Space", "\u6682\u505c / \u7ee7\u7eed"],
                        ["R", "\u624b\u52a8\u91cd\u542f\u5faa\u73af"],
                        ["B", "\u5207\u6362\u79bb\u7ebf\u6536\u76ca"],
                    ],
                },
                {
                    title: "\u6392\u8868\u4e0e\u6570\u91cf",
                    items: [
                        ["1-9", "\u5feb\u901f\u8bbe\u5b9a\u6dfb\u52a0\u6b21\u6570"],
                        ["0", "\u628a\u5f53\u524d\u6b21\u6570 x10"],
                        ["Backspace", "\u628a\u5f53\u524d\u6b21\u6570 /10"],
                        ["=", "\u961f\u5217\u5bb9\u91cf +100"],
                        ["-", "\u961f\u5217\u5bb9\u91cf -100"],
                        ["Shift+S / L / C", "\u4fdd\u5b58 / \u8f7d\u5165 / \u6e05\u7a7a\u961f\u5217"],
                        ["Shift+Z", "\u64a4\u9500\u4e0a\u4e00\u6b65"],
                    ],
                },
                {
                    title: "\u9884\u8bbe\u4e0e\u5bfc\u822a",
                    items: [
                        ["Shift+1..5", "\u8f7d\u5165 1-5 \u53f7 Loadout"],
                        ["Left / A", "\u5207\u5230\u4e0a\u4e00\u4e2a\u533a\u57df"],
                        ["Right / D", "\u5207\u5230\u4e0b\u4e00\u4e2a\u533a\u57df"],
                        ["Shift+Left / A", "\u5207\u5230\u884c\u52a8\u9762"],
                        ["Shift+Right / D", "\u5207\u5230\u6545\u4e8b\u9762"],
                    ],
                },
            ];
        }
        return [
            {
                title: "Playback",
                items: [
                    ["Space", "Pause or resume the loop"],
                    ["R", "Restart the current loop"],
                    ["B", "Toggle offline bonus time"],
                ],
            },
            {
                title: "Queue and Amounts",
                items: [
                    ["1-9", "Set the add amount directly"],
                    ["0", "Multiply the current add amount by 10"],
                    ["Backspace", "Divide the current add amount by 10"],
                    ["=", "Increase queue capacity by 100"],
                    ["-", "Decrease queue capacity by 100"],
                    ["Shift+S / L / C", "Save, load, or clear the current queue"],
                    ["Shift+Z", "Undo the last queue edit"],
                ],
            },
            {
                title: "Loadouts and Navigation",
                items: [
                    ["Shift+1..5", "Load loadouts 1 through 5"],
                    ["Left / A", "Move to the previous area"],
                    ["Right / D", "Move to the next area"],
                    ["Shift+Left / A", "Switch to the action list"],
                    ["Shift+Right / D", "Switch to the story list"],
                ],
            },
        ];
    }

    renderHotkeyReferenceHtml() {
        const statusKey = options.hotkeys ? "hotkeyStatusOn" : "hotkeyStatusOff";
        const statusClass = options.hotkeys ? "is-active" : "is-inactive";
        const sections = this.getHotkeyReferenceSections();
        return `
            <div class="hotkeyReferenceHeader">
                <div class="hotkeyReferenceTitle">${this.getGuiText("hotkeyReferenceTitle")}</div>
                <span class="hotkeyReferenceStatus ${statusClass}">${this.getGuiText(statusKey)}</span>
            </div>
            <div class="hotkeyReferenceIntro">${this.getGuiText("hotkeyReferenceIntro")}</div>
            <div class="hotkeyReferenceGrid">
                ${sections.map(section => `
                    <section class="hotkeyReferenceGroup">
                        <div class="hotkeyReferenceGroupTitle">${section.title}</div>
                        <ul class="hotkeyReferenceList">
                            ${section.items.map(([key, description]) => `
                                <li class="hotkeyReferenceRow">
                                    <kbd>${key}</kbd>
                                    <span>${description}</span>
                                </li>
                            `).join("")}
                        </ul>
                    </section>
                `).join("")}
            </div>
        `;
    }

    updateHotkeyReferencePanels() {
        const optionLabel = document.getElementById("simpleTooltipsOptionLabel");
        if (optionLabel instanceof HTMLElement) {
            optionLabel.textContent = this.getGuiText("simpleTooltips");
        }
        const optionTooltip = document.getElementById("simpleTooltipsOptionTooltip");
        if (optionTooltip instanceof HTMLElement) {
            optionTooltip.textContent = this.getGuiText("simpleTooltipsTooltip");
        }
        const helpHeading = document.getElementById("quickSettingsHelpHeading");
        if (helpHeading instanceof HTMLElement) {
            helpHeading.textContent = this.getGuiText("quickSettingsHelp");
        }
        const buttonIds = ["optionsHotkeyReferenceButton", "quickSettingHotkeyReference"];
        for (const id of buttonIds) {
            const button = document.getElementById(id);
            if (button instanceof HTMLElement) {
                button.textContent = this.getGuiText("viewHotkeys");
            }
        }
        const panelHtml = this.renderHotkeyReferenceHtml();
        for (const id of ["hotkeyReferencePanelOptions", "hotkeyReferencePanelQuick"]) {
            const panel = document.getElementById(id);
            if (panel instanceof HTMLElement) {
                panel.innerHTML = panelHtml;
            }
        }
    }

    closeHotkeyReferencePanels() {
        const pairs = [
            ["optionsHotkeyReferenceButton", "hotkeyReferencePanelOptions"],
            ["quickSettingHotkeyReference", "hotkeyReferencePanelQuick"],
        ];
        for (const [buttonId, panelId] of pairs) {
            const button = document.getElementById(buttonId);
            const panel = document.getElementById(panelId);
            if (button instanceof HTMLElement) {
                button.classList.remove("is-active");
                button.setAttribute("aria-expanded", "false");
            }
            if (panel instanceof HTMLElement) {
                panel.classList.add("hidden");
            }
        }
    }

    toggleHotkeyReference(source) {
        const isOptions = source === "options";
        const buttonId = isOptions ? "optionsHotkeyReferenceButton" : "quickSettingHotkeyReference";
        const panelId = isOptions ? "hotkeyReferencePanelOptions" : "hotkeyReferencePanelQuick";
        const button = document.getElementById(buttonId);
        const panel = document.getElementById(panelId);
        if (!(button instanceof HTMLElement) || !(panel instanceof HTMLElement)) return;
        const shouldOpen = panel.classList.contains("hidden");
        this.closeHotkeyReferencePanels();
        if (shouldOpen) {
            this.updateHotkeyReferencePanels();
            panel.classList.remove("hidden");
            button.classList.add("is-active");
            button.setAttribute("aria-expanded", "true");
        }
    }

    getTrackedStatLabel() {
        const select = document.getElementById("predictorTrackedStatInput");
        if (select instanceof HTMLSelectElement) {
            const selectedOption = select.selectedOptions[0];
            const label = selectedOption?.textContent?.trim();
            if (label) return label;
        }
        const trackedStat = globalThis.Koviko?.trackedStats?.[options.predictorTrackedStat];
        if (trackedStat) return `(${trackedStat.type}) ${trackedStat.display_name}`;
        return options.predictorTrackedStat;
    }

    getUiPresetLabel(preset) {
        const labels = this.isChineseLanguage()
            ? {
                classic: "\u7ecf\u5178",
                planner: "\u89c4\u5212",
                reader: "\u9605\u8bfb",
                compact: "\u7d27\u51d1",
            }
            : {
                classic: "Classic",
                planner: "Planner",
                reader: "Reader",
                compact: "Compact",
        };
        return labels[preset] ?? preset;
    }

    getUiDensityLabel(density) {
        return this.getGuiText(`density${density[0].toUpperCase()}${density.slice(1)}`);
    }

    getQueueRepeatToggleLabel() {
        if (this.queueCompactRepeats) {
            return this.isChineseLanguage() ? "\u91cd\u590d\u9879\uff1a\u6298\u53e0" : "Repeat Rows: Compact";
        }
        return this.isChineseLanguage() ? "\u91cd\u590d\u9879\uff1a\u5c55\u5f00" : "Repeat Rows: Full";
    }

    getTrackedResourcePinLabel(isPinned) {
        if (this.isChineseLanguage()) {
            return isPinned ? "\u53d6\u6d88\u7f6e\u9876" : "\u7f6e\u9876\u8d44\u6e90";
        }
        return isPinned ? "Unpin resource" : "Pin resource";
    }

    getInspectorPredictorLabel() {
        return this.isChineseLanguage() ? "\u5c40\u90e8\u9884\u6d4b" : "Local Predictor";
    }

    isMobileReadingUi() {
        return options.responsiveUI && window.matchMedia("(max-width: 810px)").matches;
    }

    updateMobileReadingState() {
        const isMobileReadingUi = this.isMobileReadingUi();
        const isDrawerOpen = isMobileReadingUi && this.readingPane !== "character";
        document.body.classList.toggle("mobile-reading-ui", isMobileReadingUi);
        document.body.classList.toggle("mobile-reading-open", isDrawerOpen);
        htmlElement("statsColumn").dataset.readingDrawer = isDrawerOpen ? "open" : "closed";
    }

    responsiveLayoutHandler() {
        this.updateMobileReadingState();
    }

    handlePredictorTrackedStatChange(value) {
        setOption("predictorTrackedStat", value);
        if (options.predictor) {
            this.setPredictorState("stale");
        } else {
            this.updatePlannerStatus();
        }
        this.renderInspector();
    }

    setUiPreset(preset) {
        if (!["classic", "planner", "reader", "compact"].includes(preset)) return;
        this.uiPreset = preset;
        window.localStorage.setItem("uiPreset", preset);
        this.applyUiPreset();
        this.updateUiPresetButtons();
    }

    applyUiPreset() {
        for (const preset of ["classic", "planner", "reader", "compact"]) {
            document.body.classList.toggle(`ui-preset-${preset}`, this.uiPreset === preset);
        }
        document.body.dataset.uiPreset = this.uiPreset;
    }

    setUiDensity(density) {
        if (!["compact", "standard", "large"].includes(density)) return;
        this.uiDensity = density;
        window.localStorage.setItem("uiDensity", density);
        this.applyUiDensity();
        this.updateUiDensityButtons();
    }

    applyUiDensity() {
        for (const density of ["compact", "standard", "large"]) {
            document.body.classList.toggle(`ui-density-${density}`, this.uiDensity === density);
        }
        document.body.dataset.uiDensity = this.uiDensity;
    }

    updateUiPresetButtons() {
        /** @type {[string, string][]} */
        const presets = [
            ["uiPresetClassic", "classic"],
            ["uiPresetPlanner", "planner"],
            ["uiPresetReader", "reader"],
            ["uiPresetCompact", "compact"],
        ];
        for (const [id, preset] of presets) {
            const button = document.getElementById(id);
            if (!(button instanceof HTMLElement)) continue;
            const isActive = this.uiPreset === preset;
            button.textContent = this.getUiPresetLabel(preset);
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
            button.dataset.state = isActive ? "active" : "inactive";
            button.setAttribute("title", this.getUiPresetLabel(preset));
        }
    }

    updateUiDensityButtons() {
        /** @type {[string, string][]} */
        const densities = [
            ["uiDensityCompact", "compact"],
            ["uiDensityStandard", "standard"],
            ["uiDensityLarge", "large"],
        ];
        for (const [id, density] of densities) {
            const button = document.getElementById(id);
            if (!(button instanceof HTMLElement)) continue;
            const isActive = this.uiDensity === density;
            button.textContent = this.getUiDensityLabel(density);
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
            button.setAttribute("title", this.getUiDensityLabel(density));
        }
    }

    toggleQueueCompactRepeats() {
        this.queueCompactRepeats = !this.queueCompactRepeats;
        window.localStorage.setItem("queueCompactRepeats", String(this.queueCompactRepeats));
        this.updateQueueRepeatToggle();
        this.updateNextActions();
    }

    updateQueueRepeatToggle() {
        const button = document.getElementById("queueRepeatToggle");
        if (!(button instanceof HTMLElement)) return;
        const label = this.getQueueRepeatToggleLabel();
        button.textContent = label;
        button.classList.toggle("is-active", this.queueCompactRepeats);
        button.setAttribute("aria-pressed", String(this.queueCompactRepeats));
        button.setAttribute("title", label);
    }

    initializeLoadoutManager() {
        const managerPanel = document.getElementById("loadoutManagerPanel");
        const slotGrid = document.getElementById("loadoutSlotGrid");
        const actionsBar = document.getElementById("loadoutManagerActions");
        const legacyShell = document.querySelector(".showthatloadout");
        const legacyPanel = legacyShell?.querySelector(".showthisloadout");
        const renameInput = document.getElementById("renameLoadout");
        if (!(managerPanel instanceof HTMLElement) || !(slotGrid instanceof HTMLElement) || !(actionsBar instanceof HTMLElement) || !(legacyPanel instanceof HTMLElement) || !(renameInput instanceof HTMLElement)) return;

        const saveButton = legacyPanel.querySelector("button[data-lockey='actions>tooltip>save_loadout']");
        const loadButton = legacyPanel.querySelector("button[data-lockey='actions>tooltip>load_loadout']");
        const renameButton = legacyPanel.querySelector("button[data-lockey='actions>tooltip>rename']");

        slotGrid.innerHTML = "";
        for (let i = 1; i <= 15; i++) {
            const loadButtonElement = document.getElementById(`load${i}`);
            if (!(loadButtonElement instanceof HTMLElement)) continue;
            loadButtonElement.classList.add("loadoutSlotButton");
            loadButtonElement.removeAttribute("style");
            slotGrid.appendChild(loadButtonElement);
        }
        if (saveButton instanceof HTMLElement) {
            saveButton.id = "saveLoadoutButton";
            actionsBar.appendChild(saveButton);
        }
        if (loadButton instanceof HTMLElement) {
            loadButton.id = "loadLoadoutButton";
            actionsBar.appendChild(loadButton);
        }
        if (renameButton instanceof HTMLElement) {
            renameButton.id = "renameLoadoutButton";
            actionsBar.appendChild(renameButton);
        }
        actionsBar.appendChild(renameInput);
        renameInput.removeAttribute("style");
        if (legacyShell instanceof HTMLElement) {
            legacyShell.classList.add("legacy-loadout-shell");
            legacyShell.setAttribute("aria-hidden", "true");
        }
        this.toggleLoadoutManager(this.loadoutManagerOpen);
        this.updateLoadoutManager();
    }

    toggleLoadoutManager(force) {
        if (typeof force === "boolean") {
            this.loadoutManagerOpen = force;
        } else {
            this.loadoutManagerOpen = !this.loadoutManagerOpen;
        }
        window.localStorage.setItem("loadoutManagerOpen", String(this.loadoutManagerOpen));
        const panel = document.getElementById("loadoutManagerPanel");
        const toggle = document.getElementById("loadoutManagerToggle");
        if (panel instanceof HTMLElement) panel.classList.toggle("hidden", !this.loadoutManagerOpen);
        if (toggle instanceof HTMLElement) toggle.setAttribute("aria-expanded", String(this.loadoutManagerOpen));
    }

    formatLoadoutSavedAt(timestamp) {
        if (!timestamp) return "";
        try {
            return new Date(timestamp).toLocaleString(Localization.currentLang || undefined, {dateStyle: "short", timeStyle: "short"});
        } catch {
            return new Date(timestamp).toLocaleString();
        }
    }

    simplifyActionRecord(record) {
        return {
            name: record.name,
            loops: record.loops,
            disabled: !!record.disabled,
            collapsed: !!record.collapsed,
        };
    }

    areActionRecordsEquivalent(left=[], right=[]) {
        if (left.length !== right.length) return false;
        return left.every((record, index) => {
            const comparison = right[index];
            if (!comparison) return false;
            const a = this.simplifyActionRecord(record);
            const b = this.simplifyActionRecord(comparison);
            return a.name === b.name
                && a.loops === b.loops
                && a.disabled === b.disabled
                && a.collapsed === b.collapsed;
        });
    }

    noteLoadoutSaved(num) {
        this.loadoutSaveTimes[num] = new Date().toISOString();
        window.localStorage.setItem("loadoutSaveTimes", JSON.stringify(this.loadoutSaveTimes));
        this.updateLoadoutManager();
    }

    updateLoadoutManager() {
        const selectionSummary = document.getElementById("loadoutSelectionSummary");
        const differenceSummary = document.getElementById("loadoutDifferenceSummary");
        const loadButton = document.getElementById("loadLoadoutButton");
        const saveButton = document.getElementById("saveLoadoutButton");
        const renameButton = document.getElementById("renameLoadoutButton");
        const renameInput = document.getElementById("renameLoadout");
        if (!(selectionSummary instanceof HTMLElement) || !(differenceSummary instanceof HTMLElement)) return;

        for (let i = 1; i <= 15; i++) {
            const button = document.getElementById(`load${i}`);
            if (!(button instanceof HTMLElement)) continue;
            const records = loadouts?.[i] ?? [];
            const isEmpty = !records || records.length === 0;
            const matchesCurrent = !isEmpty && this.areActionRecordsEquivalent(records, actions.next);
            const savedAt = this.formatLoadoutSavedAt(this.loadoutSaveTimes[i]);
            const loadoutName = loadoutnames[i - 1] ?? getDefaultLoadoutName(i);
            const actionCountText = isEmpty
                ? this.getGuiText("loadoutEmpty")
                : `${records.length} ${this.getGuiText("loadoutActions")}`;
            const savedAtText = savedAt
                ? `${this.getGuiText("loadoutSavedAt")}: ${savedAt}`
                : `${this.getGuiText("loadoutSavedAt")}: -`;
            button.classList.toggle("unused", curLoadout !== i);
            button.classList.toggle("loadout-slot-empty", isEmpty);
            button.classList.toggle("loadout-slot-dirty", curLoadout === i && !isEmpty && !matchesCurrent);
            button.classList.toggle("loadout-slot-match", curLoadout === i && matchesCurrent);
            button.setAttribute("data-count", String(records?.length ?? 0));
            button.innerHTML = `
                <span class="loadoutSlotName">${loadoutName}</span>
                <span class="loadoutSlotMeta">${actionCountText}</span>
                <span class="loadoutSlotSaved">${savedAtText}</span>
            `;
            button.setAttribute("title", `${loadoutName} / ${actionCountText} / ${savedAtText}`);
            button.setAttribute("aria-label", `${loadoutName}. ${actionCountText}. ${savedAtText}.`);
        }

        if (curLoadout === 0) {
            selectionSummary.textContent = this.getGuiText("loadoutNoSelection");
            differenceSummary.textContent = this.getGuiText("loadoutReplaceWarning");
            if (loadButton instanceof HTMLButtonElement) loadButton.disabled = true;
            if (saveButton instanceof HTMLButtonElement) saveButton.disabled = true;
            if (renameButton instanceof HTMLButtonElement) renameButton.disabled = true;
            if (renameInput instanceof HTMLInputElement && document.activeElement !== renameInput) {
                renameInput.value = getLoadoutNameDefault();
            }
            return;
        }

        const selectedRecords = loadouts?.[curLoadout] ?? [];
        const isEmpty = !selectedRecords || selectedRecords.length === 0;
        const matchesCurrent = !isEmpty && this.areActionRecordsEquivalent(selectedRecords, actions.next);
        const savedAt = this.formatLoadoutSavedAt(this.loadoutSaveTimes[curLoadout]);
        selectionSummary.textContent = `${this.getGuiText("loadoutSelected")}: ${loadoutnames[curLoadout - 1] ?? getDefaultLoadoutName(curLoadout)}`;
        differenceSummary.textContent = isEmpty
            ? this.getGuiText("loadoutEmpty")
            : `${selectedRecords.length} ${this.getGuiText("loadoutActions")} / ${matchesCurrent ? this.getGuiText("loadoutMatchesCurrent") : this.getGuiText("loadoutDiffersCurrent")}${savedAt ? ` / ${this.getGuiText("loadoutSavedAt")}: ${savedAt}` : ""}`;
        if (loadButton instanceof HTMLButtonElement) loadButton.disabled = isEmpty;
        if (saveButton instanceof HTMLButtonElement) saveButton.disabled = false;
        if (renameButton instanceof HTMLButtonElement) renameButton.disabled = false;
        if (renameInput instanceof HTMLInputElement && document.activeElement !== renameInput) {
            renameInput.value = loadoutnames[curLoadout - 1] ?? getLoadoutNameDefault();
        }
    }

    toggleQuickSetting(option) {
        if (!(option in options)) return;
        setOption(option, !options[option], true);
        if (option === "predictor") {
            this.setPredictorState(options.predictor ? "stale" : "off");
        } else {
            this.updatePlannerStatus();
        }
        this.updateQuickSettings();
        this.updateMobileReadingState();
        this.renderInspector();
    }

    updateQuickSettings() {
        /** @type {[string, string, string][]} */
        const quickSettings = [
            ["quickSettingResponsiveUI", "responsiveUI", "menu>options>responsive_ui"],
            ["quickSettingActionLog", "actionLog", "menu>options>action_log"],
            ["quickSettingPredictor", "predictor", "menu>options>predictor"],
            ["quickSettingStatColors", "statColors", "menu>options>stat_colors"],
            ["quickSettingHighlightNew", "highlightNew", "menu>options>highlight_new"],
            ["quickSettingHotkeys", "hotkeys", "menu>options>hotkeys"],
            ["quickSettingSimpleTooltips", "simpleTooltips", "gui:simpleTooltips"],
        ];
        for (const [id, option, locKey] of quickSettings) {
            const button = document.getElementById(id);
            if (!(button instanceof HTMLElement)) continue;
            const active = !!options[option];
            button.textContent = locKey.startsWith("gui:") ? this.getGuiText(locKey.slice(4)) : _txt(locKey);
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
            button.dataset.state = active ? "on" : "off";
            button.title = `${button.textContent?.trim() ?? ""}: ${this.getGuiText(active ? "quickSettingOn" : "quickSettingOff")}`;
        }
    }

    getBuffGroupLabel(group) {
        return this.getGuiText(`buffGroup${group[0].toUpperCase()}${group.slice(1)}`);
    }

    updateBuffGroups() {
        const groups = ["trials", "ritual", "feast", "prestige"];
        for (const group of groups) {
            const groupElement = document.getElementById(`buffGroup${group}`);
            const header = document.getElementById(`buffGroupHeader${group}`);
            if (!(groupElement instanceof HTMLElement)) continue;
            if (header instanceof HTMLElement) header.textContent = this.getBuffGroupLabel(group);
            const hasVisibleBuff = Array.from(groupElement.querySelectorAll(".buffContainer"))
                .some(element => element instanceof HTMLElement && element.style.display !== "none");
            groupElement.classList.toggle("hidden", !hasVisibleBuff);
        }
    }

    refreshGuiLanguage(force=false) {
        if (!force && this.guiLanguage === Localization.currentLang) return;
        this.guiLanguage = Localization.currentLang;
        htmlElement("readingTabInspector").textContent = this.getGuiText("inspector");
        htmlElement("readingTabChronicle").textContent = this.getGuiText("chronicle");
        htmlElement("readingTabCharacter").textContent = this.getGuiText("character");
        htmlElement("inspectorTabSummary").textContent = this.getGuiText("summary");
        htmlElement("inspectorTabStory").textContent = this.getGuiText("story");
        htmlElement("inspectorTabNumbers").textContent = this.getGuiText("numbers");
        htmlElement("chronicleTabLog").textContent = this.getGuiText("log");
        htmlElement("chronicleTabChapters").textContent = this.getGuiText("chapters");
        htmlElement("chronicleTabStories").textContent = this.getGuiText("stories");
        htmlElement("inspectorEmpty").textContent = this.getGuiText("inspectorEmpty");
        const quickSettingsMenuLabel = document.getElementById("quickSettingsMenuLabel");
        if (quickSettingsMenuLabel instanceof HTMLElement) {
            quickSettingsMenuLabel.textContent = this.isChineseLanguage() ? "\u5feb\u6377\u8bbe\u7f6e" : "Quick Settings";
        }
        const trackedStatLabel = document.getElementById("plannerTrackedStatLabel");
        if (trackedStatLabel instanceof HTMLElement) {
            trackedStatLabel.textContent = this.isChineseLanguage() ? "\u8ddf\u8e2a\u9879" : "Tracked";
        }
        const quickSettingsToggleHeading = document.getElementById("quickSettingsToggleHeading");
        if (quickSettingsToggleHeading instanceof HTMLElement) {
            quickSettingsToggleHeading.textContent = this.getGuiText("quickSettingsToggles");
        }
        const quickSettingsDensityHeading = document.getElementById("quickSettingsDensityHeading");
        if (quickSettingsDensityHeading instanceof HTMLElement) {
            quickSettingsDensityHeading.textContent = this.getGuiText("quickSettingsDensity");
        }
        this.updateHotkeyReferencePanels();
        this.updateUiPresetButtons();
        this.updateUiDensityButtons();
        this.updateQueueRepeatToggle();
        this.updatePlannerStatus();
        this.updateTownBrowserTools();
        this.updateQuickSettings();
        this.updateLoadoutManager();
        this.updateBuffGroups();
        this.applyTrackedResourcePins();
        this.renderChronicleLogControls();
        this.renderChronicleChapters();
        this.renderChronicleStories();
        this.renderInspector();
        this.updateMobileReadingState();
    }

    setReadingPane(pane) {
        if (this.isMobileReadingUi() && pane === this.readingPane && pane !== "character") {
            pane = "character";
        }
        this.readingPane = pane;
        const statsColumn = htmlElement("statsColumn");
        const panes = {
            inspector: htmlElement("inspectorPane"),
            chronicle: htmlElement("chroniclePane"),
        };
        statsColumn.dataset.readingPane = pane;
        panes.inspector.classList.toggle("hidden", pane !== "inspector");
        panes.chronicle.classList.toggle("hidden", pane !== "chronicle");
        htmlElement("statsWindow").classList.toggle("hidden", pane !== "character");
        htmlElement("readingTabInspector").classList.toggle("is-active", pane === "inspector");
        htmlElement("readingTabChronicle").classList.toggle("is-active", pane === "chronicle");
        htmlElement("readingTabCharacter").classList.toggle("is-active", pane === "character");
        this.updateMobileReadingState();
    }

    setInspectorTab(tab) {
        this.inspectorTab = tab;
        htmlElement("inspectorTabSummary").classList.toggle("is-active", tab === "summary");
        htmlElement("inspectorTabStory").classList.toggle("is-active", tab === "story");
        htmlElement("inspectorTabNumbers").classList.toggle("is-active", tab === "numbers");
        htmlElement("inspectorSummaryPane").classList.toggle("hidden", tab !== "summary");
        htmlElement("inspectorStoryPane").classList.toggle("hidden", tab !== "story");
        htmlElement("inspectorNumbersPane").classList.toggle("hidden", tab !== "numbers");
    }

    setChronicleTab(tab) {
        this.chronicleTab = tab;
        htmlElement("chronicleTabLog").classList.toggle("is-active", tab === "log");
        htmlElement("chronicleTabChapters").classList.toggle("is-active", tab === "chapters");
        htmlElement("chronicleTabStories").classList.toggle("is-active", tab === "stories");
        htmlElement("chronicleLogPane").classList.toggle("hidden", tab !== "log");
        htmlElement("chronicleChaptersPane").classList.toggle("hidden", tab !== "chapters");
        htmlElement("chronicleStoriesPane").classList.toggle("hidden", tab !== "stories");
        if (tab === "log") this.renderChronicleLogControls();
        if (tab === "chapters") this.renderChronicleChapters();
        if (tab === "stories") this.renderChronicleStories();
    }

    setChronicleChapter(chapter) {
        this.chronicleChapter = chapter;
        this.renderChronicleChapters();
    }

    openReadingPaneFromNav(pane, tab) {
        this.setReadingPane(pane);
        if (pane === "chronicle" && tab) {
            this.setChronicleTab(tab);
        }
    }

    setPredictorState(state) {
        this.predictorState = options.predictor ? state : "off";
        this.updatePlannerStatus();
    }

    predictorUpdateHandler() {
        this.setPredictorState("ready");
        if (this.inspectorSelection?.kind === "action" && this.inspectorSelection.source === "queue") {
            this.renderInspector();
        }
    }

    documentClickHandler(event) {
        if (!(event.target instanceof HTMLElement)) return;
        const target = event.target;
        const insidePopup = target.closest(".showthis,.showthis2,.showthisH,.showthisloadout,.showthisstory");
        const menuTrigger = target.closest("#menu > li.showthatH");

        if (menuTrigger && !insidePopup) {
            this.toggleMenuPopup(menuTrigger.id);
        } else if (!target.closest("#menu")) {
            this.closeOpenMenus();
        }

        if (insidePopup) return;

        const storyContainer = target.closest(".storyContainer");
        if (storyContainer instanceof HTMLElement) {
            const varName = storyContainer.id.replace("storyContainer", "");
            this.openInspectorForStory(varName);
            return;
        }

        const actionContainer = target.closest(".actionOrTravelContainer");
        if (actionContainer instanceof HTMLElement) {
            const varName = actionContainer.id.replace("container", "");
            queueMicrotask(() => this.openInspectorForAction(varName));
            return;
        }

        const logEntry = target.closest(".actionLogEntry");
        if (logEntry instanceof HTMLElement) {
            const index = Number(logEntry.id.replace("actionLogEntry", ""));
            if (Number.isFinite(index)) {
                this.openInspectorForLog(index);
            }
        }
    }

    keydownHandler(event) {
        if (!(event.target instanceof HTMLElement)) return;
        if (event.key === "Escape") {
            this.closeOpenMenus();
            if (this.readingPane === "inspector" && this.inspectorSelection) {
                this.clearInspectorSelection();
            }
            return;
        }
        if (!(event.key === "Enter" || event.key === " ")) return;

        const target = event.target;
        const storyContainer = target.closest(".storyContainer");
        if (storyContainer instanceof HTMLElement) {
            event.preventDefault();
            this.openInspectorForStory(storyContainer.id.replace("storyContainer", ""));
            return;
        }
        const queueRow = target.closest(".nextActionContainer");
        if (queueRow instanceof HTMLElement) {
            event.preventDefault();
            const actionId = Number(queueRow.getAttribute("data-action-id"));
            if (Number.isFinite(actionId)) this.openInspectorForQueue(actionId);
            return;
        }
        const logEntry = target.closest(".actionLogEntry");
        if (logEntry instanceof HTMLElement) {
            event.preventDefault();
            const index = Number(logEntry.id.replace("actionLogEntry", ""));
            if (Number.isFinite(index)) this.openInspectorForLog(index);
        }
    }

    toggleMenuPopup(menuId) {
        const menuElement = htmlElement(menuId);
        const isOpen = menuElement.classList.contains("menu-open");
        this.closeOpenMenus();
        if (!isOpen) {
            menuElement.classList.add("menu-open");
            menuElement.setAttribute("aria-expanded", "true");
        }
    }

    closeOpenMenus() {
        this.closeHotkeyReferencePanels();
        for (const menu of document.querySelectorAll("#menu > li.showthatH.menu-open")) {
            if (!(menu instanceof HTMLElement)) continue;
            menu.classList.remove("menu-open");
            menu.setAttribute("aria-expanded", "false");
        }
    }

    getActionByVarName(varName) {
        return totalActionList.find(action => action.varName === varName) ?? null;
    }

    getActionTypeLabel(type) {
        const key = `actionType${type[0].toUpperCase()}${type.slice(1)}`;
        return this.getGuiText(key);
    }

    getSelectionSourceLabel(source) {
        const key = `source${source[0].toUpperCase()}${source.slice(1)}`;
        return this.getGuiText(key);
    }

    getActionInspectorTags(action) {
        const tags = [];
        if (getPossibleTravel(action.name).length > 0) tags.push(this.getGuiText("tagTravel"));
        if (action.skills && Object.keys(action.skills).some(skill => action.teachesSkill(skill))) tags.push(this.getGuiText("tagTeaching"));
        if (isBuffName(action.grantsBuff)) tags.push(this.getGuiText("tagBuff"));
        if (action.name.includes("Trial")) tags.push(this.getGuiText("tagTrial"));
        if (["SDungeon", "LDungeon", "TheSpire"].includes(action.varName)) tags.push(this.getGuiText("tagDungeon"));
        return tags;
    }

    getActionTooltipHTML(action) {
        const container = document.getElementById(`container${action.varName}`);
        const tooltip = container?.querySelector(action.unlocked() ? ".showthis.when-unlocked" : ".showthis.when-locked");
        return tooltip instanceof HTMLElement ? tooltip.innerHTML : "";
    }

    getActionStoryHTML(varName) {
        const storyContent = document.getElementById(`storyContent${varName}`);
        return storyContent instanceof HTMLElement ? storyContent.innerHTML : "";
    }

    getQueuePredictorDetails(actionId) {
        if (!options.predictor) return "";
        const actionElement = document.getElementById(`nextActionContainer${actionId}`);
        if (!(actionElement instanceof HTMLElement)) return "";
        const predictorList = actionElement.querySelector("ul.koviko");
        if (!(predictorList instanceof HTMLElement)) return "";
        const chips = Array.from(predictorList.querySelectorAll(":scope > li")).map(item => item.outerHTML).join("");
        const tooltip = predictorList.querySelector(":scope > .showthis");
        const tooltipHTML = tooltip instanceof HTMLElement ? tooltip.innerHTML : "";
        if (!chips && !tooltipHTML) return "";
        const classes = Array.from(predictorList.classList).join(" ");
        return `
            <div class="inspectorPredictorBlock">
                <div class="inspectorPredictorHeader">${this.getInspectorPredictorLabel()}: ${this.getTrackedStatLabel()}</div>
                ${chips ? `<ul class="${classes} inspectorPredictorList">${chips}</ul>` : ""}
                ${tooltipHTML ? `<div class="inspectorPredictorTooltip">${tooltipHTML}</div>` : ""}
            </div>
        `;
    }

    getInspectorSelectionKey(selection=this.inspectorSelection) {
        if (!selection) return "";
        if (selection.kind === "log") return `log:${selection.index}`;
        return `${selection.kind}:${selection.source}:${selection.varName}:${selection.actionId ?? ""}`;
    }

    renderDefinitionRows(rows) {
        const visibleRows = rows.filter(([, value]) => value !== "" && value !== undefined && value !== null);
        if (visibleRows.length === 0) return "";
        return `
            <dl class="inspectorDefinitionList">
                ${visibleRows.map(([label, value]) => `
                    <div class="inspectorDefinitionRow">
                        <dt>${label}</dt>
                        <dd>${value}</dd>
                    </div>
                `).join("")}
            </dl>
        `;
    }

    describeQueueState(action) {
        const states = [];
        states.push(action.disabled ? this.getGuiText("queueDisabled") : this.getGuiText("queueEnabled"));
        if (action.collapsed) states.push(this.getGuiText("queueCollapsed"));
        return states.join(" · ");
    }

    applyInspectorSelectionHighlight() {
        document.querySelectorAll(".inspector-selected").forEach(element => element.classList.remove("inspector-selected"));
        if (!this.inspectorSelection) return;

        let element = null;
        if (this.inspectorSelection.kind === "log") {
            element = document.getElementById(`actionLogEntry${this.inspectorSelection.index}`);
        } else if (this.inspectorSelection.source === "action") {
            element = document.getElementById(`container${this.inspectorSelection.varName}`);
        } else if (this.inspectorSelection.source === "story") {
            element = document.getElementById(`storyContainer${this.inspectorSelection.varName}`);
        } else if (this.inspectorSelection.source === "queue") {
            element = document.getElementById(`nextActionContainer${this.inspectorSelection.actionId}`);
        }
        element?.classList.add("inspector-selected");
    }

    setInspectorSelection(selection, preferredTab="summary") {
        const nextKey = this.getInspectorSelectionKey(selection);
        if (nextKey !== "" && nextKey === this.getInspectorSelectionKey() && this.readingPane === "inspector") {
            this.clearInspectorSelection();
            return;
        }
        this.inspectorSelection = selection;
        this.setReadingPane("inspector");
        this.setInspectorTab(preferredTab);
        this.applyInspectorSelectionHighlight();
        this.renderInspector();
        this.updatePlannerStatus();
    }

    openInspectorForAction(varName, preferredTab="summary") {
        let nextTab = preferredTab;
        if (preferredTab === "summary") {
            const storyText = this.getActionStoryHTML(varName).replace(/<[^>]*>/g, "").trim();
            const action = this.getActionByVarName(varName);
            const numberText = action ? this.getActionTooltipHTML(action).replace(/<[^>]*>/g, "").trim() : "";
            nextTab = storyText ? "story" : (numberText ? "numbers" : "summary");
        }
        this.setInspectorSelection({kind: "action", source: "action", varName}, nextTab);
    }

    openInspectorForStory(varName) {
        this.setInspectorSelection({kind: "action", source: "story", varName}, "story");
    }

    openInspectorForQueue(actionId) {
        const queuedAction = actions.next.find(action => action.actionId === actionId);
        const action = queuedAction ? getActionPrototype(queuedAction.name) : null;
        if (!queuedAction || !action) return;
        this.setInspectorSelection({kind: "action", source: "queue", varName: action.varName, actionId}, "numbers");
    }

    openInspectorForLog(index) {
        const entry = actionLog.getEntry(index);
        if (!entry) return;
        const preferredTab = entry instanceof ActionStoryEntry || entry instanceof GlobalStoryEntry ? "story" : "summary";
        this.setInspectorSelection({kind: "log", index}, preferredTab);
    }

    clearInspectorSelection() {
        this.inspectorSelection = null;
        this.applyInspectorSelectionHighlight();
        this.renderInspector();
        this.updatePlannerStatus();
    }

    formatChapterLabel(index) {
        if (this.isChineseLanguage()) {
            return `${this.getGuiText("chapterPrefix")}${index + 1}${this.getGuiText("chapterSuffix")}`;
        }
        return `${this.getGuiText("chapterPrefix")}${index + 1}`;
    }

    renderInspector() {
        const empty = htmlElement("inspectorEmpty");
        const content = htmlElement("inspectorContent");
        if (!this.inspectorSelection) {
            empty.classList.remove("hidden");
            content.classList.add("hidden");
            htmlElement("inspectorHeader").textContent = "";
            htmlElement("inspectorMeta").innerHTML = "";
            htmlElement("inspectorSummaryPane").innerHTML = "";
            htmlElement("inspectorStoryPane").innerHTML = "";
            htmlElement("inspectorNumbersPane").innerHTML = "";
            return;
        }

        let title = "";
        let meta = "";
        let summary = "";
        let story = `<p>${this.getGuiText("noStory")}</p>`;
        let numbers = `<p>${this.getGuiText("noNumbers")}</p>`;

        if (this.inspectorSelection.kind === "action") {
            const action = this.getActionByVarName(this.inspectorSelection.varName);
            if (!action) {
                this.clearInspectorSelection();
                return;
            }
            const queuedAction = this.inspectorSelection.source === "queue"
                ? actions.next.find(nextAction => nextAction.actionId === this.inspectorSelection.actionId)
                : null;
            const tags = this.getActionInspectorTags(action);
            title = action.label;
            meta = `
                <span class="readingMetaChip zone-${action.townNum + 1}">${getTownName(action.townNum)}</span>
                <span class="readingMetaChip action-category-${action.category}">${getActionCategoryLabel(action.category)}</span>
                <span class="readingMetaChip action-type-${action.type}">${this.getActionTypeLabel(action.type)}</span>
            `;
            summary = this.renderDefinitionRows([
                [this.getGuiText("area"), getTownName(action.townNum)],
                [this.getGuiText("role"), getActionCategoryLabel(action.category)],
                [this.getGuiText("type"), this.getActionTypeLabel(action.type)],
                [this.getGuiText("source"), this.getSelectionSourceLabel(this.inspectorSelection.source)],
                [this.getGuiText("queuedLoops"), queuedAction ? formatNumber(queuedAction.loops) : ""],
                [this.getGuiText("queueState"), queuedAction ? this.describeQueueState(queuedAction) : ""],
                [this.getGuiText("tags"), tags.join(" · ")],
            ]);
            const storyHTML = this.getActionStoryHTML(action.varName);
            if (storyHTML) story = `<div class="inspectorRichText">${storyHTML}</div>`;
            const tooltipHTML = this.getActionTooltipHTML(action);
            const predictorHTML = queuedAction ? this.getQueuePredictorDetails(queuedAction.actionId) : "";
            if (tooltipHTML || predictorHTML) numbers = `<div class="inspectorRichText">${predictorHTML}${tooltipHTML}</div>`;
        } else if (this.inspectorSelection.kind === "log") {
            const entry = actionLog.getEntry(this.inspectorSelection.index);
            if (!entry) {
                this.clearInspectorSelection();
                return;
            }
            const action = entry.action;
            title = action?.label ?? this.getGuiText("log");
            meta = `
                <span class="readingMetaChip">${this.getGuiText("log")}</span>
                <span class="readingMetaChip">${entry.type}</span>
            `;
            summary = `<div class="inspectorRichText">${entry.element.innerHTML}</div>`;
            if (entry instanceof ActionStoryEntry) {
                const storyInfo = action?.getStoryTexts()?.find(({num}) => num === entry.storyIndex);
                story = `<div class="inspectorRichText">${storyInfo ? `${storyInfo.conditionHTML}${storyInfo.text}` : this.getGuiText("noStory")}</div>`;
            } else if (entry instanceof GlobalStoryEntry) {
                story = `<div class="inspectorRichText">${_txt(`time_controls>stories>story[num="${entry.chapter}"]`)}</div>`;
            }
            if (action) {
                const tooltipHTML = this.getActionTooltipHTML(action);
                if (tooltipHTML) numbers = `<div class="inspectorRichText">${tooltipHTML}</div>`;
            }
        }

        empty.classList.add("hidden");
        content.classList.remove("hidden");
        htmlElement("inspectorHeader").textContent = title;
        htmlElement("inspectorMeta").innerHTML = meta;
        htmlElement("inspectorSummaryPane").innerHTML = summary;
        htmlElement("inspectorStoryPane").innerHTML = story;
        htmlElement("inspectorNumbersPane").innerHTML = numbers;
    }

    renderChronicleChapters() {
        const rail = document.getElementById("chronicleChapterRail");
        const viewer = document.getElementById("chronicleChapterViewer");
        if (!(rail instanceof HTMLElement) || !(viewer instanceof HTMLElement)) return;
        const availableChapters = [];
        for (let i = 0; i <= storyMax; i++) {
            if (document.getElementById(`story${i}`)) availableChapters.push(i);
        }
        if (availableChapters.length === 0) {
            rail.innerHTML = "";
            viewer.innerHTML = `<p>${this.getGuiText("noStory")}</p>`;
            return;
        }
        if (!availableChapters.includes(this.chronicleChapter)) {
            this.chronicleChapter = availableChapters[availableChapters.length - 1];
        }
        rail.innerHTML = availableChapters.map(chapter => `
            <button
                type="button"
                class="button chronicleChapterButton${chapter === this.chronicleChapter ? " is-active" : ""}"
                onclick="view.setChronicleChapter(${chapter})"
            >${this.formatChapterLabel(chapter)}</button>
        `).join("");
        const storyDiv = document.getElementById(`story${this.chronicleChapter}`);
        viewer.innerHTML = `
            <div class="chronicleChapterCard">
                <div class="chronicleChapterHeading">${this.formatChapterLabel(this.chronicleChapter)}</div>
                <div class="inspectorRichText">${storyDiv?.innerHTML ?? ""}</div>
            </div>
        `;
    }

    renderChronicleStories() {
        const pane = document.getElementById("chronicleStoriesPane");
        if (!(pane instanceof HTMLElement)) return;
        const unreadStories = Array.isArray(globalThis.unreadActionStories) ? globalThis.unreadActionStories : [];
        const storyActions = totalActionList
            .filter(action => action.storyReqs !== undefined)
            .filter(action => {
                const storyContainer = document.getElementById(`storyContainer${action.varName}`);
                return storyContainer instanceof HTMLElement && !storyContainer.classList.contains("hidden");
            });
        if (storyActions.length === 0) {
            pane.innerHTML = `<p>${this.getGuiText("noChronicleStories")}</p>`;
            return;
        }

        /** @type {Map<number, AnyAction[]>} */
        const groupedStories = new Map();
        for (const action of storyActions) {
            const existing = groupedStories.get(action.townNum) ?? [];
            existing.push(action);
            groupedStories.set(action.townNum, existing);
        }

        pane.innerHTML = `
            <div class="chronicleStorySections">
                ${[...groupedStories.entries()].sort(([leftTown], [rightTown]) => leftTown - rightTown).map(([townNum, actionsInTown]) => {
                    const unreadCount = actionsInTown.filter(action => unreadStories.includes(`storyContainer${action.varName}`)).length;
                    const sectionMeta = this.isChineseLanguage()
                        ? `${actionsInTown.length} 条 · 未读 ${unreadCount}`
                        : `${actionsInTown.length} stories · ${unreadCount} unread`;
                    return `
                        <section class="chronicleStorySection zone-${townNum + 1}">
                            <div class="chronicleStorySectionHeader">
                                <div class="chronicleStorySectionTitle">${getTownName(townNum)}</div>
                                <div class="chronicleStorySectionMeta">${sectionMeta}</div>
                            </div>
                            <div class="chronicleStoryList">
                                ${actionsInTown.map(action => {
                                    const unread = unreadStories.includes(`storyContainer${action.varName}`);
                                    const storyTexts = action.getStoryTexts();
                                    const unlockedCount = storyTexts.filter(({num}) => action.storyReqs(num)).length;
                                    const storyProgress = this.isChineseLanguage()
                                        ? `故事 ${unlockedCount}/${storyTexts.length}`
                                        : `Story ${unlockedCount}/${storyTexts.length}`;
                                    return `
                                        <button
                                            type="button"
                                            class="chronicleStoryCard action-category-${action.category}${unread ? " has-unread" : ""}"
                                            onclick="view.openInspectorForStory('${action.varName}')"
                                        >
                                            <div class="chronicleStoryTopline">
                                                <span class="chronicleStoryName">${action.label}</span>
                                                ${unread ? `<span class="chronicleStoryUnread">${this.isChineseLanguage() ? "未读" : "Unread"}</span>` : ""}
                                            </div>
                                            <div class="chronicleStoryMetaRow">
                                                <span class="chronicleStoryMetaChip action-category-${action.category}">${getActionCategoryLabel(action.category)}</span>
                                                <span class="chronicleStoryMetaChip">${this.getActionTypeLabel(action.type)}</span>
                                                <span class="chronicleStoryCount">${storyProgress}</span>
                                            </div>
                                        </button>
                                    `;
                                }).join("")}
                            </div>
                        </section>
                    `;
                }).join("")}
            </div>
        `;
    }

    getChronicleLogFilterLabel(filter) {
        return this.getGuiText(`chronicleLog${filter[0].toUpperCase()}${filter.slice(1)}`);
    }

    setChronicleLogFilter(filter) {
        if (!["all", "story", "chapter", "growth", "soulstone"].includes(filter)) return;
        this.chronicleLogFilter = filter;
        window.localStorage.setItem("chronicleLogFilter", filter);
        this.renderChronicleLogControls();
    }

    classifyChronicleLogEntry(entry) {
        if (entry instanceof ActionStoryEntry) return "story";
        if (entry instanceof GlobalStoryEntry) return "chapter";
        if (entry instanceof SkillEntry || entry instanceof BuffEntry) return "growth";
        if (entry instanceof SoulstoneEntry) return "soulstone";
        return "all";
    }

    renderChronicleLogControls() {
        const statsElement = document.getElementById("chronicleLogStats");
        const filterElement = document.getElementById("chronicleLogFilters");
        const logBody = document.getElementById("actionLog");
        if (!(statsElement instanceof HTMLElement) || !(filterElement instanceof HTMLElement) || !(logBody instanceof HTMLElement)) return;

        /** @type {const} */
        const filterOrder = ["all", "story", "chapter", "growth", "soulstone"];
        const entries = actionLog.entries ?? [];
        /** @type {Record<string, number>} */
        const counts = {all: entries.length, story: 0, chapter: 0, growth: 0, soulstone: 0};
        for (const entry of entries) {
            const category = this.classifyChronicleLogEntry(entry);
            if (category !== "all") counts[category] += 1;
        }

        const visibleEntries = Array.from(logBody.querySelectorAll(".actionLogEntry"))
            .filter(element => element instanceof HTMLElement);
        let visibleCount = 0;
        for (const element of visibleEntries) {
            const index = Number(element.id.replace("actionLogEntry", ""));
            const entry = Number.isFinite(index) ? actionLog.entries[index] : null;
            const category = entry ? this.classifyChronicleLogEntry(entry) : "all";
            const matches = this.chronicleLogFilter === "all" || category === this.chronicleLogFilter;
            element.classList.toggle("chronicle-log-hidden", !matches);
            element.dataset.chronicleFilter = category;
            if (matches) visibleCount += 1;
        }

        statsElement.innerHTML = `
            <span class="chronicleStatChip">${this.getGuiText("chronicleVisible")}: ${visibleCount}</span>
            <span class="chronicleStatChip">${this.getGuiText("chronicleMatching")}: ${this.chronicleLogFilter === "all" ? counts.all : counts[this.chronicleLogFilter]}</span>
            <span class="chronicleStatChip">${this.getGuiText("chronicleEntries")}: ${counts.all}</span>
        `;

        filterElement.innerHTML = filterOrder.map(filter => `
            <button
                type="button"
                class="button chronicleFilterButton${this.chronicleLogFilter === filter ? " is-active" : ""}"
                onclick="view.setChronicleLogFilter('${filter}')"
                aria-pressed="${this.chronicleLogFilter === filter}"
                title="${this.getChronicleLogFilterLabel(filter)}"
            >${this.getChronicleLogFilterLabel(filter)} <span class="chronicleFilterCount">${filter === "all" ? counts.all : counts[filter]}</span></button>
        `).join("");

        const emptyNoticeId = "chronicleLogEmptyNotice";
        let emptyNotice = document.getElementById(emptyNoticeId);
        if (visibleCount === 0) {
            if (!(emptyNotice instanceof HTMLElement)) {
                emptyNotice = document.createElement("div");
                emptyNotice.id = emptyNoticeId;
                emptyNotice.className = "chronicleEmptyNotice";
                logBody.appendChild(emptyNotice);
            }
            emptyNotice.textContent = this.getGuiText("noChronicleLog");
        } else if (emptyNotice instanceof HTMLElement) {
            emptyNotice.remove();
        }
    }

    getChronicleStoryFilterLabel(filter) {
        return this.getGuiText(`chronicleStories${filter[0].toUpperCase()}${filter.slice(1)}`);
    }

    setChronicleStoryFilter(filter) {
        if (!["all", "unread", "incomplete", "currentTown"].includes(filter)) return;
        this.chronicleStoryFilter = filter;
        window.localStorage.setItem("chronicleStoryFilter", filter);
        this.renderChronicleStories();
    }

    getChronicleStoryItems() {
        const unreadStories = Array.isArray(globalThis.unreadActionStories) ? globalThis.unreadActionStories : [];
        return totalActionList
            .filter(action => action.storyReqs !== undefined)
            .filter(action => {
                const storyContainer = document.getElementById(`storyContainer${action.varName}`);
                return storyContainer instanceof HTMLElement && !storyContainer.classList.contains("hidden");
            })
            .map(action => {
                const storyTexts = action.getStoryTexts();
                const unlockedCount = storyTexts.filter(({num}) => action.storyReqs(num)).length;
                const totalCount = storyTexts.length;
                const unread = unreadStories.includes(`storyContainer${action.varName}`);
                return {
                    action,
                    unread,
                    unlockedCount,
                    totalCount,
                    complete: totalCount > 0 && unlockedCount >= totalCount,
                };
            });
    }

    renderChronicleStories() {
        const statsElement = document.getElementById("chronicleStoryStats");
        const filterElement = document.getElementById("chronicleStoryFilters");
        const contentElement = document.getElementById("chronicleStoriesContent");
        if (!(statsElement instanceof HTMLElement) || !(filterElement instanceof HTMLElement) || !(contentElement instanceof HTMLElement)) return;

        /** @type {const} */
        const filterOrder = ["all", "unread", "incomplete", "currentTown"];
        const storyItems = this.getChronicleStoryItems();
        /** @type {Record<string, number>} */
        const counts = {all: storyItems.length, unread: 0, incomplete: 0, currentTown: 0};
        for (const item of storyItems) {
            if (item.unread) counts.unread += 1;
            if (!item.complete) counts.incomplete += 1;
            if (item.action.townNum === townShowing) counts.currentTown += 1;
        }

        const visibleItems = storyItems.filter(item => {
            switch (this.chronicleStoryFilter) {
                case "unread":
                    return item.unread;
                case "incomplete":
                    return !item.complete;
                case "currentTown":
                    return item.action.townNum === townShowing;
                default:
                    return true;
            }
        });

        const completedVisibleCount = visibleItems.filter(item => item.complete).length;
        const visibleAreaCount = new Set(visibleItems.map(item => item.action.townNum)).size;
        statsElement.innerHTML = `
            <span class="chronicleStatChip">${this.getGuiText("chronicleVisible")}: ${visibleItems.length}</span>
            <span class="chronicleStatChip">${this.getGuiText("chronicleCompleted")}: ${completedVisibleCount}</span>
            <span class="chronicleStatChip">${this.getGuiText("chronicleZones")}: ${visibleAreaCount}</span>
        `;

        filterElement.innerHTML = filterOrder.map(filter => `
            <button
                type="button"
                class="button chronicleFilterButton${this.chronicleStoryFilter === filter ? " is-active" : ""}"
                onclick="view.setChronicleStoryFilter('${filter}')"
                aria-pressed="${this.chronicleStoryFilter === filter}"
                title="${this.getChronicleStoryFilterLabel(filter)}"
            >${this.getChronicleStoryFilterLabel(filter)} <span class="chronicleFilterCount">${counts[filter]}</span></button>
        `).join("");

        if (storyItems.length === 0 || visibleItems.length === 0) {
            contentElement.innerHTML = `<p class="chronicleEmptyNotice">${this.getGuiText("noChronicleStories")}</p>`;
            return;
        }

        /** @type {Map<number, ReturnType<View["getChronicleStoryItems"]>>} */
        const groupedStories = new Map();
        for (const item of visibleItems) {
            const action = item.action;
            const existing = groupedStories.get(action.townNum) ?? [];
            existing.push(item);
            groupedStories.set(action.townNum, existing);
        }

        contentElement.innerHTML = `
            <div class="chronicleStorySections">
                ${[...groupedStories.entries()].sort(([leftTown], [rightTown]) => leftTown - rightTown).map(([townNum, actionsInTown]) => {
                    const unreadCount = actionsInTown.filter(item => item.unread).length;
                    const completedCount = actionsInTown.filter(item => item.complete).length;
                    const sectionMeta = `${actionsInTown.length} ${this.getGuiText("stories")} / ${unreadCount} ${this.getChronicleStoryFilterLabel("unread")} / ${completedCount} ${this.getGuiText("chronicleCompleted")}`;
                    return `
                        <section class="chronicleStorySection zone-${townNum + 1}">
                            <div class="chronicleStorySectionHeader">
                                <div class="chronicleStorySectionTitle">${getTownName(townNum)}</div>
                                <div class="chronicleStorySectionMeta">${sectionMeta}</div>
                            </div>
                            <div class="chronicleStoryList">
                                ${actionsInTown.map(({action, unread, unlockedCount, totalCount, complete}) => `
                                    <button
                                        type="button"
                                        class="chronicleStoryCard action-category-${action.category}${unread ? " has-unread" : ""}${complete ? " is-complete" : ""}"
                                        onclick="view.openInspectorForStory('${action.varName}')"
                                    >
                                        <div class="chronicleStoryTopline">
                                            <span class="chronicleStoryName">${action.label}</span>
                                            ${unread ? `<span class="chronicleStoryUnread">${this.getChronicleStoryFilterLabel("unread")}</span>` : ""}
                                        </div>
                                        <div class="chronicleStoryMetaRow">
                                            <span class="chronicleStoryMetaChip action-category-${action.category}">${getActionCategoryLabel(action.category)}</span>
                                            <span class="chronicleStoryMetaChip">${this.getActionTypeLabel(action.type)}</span>
                                            <span class="chronicleStoryCount">${unlockedCount}/${totalCount}</span>
                                            ${complete ? `<span class="chronicleStoryMetaChip chronicleStoryComplete">${this.getGuiText("chronicleCompleted")}</span>` : ""}
                                        </div>
                                    </button>
                                `).join("")}
                            </div>
                        </section>
                    `;
                }).join("")}
            </div>
        `;
    }

    updatePlannerStatus() {
        const predictorState = htmlElement("plannerPredictorState");
        const trackedStatState = htmlElement("plannerTrackedStatState");
        const selectionState = htmlElement("plannerSelectionState");
        const predictorLabel = {
            off: this.getGuiText("predictorOff"),
            running: this.getGuiText("predictorRunning"),
            ready: this.getGuiText("predictorReady"),
            stale: this.getGuiText("predictorStale"),
        }[options.predictor ? this.predictorState : "off"];
        predictorState.textContent = `${this.getGuiText("predictor")}: ${predictorLabel}`;
        predictorState.dataset.state = options.predictor ? this.predictorState : "off";
        trackedStatState.textContent = `${this.isChineseLanguage() ? "\u8ddf\u8e2a\u9879" : "Tracked"}: ${this.getTrackedStatLabel()}`;
        trackedStatState.dataset.state = options.predictor ? this.predictorState : "off";

        let selectionLabel = this.getGuiText("nothingSelected");
        if (this.inspectorSelection?.kind === "action") {
            const action = this.getActionByVarName(this.inspectorSelection.varName);
            if (action) selectionLabel = `${this.getGuiText("selected")}: ${action.label}`;
        } else if (this.inspectorSelection?.kind === "log") {
            selectionLabel = `${this.getGuiText("selected")}: ${this.getGuiText("log")} #${this.inspectorSelection.index + 1}`;
        }
        selectionState.textContent = selectionLabel;
        this.updatePredictorPlannerPanel();
    }

    handleQueueRowClick(actionId, event) {
        if (event?.target instanceof HTMLElement && event.target.closest(".nextActionButtons")) return;
        this.openInspectorForQueue(actionId);
    }

    handleQueueControlClick(actionId, callback, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        callback(actionId);
    }

    updatePredictorPlannerPanel() {
        const panel = document.getElementById("plannerPredictorPanel");
        const heading = document.getElementById("plannerPredictorHeading");
        const viewHeading = document.getElementById("plannerViewHeading");
        const trackedStatLabel = document.getElementById("plannerTrackedStatLabel");
        const trackedStatInput = document.getElementById("predictorTrackedStatInput");
        const totalDisplay = document.getElementById("predictorTotalDisplay");
        const statisticDisplay = document.getElementById("predictorStatisticDisplay");
        if (heading instanceof HTMLElement) {
            heading.textContent = this.getGuiText("plannerPredictorHeading");
        }
        if (viewHeading instanceof HTMLElement) {
            viewHeading.textContent = this.getGuiText("plannerViewHeading");
        }
        if (trackedStatLabel instanceof HTMLElement) {
            trackedStatLabel.textContent = this.isChineseLanguage() ? "\u8ddf\u8e2a\u9879" : "Tracked";
        }
        if (trackedStatInput instanceof HTMLSelectElement) {
            trackedStatInput.value = options.predictorTrackedStat;
            trackedStatInput.title = `${this.getTrackedStatLabel()}`;
        }
        if (!options.predictor) {
            if (totalDisplay instanceof HTMLElement) totalDisplay.textContent = "";
            if (statisticDisplay instanceof HTMLElement) statisticDisplay.textContent = "";
        }
        if (panel instanceof HTMLElement) {
            panel.classList.toggle("is-disabled", !options.predictor);
            panel.dataset.state = options.predictor ? this.predictorState : "off";
        }
    }

    getActiveQueueTownNum() {
        return actions.currentAction?.townNum ?? actions.current[actions.currentPos]?.townNum ?? -1;
    }

    updateQueueSegmentHighlight() {
        const activeTownNum = this.getActiveQueueTownNum();
        for (const element of document.querySelectorAll(".nextActionContainer")) {
            if (!(element instanceof HTMLElement)) continue;
            element.classList.toggle("zone-active-segment", Number(element.dataset.townNum) === activeTownNum);
        }
    }

    createStats() {
        if (statGraph.initalized) return;
        statGraph.init(document.getElementById("statsContainer"));
        const totalContainer = htmlElement("totalStatContainer");
        for (const stat of statList) {
            const axisTip = statGraph.getAxisTip(stat);
            totalContainer.insertAdjacentHTML("beforebegin",
            Raw.html`<div class='statContainer showthat stat-${stat}' style='left:${axisTip[0]}%;top:${axisTip[1]+3}%;' onmouseover='view.showStat("${stat}")' onmouseout='view.showStat(undefined)'>
                <div class='statLabelContainer'>
                    <div class='medium bold stat-name long-form' style='margin-left:18px;margin-top:5px;'>${_txt(`stats>${stat}>long_form`)}</div>
                    <div class='medium bold stat-name short-form' style='margin-left:18px;margin-top:5px;'>${_txt(`stats>${stat}>short_form`)}</div>
                    <div class='medium statNum stat-soulstone' style='color:var(--stat-soulstone-color);' id='stat${stat}ss'></div>
                    <div class=' statNum stat-talent'></div>
                    <div class='medium statNum stat-talent statBarWrapper'>
                        <div class='thinProgressBarLower tiny talentBar'><div class='statBar statTalentBar' id='stat${stat}TalentBar'></div></div>
                        <div class='label' id='stat${stat}Talent'>0</div>
                    </div>
                    <div class='medium statNum stat-level statBarWrapper'>
                        <div class='thinProgressBarLower tiny expBar'><div class='statBar statLevelBar' id='stat${stat}LevelBar'></div></div>
                        <div class='label bold' id='stat${stat}Level'>0</div>
                    </div>
                </div>
                <div class='statBars'>
                    <div class='thinProgressBarUpper expBar'><div class='statBar statLevelLogBar logBar' id='stat${stat}LevelLogBar'></div></div>
                    <div class='thinProgressBarLower talentBar'><div class='statBar statTalentLogBar logBar' id='stat${stat}TalentLogBar'></div></div>
                    <div class='thinProgressBarLower soulstoneBar'><div class='statBar statSoulstoneLogBar logBar' id='stat${stat}SoulstoneLogBar'></div></div>
                </div>
                <div class='showthis' id='stat${stat}Tooltip' style='width:225px;'>
                    <div class='medium bold'>${_txt(`stats>${stat}>long_form`)}</div><br>${_txt(`stats>${stat}>blurb`)}
                    <br>
                    <div class='medium bold'>${_txt("stats>tooltip>level")}:</div> <div id='stat${stat}Level2'></div>
                    <br>
                    <div class='medium bold'>${_txt("stats>tooltip>level_exp")}:</div>
                    <div id='stat${stat}LevelExp'></div>/<div id='stat${stat}LevelExpNeeded'></div>
                    <div class='statTooltipPerc'>(<div id='stat${stat}LevelProgress'></div>%)</div>
                    <br>
                    <div class='medium bold'>${_txt("stats>tooltip>talent")}:</div>
                    <div id='stat${stat}Talent2'></div>
                    <br>
                    <div class='medium bold'>${_txt("stats>tooltip>talent_exp")}:</div>
                    <div id='stat${stat}TalentExp'></div>/<div id='stat${stat}TalentExpNeeded'></div>
                    <div class='statTooltipPerc'>(<div id='stat${stat}TalentProgress'></div>%)</div>
                    <br>
                    <div class='medium bold'>${_txt("stats>tooltip>talent_multiplier")}:</div>
                    x<div id='stat${stat}TalentMult'></div>
                    <br>
                    <div id='ss${stat}Container' class='ssContainer'>
                        <div class='bold'>${_txt("stats>tooltip>soulstone")}:</div> <div id='ss${stat}'></div><br>
                        <div class='medium bold'>${_txt("stats>tooltip>soulstone_multiplier")}:</div> x<div id='stat${stat}SSBonus'></div>
                    </div><br>
                    <div class='medium bold'>${_txt("stats>tooltip>total_multiplier")}:</div> x<div id='stat${stat}TotalMult'></div>
                </div>
            </div>`);
        }
    };

    // requests are properties, where the key is the function name,
    // and the array items in the value are the target of the function
    /** @satisfies {Partial<Record<keyof View, any[]>>} */
    requests = {
        updateStats: [],
        updateStat: [],
        updateSkill: [],
        updateSkills: [],
        updateBuff: [],
        updateTrialInfo: [],
        updateTrials: [],
        updateRegular: [],
        updateProgressAction: [],
        updateMultiPartSegments: [],
        updateMultiPart: [],
        updateMultiPartActions: [],
        updateNextActions: [],
        updateCloudSave: [],
        updateTime: [],
        updateOffline: [],
        updateBonusText: [],
        updateTotals: [],
        updateStories: [],
        updateGlobalStory: [],
        updateActionLogEntry: [],
        updateCurrentActionBar: [],
        updateCurrentActionsDivs: [],
        updateTotalTicks: [],
        updateCurrentActionLoops: [],
        updateSoulstones: [],
        updateResource: [],
        updateResources: [],
        updateActionTooltips: [],
        updateLockedHidden: [],
        updateTravelMenu: [],
        updateTeamCombat: [],
        adjustManaCost: [],
        adjustGoldCost: [],
        adjustGoldCosts: [],
        adjustExpGain: [],
        removeAllHighlights: [],
        highlightIncompleteActions: [],
        highlightAction: [],
    };

    // requesting an update will call that update on the next view.update tick (based off player set UPS)
    requestUpdate(category, target) {
        if (!this.requests[category].includes(target)) this.requests[category].push(target);
    };

    handleUpdateRequests() {
        for (const category in this.requests) {
            for (const target of this.requests[category]) {
                this[category](target);
            }
            this.requests[category] = [];
        }
    };

    update() {
        this.refreshGuiLanguage();

        this.handleUpdateRequests();

        if (dungeonShowing !== undefined) this.updateSoulstoneChance(dungeonShowing);
        if (this.updateStatGraphNeeded) statGraph.update();
        this.updateQuickSettings();
        this.updatePlannerStatus();
        this.updateTime();
    };


    adjustTooltipPosition(tooltipDiv) {
        // this is a no-op now, all repositioning happens dynamically on mouseover.
        // if the delegation in mouseoverHandler ends up being too costly, though, this is where
        // we'll bind discrete mouseenter handlers, like so:

        // const trigger = /** @type {HTMLElement} */(tooltipDiv.closest(".showthat,.showthatO,.showthat2,.showthatH,.showthatloadout"));
        // trigger.onmouseenter = e => this.fixTooltipPosition(tooltipDiv, trigger, e);
    }

    /**
     * @param {HTMLElement} tooltip
     * @param {Element} trigger
     * @param {Node} eventTarget
     */
    fixTooltipPosition(tooltip, trigger, eventTarget, delayedCall=false) {
        if (tooltip.contains(eventTarget)) {
            // console.log("Not fixing tooltip while cursor is inside",{tooltip,trigger,event});
            return;
        }
        if (!trigger.parentElement) {
            // trigger has been removed from document, abort
            return;
        }
        const triggerRect = trigger.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportRect = {
            // document.documentElement.getBoundingClientRect();
            top: 0,
            left: 0,
            right: window.innerWidth,
            bottom: window.innerHeight,
        };
        const viewportMargins = {
            top: triggerRect.top - viewportRect.top,
            right: viewportRect.right - triggerRect.right,
            bottom: viewportRect.bottom - triggerRect.bottom,
            left: triggerRect.left - viewportRect.left,
        };
        const triggerParentStyle = getComputedStyle(trigger.parentElement);
        const wantsSidePosition = triggerParentStyle.display === "flex" && triggerParentStyle.flexDirection === "column";

        // We prefer to display tooltips above or below the trigger, except in the action list and the changelog
        let displayOverUnder = true;
        if (tooltipRect.height > Math.max(viewportMargins.top, viewportMargins.bottom)) displayOverUnder = false;
        if (wantsSidePosition && tooltipRect.width <= Math.max(viewportMargins.left, viewportMargins.right)) displayOverUnder = false;

        const targetPos = {
            x: 0,
            y: 0,
        };

        if (displayOverUnder) {
            targetPos.y = viewportMargins.top > viewportMargins.bottom
                          ? triggerRect.top - tooltipRect.height
                          : triggerRect.bottom;
            targetPos.x = viewportMargins.left > viewportMargins.right && tooltipRect.width > triggerRect.width
                          ? triggerRect.right - tooltipRect.width
                          : triggerRect.left;
        } else {
            targetPos.x = viewportMargins.left > viewportMargins.right
                          ? triggerRect.left - tooltipRect.width
                          : triggerRect.right;
            targetPos.y = viewportMargins.top > viewportMargins.bottom
                          ? triggerRect.bottom - tooltipRect.height
                          : triggerRect.top;
        }

        // check all bounds and nudge the tooltip back onto the screen if necessary, favoring the
        // top and left edges. don't trust the trbl on tooltipRect, since adjusting those isn't in spec.
        targetPos.x = Math.min(targetPos.x, viewportRect.right - tooltipRect.width);
        targetPos.y = Math.min(targetPos.y, viewportRect.bottom - tooltipRect.height);
        targetPos.x = Math.max(targetPos.x, viewportRect.left);
        targetPos.y = Math.max(targetPos.y, viewportRect.top);

        // console.log("Fixing tooltip:",{tooltip,tooltipRect,trigger,triggerRect,event});

        // Now, check and see if we can do a nudge (valid rect, currently fixed) or if we have to do initial position
        const curLeft = parseFloat(tooltip.style.left);
        const curTop = parseFloat(tooltip.style.top);
        if (tooltip.style.position === "fixed" && isFinite(curLeft) && isFinite(curTop) && tooltipRect.width > 0 && tooltipRect.height > 0) {
            // simple nudge
            tooltip.style.left = `${curLeft + targetPos.x - tooltipRect.x}px`;
            tooltip.style.top = `${curTop + targetPos.y - tooltipRect.y}px`;
        } else {
            // initial positioning
            tooltip.style.position = "fixed";
            tooltip.style.left = `${targetPos.x - viewportRect.left}px`;
            tooltip.style.top = `${targetPos.y - viewportRect.top}px`;
            tooltip.style.right = "auto";
            tooltip.style.bottom = "auto";
            tooltip.style.margin = "0";
            if (!delayedCall) {
                // queue up a nudge ASAP, but avoid infinite recursion
                requestAnimationFrame(() => this.fixTooltipPosition(tooltip, trigger, eventTarget, true));
            }
        }
    }

    showStat(stat) {
        statShowing = stat;
        if (stat !== undefined) this.updateStat(stat);
    };

    updateStatGraphNeeded = false;

    /** @param {StatName} stat */
    updateStat(stat) {
        const level = getLevel(stat);
        const talent = getTalent(stat);
        const totalLevel = Object.values(stats).map(s=>s.statLevelExp.level).reduce((a,b) => a + b);
        const totalTalent = Object.values(stats).map(s=>s.talentLevelExp.level).reduce((a,b) => a + b);
        const levelPrc = `${getPrcToNextLevel(stat)}%`;
        const talentPrc = `${getPrcToNextTalent(stat)}%`;

        this.updateLevelLogBar("statsContainer", `stat${stat}LevelLogBar`, level, `stat${stat}LevelBar`, levelPrc);
        this.updateLevelLogBar("statsContainer", `stat${stat}TalentLogBar`, talent, `stat${stat}TalentBar`, talentPrc);

        document.getElementById(`stat${stat}Level`).textContent = intToString(level, 1);
        document.getElementById(`stat${stat}Talent`).textContent = intToString(talent, 1);
        document.getElementById(`stattotalLevel`).textContent = intToString(totalLevel, 1);
        document.getElementById(`stattotalTalent`).textContent = intToString(totalTalent, 1);
        document.getElementById(`stattotalLevel2`).textContent = formatNumber(totalLevel);
        document.getElementById(`stattotalTalent2`).textContent = formatNumber(totalTalent);

        if (statShowing === stat || document.getElementById(`stat${stat}LevelExp`).innerHTML === "") {
            document.getElementById(`stat${stat}Level2`).textContent = formatNumber(level);
            document.getElementById(`stat${stat}LevelExp`).textContent = intToString(stats[stat].statLevelExp.exp, 1);
            document.getElementById(`stat${stat}LevelExpNeeded`).textContent = intToString(stats[stat].statLevelExp.expRequiredForNextLevel, 1);
            document.getElementById(`stat${stat}LevelProgress`).textContent = intToString(levelPrc, 2);

            document.getElementById(`stat${stat}Talent2`).textContent = formatNumber(talent);
            document.getElementById(`stat${stat}TalentExp`).textContent = intToString(stats[stat].talentLevelExp.exp, 1);
            document.getElementById(`stat${stat}TalentExpNeeded`).textContent = intToString(stats[stat].talentLevelExp.expRequiredForNextLevel, 1);
            document.getElementById(`stat${stat}TalentMult`).textContent = intToString(stats[stat].talentMult, 3);
            document.getElementById(`stat${stat}TalentProgress`).textContent = intToString(talentPrc, 2);
            document.getElementById(`stat${stat}TotalMult`).textContent = intToString(getTotalBonusXP(stat), 3);
        }
};

    logBarScaleBase = 1.25;
    /** @param {number} maxValue  */
    getMaxLogBarScale(maxValue) {
        return this.logBarScaleBase ** Math.ceil(Math.log(maxValue) / Math.log(this.logBarScaleBase));
    }

    /**
     * @param {string} maxContainerId
     * @param {string} logBarId
     * @param {number} level
     * @param {string} [levelBarId]
     * @param {string} [levelPrc]
     */
    updateLevelLogBar(maxContainerId, logBarId, level, levelBarId, levelPrc) {
        const maxContainer = htmlElement(maxContainerId);
        const logLevel = level; //Math.log10(level);
        let maxValue = parseFloat(getComputedStyle(maxContainer).getPropertyValue("--max-bar-value")) || 0;

        const logBar = htmlElement(logBarId);
        if (level > maxValue) {
            maxValue = this.getMaxLogBarScale(level + 1);
            maxContainer.style.setProperty("--max-bar-value", String(maxValue));
        }
        logBar.style.setProperty("--bar-value", String(logLevel));
        if (levelBarId) document.getElementById(levelBarId).style.width = levelPrc;
    }

    updateStats(skipAnimation) {
        let maxValue = 100; // I really need to stop writing this default explicitly everywhere
        for (const stat of statList) {
            for (const value of [getLevel(stat), getTalent(stat), stats[stat].soulstone]) {
                maxValue = Math.max(value, maxValue);
            }
        }
        maxValue = this.getMaxLogBarScale(maxValue);
        const statsContainer = htmlElement("statsContainer");
        if (skipAnimation) {
            statsContainer.classList.remove("animate-logBars");
            statGraph.update(true);
        }
        statsContainer.style.setProperty("--max-bar-value", String(maxValue));
        if (!statsContainer.classList.contains("animate-logBars")) {
            requestAnimationFrame(() => statsContainer.classList.add("animate-logBars"));
        }

        for (const stat of statList) {
            this.updateStat(stat);
        }
    };

    showSkill(skill) {
        skillShowing = skill;
        if (skill !== undefined) this.updateSkill(skill);
    };

    /** @param {SkillName} skill */
    updateSkill(skill) {
        if (skills[skill].levelExp.level === 0) {
            document.getElementById(`skill${skill}Container`).style.display = "none";
            return;
        }
        let container = document.getElementById(`skill${skill}Container`);
        container.style.display = "inline-block";
        if (skill === "Combat" || skill === "Pyromancy" || skill === "Restoration") {
            this.updateTeamCombat();
        }

        const levelPrc = getPrcToNextSkillLevel(skill);
        document.getElementById(`skill${skill}Level`).textContent = (getSkillLevel(skill) > 9999) ? toSuffix(getSkillLevel(skill)) : formatNumber(getSkillLevel(skill));
        document.getElementById(`skill${skill}LevelBar`).style.width = `${levelPrc}%`;

        if (skillShowing === skill) {
            document.getElementById(`skill${skill}LevelExp`).textContent = intToString(skills[skill].levelExp.exp, 1);
            document.getElementById(`skill${skill}LevelExpNeeded`).textContent = intToString(skills[skill].levelExp.expRequiredForNextLevel, 1);
            document.getElementById(`skill${skill}LevelProgress`).textContent = intToString(levelPrc, 2);

            if (skill === "Dark") {
                document.getElementById("skillBonusDark").textContent = intToString(getSkillBonus("Dark"), 4);
            } else if (skill === "Chronomancy") {
                document.getElementById("skillBonusChronomancy").textContent = intToString(getSkillBonus("Chronomancy"), 4);
            } else if (skill === "Practical") {
                document.getElementById("skillBonusPractical").textContent = getSkillBonus("Practical").toFixed(3).replace(/(\.\d*?[1-9])0+$/gu, "$1");
            } else if (skill === "Mercantilism") {
                document.getElementById("skillBonusMercantilism").textContent = intToString(getSkillBonus("Mercantilism"), 4);
            } else if (skill === "Spatiomancy") {
                document.getElementById("skillBonusSpatiomancy").textContent = getSkillBonus("Spatiomancy").toFixed(3).replace(/(\.\d*?[1-9])0+$/gu, "$1");
            } else if (skill === "Divine") {
                document.getElementById("skillBonusDivine").textContent = intToString(getSkillBonus("Divine"), 4);
            } else if (skill === "Commune") {
                document.getElementById("skillBonusCommune").textContent = getSkillBonus("Commune").toFixed(3).replace(/(\.\d*?[1-9])0+$/gu, "$1");
            } else if (skill === "Wunderkind") {
                document.getElementById("skillBonusWunderkind").textContent = intToString(getSkillBonus("Wunderkind"), 4);
            }else if (skill === "Gluttony") {
                document.getElementById("skillBonusGluttony").textContent = getSkillBonus("Gluttony").toFixed(3).replace(/(\.\d*?[1-9])0+$/gu, "$1");
            } else if (skill === "Thievery") {
                document.getElementById("skillBonusThievery").textContent = intToString(getSkillBonus("Thievery"), 4);
            } else if (skill === "Leadership") {
                document.getElementById("skillBonusLeadership").textContent = intToString(getSkillBonus("Leadership"), 4);
            } else if (skill === "Assassin") {
                document.getElementById("skillBonusAssassin").textContent = intToString(getSkillBonus("Assassin"), 4);
            }
        }
        this.adjustTooltipPosition(container.querySelector("div.showthis"));
    };

    updateSkills() {
        for (const skill of skillList) {
            this.updateSkill(skill);
        }
    };

    showBuff(buff) {
        buffShowing = buff;
        if (buff !== undefined) this.updateBuff(buff);
    };

    updateBuff(buff) {
        if (buffs[buff].amt === 0) {
            document.getElementById(`buff${buff}Container`).style.display = "none";
            this.updateBuffGroups();
            return;
        }
        let container = document.getElementById(`buff${buff}Container`);
        container.style.display = "flex";
        document.getElementById(`buff${buff}Level`).textContent = `${getBuffLevel(buff)}/`;
        if (buff === "Imbuement") {
            this.updateTrainingLimits();
        }
        this.adjustTooltipPosition(container.querySelector("div.showthis"));
        this.updateBuffGroups();
    };

    updateBuffs() {
        for (const buff of buffList) {
            this.updateBuff(buff);
        }
        this.updateBuffGroups();
    };

    /** @param {string|gapi.client.drive.File} fileOrText */
    updateCloudSave(fileOrText) {
        const list = document.getElementById("cloud_save_result");
        if (typeof fileOrText === "string") {
            list.innerHTML = fileOrText;
        } else if (fileOrText) {
            const fileId = fileOrText.id;
            const fileName = fileOrText.name;
            let li = document.getElementById(`cloud_save_${fileId}`);
            if (li && !fileName) {
                li.remove();
                return;
            }
            if (!li) {
                li = document.createElement("li");
                list.appendChild(li);
            }
            li.className = "cloud_save";
            li.id = `cloud_save_${fileId}`;
            li.dataset.fileId = fileId;
            li.dataset.fileName = fileName;
            li.innerHTML = `
                <button onclick='startRenameCloudSave("${fileId}")' class='cloud_rename actionIcon fas fa-pencil-alt'></button>
                <div class="cloud_save_name"'>
                    ${fileName}
                </div>
                <button class='button cloud_import' style='margin-top: 1px;' onclick='googleCloud.importFile("${fileId}")'>${_txt("menu>save>import_button")}</button>
                <button class='button cloud_delete' style='margin-top: 1px;' onclick='askDeleteCloudSave("${fileId}")'>${_txt("menu>save>delete_button")}</button>
            `;
            const name = /** @type {HTMLElement} */(li.querySelector(".cloud_save_name"));
            name.textContent = fileName;
            name.title = fileName;
        }
    }

    updateTime() {
        document.getElementById("timeBar").style.width = `${100 - timer / timeNeeded * 100}%`;
        document.getElementById("timer").textContent = `${intToString((timeNeeded - timer), options.fractionalMana ? 2 : 1, true)} | ${formatTime((timeNeeded - timer) / 50 / getActualGameSpeed())}`;
        this.adjustGoldCost({varName:"Wells", cost: Action.ManaWell.goldCost()});
    };
    updateOffline() {
        document.getElementById("bonusSeconds").textContent = formatTime(totalOfflineMs / 1000);
        const returnTimeButton = document.getElementById("returnTimeButton");
        if (returnTimeButton instanceof HTMLButtonElement) {
            returnTimeButton.disabled = totalOfflineMs < 86400_000;
        }
    }
    updateBonusText() {
        const element = document.getElementById("bonusText");
        if (!element) return;
        element.innerHTML = this.getBonusText() ?? "";
    }
    getBonusText() {
        let text = _txt("time_controls>bonus_seconds>main_text");
        let lastText = null;
        while (lastText !== text) {
            lastText = text;
            text = text?.replace(/{([^+{}-]*)([+-]?)(.*?)}/g, (_str, lhs, op, rhs) => this.getBonusReplacement(lhs, op, rhs));
        }
        return text;
    }
    /** @type {(lhs: string, op?: string, rhs?: string) => string} */
    getBonusReplacement(lhs, op, rhs) {
        // this is the second time I've manually implemented this text-replacement pattern (first was for Action Log entries). Next time I need to make it a
        // generic operation on Localization; I think I'm beginning to figure out what will be needed for it
        const fgSpeed = Math.max(5, options.speedIncrease10x ? 10 : 0, options.speedIncrease20x ? 20 : 0, options.speedIncreaseCustom);
        const bgSpeed = !isFinite(options.speedIncreaseBackground) ? -1 : options.speedIncreaseBackground ?? -1;
        const variables = {
            __proto__: null, // toString is not a valid replacement name
            get background_info() {
                if (bgSpeed < 0 || bgSpeed === fgSpeed) {
                    return _txt("time_controls>bonus_seconds>background_disabled");
                } else if (bgSpeed === 0) {
                    return _txt("time_controls>bonus_seconds>background_0x");
                } else if (bgSpeed < 1) {
                    return _txt("time_controls>bonus_seconds>background_regen");
                } else if (bgSpeed === 1) {
                    return _txt("time_controls>bonus_seconds>background_1x");
                } else if (bgSpeed < fgSpeed) {
                    return _txt("time_controls>bonus_seconds>background_slower");
                } else {
                    return _txt("time_controls>bonus_seconds>background_faster");
                }
            },
            get state() {return `<span class='bold' id='isBonusOn'>${_txt(`time_controls>bonus_seconds>state>${isBonusActive() ? "on" : "off"}`)}</span>`},
            get counter_text() {return `<span class='bold'>${_txt("time_controls>bonus_seconds>counter_text")}</span>`},
            get bonusSeconds() {return `<span id='bonusSeconds'>${formatTime(totalOfflineMs / 1000)}</span>`},
            get lag_warning() {return lagSpeed > 0 ? _txt("time_controls>bonus_seconds>lag_warning") : ""},
            speed: fgSpeed,
            background_speed: bgSpeed,
            lagSpeed,
        }
        const lval = variables[lhs] ?? (parseFloat(lhs) || 0);
        const rval = variables[rhs] ?? (parseFloat(rhs) || 0);
        return String(
            op === "+" ? lval + rval
            : op === "-" ? lval - rval
            : lval);
    }
    updateTotalTicks() {
        document.getElementById("totalTicks").textContent = `${formatNumber(actions.completedTicks)} | ${formatTime(timeCounter)}`;
        document.getElementById("effectiveTime").textContent = `${formatTime(effectiveTime)}`;
    };
    toggleTrackedResourcePin(resource, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        const index = this.pinnedTrackedResources.indexOf(resource);
        if (index >= 0) {
            this.pinnedTrackedResources.splice(index, 1);
        } else {
            this.pinnedTrackedResources.unshift(resource);
        }
        window.localStorage.setItem("pinnedTrackedResources", JSON.stringify(this.pinnedTrackedResources));
        this.applyTrackedResourcePins();
    }
    applyTrackedResourcePins() {
        const container = document.getElementById("trackedResources");
        if (!(container instanceof HTMLElement)) return;
        const pinnedSet = new Set(this.pinnedTrackedResources);
        const resourceElements = Array.from(container.querySelectorAll(".resource[data-resource-id]"))
            .filter(element => element instanceof HTMLElement);
        resourceElements.sort((left, right) => {
            const leftPinned = pinnedSet.has(left.dataset.resourceId ?? "");
            const rightPinned = pinnedSet.has(right.dataset.resourceId ?? "");
            if (leftPinned !== rightPinned) return leftPinned ? -1 : 1;
            return Number(left.dataset.resourceOrder ?? "0") - Number(right.dataset.resourceOrder ?? "0");
        });
        for (const element of resourceElements) {
            container.appendChild(element);
            const resourceId = element.dataset.resourceId ?? "";
            const isPinned = pinnedSet.has(resourceId);
            element.classList.toggle("resource-pinned", isPinned);
            const button = element.querySelector(".trackedResourcePinButton");
            if (button instanceof HTMLElement) {
                button.classList.toggle("is-active", isPinned);
                button.textContent = isPinned ? "\u2605" : "\u2606";
                const label = this.getTrackedResourcePinLabel(isPinned);
                button.setAttribute("title", label);
                button.setAttribute("aria-label", label);
            }
        }
    }
    updateResource(resource) {
        const element = htmlElement(`${resource}Div`, false, false);
        if (element) element.style.display = resources[resource] ? "inline-flex" : "none";

        if (resource === "supplies") {
            const suppliesCostElement = document.getElementById("suppliesCost");
            if (suppliesCostElement) suppliesCostElement.textContent = String(towns[0].suppliesCost);
        }
        if (resource === "teamMembers") {
            const teamCostElement = document.getElementById("teamCost");
            if (teamCostElement) teamCostElement.textContent = `${(resources.teamMembers + 1) * 100}`;
        }

        const valueElement = htmlElement(resource, false, false);
        if (Number.isFinite(resources[resource]) && valueElement) valueElement.textContent = resources[resource];
    };
    updateResources() {
        for (const resource in resources) this.updateResource(resource);
        this.applyTrackedResourcePins();
    };
    updateActionTooltips() {
        document.getElementById("goldInvested").textContent = intToStringRound(goldInvested);
        document.getElementById("bankInterest").textContent = intToStringRound(goldInvested * .001);
        document.getElementById("actionAllowedPockets").textContent = intToStringRound(towns[7].totalPockets);
        document.getElementById("actionAllowedWarehouses").textContent = intToStringRound(towns[7].totalWarehouses);
        document.getElementById("actionAllowedInsurance").textContent = intToStringRound(towns[7].totalInsurance);
        document.getElementById("totalSurveyProgress").textContent = `${getExploreProgress()}`;
        Array.from(document.getElementsByClassName("surveySkill")).forEach(div => {
            div.textContent = `${getExploreSkill()}`;
        });
        for (const town of towns) {
            const varName = town.progressVars.find(v => v.startsWith("Survey"));
            this.updateGlobalSurvey(varName, town);
        }
    }
    updateTeamCombat() {
        if (towns[2].unlocked) {
            document.getElementById("skillSCombatContainer").style.display = "inline-block";
            document.getElementById("skillTCombatContainer").style.display = "inline-block";
            document.getElementById("skillSCombatLevel").textContent = intToString(getSelfCombat(), 1);
            document.getElementById("skillTCombatLevel").textContent = intToString(getTeamCombat(), 1);
        } else {
            document.getElementById("skillSCombatContainer").style.display = "none";
            document.getElementById("skillTCombatContainer").style.display = "none";
        }
    };
    zoneTints = [
        "var(--zone-tint-1)", //Beginnersville
        "var(--zone-tint-2)", //Forest Path
        "var(--zone-tint-3)", //Merchanton
        "var(--zone-tint-4)", //Mt Olympus
        "var(--zone-tint-5)", //Valhalla
        "var(--zone-tint-6)", //Startington
        "var(--zone-tint-7)", //Jungle Path
        "var(--zone-tint-8)", //Commerceville
        "var(--zone-tint-9)", //Valley of Olympus
    ];
    highlightAction(index) {
        const element = document.getElementById(`nextActionContainer${index}`);
        if (!(element instanceof HTMLElement)) return;
        element.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest",
        })
    };
    getQueuedActionRepeatKey(queuedAction) {
        return [
            queuedAction.name,
            queuedAction.loops,
            queuedAction.disabled ? 1 : 0,
            queuedAction.collapsed ? 1 : 0,
            queuedAction.action.townNum,
        ].join("|");
    }
    annotateQueuedActionsForDisplay(queuedActions) {
        const selectedQueueActionId = this.inspectorSelection?.source === "queue"
            ? this.inspectorSelection.actionId
            : -1;
        for (let start = 0; start < queuedActions.length;) {
            let end = start + 1;
            const repeatKey = this.getQueuedActionRepeatKey(queuedActions[start]);
            while (end < queuedActions.length && this.getQueuedActionRepeatKey(queuedActions[end]) === repeatKey) {
                end++;
            }
            const repeatGroupSize = end - start;
            for (let index = start; index < end; index++) {
                const queuedAction = queuedActions[index];
                queuedAction.repeatGroupSize = repeatGroupSize;
                queuedAction.repeatGroupIndex = index - start;
                queuedAction.isRepeatLeader = repeatGroupSize > 1 && index === start;
                queuedAction.hideInRepeatGroup = this.queueCompactRepeats
                    && repeatGroupSize > 1
                    && index > start
                    && queuedAction.actionId !== selectedQueueActionId;
            }
            start = end;
        }
        return queuedActions;
    }
    updateNextActions() {
        const {scrollTop} = nextActionsDiv; // save the current scroll position
        this.setPredictorState(options.predictor ? "running" : "off");
        if (options.predictor) {
            Koviko.preUpdateHandler(nextActionsDiv);
        }
        const activeTownNum = this.getActiveQueueTownNum();
        const queuedActions = actions.next.map((a, index, allActions) => {
            const action = getActionPrototype(a.name);
            const previousAction = index > 0 ? getActionPrototype(allActions[index - 1].name) : null;
            return {
                ...a,
                actionId: a.actionId /* not enumerable by design */,
                index,
                action,
                startsNewZone: index === 0 || previousAction?.townNum !== action.townNum,
                zoneName: getTownName(action.townNum),
                isActiveZone: action.townNum === activeTownNum,
            };
        });
        this.annotateQueuedActionsForDisplay(queuedActions);

        const actionContainers = d3.select(nextActionsDiv)
            .selectAll(".nextActionContainer")
            .data(queuedActions, a => a.actionId)
            .join(enter => enter
                .append(({action, actionId: i}) => Rendered.html`
                    <div
                        id='nextActionContainer${i}'
                        class='nextActionContainer small showthat'
                        onclick=${this.handleQueueRowClick.bind(this, i)}
                        ondragover=${handleDragOver}
                        ondrop=${handleDragDrop}
                        ondragstart=${handleDragStart}
                        ondragend=${draggedUndecorate.bind(null, i)}
                        ondragenter=${dragOverDecorate.bind(null, i)}
                        ondragleave=${dragExitUndecorate.bind(null, i)}
                        draggable='true' tabindex='0' role='button' data-action-id='${i}'
                    >
                        <div class='nextActionLoops'><img class='smallIcon imageDragFix'> ×
                        <div class='bold'></div><span class='nextActionRepeatBadge hidden'></span></div>
                        <div class='nextActionCategoryMark'></div>
                        <div class='nextActionButtons'>
                            <button onclick=${this.handleQueueControlClick.bind(this, i, capAction)}      class='capButton actionIcon far fa-circle'></button>
                            <button onclick=${this.handleQueueControlClick.bind(this, i, addLoop)}        class='plusButton actionIcon fas fa-plus'></button>
                            <button onclick=${this.handleQueueControlClick.bind(this, i, removeLoop)}     class='minusButton actionIcon fas fa-minus'></button>
                            <button onclick=${this.handleQueueControlClick.bind(this, i, split)}          class='splitButton actionIcon fas fa-arrows-alt-h'></button>
                            <button onclick=${this.handleQueueControlClick.bind(this, i, collapse)}       class='collapseButton actionIcon fas fa-compress-alt'></button>
                            <button onclick=${this.handleQueueControlClick.bind(this, i, moveUp)}         class='upButton actionIcon fas fa-sort-up'></button>
                            <button onclick=${this.handleQueueControlClick.bind(this, i, moveDown)}       class='downButton actionIcon fas fa-sort-down'></button>
                            <button onclick=${this.handleQueueControlClick.bind(this, i, disableAction)}  class='skipButton actionIcon far fa-times-circle'></button>
                            <button onclick=${this.handleQueueControlClick.bind(this, i, removeAction)}   class='removeButton actionIcon fas fa-times'></button>
                        </div>
                        <ul class='koviko'></ul>
                    </div>
                `.firstElementChild))
            .property("data-index", (_a, i) => i)
            .call(container => {
                for (const {index} of towns) {
                    container.classed(`zone-${index+1}`, a => a.action.townNum === index);
                }
                for (const type of actionTypes) {
                    container.classed(`action-type-${type}`, a => a.action.type === type);
                }
                for (const category of actionCategories) {
                    container.classed(`action-category-${category}`, a => a.action.category === category);
                }
            })
            .attr("data-action-category", a => a.action.category)
            .attr("data-action-var-name", a => a.action.varName)
            .attr("data-town-num", a => String(a.action.townNum))
            .attr("data-zone-name", a => a.zoneName)
            .classed("action-has-limit", a => hasLimit(a.name))
            .classed("action-is-training", a => isTraining(a.name))
            .classed("action-is-singular", a => a.action.allowed?.() === 1)
            .classed("action-is-travel", a => getPossibleTravel(a.name).length > 0)
            .classed("action-disabled", a => !actions.isValidAndEnabled(a))
            .classed("user-disabled", a => !!a.disabled)
            .classed("user-collapsed", a => !!a.collapsed)
            .classed("starts-new-zone", a => a.startsNewZone)
            .classed("zone-active-segment", a => a.isActiveZone)
            .classed("zone-collapsed", a => actions.zoneSpanAtIndex(a.index).isCollapsed)
            .classed("repeat-group-leader", a => !!a.isRepeatLeader)
            .classed("repeat-group-hidden", a => !!a.hideInRepeatGroup)
            .classed("action-is-collapsing-zone", a => {
                const zoneSpan = actions.zoneSpanAtIndex(a.index);
                return zoneSpan.end === a.index && zoneSpan.isCollapsed;
            })
            .style("background", ({action}) => {
                const {townNum} = action;
                const travelNums = getPossibleTravel(action.name);
                let color = this.zoneTints[townNum];
                if (travelNums.length === 1) {
                    color = `linear-gradient(${color} 49%, ${this.zoneTints[townNum + travelNums[0]]} 51%)`;
                } else if (travelNums.length > 1) {
                    color = `conic-gradient(${color} 100grad, ${travelNums.map((travelNum, i) => `${this.zoneTints[townNum + travelNum]} ${i * 200 / travelNums.length + 100}grad ${(i + 1) * 200 / travelNums.length + 100}grad`).join(", ")}, ${color} 300grad)`
                }
                return color;
            })
            .call(container => container
                .select("div.nextActionCategoryMark")
                .text(({action}) => getActionCategoryShortLabel(action.category))
                .property("title", ({action}) => getActionCategoryLabel(action.category)))
            .call(container => container
                .select("div.nextActionLoops > img")
                .property("src", a => `img/${a.action.imageName}.svg`))
            .call(container => container
                .select("div.nextActionLoops > div.bold")
                .text(action => action.loops > 99999 ? toSuffix(action.loops) : formatNumber(action.loops))
            )
            .call(container => container
                .select("span.nextActionRepeatBadge")
                .classed("hidden", action => !(action.repeatGroupSize > 1 && action.isRepeatLeader))
                .text(action => action.repeatGroupSize > 1 ? `x${action.repeatGroupSize}` : "")
                .attr("title", action => action.repeatGroupSize > 1 ? `${action.repeatGroupSize} matching rows` : "")
            )
            .call(container => {
                const buttonTitles = [
                    ["button.capButton", this.getGuiText("queueCapAction")],
                    ["button.plusButton", this.getGuiText("queueAddLoop")],
                    ["button.minusButton", this.getGuiText("queueRemoveLoop")],
                    ["button.splitButton", this.getGuiText("queueSplit")],
                    ["button.collapseButton", this.getGuiText("queueCollapse")],
                    ["button.upButton", this.getGuiText("queueMoveUp")],
                    ["button.downButton", this.getGuiText("queueMoveDown")],
                    ["button.skipButton", this.getGuiText("queueDisable")],
                    ["button.removeButton", this.getGuiText("queueRemove")],
                ];
                for (const [selector, label] of buttonTitles) {
                    container.selectAll(selector)
                        .attr("title", label)
                        .attr("aria-label", label);
                }
            });

        if (options.predictor) {
            Koviko.postUpdateHandler(actions.next, nextActionsDiv);
        }
        nextActionsDiv.scrollTop = Math.max(nextActionsDiv.scrollTop, scrollTop); // scrolling down to see the new thing added is okay, scrolling up when you click an action button is not
        this.updateQueueSegmentHighlight();
        this.updateLoadoutManager();
        this.applyInspectorSelectionHighlight();
        this.renderInspector();
        this.updatePlannerStatus();
    };

    updateCurrentActionsDivs() {
        let totalDivText = "";

        // definite leak - need to remove listeners and image
        for (let i = 0; i < actions.current.length; i++) {
            const action = actions.current[i];
            const actionLoops = action.loops > 99999 ? toSuffix(action.loops) : formatNumber(action.loops);
            const actionLoopsDone = (action.loops - action.loopsLeft) > 99999 ? toSuffix(action.loops - action.loopsLeft) : formatNumber(action.loops - action.loopsLeft);
            const imageName = action.name.startsWith("Assassin") ? "assassin" : camelize(action.name);
            totalDivText +=
                `<div class='curActionContainer small' onmouseover='view.mouseoverAction(${i}, true)' onmouseleave='view.mouseoverAction(${i}, false)'>
                    <div class='curActionBar' id='action${i}Bar'></div>
                    <div class='actionSelectedIndicator' id='action${i}Selected'></div>
                    <img src='img/${imageName}.svg' class='smallIcon'>
                    <div id='action${i}LoopsDone' style='margin-left:3px; border-left: 1px solid var(--action-separator-border);padding-left: 3px;'>${actionLoopsDone}</div>
                    /<div id='action${i}Loops'>${actionLoops}</div>
                </div>`;
        }

        curActionsDiv.innerHTML = totalDivText;

        totalDivText = "";

        for (let i = 0; i < actions.current.length; i++) {
            const action = actions.current[i];
            totalDivText +=
                `<div id='actionTooltip${i}' style='display:none;padding-left:10px;width:90%'>` +
                    `<div style='text-align:center;width:100%'>${action.label}</div><br><br>` +
                    `<b>${_txt("actions>current_action>mana_original")}</b> <div id='action${i}ManaOrig'></div><br>` +
                    `<b>${_txt("actions>current_action>mana_used")}</b> <div id='action${i}ManaUsed'></div><br>` +
                    `<b>${_txt("actions>current_action>last_mana")}</b> <div id='action${i}LastMana'></div><br>` +
                    `<b>${_txt("actions>current_action>mana_remaining")}</b> <div id='action${i}Remaining'></div><br>` +
                    `<b>${_txt("actions>current_action>gold_remaining")}</b> <div id='action${i}GoldRemaining'></div><br>` +
                    `<b>${_txt("actions>current_action>time_spent")}</b> <div id='action${i}TimeSpent'></div><br>` +
                    `<b>${_txt("actions>current_action>total_time_elapsed")}</b> <div id='action${i}TotalTimeElapsed'></div><br>` +
                    `<br>` +
                    `<div id='action${i}ExpGain'></div>` +
                    `<div id='action${i}HasFailed' style='display:none'>` +
                        `<div id='action${i}FailedAttemptsRow'>` +
                            `<b>${_txt("actions>current_action>failed_attempts")}</b> <div id='action${i}Failed'></div><br>` +
                        `</div>` +
                        `<b>${getActionFailureTypeLabelText()}</b> <div id='action${i}FailureType'></div><br>` +
                        `<div id='action${i}FailureReasonRow'>` +
                            `<b>${getActionFailureReasonLabelText()}</b> <div id='action${i}Error'></div>` +
                        `</div>` +
                    `</div>` +
                `</div>`;
        }

        document.getElementById("actionTooltipContainer").innerHTML = totalDivText;
        this.mouseoverAction(0, false);
    };

    updateCurrentActionBar(index) {
        const div = document.getElementById(`action${index}Bar`);
        if (!div) {
            return;
        }
        const action = actions.current[index];
        if (!action) {
            return;
        }
        const failureInfo = action.failureInfo;
        if (failureInfo) {
            document.getElementById(`action${index}Failed`).textContent = `${action.loopsLeft}`;
            document.getElementById(`action${index}FailureType`).textContent = getActionFailureKindLabel(failureInfo.kind);
            document.getElementById(`action${index}Error`).textContent = action.errorMessage ?? getActionFailureReason(failureInfo, action);
            document.getElementById(`action${index}FailedAttemptsRow`).style.display = failureInfo.countsAsFailure ? "" : "none";
            document.getElementById(`action${index}FailureReasonRow`).style.display = action.errorMessage ? "" : "none";
            document.getElementById(`action${index}HasFailed`).style.display = "";
            div.style.width = "100%";
            div.style.backgroundColor = failureInfo.severity === "soft"
                ? "var(--button-warning-background)"
                : "var(--cur-action-error-indicator)";
            div.style.height = "30%";
            div.style.marginTop = "5px";
            if (failureInfo.countsAsFailure) {
                if (action.name === "Heal The Sick") setStoryFlag("failedHeal");
                if (action.name === "Brew Potions" && failureInfo.detail === "reputationLow" && resources.reputation >= 0 && resources.herbs >= 10) setStoryFlag("failedBrewPotions");
                if (action.name === "Brew Potions" && failureInfo.detail === "reputationLow" && resources.reputation < 0 && resources.herbs >= 10) setStoryFlag("failedBrewPotionsNegativeRep");
                if (action.name === "Gamble" && failureInfo.detail === "reputationLow") setStoryFlag("failedGamble");
                if (action.name === "Gamble" && failureInfo.detail === "goldLow" && resources.reputation > -6) setStoryFlag("failedGambleLowMoney");
                if (action.name === "Gather Team") setStoryFlag("failedGatherTeam");
                if (action.name === "Craft Armor") setStoryFlag("failedCraftArmor");
                if (action.name === "Imbue Body") setStoryFlag("failedImbueBody");
                if (action.name === "Accept Donations") setStoryFlag("failedReceivedDonations");
                if (action.name === "Raise Zombie") setStoryFlag("failedRaiseZombie");
            }
        } else if (action.loopsLeft === 0) {
            document.getElementById(`action${index}HasFailed`).style.display = "none";
            div.style.width = "100%";
            div.style.backgroundColor = "var(--cur-action-completed-background)";
            div.style.height = "";
            div.style.marginTop = "";
        } else {
            document.getElementById(`action${index}HasFailed`).style.display = "none";
            div.style.width = `${100 * action.ticks / action.adjustedTicks}%`;
            div.style.backgroundColor = "";
            div.style.height = "";
            div.style.marginTop = "";
        }

        // only update tooltip if it's open
        if (curActionShowing === index) {
            document.getElementById(`action${index}ManaOrig`).textContent = intToString(action.manaCost() * action.loops, options.fractionalMana ? 3 : 1);
            document.getElementById(`action${index}ManaUsed`).textContent = intToString(action.manaUsed, options.fractionalMana ? 3 : 1);
            document.getElementById(`action${index}LastMana`).textContent = intToString(action.lastMana, 3);
            document.getElementById(`action${index}Remaining`).textContent = intToString(action.manaRemaining, options.fractionalMana ? 3 : 1);
            document.getElementById(`action${index}GoldRemaining`).textContent = formatNumber(action.goldRemaining);
            document.getElementById(`action${index}TimeSpent`).textContent = formatTime(action.timeSpent);
            document.getElementById(`action${index}TotalTimeElapsed`).textContent = formatTime(action.effectiveTimeElapsed);

            let statExpGain = "";
            const expGainDiv = document.getElementById(`action${index}ExpGain`);
            while (expGainDiv.firstChild) {
                expGainDiv.removeChild(expGainDiv.firstChild);
            }
            for (const stat of statList) {
                if (action[`statExp${stat}`]) {
                    statExpGain += `<div class='bold'>${_txt(`stats>${stat}>short_form`)}:</div> ${intToString(action[`statExp${stat}`], 2)}<br>`;
                }
            }
            expGainDiv.innerHTML = statExpGain;
        }
        this.updateQueueSegmentHighlight();
    };

    /** @typedef {{lastScroll:Pick<HTMLElement,'scrollTop'|'scrollHeight'|'clientHeight'>}} LastScrollRecord */
    /** @type {string} */
    actionLogClearHTML;
    /** @type {ResizeObserver} */
    actionLogObserver;
    initActionLog() {
        const log = /** @type {HTMLElement & LastScrollRecord} */(document.getElementById("actionLog"));
        this.actionLogClearHTML ??= log.innerHTML;
        this.actionLogObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.target !== log) continue;
                // console.log(entry,entry.target,log,log.scrollTop,log.scrollHeight,log.clientHeight,log.lastScroll);
                // check the most recent position of the scroll bottom
                const {scrollTop, scrollHeight, clientHeight, lastScroll} = log;
                const lastScrollBottom = lastScroll ? lastScroll.scrollHeight - (lastScroll.scrollTop + lastScroll.clientHeight) : 0;
                // check the current position
                const scrollBottom = scrollHeight - (scrollTop + clientHeight);
                // shift by that delta
                log.scrollTop += scrollBottom - lastScrollBottom;
            }
        });
        this.actionLogObserver.observe(log);
        log.addEventListener("scroll", this.recordScrollPosition, {passive: true});
        log.addEventListener("scrollend", this.recordScrollPosition, {passive: true});
        this.renderChronicleStories();
        this.renderChronicleChapters();
    }
    /** @this {HTMLElement & LastScrollRecord} */
    recordScrollPosition() {
        const {scrollTop, scrollHeight, clientHeight} = this;
        this.lastScroll = {scrollTop, scrollHeight, clientHeight};
    }
    updateActionLogEntry(index) {
        const log = document.getElementById("actionLog");
        this.actionLogClearHTML ??= log.innerHTML;
        if (index === "clear") {
            log.innerHTML = this.actionLogClearHTML; // nuke it, dot it
        }
        const entry = actionLog.getEntry(index);
        if (actionLog.hasPrevious()) {
            log.classList.add("hasPrevious");
        } else {
            log.classList.remove("hasPrevious");
        }
        if (!entry) return;
        let element = document.getElementById(`actionLogEntry${index}`);
        if (element) {
            entry.element = element;
            entry.updateElement();
        } else {
            element = entry.createElement();
            element.id = `actionLogEntry${index}`;
            element.style.order = index;
            element.tabIndex = 0;
            element.setAttribute("role", "button");

            const nextEntry = htmlElement(`actionLogEntry${index+1}`, false, false);
            log.insertBefore(element, nextEntry ?? htmlElement("actionLogLatest"));
        }
        if ((actionLog.firstNewOrUpdatedEntry ?? Infinity) <= index) {
            element.classList.add("highlight");
            // this is just causing problems right now. disable, it's not all that important if scroll anchors work properly
            // element.scrollIntoView({block: "nearest", inline: "nearest", behavior: "auto"});
            setTimeout(() => element.classList.remove("highlight"), 1);
        }
        this.renderChronicleLogControls();
        this.applyInspectorSelectionHighlight();
        this.renderInspector();
    }

    mouseoverAction(index, isShowing) {
        if (isShowing) curActionShowing = index;
        else curActionShowing = undefined;
        const div = document.getElementById(`action${index}Selected`);
        if (div) {
            div.style.opacity = isShowing ? "1" : "0";
            document.getElementById(`actionTooltip${index}`).style.display = isShowing ? "" : "none";
        }
        nextActionsDiv.style.display = isShowing ? "none" : "";
        document.getElementById("actionTooltipContainer").style.display = isShowing ? "" : "none";
        view.updateCurrentActionBar(index);
    };

    updateCurrentActionLoops(index) {
        const action = actions.current[index];
        if (action !== undefined) {
            document.getElementById(`action${index}LoopsDone`).textContent = (action.loops - action.loopsLeft) > 99999
                ? toSuffix(action.loops - action.loopsLeft) : formatNumber(action.loops - action.loopsLeft);
            document.getElementById(`action${index}Loops`).textContent = action.loops > 99999 ? toSuffix(action.loops) : formatNumber(action.loops);
        }
    };

    /** @param {{name: string, town: Town}} updateInfo */
    updateProgressAction({name: varName, town},
                         level = town.getLevel(varName),
                         levelPrc = `${town.getPrcToNext(varName)}%`,
    ) {
        document.getElementById(`prc${varName}`).textContent = `${level}`;
        document.getElementById(`expBar${varName}`)?.style.setProperty("width", levelPrc);
        document.getElementById(`progress${varName}`).textContent = intToString(levelPrc, 2);
        document.getElementById(`bar${varName}`).style.width = `${level}%`;
        if (varName.startsWith("Survey") && !varName.endsWith("Global")) {
            this.updateGlobalSurvey(varName, town);
        }
    };

    updateGlobalSurvey(varName, town) {
            const expToNext = getExploreExpToNextProgress();
            const expSinceLast = getExploreExpSinceLastProgress();
            this.updateProgressAction({name: `${varName}Global`, town}, getExploreProgress(), `${expSinceLast * 100 / (expSinceLast + expToNext)}%`);
    };

    updateProgressActions() {
        for (const town of towns) {
            for (let i = 0; i < town.progressVars.length; i++) {
                const varName = town.progressVars[i];
                this.updateProgressAction({name: varName, town: town});
            }
        }
    };

    updateLockedHidden() {
        for (const action of totalActionList) {
            const actionDiv = document.getElementById(`container${action.varName}`);
            const infoDiv = document.getElementById(`infoContainer${action.varName}`);
            const storyDiv = document.getElementById(`storyContainer${action.varName}`);
            if (action.allowed && getNumOnList(action.name) >= action.allowed()) {
                addClassToDiv(actionDiv, "capped");
            } else if (action.unlocked()) {
                if (infoDiv) {
                    removeClassFromDiv(infoDiv, "hidden");
                    if (action.varName.startsWith("Survey")) {
                        removeClassFromDiv(document.getElementById(`infoContainer${action.varName}Global`), "hidden");
                    }
                }
                removeClassFromDiv(actionDiv, "locked");
                removeClassFromDiv(actionDiv, "capped");
            } else {
                addClassToDiv(actionDiv, "locked");
                if (infoDiv) {
                    addClassToDiv(infoDiv, "hidden");
                    if (action.varName.startsWith("Survey")) {
                        addClassToDiv(document.getElementById(`infoContainer${action.varName}Global`), "hidden");
                    }
                }
            }
            if (action.unlocked() && infoDiv) {
                removeClassFromDiv(infoDiv, "hidden");
            }
            if (action.visible()) {
                removeClassFromDiv(actionDiv, "hidden");
                if (storyDiv !== null) removeClassFromDiv(storyDiv, "hidden");
            } else {
                addClassToDiv(actionDiv, "hidden");
                if (storyDiv !== null) addClassToDiv(storyDiv, "hidden");
            }
            if (storyDiv !== null) {
                if (action.unlocked()) {
                    removeClassFromDiv(storyDiv, "hidden");
                } else {
                    addClassToDiv(storyDiv, "hidden");
                }
            }
        }
        if (totalActionList.filter(action => action.finish.toString().includes("handleSkillExp")).filter(action => action.unlocked()).length > 0) {
            document.getElementById("skillList").style.display = "";
        } else {
            document.getElementById("skillList").style.display = "none";
        }
        if (totalActionList.filter(action => action.finish.toString().includes("updateBuff")).filter(action => action.unlocked()).length > 0 ||
            prestigeValues["completedAnyPrestige"]) {
            document.getElementById("buffList").style.display = "";
        } else {
            document.getElementById("buffList").style.display = "none";
        }
        this.updateActionCategoryLegend();
        this.applyActionCategoryFilter();
        this.applyTownBrowserFilters();
        this.updateTownBrowserTools();
    };

    updateGlobalStory(num) {
        actionLog.addGlobalStory(num);
        this.chronicleChapter = num;
        this.renderChronicleChapters();
    }

    updateStories(init) {
        // several ms cost per run. run once every 2000ms on an interval
        for (const action of totalActionList) {
            if (action.storyReqs !== undefined) {
                // greatly reduces/nullifies the cost of checking actions with all stories unlocked, which is nice,
                // since you're likely to have more stories unlocked at end game, which is when performance is worse
                const divName = `storyContainer${action.varName}`;
                const storyContentDiv = document.getElementById(`storyContent${action.varName}`);
                const storyContentHTML = storyContentDiv?.innerHTML ?? "";
                if (init || storyContentHTML.includes("???")) {
                    let storyTooltipText = "";
                    let lastInBranch = false;
                    let allStoriesForActionUnlocked = true;

                    for (const {num: storyId, conditionHTML, text} of action.getStoryTexts()) {

                            storyTooltipText += "<p>";
                            if (action.storyReqs(storyId)) {
                                storyTooltipText += conditionHTML + text;
                                lastInBranch = false;
                                if (action.visible() && action.unlocked() && completedActions.includes(action.varName)) {
                                    actionLog.addActionStory(action, storyId, init);
                                }
                            } else {
                                allStoriesForActionUnlocked = false;

                                if (lastInBranch) {
                                    storyTooltipText += "<b>???:</b> ???";
                                } else {
                                    storyTooltipText += `${conditionHTML} ???`;
                                    lastInBranch = true;
                                }
                            }
                            storyTooltipText += "</p>\n";
                    }

                    if (storyContentDiv && storyContentDiv.innerHTML !== storyTooltipText) {
                        storyContentDiv.innerHTML = storyTooltipText;
                        if (!init) {
                            showNotification(divName);
                            if (!unreadActionStories.includes(divName)) unreadActionStories.push(divName);
                        }
                        if (allStoriesForActionUnlocked) {
                            document.getElementById(divName).classList.add("storyContainerCompleted");
                        } else {
                            document.getElementById(divName).classList.remove("storyContainerCompleted");
                        }
                        this.renderChronicleStories();
                        this.applyTownBrowserFilters();
                        this.updateTownBrowserTools();
                        this.renderInspector();
                    }
                }
            }
        }
    };

    showTown(townNum) {
        if (!towns[townNum].unlocked()) return;

        if (townNum === 0) {
            document.getElementById("townViewLeft").style.visibility = "hidden";
        } else {
            document.getElementById("townViewLeft").style.visibility = "";
        }

        if (townNum === Math.max(...townsUnlocked)) {
            document.getElementById("townViewRight").style.visibility = "hidden";
        } else {
            document.getElementById("townViewRight").style.visibility = "";
        }

        for (let i = 0; i < actionOptionsTown.length; i++) {
            actionOptionsTown[i].style.display = "none";
            actionStoriesTown[i].style.display = "none";
            townInfos[i].style.display = "none";
        }
        if (actionStoriesShowing) actionStoriesTown[townNum].style.display = "";
        else actionOptionsTown[townNum].style.display = "";
        townInfos[townNum].style.display = "";
        $("#TownSelect").val(townNum);
        htmlElement("shortTownColumn").classList.remove(`zone-${townShowing+1}`);
        htmlElement("shortTownColumn").classList.add(`zone-${townNum+1}`);
        document.getElementById("townDesc").textContent = _txt(`towns>town${townNum}>desc`);
        townShowing = townNum;
        this.updateActionCategoryLegend();
        this.applyActionCategoryFilter();
        this.applyTownBrowserFilters();
        this.updateTownBrowserTools();
        this.renderChronicleStories();
    };

    showActions(stories) {
        for (let i = 0; i < actionOptionsTown.length; i++) {
            actionOptionsTown[i].style.display = "none";
            actionStoriesTown[i].style.display = "none";
        }

        if (stories) {
            document.getElementById("actionsViewLeft").style.visibility = "";
            document.getElementById("actionsViewRight").style.visibility = "hidden";
            actionStoriesTown[townShowing].style.display = "";
        } else {
            document.getElementById("actionsViewLeft").style.visibility = "hidden";
            document.getElementById("actionsViewRight").style.visibility = "";
            actionOptionsTown[townShowing].style.display = "";
        }

        document.getElementById("actionsTitle").textContent = _txt(`actions>title${(stories) ? "_stories" : ""}`);
        actionStoriesShowing = stories;
        this.updateActionCategoryLegend();
        this.applyActionCategoryFilter();
        this.applyTownBrowserFilters();
        this.updateTownBrowserTools();
        this.renderChronicleStories();
    };

    initializeActionCategoryLegend() {
        if (document.getElementById("actionCategoryLegend")) return;

        document.getElementById("townActionTitle").append(Rendered.html`
            <div id="actionCategoryLegend" class="actionCategoryLegend">
                <div class="actionCategoryLegendHeader">
                    <span id="actionCategoryLegendTitle" class="actionCategoryLegendTitle"></span>
                    <button
                        type="button"
                        id="actionCategoryLegendToggle"
                        class="button actionCategoryLegendToggle"
                        onclick="view.toggleActionCategoryLegend()"
                    ></button>
                </div>
                <div id="actionCategoryLegendButtons" class="actionCategoryLegendButtons"></div>
                <div id="actionCategoryLegendHint" class="actionCategoryLegendHint"></div>
            </div>
        `);

        const buttons = document.getElementById("actionCategoryLegendButtons");
        for (const category of actionCategories) {
            buttons.append(Rendered.html`
                <button
                    type="button"
                    class="button actionCategoryFilterButton action-category-${category}"
                    data-category="${category}"
                    onclick="view.toggleActionCategoryFilter('${category}')"
                >
                    <span class="actionCategoryFilterLabel"></span>
                    <span class="actionCategoryFilterCount">0</span>
                </button>
            `);
        }

        this.updateActionCategoryLegend();
    }

    initializeTownBrowserTools() {
        if (document.getElementById("townBrowserTools")) return;
        document.getElementById("townActionTitle").append(Rendered.html`
            <div id="townBrowserTools" class="townBrowserTools">
                <div id="townSummaryStrip" class="townSummaryStrip">
                    <div class="townSummaryPrimary">
                        <span id="townSummaryVisible" class="townSummaryPill"></span>
                        <span id="townSummaryUnread" class="townSummaryPill"></span>
                    </div>
                    <div id="townSummaryCategoryRow" class="townSummaryCategoryRow">
                        ${actionCategories.map(category => `
                            <span id="townSummaryCategory${category}" class="townSummaryPill townSummaryCategoryPill action-category-${category}"></span>
                        `).join("")}
                    </div>
                </div>
                <div id="townFilterBar" class="townFilterBar">
                    <input
                        id="townActionSearch"
                        class="townActionSearch"
                        type="search"
                        autocomplete="off"
                        oninput="view.setTownActionSearch(this.value)"
                    >
                    <button
                        type="button"
                        id="townFilterNew"
                        class="button townQuickFilter"
                        onclick="view.toggleTownQuickFilter('new')"
                    ></button>
                    <button
                        type="button"
                        id="townFilterUnread"
                        class="button townQuickFilter"
                        onclick="view.toggleTownQuickFilter('unread')"
                    ></button>
                    <button
                        type="button"
                        id="townFilterTravelTrial"
                        class="button townQuickFilter"
                        onclick="view.toggleTownQuickFilter('travelTrial')"
                    ></button>
                </div>
            </div>
        `);
        this.updateTownBrowserTools();
    }

    /** @param {AnyAction} action @param {"action"|"story"|"queue"} [variant] */
    renderActionCategoryBadge(action, variant="action") {
        const category = action.category;
        return `<span class="actionCategoryBadge actionCategoryBadge-${variant} action-category-${category}" title="${getActionCategoryLabel(category)}">${getActionCategoryShortLabel(category)}</span>`;
    }

    /** @param {AnyAction} action @param {"action"|"story"} [variant] */
    renderActionCategoryTooltip(action, variant="action") {
        const category = action.category;
        const note = getActionCategoryNote(action);
        return `
            <div class="actionCategoryTooltipText actionCategoryTooltipText-${variant} action-category-${category}">
                <div class="actionCategoryTooltipHeading"><span class="bold">${getActionCategoryPrimaryRoleText()}:</span> ${getActionCategoryLabel(category)}</div>
                <div class="actionCategoryTooltipDescription">${getActionCategoryDescription(category)}</div>
                ${note ? `<div class="actionCategoryTooltipNote">${note}</div>` : ""}
            </div>
        `;
    }

    toggleActionCategoryFilter(category) {
        this.actionCategoryFilter = this.actionCategoryFilter === category ? "" : category;
        if (this.actionCategoryFilter) {
            window.localStorage.setItem("actionCategoryFilter", this.actionCategoryFilter);
        } else {
            window.localStorage.removeItem("actionCategoryFilter");
        }
        this.updateActionCategoryLegend();
        this.applyActionCategoryFilter();
        this.updateTownBrowserTools();
    }

    toggleActionCategoryLegend() {
        this.actionCategoryLegendCollapsed = !this.actionCategoryLegendCollapsed;
        window.localStorage.setItem("actionCategoryLegendCollapsed", String(this.actionCategoryLegendCollapsed));
        this.updateActionCategoryLegend();
    }

    updateActionCategoryLegend() {
        const legend = document.getElementById("actionCategoryLegend");
        if (!legend) return;

        legend.classList.toggle("collapsed", this.actionCategoryLegendCollapsed);
        document.getElementById("actionCategoryLegendTitle").textContent = getActionCategoryLegendTitle();

        /** @type {Record<ActionCategory, number>} */
        const counts = {
            advance: 0,
            growth: 0,
            resource: 0,
            shortcut: 0,
            side: 0,
        };

        const shownTown = towns[townShowing] ?? towns[0];
        if (shownTown) {
            for (const action of shownTown.totalActionList) {
                if (action.visible()) counts[action.category]++;
            }
        }

        for (const button of document.querySelectorAll(".actionCategoryFilterButton")) {
            if (!(button instanceof HTMLButtonElement)) continue;
            const category = /** @type {ActionCategory} */(button.dataset.category);
            button.querySelector(".actionCategoryFilterLabel").textContent = getActionCategoryLabel(category);
            button.querySelector(".actionCategoryFilterCount").textContent = String(counts[category]);
            button.classList.toggle("is-active", this.actionCategoryFilter === category);
            button.disabled = counts[category] === 0 && this.actionCategoryFilter !== category;
            button.title = `${getActionCategoryLabel(category)}: ${getActionCategoryDescription(category)}`;
        }

        const legendToggle = document.getElementById("actionCategoryLegendToggle");
        const toggleTitle = getActionCategoryLegendToggleText(this.actionCategoryLegendCollapsed);
        legendToggle.textContent = this.actionCategoryLegendCollapsed ? "+" : "-";
        legendToggle.title = toggleTitle;
        legendToggle.setAttribute("aria-label", toggleTitle);

        document.getElementById("actionCategoryLegendHint").textContent = getActionCategoryLegendHint(this.actionCategoryFilter || undefined);
    }

    applyActionCategoryFilter() {
        const activeCategory = this.actionCategoryFilter;
        for (const container of [...actionOptionsTown, ...actionStoriesTown]) {
            for (const element of container.querySelectorAll("[data-action-category]")) {
                if (!(element instanceof HTMLElement)) continue;
                const shouldDim = !!activeCategory
                    && !element.classList.contains("hidden")
                    && element.dataset.actionCategory !== activeCategory;
                element.classList.toggle("category-dimmed", shouldDim);
            }
        }
    }

    setTownActionSearch(value) {
        this.townActionSearch = value.trim().toLocaleLowerCase();
        window.localStorage.setItem("townActionSearch", value);
        this.applyTownBrowserFilters();
        this.updateTownBrowserTools();
    }

    toggleTownQuickFilter(filter) {
        this.townQuickFilters[filter] = !this.townQuickFilters[filter];
        window.localStorage.setItem("townQuickFilters", JSON.stringify(this.townQuickFilters));
        this.applyTownBrowserFilters();
        this.updateTownBrowserTools();
    }

    isTravelOrTrialAction(action) {
        return getPossibleTravel(action.name).length > 0
            || action.name.includes("Trial")
            || ["SDungeon", "LDungeon", "TheSpire"].includes(action.varName);
    }

    getTownBrowserStats() {
        const shownTown = towns[townShowing] ?? towns[0];
        const unreadStories = Array.isArray(globalThis.unreadActionStories) ? globalThis.unreadActionStories : [];
        const visibleActions = shownTown?.totalActionList?.filter(action => action.visible()) ?? [];
        /** @type {Record<ActionCategory, number>} */
        const categoryCounts = {
            advance: 0,
            growth: 0,
            resource: 0,
            shortcut: 0,
            side: 0,
        };
        for (const action of visibleActions) {
            categoryCounts[action.category]++;
        }
        return {
            visibleCount: visibleActions.length,
            unreadCount: visibleActions.filter(action => unreadStories.includes(`storyContainer${action.varName}`)).length,
            categoryCounts,
        };
    }

    updateTownBrowserTools() {
        const searchInput = document.getElementById("townActionSearch");
        if (searchInput instanceof HTMLInputElement) {
            if (searchInput.value !== this.townActionSearch) searchInput.value = this.townActionSearch;
            searchInput.placeholder = this.getGuiText("townSearchPlaceholder");
        }

        const {visibleCount, unreadCount, categoryCounts} = this.getTownBrowserStats();
        htmlElement("townSummaryVisible").textContent = `${this.getGuiText("townSummaryVisible")}: ${visibleCount}`;
        htmlElement("townSummaryUnread").textContent = `${this.getGuiText("townSummaryUnread")}: ${unreadCount}`;
        for (const category of actionCategories) {
            const pill = htmlElement(`townSummaryCategory${category}`);
            const count = categoryCounts[category];
            pill.innerHTML = `
                <span class="townSummaryCategoryLabel">${getActionCategoryShortLabel(category)}</span>
                <span class="townSummaryCategoryCount">${count}</span>
            `;
            pill.title = `${getActionCategoryLabel(category)}: ${count}`;
            pill.classList.toggle("is-empty", count === 0);
        }

        /** @type {[keyof View["townQuickFilters"], string][]} */
        const buttons = [
            ["new", "townFilterNew"],
            ["unread", "townFilterUnread"],
            ["travelTrial", "townFilterTravelTrial"],
        ];
        for (const [filter, id] of buttons) {
            const button = htmlElement(id);
            button.classList.toggle("is-active", !!this.townQuickFilters[filter]);
            button.textContent = this.getGuiText(id);
        }
    }

    applyTownBrowserFilters() {
        const shownTown = towns[townShowing] ?? towns[0];
        const unreadStories = Array.isArray(globalThis.unreadActionStories) ? globalThis.unreadActionStories : [];
        for (const action of shownTown?.totalActionList ?? []) {
            const actionElement = document.getElementById(`container${action.varName}`);
            const storyElement = document.getElementById(`storyContainer${action.varName}`);
            const isNew = !completedActions.includes(action.varName);
            const hasUnreadStory = unreadStories.includes(`storyContainer${action.varName}`);
            const isTravelTrial = this.isTravelOrTrialAction(action);
            const searchable = `${action.label} ${getActionCategoryLabel(action.category)} ${this.getActionTypeLabel(action.type)} ${getTownName(action.townNum)}`.toLocaleLowerCase();
            const searchMiss = !!this.townActionSearch && !searchable.includes(this.townActionSearch);
            const quickFilterMiss = (this.townQuickFilters.new && !isNew)
                || (this.townQuickFilters.unread && !hasUnreadStory)
                || (this.townQuickFilters.travelTrial && !isTravelTrial);
            const shouldHide = !!(searchMiss || quickFilterMiss);

            if (actionElement instanceof HTMLElement) {
                actionElement.classList.toggle("town-browser-hidden", shouldHide);
                actionElement.classList.toggle("action-is-new", isNew);
                actionElement.classList.toggle("action-has-unread-story", hasUnreadStory);
                actionElement.classList.toggle("action-is-travel-trial", isTravelTrial);
            }
            if (storyElement instanceof HTMLElement) {
                storyElement.classList.toggle("town-browser-hidden", shouldHide);
                storyElement.classList.toggle("action-is-new", isNew);
                storyElement.classList.toggle("action-has-unread-story", hasUnreadStory);
                storyElement.classList.toggle("action-is-travel-trial", isTravelTrial);
            }
        }
    }

    toggleHiding() {
        document.documentElement.classList.toggle("editing-hidden-vars");
    }

    toggleHidden(varName, force) {
        const isHidden = towns[townShowing].hiddenVars.has(varName);
        if ((isHidden && force !== true) || force === false) {
            towns[townShowing].hiddenVars.delete(varName);
            htmlElement(`infoContainer${varName}`).classList.remove("user-hidden");
        } else if (!isHidden || force === true) {
            towns[townShowing].hiddenVars.add(varName);
            htmlElement(`infoContainer${varName}`).classList.add("user-hidden");
        }
    }

    updateRegular(updateInfo) {
        const varName = updateInfo.name;
        const index = updateInfo.index;
        const town = towns[index];
        htmlElement(`total${varName}`).textContent = String(town[`total${varName}`]);
        htmlElement(`checked${varName}`).textContent = String(town[`checked${varName}`]);
        htmlElement(`unchecked${varName}`).textContent = String(town[`total${varName}`] - town[`checked${varName}`]);
        htmlElement(`goodTemp${varName}`).textContent = String(town[`goodTemp${varName}`]);
        htmlElement(`good${varName}`).textContent = String(town[`good${varName}`]);
    };

    updateAddAmount(amount) {
        for (const elem of document.getElementsByClassName("change-amount")) {
            elem.classList.toggle("unused", elem.textContent !== String(amount));
        }
    };

    updateLoadout(num) {
        for (let i = 0; i < 16; i++) {
            const elem = document.getElementById(`load${i}`);
            if (elem) {
                addClassToDiv(elem, "unused");
            }
        }
        const elem = document.getElementById(`load${num}`);
        if (elem) {
            removeClassFromDiv(document.getElementById(`load${num}`), "unused");
        }
        this.updateLoadoutManager();
    };

    updateLoadoutNames() {
        for (let i = 0; i < loadoutnames.length; i++) {
            document.getElementById(`load${i + 1}`).textContent = loadoutnames[i];
        }
        inputElement("renameLoadout").value = loadoutnames[curLoadout - 1] ?? getLoadoutNameDefault();
        this.updateLoadoutManager();
    };

    createTownActions() {
        if (actionOptionsTown[0].querySelector(".actionOrTravelContainer")) return;
        for (const action of towns.flatMap(t => t.totalActionList)) {
            this.createTownAction(action);
        }
        for (const varName of towns.flatMap(t => t.allVarNames)) {
            const action = totalActionList.find(a => a.varName === varName);
            if (isActionOfType(action, "limited")) this.createTownInfo(action);
            if (isActionOfType(action, "progress")) {
                if (action.name.startsWith("Survey")) this.createGlobalSurveyProgress(action);
                this.createActionProgress(action);
            }
            if (isActionOfType(action, "multipart")) this.createMultiPartPBar(action);
        }
        if (options.highlightNew) this.highlightIncompleteActions();
        this.updateActionCategoryLegend();
        this.applyActionCategoryFilter();
        this.applyTownBrowserFilters();
        this.updateTownBrowserTools();
    };

    /** @param {ActionOfType<"progress">} action  */
    createGlobalSurveyProgress(action) {
        this.createActionProgress(action, "Global", action.labelGlobal, true);
    }

    /** @param {ActionOfType<"progress">} action @param {string} [label] */
    createActionProgress(action, varSuffix="", label, includeExpBar=true) {
        const totalDivText =
        Raw.html`<div class='townStatContainer showthat'>
            <div class='bold townLabel'>${label ?? action.labelDone}</div>
            <div class='progressValue' id='prc${action.varName}${varSuffix}'>5</div><div class='percentSign'>%</div>
            <div class='progressBars'>
                ${includeExpBar ? `<div class='thinProgressBarUpper'><div id='expBar${action.varName}${varSuffix}' class='statBar townExpBar'></div></div>` : ""}
                <div class='thinProgressBarLower'><div id='bar${action.varName}${varSuffix}' class='statBar townBar'></div></div>
            </div>

            <div class='showthis'>
                ${_txt("actions>tooltip>higher_done_percent_benefic")}<br>
                <div class='bold'>${_txt("actions>tooltip>progress_label")}</div> <div id='progress${action.varName}${varSuffix}'></div>%
            </div>
            <div class='hideVarButton far' onclick='view.toggleHidden("${action.varName}${varSuffix}")'></div>
        </div>`;
        const progressDiv = document.createElement("div");
        progressDiv.className = "townContainer progressType";
        progressDiv.id = `infoContainer${action.varName}${varSuffix}`;
        progressDiv.style.display = "";
        progressDiv.innerHTML = totalDivText;
        townInfos[action.townNum].appendChild(progressDiv);
        if (towns[action.townNum].hiddenVars.has(`${action.varName}${varSuffix}`)) {
            progressDiv.classList.add("user-hidden");
        }
    };

    /** @param {AnyAction} action  */
    createTownAction(action) {
        let actionStats = "";
        let actionSkills = "";
        let skillDetails = "";
        let lockedStats = "";
        let lockedSkills = "";
        const pieSlices = [];
        const gradientStops=[];
        const statEntries = typedEntries(action.stats);
        // sort high to low, then by statname index
        statEntries.sort(([aStat, aRatio], [bStat, bRatio]) => ((bRatio - aRatio) || (statList.indexOf(aStat) - statList.indexOf(bStat))));
        let totalRatio = 0;
        let gradientOffset = 0;
        let lastArcPoint = [0, -1]; // start at 12 o'clock
        for (const [stat, ratio] of statEntries) {
            const statLabel = _txt(`stats>${stat}>short_form`);
            actionStats += `<dt class='stat-${stat}'>${statLabel}</dt> <dd class='stat-${stat}'>${ratio * 100}%</dd>`;
            const startRatio = totalRatio;
            totalRatio += ratio;
            if (totalRatio >= 0.999 && totalRatio <= 1.001) totalRatio = 1;
            const midRatio = (startRatio + totalRatio) / 2;
            const angle = Math.PI * 2 * totalRatio;
            const arcPoint = [Math.sin(angle), -Math.cos(angle)];
            pieSlices.push(`<path class='pie-slice stat-${stat}' d='M0,0 L${lastArcPoint.join()} A1,1 0,${ratio >= 0.5 ? 1 : 0},1 ${arcPoint.join()} Z' />`);
            if (gradientStops.length === 0) {
                gradientOffset = midRatio;
                gradientStops.push(`from ${gradientOffset}turn`, `var(--stat-${stat}-color) calc(${gradientOffset}turn * var(--pie-ratio))`);
            } else {
                gradientStops.push(`var(--stat-${stat}-color) calc(${midRatio - gradientOffset}turn - (${ratio/2}turn * var(--pie-ratio))) calc(${midRatio - gradientOffset}turn + (${ratio/2}turn * var(--pie-ratio)))`);
            }
            lastArcPoint = arcPoint;
        }
        // this is *almost* always true (but not always)
        if (statEntries.length > 0) {
            gradientStops.push(`var(--stat-${statEntries[0][0]}-color) calc(1turn - (${gradientOffset}turn * var(--pie-ratio)))`)
            const highestRatio = statEntries[0][1];
            lockedStats = `(${statEntries.map(([stat, ratio]) => /** @type {const} */([ratio === highestRatio, stat, _txt(`stats>${stat}>short_form`)]))
                                      .map(([isHighestStat, stat, label]) => `<span class='${isHighestStat?"bold":""} stat-${stat} stat-color'>${label}</span>`)
                                      .join(", ")})<br>`;
        }
        const statPie = statEntries.length === 0 ? "" : `
                <svg viewBox='-1 -1 2 2' class='stat-pie' id='stat-pie-${action.varName}'>
                    <g id='stat-pie-${action.varName}-g'>
                        ${pieSlices.join("")}
                    </g>
                </svg>
                <div class='stat-pie mask' style='background:conic-gradient(${gradientStops.join()})'></div>`;
        if (action.skills !== undefined) {
            const skillKeyNames = Object.keys(action.skills);
            const l = skillList.length;
            for (let i = 0; i < l; i++) {
                for (const skill of skillKeyNames) {
                    if (skillList[i] === skill) {
                        const xmlName = getXMLName(skill);
                        const skillLabel = `${_txt(`skills>${xmlName}>label`)} ${_txt("stats>tooltip>exp")}`;
                        actionSkills += `<div class='bold'>${skillLabel}:</div><span id='expGain${action.varName}${skill}'></span><br>`;
                        if (action.teachesSkill(skill)) {
                            const learnSkill = `<div class='bold'>${_txt("actions>tooltip>learn_skill")}:</div>`;
                            lockedSkills += `${learnSkill} <span>${_txt(`skills>${xmlName}>label`)}</span><br>`;
                            skillDetails +=
                                `<hr>
                                ${learnSkill} <div class='bold underline'>${_txt(`skills>${xmlName}>label`)}</div><br>
                                <i>${_txt(`skills>${xmlName}>desc`)}</i><br>`;
                            if (_txtsObj(`skills>${xmlName}>desc2`)?.length > 0) {
                                skillDetails += `${_txt(`skills>${xmlName}>desc2`).replace(/<br>\s*Currently.*(?:<br>|$)/sgi, "") }<br>`; // ugh
                            }
                        }
                    }
                }
            }
        }
        if (isBuffName(action.grantsBuff)) {
            const xmlName = getXMLName(Buff.fullNames[action.grantsBuff]);
            const grantsBuff = `<div class='bold'>${_txt("actions>tooltip>grants_buff")}:</div>`;
            lockedSkills += `${grantsBuff} <span>${_txt(`buffs>${xmlName}>label`)}</span><br>`;
            skillDetails +=
                `<hr>
                ${grantsBuff} <div class='bold underline'>${_txt(`buffs>${xmlName}>label`)}</div><br>
                <i>${_txt(`buffs>${xmlName}>desc`)}</i><br>`;
        }
        let extraImage = "";
        const extraImagePositions = ["margin-top:17px;margin-left:5px;", "margin-top:17px;margin-left:-55px;", "margin-top:0px;margin-left:-55px;", "margin-top:0px;margin-left:5px;"];
        if (action.affectedBy) {
            for (let i = 0; i < action.affectedBy.length; i++) {
                extraImage += `<img src='img/${camelize(action.affectedBy[i])}.svg' class='smallIcon' draggable='false' style='position:absolute;${extraImagePositions[i]}'>`;
            }
        }
        const isTravel = getTravelNum(action.name) != 0;
        const divClass = `${isTravel ? "travelContainer" : "actionContainer"} ${isTraining(action.name) || hasLimit(action.name) ? "cappableActionContainer" : ""}`;
        const imageName = action.name.startsWith("Assassin") ? "assassin" : camelize(action.name);
        const category = action.category;
        const categoryBadge = this.renderActionCategoryBadge(action);
        const categoryTooltip = this.renderActionCategoryTooltip(action);
        const unlockConditions = /<br>\s*Unlocked (.*?)(?:<br>|$)/is.exec(`${action.tooltip}${action.goldCost === undefined ? "" : action.tooltip2}`)?.[1]; // I hate this but wygd
        const lockedText = unlockConditions ? `${_txt("actions>tooltip>locked_tooltip")}<br>${_txt("actions>tooltip>will_unlock")} ${unlockConditions}` : `${action.tooltip}${action.goldCost === undefined ? "" : action.tooltip2}`;
        const totalDivText =
            `<button
                id='container${action.varName}'
                class='${divClass} actionOrTravelContainer ${action.type}ActionContainer showthat action-category-${category}'
                data-action-category='${category}'
                draggable='true'
                ondragover='handleDragOver(event)'
                ondragstart='handleDirectActionDragStart(event, "${action.name}", ${action.townNum}, "${action.varName}", false)'
                ondragend='handleDirectActionDragEnd("${action.varName}")'
                onclick='addActionToList("${action.name}", ${action.townNum})'
                onmouseover='view.updateAction("${action.varName}")'
                onmouseout='view.updateAction(undefined)'
            >
                ${categoryBadge}
                <label>${action.label}</label><br>
                <div style='position:relative'>
                    <img src='img/${imageName}.svg' class='superLargeIcon' draggable='false'>${extraImage}
                </div>
                ${statPie}
                <div class='showthis when-unlocked' draggable='false'>
                    ${categoryTooltip}
                    <div class='tooltipPrimary'>
                        ${action.tooltip}<span id='goldCost${action.varName}'></span>
                        ${(action.goldCost === undefined) ? "" : action.tooltip2}
                    </div>
                    <div class='tooltipSimpleHint'>${this.getGuiText("simpleTooltipHint")}</div>
                    <div class='tooltipAdvanced'>
                        ${actionSkills}
                        <div class='bold'>${_txt("actions>tooltip>mana_cost")}:</div> <div id='manaCost${action.varName}'>${formatNumber(action.manaCost())}</div><br>
                        <dl class='action-stats'>${actionStats}</dl>
                        <div class='bold'>${_txt("actions>tooltip>exp_multiplier")}:</div><div id='expMult${action.varName}'>${action.expMult * 100}</div>%<br>
                        ${skillDetails}
                    </div>
                </div>
                <div class='showthis when-locked' draggable='false'>
                    ${categoryTooltip}
                    <div class='tooltipPrimary'>
                        ${lockedText}
                    </div>
                    <div class='tooltipSimpleHint'>${this.getGuiText("simpleTooltipHint")}</div>
                    <div class='tooltipAdvanced'>
                        ${lockedSkills}
                        ${lockedStats}
                    </div>
                </div>
            </button>`;

        const actionsDiv = document.createElement("div");
        actionsDiv.innerHTML = totalDivText;
        actionOptionsTown[action.townNum].querySelector(`:scope > .${isTravel ? "travelDiv" : "actionDiv"}`).appendChild(actionsDiv);

        if (action.storyReqs !== undefined) {
            let storyTooltipText = "";
            let lastInBranch = false;

            for (const {num: storyId, conditionHTML, text} of action.getStoryTexts()) {
                    storyTooltipText += "<p>";
                    if (action.storyReqs(storyId)) {
                        storyTooltipText += conditionHTML + text;
                        lastInBranch = false;
                    } else if (lastInBranch) {
                        storyTooltipText += "<b>???:</b> ???";
                    } else {
                        storyTooltipText += `${conditionHTML} ???`;
                        lastInBranch = true;
                    }
                    storyTooltipText += "</p>";
            }

            const storyCategoryBadge = this.renderActionCategoryBadge(action, "story");
            const storyCategoryTooltip = this.renderActionCategoryTooltip(action, "story");
            const storyDivText =
                `<div id='storyContainer${action.varName}' tabindex='0' class='storyContainer showthatstory action-category-${category}' data-action-category='${category}' draggable='false' onmouseover='hideNotification("storyContainer${action.varName}")'>
                    ${storyCategoryBadge}
                    ${action.label}
                    <br>
                    <div style='position:relative'>
                        <img src='img/${camelize(action.name)}.svg' class='superLargeIcon' draggable='false'>
                        <div id='storyContainer${action.varName}Notification' class='notification storyNotification'></div>
                    </div>
                    <div class='showthisstory' draggable='false'>
                        ${storyCategoryTooltip}
                        <div id='storyContent${action.varName}' class='storyTooltipContent'>${storyTooltipText}</div>
                    </div>
                </div>`;

            const storyDiv = document.createElement("div");
            storyDiv.innerHTML = storyDivText;
            actionStoriesTown[action.townNum].appendChild(storyDiv);
        }
    };

    updateAction(action) {
        if (action === undefined) return
        let container = document.getElementById(`container${action}`);
        this.adjustTooltipPosition(container.querySelector("div.showthis"));
    }

    adjustManaCost(actionName) {
        const action = translateClassNames(actionName);
        document.getElementById(`manaCost${action.varName}`).textContent = formatNumber(action.manaCost());
    };

    adjustExpMult(actionName) {
        const action = translateClassNames(actionName);
        document.getElementById(`expMult${action.varName}`).textContent = formatNumber(action.expMult * 100);
    };

    goldCosts = {};

    adjustGoldCost(updateInfo) {
        const varName = updateInfo.varName;
        const amount = updateInfo.cost;
        const element = document.getElementById(`goldCost${varName}`);
        if (this.goldCosts[varName] !== amount && element) {
            element.textContent = formatNumber(amount);
            this.goldCosts[varName] = amount;
        }
    };
    adjustGoldCosts() {
        for (const action of actionsWithGoldCost) {
            this.adjustGoldCost({varName: action.varName, cost: action.goldCost()});
        }
    };
    adjustExpGain(action) {
        for (const skill in action.skills) {
            if (Number.isInteger(action.skills[skill])) document.getElementById(`expGain${action.varName}${skill}`).textContent = ` ${action.skills[skill].toFixed(0)}`;
            else document.getElementById(`expGain${action.varName}${skill}`).textContent = ` ${action.skills[skill]().toFixed(0)}`;
        }
    };
    adjustExpGains() {
        for (const action of totalActionList) {
            if (action.skills) this.adjustExpGain(action);
        }
    };

    /** @param {ActionOfType<"limited">} action  */
    createTownInfo(action) {
        const totalInfoText =
            // important that there be 8 element children of townInfoContainer (excluding the showthis popup and hideVarButton)
            Raw.html`
            <div class='townInfoContainer showthat'>
                <div class='bold townLabel'>${action.labelDone}</div>
                <div class='numeric goodTemp' id='goodTemp${action.varName}'>0</div> <i class='fa fa-arrow-left'></i>
                <div class='numeric good' id='good${action.varName}'>0</div> <i class='fa fa-arrow-left'></i>
                <div class='numeric unchecked' id='unchecked${action.varName}'>0</div>
                <input type='checkbox' id='searchToggler${action.varName}' style='margin-left:10px;'>
                <label for='searchToggler${action.varName}'> ${_txt("actions>tooltip>lootable_first")}</label>
                <div class='showthis'>${action.infoText()}</div>
                <div class='hideVarButton far' onclick='view.toggleHidden("${action.varName}")'></div>
            </div><br>`;

        const infoDiv = document.createElement("div");
        infoDiv.className = "townContainer infoType";
        infoDiv.id = `infoContainer${action.varName}`;
        infoDiv.style.display = "";
        infoDiv.innerHTML = totalInfoText;
        townInfos[action.townNum].appendChild(infoDiv);
        if (towns[action.townNum].hiddenVars.has(action.varName)) {
            infoDiv.classList.add("user-hidden");
        }
    };

    /** @param {ActionOfType<"multipart">} action  */
    createMultiPartPBar(action) {
        let pbars = "";
        const width = `style='width:calc(${91 / action.segments}% - 4px)'`;
        const varName = action.varName;
        for (let i = 0; i < action.segments; i++) {
            pbars += `<div class='thickProgressBar showthat' ${width}>
                        <div id='expBar${i}${varName}' class='segmentBar'></div>
                        <div class='showthis' id='tooltip${i}${varName}'>
                            <div id='segmentName${i}${varName}'></div><br>
                            <div class='bold'>${_txt("actions>tooltip>main_stat")}</div> <div id='mainStat${i}${varName}'></div><br>
                            <div class='bold'>${_txt("actions>tooltip>progress_label")}</div> <div id='progress${i}${varName}'></div> / <div id='progressNeeded${i}${varName}'></div>
                        </div>
                    </div>`;
        }
        const completedTooltip = action.completedTooltip ? action.completedTooltip() : "";
        let mouseOver = "";
        if (varName === "SDungeon") mouseOver = "onmouseover='view.showDungeon(0)' onmouseout='view.showDungeon(undefined)'";
        else if (varName === "LDungeon") mouseOver = "onmouseover='view.showDungeon(1)' onmouseout='view.showDungeon(undefined)'";
        else if (varName === "TheSpire") mouseOver = "onmouseover='view.showDungeon(2)' onmouseout='view.showDungeon(undefined)'";
        const totalDivText =
            Raw.html`
            <div class='townStatContainer' id='infoContainer${varName}'>
                <div class='multipartLabel'>
                    <div class='flexMargin'></div>
                    <div class='bold townLabel' id='multiPartName${varName}'></div>
                    <div class='completedInfo showthat' ${mouseOver}>
                        <div class='bold'>${action.labelDone}</div>
                        <div id='completed${varName}'></div>
                        ${completedTooltip === "" ? "" : `<div class='showthis' id='completedContainer${varName}'>
                            ${completedTooltip}
                        </div>`}
                    </div>
                    <div class='flexMargin'></div>
                </div>
                <div class='multipartBars'>
                    ${pbars}
                </div>
                <div class='hideVarButton far' onclick='view.toggleHidden("${action.varName}")'></div>
            </div>`;

        const progressDiv = document.createElement("div");
        progressDiv.className = "townContainer multipartType";
        progressDiv.style.display = "";
        progressDiv.innerHTML = totalDivText;
        townInfos[action.townNum].appendChild(progressDiv);
        if (towns[action.townNum].hiddenVars.has(action.varName)) {
            progressDiv.firstElementChild.classList.add("user-hidden");
        }
    };

    updateMultiPartActions() {
        for (const action of totalActionList) {
            if (action.type === "multipart") {
                this.updateMultiPart(action);
                this.updateMultiPartSegments(action);
            }
        }
    };

    updateMultiPartSegments(action) {
        let segment = 0;
        let curProgress = towns[action.townNum][action.varName];
        // update previous segments
        let loopCost = action.loopCost(segment);
        while (curProgress >= loopCost && segment < action.segments) {
            document.getElementById(`expBar${segment}${action.varName}`).style.width = "0px";
            const roundedLoopCost = intToStringRound(loopCost);
            if (document.getElementById(`progress${segment}${action.varName}`).textContent !== roundedLoopCost) {
                document.getElementById(`progress${segment}${action.varName}`).textContent = roundedLoopCost;
                document.getElementById(`progressNeeded${segment}${action.varName}`).textContent = roundedLoopCost;
            }

            curProgress -= loopCost;
            segment++;
            loopCost = action.loopCost(segment);
        }

        // update current segments
        if (document.getElementById(`progress${segment}${action.varName}`)) {
            document.getElementById(`expBar${segment}${action.varName}`).style.width = `${100 - 100 * curProgress / loopCost}%`;
            document.getElementById(`progress${segment}${action.varName}`).textContent = intToStringRound(curProgress);
            document.getElementById(`progressNeeded${segment}${action.varName}`).textContent = intToStringRound(loopCost);
        }

        // update later segments
        for (let i = segment + 1; i < action.segments; i++) {
            document.getElementById(`expBar${i}${action.varName}`).style.width = "100%";
            if (document.getElementById(`progress${i}${action.varName}`).textContent !== "0") {
                document.getElementById(`progress${i}${action.varName}`).textContent = "0";
            }
            document.getElementById(`progressNeeded${i}${action.varName}`).textContent = intToStringRound(action.loopCost(i));
        }
    };

    showDungeon(index) {
        dungeonShowing = index;
        if (index !== undefined) this.updateSoulstoneChance(index);
    };

    updateSoulstoneChance(index) {
        const dungeon = dungeons[index];
        for (let i = 0; i < dungeon.length; i++) {
            const level = dungeon[i];
            document.getElementById(`soulstoneChance${index}_${i}`).textContent = intToString(level.ssChance * 100, 4);
            document.getElementById(`soulstonePrevious${index}_${i}`).textContent = level.lastStat;
            document.getElementById(`soulstoneCompleted${index}_${i}`).textContent = formatNumber(level.completed);
        }
    };

    updateTrials() {
        for(let i = 0; i < trials.length; i++)
        {
            this.updateTrialInfo({trialNum: i, curFloor: 0});
        }
    };

    updateTrialInfo(updateInfo) {
        const curFloor = updateInfo.curFloor;
        const trialNum = updateInfo.trialNum;
        const trial = trials[trialNum];
            document.getElementById(`trial${trialNum}HighestFloor`).textContent = String(trial.highestFloor + 1);
            if (curFloor >= trial.length) {
                document.getElementById(`trial${trialNum}CurFloor`).textContent = "";
                document.getElementById(`trial${trialNum}CurFloorCompleted`).textContent = "";
            }
            else {
                document.getElementById(`trial${trialNum}CurFloor`).textContent = "" + (curFloor + 1);
                document.getElementById(`trial${trialNum}CurFloorCompleted`).textContent = trial[curFloor].completed;
            }
            if (curFloor > 0) {
                document.getElementById(`trial${trialNum}LastFloor`).textContent = curFloor;
                document.getElementById(`trial${trialNum}LastFloorCompleted`).textContent = trial[curFloor - 1].completed;
            }
    };

    updateSoulstones() {
        let total = 0;
        for (const stat of statList) {
            if (stats[stat].soulstone) {
                total += stats[stat].soulstone;
                htmlElement(`stat${stat}SoulstoneLogBar`).parentElement.style.display = "";
                this.updateLevelLogBar("statsContainer", `stat${stat}SoulstoneLogBar`, stats[stat].soulstone);
                document.getElementById(`ss${stat}Container`).style.display = "";
                document.getElementById(`ss${stat}`).textContent = formatNumber(stats[stat].soulstone);
                document.getElementById(`stat${stat}SSBonus`).textContent = intToString(stats[stat].soulstone ? stats[stat].soulstoneMult : 0);
                document.getElementById(`stat${stat}ss`).textContent = intToString(stats[stat].soulstone, 1);
            } else {
                htmlElement(`stat${stat}SoulstoneLogBar`).parentElement.style.display = "none";
                document.getElementById(`ss${stat}Container`).style.display = "none";
                document.getElementById(`stat${stat}ss`).textContent = "";
            }
        }
        if (total > 0) {
            document.getElementById(`stattotalss`).style.display = "";
            document.getElementById(`stattotalss`).textContent = intToString(total, 1);
            document.getElementById(`sstotalContainer`).style.display = "";
            document.getElementById(`sstotal`).textContent = formatNumber(total);
        } else {
            document.getElementById(`stattotalss`).style.display = "none";
            document.getElementById(`stattotalss`).textContent = "";
            document.getElementById(`sstotalContainer`).style.display = "none";
        }
    };

    updateMultiPart(action) {
        const town = towns[action.townNum];
        document.getElementById(`multiPartName${action.varName}`).textContent = action.getPartName();
        document.getElementById(`completed${action.varName}`).textContent = ` ${formatNumber(town[`total${action.varName}`])}`;
        for (let i = 0; i < action.segments; i++) {
            const expBar = document.getElementById(`expBar${i}${action.varName}`);
            if (!expBar) {
                continue;
            }
            const mainStat = action.loopStats[(town[`${action.varName}LoopCounter`] + i) % action.loopStats.length];
            document.getElementById(`mainStat${i}${action.varName}`).textContent = _txt(`stats>${mainStat}>short_form`);
            addStatColors(expBar, mainStat, true);
            document.getElementById(`segmentName${i}${action.varName}`).textContent = action.getSegmentName(town[`${action.varName}LoopCounter`] + i);
        }
    };

    updateTrainingLimits() {
        for (let i = 0; i < statList.length; i++) {
            const trainingDivs = document.querySelectorAll(`[id='trainingLimit${statList[i]}']`);
            for (const trainingDiv of trainingDivs) {
                trainingDiv.textContent = String(trainingLimits);
            }
        }
        if (getBuffLevel("Imbuement") > 0 || getBuffLevel("Imbuement3") > 0) document.getElementById("maxTraining").style.display = "";
    };

    // when you mouseover Story
    updateStory(num) {
        document.getElementById("newStory").style.display = "none";
        if (num <= 0) {
            num = 0;
            document.getElementById("storyLeft").style.visibility = "hidden";
        } else {
            document.getElementById("storyLeft").style.visibility = "";
        }

        if (num >= storyMax) {
            num = storyMax;
            document.getElementById("storyRight").style.visibility = "hidden";
        } else {
            document.getElementById("storyRight").style.visibility = "";
        }
        //Hard coded story count - need to fix this
        for (let i = 0; i <= 12; i++) {
            const storyDiv = document.getElementById(`story${i}`);
            if (storyDiv) {
                storyDiv.style.display = "none";
            }
        }
        storyShowing = num;
        this.chronicleChapter = num;
        document.getElementById("storyPage").textContent = String(storyShowing + 1);
        document.getElementById(`story${num}`).style.display = "inline-block";
        this.renderChronicleChapters();
    };

    changeStatView() {
        const statsWindow = document.getElementById("statsWindow");
        if (inputElement("regularStats").checked) {
            statsWindow.dataset.view = "regular";
        } else {
            statsWindow.dataset.view = "radar";
            statGraph.update();
        }
    };

    changeTheme(init) {
        const themeInput = selectElement("themeInput");
        const themeVariantInput = selectElement("themeVariantInput");
        if (init) themeInput.value = options.theme;
        if (init) themeVariantInput.value = options.themeVariant;
        options.theme = themeInput.value;
        options.themeVariant = themeVariantInput.value;
        const variants = $(themeVariantInput).find(`.variant-${options.theme.replaceAll(" ","_")}`);
        if (variants.length) {
            document.getElementById("themeVariantSection").style.display = "";
            $(themeVariantInput).find("option").css("display", "none");
            variants.css("display", "");
        } else {
            document.getElementById("themeVariantSection").style.display = "none";
        }
        document.getElementById("theBody").className = `t-${options.theme} ${options.themeVariant}`;
        localStorage["latestTheme"] = `${options.theme} ${options.themeVariant}`;
    };

    createTravelMenu() {
        let travelMenu = $("#TownSelect");
        travelMenu.empty()
        getTownNames().forEach((town, index) => {
            travelMenu.append(`"<option value=${index} class='zone-${index+1}' hidden=''>${town}</option>`);
        });
        travelMenu.change(function() {
            view.showTown(Number($(this).val()));
        });
        this.updateTravelMenu()
    }

    updateTravelMenu() {
        let travelOptions = $("#TownSelect").children();
        for (let i=0;i<travelOptions.length;i++) {
            travelOptions[i].hidden=(!townsUnlocked.includes(i));
        }
    }

    adjustDarkRitualText() {
        let DRdesc = document.getElementById("DRText");
        DRdesc.innerHTML = `${_txt("actions>tooltip>dark_ritual_actions_are")}<br>`;
        townsUnlocked.forEach(townNum => {
            DRdesc.innerHTML += DarkRitualDescription[townNum];
        });
        if(getBuffLevel("Ritual") > 200) DRdesc.innerHTML += DarkRitualDescription[9];
    }

    highlightIncompleteActions() {
        let actionDivs = Array.from(document.getElementsByClassName("actionContainer"));
        actionDivs.forEach(div => {
            let actionName = div.id.replace("container","");
            if (!completedActions.includes(actionName))
                div.classList.add("actionHighlight");
        });
    }

    removeAllHighlights() {
        let actionDivs = Array.from(document.getElementsByClassName("actionHighlight"));
        actionDivs.forEach(div => {
            div.classList.remove("actionHighlight");
        });
    }

    updateTotals() {
        document.getElementById('totalPlaytime').textContent = `${formatTime(totals.time)}`;
        document.getElementById('totalEffectiveTime').textContent = `${formatTime(totals.effectiveTime)}`;
        document.getElementById('borrowedTimeBalance').textContent = formatTime(totals.borrowedTime);
        document.getElementById('borrowedTimeDays').textContent = `${formatNumber(Math.floor(totals.borrowedTime / 86400))}${_txt("time_controls>days")}`;
        document.getElementById('totalLoops').textContent = `${formatNumber(totals.loops)}`;
        document.getElementById('totalActions').textContent = `${formatNumber(totals.actions)}`;
        if (totals.borrowedTime > 0) document.documentElement.classList.add("time-borrowed");
        else document.documentElement.classList.remove("time-borrowed");
    }

    updatePrestigeValues() {
        document.getElementById('currentPrestigePoints').textContent = `${formatNumber(prestigeValues["prestigeCurrentPoints"])}`;
        document.getElementById('currentPrestigesCompleted').textContent = `${formatNumber(prestigeValues["prestigeTotalCompletions"])}`;
        // document.getElementById('maxTotalImbueSoulLevels').textContent = `${formatNumber(prestigeValues["prestigeTotalCompletions"])}`;
        document.getElementById('maxTotalImbueSoulLevels').textContent = `${formatNumber(Math.min(prestigeValues["prestigeTotalCompletions"], 7))}`;

        document.getElementById('totalPrestigePoints').textContent = `${formatNumber(prestigeValues["prestigeTotalPoints"])}`;

        document.getElementById('prestigePhysicalCurrentBonus').textContent = `${formatNumber(getPrestigeCurrentBonus("PrestigePhysical"))}`;
        document.getElementById('prestigeMentalCurrentBonus').textContent = `${formatNumber(getPrestigeCurrentBonus("PrestigeMental"))}`;
        document.getElementById('prestigeCombatCurrentBonus').textContent = `${formatNumber(getPrestigeCurrentBonus("PrestigeCombat"))}`;
        document.getElementById('prestigeSpatiomancyCurrentBonus').textContent = `${formatNumber(getPrestigeCurrentBonus("PrestigeSpatiomancy"))}`;
        document.getElementById('prestigeChronomancyCurrentBonus').textContent = `${formatNumber(getPrestigeCurrentBonus("PrestigeChronomancy"))}`;
        document.getElementById('prestigeBarteringCurrentBonus').textContent = `${formatNumber(getPrestigeCurrentBonus("PrestigeBartering"))}`;
        document.getElementById('prestigeExpOverflowCurrentBonus').textContent = `${formatNumber(getPrestigeCurrentBonus("PrestigeExpOverflow") * 10)}`;

        document.getElementById('prestigePhysicalNextCost').textContent = `${formatNumber(getPrestigeCost("PrestigePhysical"))}`;
        document.getElementById('prestigeMentalNextCost').textContent = `${formatNumber(getPrestigeCost("PrestigeMental"))}`;
        document.getElementById('prestigeCombatNextCost').textContent = `${formatNumber(getPrestigeCost("PrestigeCombat"))}`;
        document.getElementById('prestigeSpatiomancyNextCost').textContent = `${formatNumber(getPrestigeCost("PrestigeSpatiomancy"))}`;
        document.getElementById('prestigeChronomancyNextCost').textContent = `${formatNumber(getPrestigeCost("PrestigeChronomancy"))}`;
        document.getElementById('prestigeBarteringNextCost').textContent = `${formatNumber(getPrestigeCost("PrestigeBartering"))}`;
        document.getElementById('prestigeExpOverflowNextCost').textContent = `${formatNumber(getPrestigeCost("PrestigeExpOverflow"))}`;
    }
}

function startRenameCloudSave(fileId) {
    const li = document.getElementById(`cloud_save_${fileId}`);
    const nameInput = li?.querySelector(".cloud_save_name");
    if (!nameInput) return;
    if (nameInput instanceof HTMLInputElement) {
        if (!nameInput.value || nameInput.value === li.dataset.fileName) {
            const div = document.createElement("div");
            div.className = nameInput.className;
            div.textContent = li.dataset.fileName;
            div.title = li.dataset.fileName;
            li.replaceChild(div, nameInput);
        } else {
            googleCloud.renameFile(fileId, nameInput.value);
        }
    } else {
        const input = document.createElement("input");
        input.className = nameInput.className;
        input.style.width = `${nameInput.clientWidth}px`;
        input.value = li.dataset.fileName;
        input.onkeydown = (e) => e.key === "Enter" ? (startRenameCloudSave(fileId), false) : true;
        li.replaceChild(input, nameInput);
        input.focus();
    }
}

async function askDeleteCloudSave(fileId) {
    const li = document.getElementById(`cloud_save_${fileId}`);
    const button = li?.querySelector(".button.cloud_delete");
    if (!button) return;
    if (button.classList.contains("warning")) {
        googleCloud.deleteFile(fileId);
    } else {
        button.textContent = _txt("menu>save>confirm_button");
        button.classList.add("warning");
        await delay(3000);
        button.classList.remove("warning");
        button.textContent = _txt("menu>save>delete_button");
    }
}

function unlockGlobalStory(num) {
    if (num > storyMax) {
        document.getElementById("newStory").style.display = "inline-block";
        storyMax = num;
        view.requestUpdate("updateGlobalStory", num);
    }
}

/** @param {StoryFlagName} name  */
function setStoryFlag(name) {
    if (!storyFlags[name]) {
        storyFlags[name] = true;
        if (options.actionLog) view.requestUpdate("updateStories", false);
    }
}
const unlockStory = setStoryFlag; // compatibility alias

/** @param {StoryVarName} name @param {number} value */
function increaseStoryVarTo(name, value) {
    if (storyVars[name] < value) {
        storyVars[name] = value;
        if (options.actionLog) view.requestUpdate("updateStories", false);
    }
}

function scrollToPanel(event, target) {
    event.preventDefault();
    const element = document.getElementById(target);
    const main = document.getElementById("main");

    if (element instanceof HTMLElement && main) {
        main.scroll({
            behavior: "smooth",
            left: element.offsetLeft,
        });
    }

    return false;
}

const curActionsDiv = document.getElementById("curActionsList");
const nextActionsDiv = document.getElementById("nextActionsList");
const actionOptionsTown = [];
const actionStoriesTown = [];
const townInfos = [];
for (let i = 0; i <= 8; i++) {
    actionOptionsTown[i] = document.getElementById(`actionOptionsTown${i}`);
    actionOptionsTown[i].append(Rendered.html`<div class="actionDiv"></div><div class="travelDiv">`);
    actionStoriesTown[i] = document.getElementById(`actionStoriesTown${i}`);
    townInfos[i] = document.getElementById(`townInfo${i}`);
}

/** @param {Element} theDiv @param {StatName} stat  */
function addStatColors(theDiv, stat, forceColors=false) {
    for (const className of Array.from(theDiv.classList)) {
        if (className.startsWith("stat-") && className.slice(5) in stats) {
            theDiv.classList.remove(className);
        }
    }
    theDiv.classList.add(`stat-${stat}`, "stat-background");
    if (forceColors) {
        theDiv.classList.add("use-stat-colors");
    }
}

function dragOverDecorate(i) {
    if (document.getElementById(`nextActionContainer${i}`)) document.getElementById(`nextActionContainer${i}`).classList.add("draggedOverAction");
}

function dragExitUndecorate(i) {
    if (document.getElementById(`nextActionContainer${i}`)) document.getElementById(`nextActionContainer${i}`).classList.remove("draggedOverAction");
}

function draggedDecorate(i) {
    if (document.getElementById(`nextActionContainer${i}`)) document.getElementById(`nextActionContainer${i}`).classList.add("draggedAction");
}

function draggedUndecorate(i) {
    if (document.getElementById(`nextActionContainer${i}`)) document.getElementById(`nextActionContainer${i}`).classList.remove("draggedAction");
    showActionIcons();
}

function adjustActionListSize(amt) {
    let height = document.documentElement.style.getPropertyValue("--action-list-height");
    if (height === "" && amt > 0) {
        height = `${500 + amt}px`;
    } else if (height === "" && amt === -100) {
        height = "500px";
    } else {
        height = `${Math.min(Math.max(parseInt(height) + amt, 500), 2000)}px`;
    }
    document.documentElement.style.setProperty("--action-list-height", height);
    setScreenSize();
    saveUISettings();
}

function updateBuffCaps() {
    for (const buff of buffList) {
        inputElement(`buff${buff}Cap`).value = String(Math.min(parseInt(inputElement(`buff${buff}Cap`).value), buffHardCaps[buff]));
        buffCaps[buff] = parseInt(inputElement(`buff${buff}Cap`).value);
    }
}

function setScreenSize() {
    screenSize = document.body.scrollHeight;
}

function cumulativeOffset(element) {
    var top = 0, bottom = 0;
    do {
        top += element.offsetTop  || 0;
        bottom += element.offsetBottom || 0;
        element = element.offsetParent;
    } while(element);

    return {
        top: top,
        bottom: bottom
    };
}

const DarkRitualDescription = [
    `10% faster in Beginnersville per ritual from 1-20<br>`,
    `5% faster in the Forest Path per ritual from 21-40<br>`,
    `2.5% faster in Merchanton per ritual from 41-60<br>`,
    `1.5% faster in Mt. Olympus per ritual from 61-80<br>`,
    `1.0% faster in Valhalla per ritual from 81-100<br>`,
    `0.5% faster in Startington per ritual from 101-150<br>`,
    `0.5% faster in Jungle Path per ritual from 151-200<br>`,
    `0.5% faster in Commerceville per ritual from 201-250<br>`,
    `0.5% faster in Valley of Olympus per ritual from 251-300<br>`,
    `0.1% faster globally per ritual from 301-666`];
