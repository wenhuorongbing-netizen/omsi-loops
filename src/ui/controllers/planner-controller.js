"use strict";

(function initPlannerController(global) {
    /** @param {View} view */
    function initializePlannerShell(view) {
        applyUiPreset(view);
        applyUiDensity(view);
        setPredictorState(view, options.predictor ? "running" : "off");
        updateUiPresetButtons(view);
        updateUiDensityButtons(view);
        updatePlannerViewMenu(view);
        updateQueueRepeatToggle(view);
        updatePlannerStatus(view);
        updateQuickSettings(view);
        updateHotkeyReferencePanels(view);
    }

    /** @param {View} view */
    function getHotkeyReferenceSections(view) {
        if (view.isChineseLanguage()) {
            return [
                {
                    title: "播放与循环",
                    items: [
                        ["Space", "暂停 / 继续"],
                        ["R", "手动重启循环"],
                        ["B", "切换离线收益"],
                    ],
                },
                {
                    title: "排表与数量",
                    items: [
                        ["1-9", "快速设定添加次数"],
                        ["0", "把当前次数 x10"],
                        ["Backspace", "把当前次数 /10"],
                        ["=", "队列容量 +100"],
                        ["-", "队列容量 -100"],
                        ["Shift+S / L / C", "保存 / 载入 / 清空队列"],
                        ["Shift+Z", "撤销上一步"],
                    ],
                },
                {
                    title: "预设与导航",
                    items: [
                        ["Shift+1..5", "载入 1-5 号 Loadout"],
                        ["Left / A", "切到上一个区域"],
                        ["Right / D", "切到下一个区域"],
                        ["Shift+Left / A", "切到行动面"],
                        ["Shift+Right / D", "切到故事面"],
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

    /** @param {View} view */
    function renderHotkeyReferenceHtml(view) {
        const statusKey = options.hotkeys ? "hotkeyStatusOn" : "hotkeyStatusOff";
        const statusClass = options.hotkeys ? "is-active" : "is-inactive";
        const sections = getHotkeyReferenceSections(view);
        return `
            <div class="hotkeyReferenceHeader">
                <div class="hotkeyReferenceTitle">${view.getGuiText("hotkeyReferenceTitle")}</div>
                <span class="hotkeyReferenceStatus ${statusClass}">${view.getGuiText(statusKey)}</span>
            </div>
            <div class="hotkeyReferenceIntro">${view.getGuiText("hotkeyReferenceIntro")}</div>
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

    /** @param {View} view */
    function updateHotkeyReferencePanels(view) {
        const optionLabel = document.getElementById("simpleTooltipsOptionLabel");
        if (optionLabel instanceof HTMLElement) {
            optionLabel.textContent = view.getGuiText("simpleTooltips");
        }
        const optionTooltip = document.getElementById("simpleTooltipsOptionTooltip");
        if (optionTooltip instanceof HTMLElement) {
            optionTooltip.textContent = view.getGuiText("simpleTooltipsTooltip");
        }
        const helpHeading = document.getElementById("quickSettingsHelpHeading");
        if (helpHeading instanceof HTMLElement) {
            helpHeading.textContent = view.getGuiText("quickSettingsHelp");
        }
        const buttonIds = ["optionsHotkeyReferenceButton", "quickSettingHotkeyReference"];
        for (const id of buttonIds) {
            const button = document.getElementById(id);
            if (button instanceof HTMLElement) {
                button.textContent = view.getGuiText("viewHotkeys");
            }
        }
        const panelHtml = renderHotkeyReferenceHtml(view);
        for (const id of ["hotkeyReferencePanelOptions", "hotkeyReferencePanelQuick"]) {
            const panel = document.getElementById(id);
            if (panel instanceof HTMLElement) {
                panel.innerHTML = panelHtml;
            }
        }
    }

    function closeHotkeyReferencePanels() {
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

    /**
     * @param {View} view
     * @param {"options"|"quick"} source
     */
    function toggleHotkeyReference(view, source) {
        const isOptions = source === "options";
        const buttonId = isOptions ? "optionsHotkeyReferenceButton" : "quickSettingHotkeyReference";
        const panelId = isOptions ? "hotkeyReferencePanelOptions" : "hotkeyReferencePanelQuick";
        const button = document.getElementById(buttonId);
        const panel = document.getElementById(panelId);
        if (!(button instanceof HTMLElement) || !(panel instanceof HTMLElement)) return;
        const shouldOpen = panel.classList.contains("hidden");
        closeHotkeyReferencePanels();
        if (shouldOpen) {
            updateHotkeyReferencePanels(view);
            panel.classList.remove("hidden");
            button.classList.add("is-active");
            button.setAttribute("aria-expanded", "true");
        }
    }

    function getTrackedStatLabel() {
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

    /** @param {View} view @param {string} preset */
    function getUiPresetLabel(view, preset) {
        const labels = view.isChineseLanguage()
            ? {
                classic: "经典",
                planner: "规划",
                reader: "阅读",
                compact: "紧凑",
            }
            : {
                classic: "Classic",
                planner: "Planner",
                reader: "Reader",
                compact: "Compact",
            };
        return labels[preset] ?? preset;
    }

    /** @param {View} view @param {string} density */
    function getUiDensityLabel(view, density) {
        return view.getGuiText(`density${density[0].toUpperCase()}${density.slice(1)}`);
    }

    /** @param {View} view */
    function getQueueRepeatToggleLabel(view) {
        if (view.queueCompactRepeats) {
            return view.isChineseLanguage() ? "重复项：折叠" : "Repeat Rows: Compact";
        }
        return view.isChineseLanguage() ? "重复项：展开" : "Repeat Rows: Full";
    }

    /** @param {View} view */
    function getPlannerViewToggleLabel(view) {
        const presetLabel = getUiPresetLabel(view, view.uiPreset);
        const repeatLabel = view.queueCompactRepeats
            ? (view.isChineseLanguage() ? "折叠" : "Compact")
            : (view.isChineseLanguage() ? "展开" : "Full");
        return view.isChineseLanguage()
            ? `显示：${presetLabel} · ${repeatLabel}`
            : `View: ${presetLabel} · ${repeatLabel}`;
    }

    /**
     * @param {View} view
     * @param {string} value
     */
    function handlePredictorTrackedStatChange(view, value) {
        setOption("predictorTrackedStat", value);
        if (options.predictor) {
            setPredictorState(view, "stale");
        } else {
            updatePlannerStatus(view);
        }
        view.renderInspector();
    }

    /** @param {View} view @param {string} preset */
    function setUiPreset(view, preset) {
        if (!["classic", "planner", "reader", "compact"].includes(preset)) return;
        view.uiPreset = preset;
        window.localStorage.setItem("uiPreset", preset);
        applyUiPreset(view);
        updateUiPresetButtons(view);
    }

    /** @param {View} view */
    function applyUiPreset(view) {
        for (const preset of ["classic", "planner", "reader", "compact"]) {
            document.body.classList.toggle(`ui-preset-${preset}`, view.uiPreset === preset);
        }
        document.body.dataset.uiPreset = view.uiPreset;
    }

    /** @param {View} view @param {string} density */
    function setUiDensity(view, density) {
        if (!["compact", "standard", "large"].includes(density)) return;
        view.uiDensity = density;
        window.localStorage.setItem("uiDensity", density);
        applyUiDensity(view);
        updateUiDensityButtons(view);
    }

    /** @param {View} view */
    function applyUiDensity(view) {
        for (const density of ["compact", "standard", "large"]) {
            document.body.classList.toggle(`ui-density-${density}`, view.uiDensity === density);
        }
        document.body.dataset.uiDensity = view.uiDensity;
    }

    /** @param {View} view */
    function updateUiPresetButtons(view) {
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
            const isActive = view.uiPreset === preset;
            button.textContent = getUiPresetLabel(view, preset);
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
            button.dataset.state = isActive ? "active" : "inactive";
            button.setAttribute("title", getUiPresetLabel(view, preset));
        }
        updatePlannerViewMenu(view);
    }

    /** @param {View} view */
    function updateUiDensityButtons(view) {
        /** @type {[string, string][]} */
        const densities = [
            ["uiDensityCompact", "compact"],
            ["uiDensityStandard", "standard"],
            ["uiDensityLarge", "large"],
        ];
        for (const [id, density] of densities) {
            const button = document.getElementById(id);
            if (!(button instanceof HTMLElement)) continue;
            const isActive = view.uiDensity === density;
            button.textContent = getUiDensityLabel(view, density);
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
            button.setAttribute("title", getUiDensityLabel(view, density));
        }
    }

    /** @param {View} view */
    function toggleQueueCompactRepeats(view) {
        view.queueCompactRepeats = !view.queueCompactRepeats;
        window.localStorage.setItem("queueCompactRepeats", String(view.queueCompactRepeats));
        updateQueueRepeatToggle(view);
        view.updateNextActions();
    }

    /** @param {View} view */
    function updateQueueRepeatToggle(view) {
        const button = document.getElementById("queueRepeatToggle");
        if (!(button instanceof HTMLElement)) return;
        const label = getQueueRepeatToggleLabel(view);
        button.textContent = label;
        button.classList.toggle("is-active", view.queueCompactRepeats);
        button.setAttribute("aria-pressed", String(view.queueCompactRepeats));
        button.setAttribute("title", label);
        updatePlannerViewMenu(view);
    }

    /** @param {View} view */
    function togglePlannerViewMenu(view) {
        view.plannerViewMenuOpen = !view.plannerViewMenuOpen;
        window.localStorage.setItem("plannerViewMenuOpen", String(view.plannerViewMenuOpen));
        updatePlannerViewMenu(view);
    }

    /** @param {View} view */
    function updatePlannerViewMenu(view) {
        const toggle = document.getElementById("plannerViewToggle");
        const body = document.getElementById("plannerViewControlBody");
        if (toggle instanceof HTMLElement) {
            const label = getPlannerViewToggleLabel(view);
            toggle.textContent = label;
            toggle.classList.toggle("is-active", view.plannerViewMenuOpen);
            toggle.setAttribute("aria-expanded", String(view.plannerViewMenuOpen));
            toggle.setAttribute("title", label);
        }
        if (body instanceof HTMLElement) {
            body.classList.toggle("hidden", !view.plannerViewMenuOpen);
        }
    }

    /**
     * @param {View} view
     * @param {string} option
     */
    function toggleQuickSetting(view, option) {
        if (!(option in options)) return;
        setOption(option, !options[option], true);
        if (option === "predictor") {
            setPredictorState(view, options.predictor ? "stale" : "off");
        } else {
            updatePlannerStatus(view);
        }
        updateQuickSettings(view);
        view.updateMobileReadingState();
        view.renderInspector();
    }

    /** @param {View} view */
    function updateQuickSettings(view) {
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
            button.textContent = locKey.startsWith("gui:") ? view.getGuiText(locKey.slice(4)) : _txt(locKey);
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
            button.dataset.state = active ? "on" : "off";
            button.title = `${button.textContent?.trim() ?? ""}: ${view.getGuiText(active ? "quickSettingOn" : "quickSettingOff")}`;
        }
    }

    /** @param {View} view @param {"off"|"running"|"ready"|"stale"} state */
    function setPredictorState(view, state) {
        view.predictorState = options.predictor ? state : "off";
        updatePlannerStatus(view);
    }

    /** @param {View} view */
    function predictorUpdateHandler(view) {
        setPredictorState(view, "ready");
        if (view.inspectorSelection?.kind === "action" && view.inspectorSelection.source === "queue") {
            view.renderInspector();
        }
    }

    /** @param {View} view */
    function updatePlannerStatus(view) {
        const predictorState = htmlElement("plannerPredictorState");
        const trackedStatState = htmlElement("plannerTrackedStatState");
        const selectionState = htmlElement("plannerSelectionState");
        const predictorPrefix = view.isChineseLanguage() ? "预测器" : "Predictor";
        const focusPrefix = view.isChineseLanguage() ? "预测关注" : "Focus";
        const selectionPrefix = view.isChineseLanguage() ? "已选" : "Selected";
        const predictorLabel = {
            off: view.getGuiText("predictorOff"),
            running: view.getGuiText("predictorRunning"),
            ready: view.getGuiText("predictorReady"),
            stale: view.getGuiText("predictorStale"),
        }[options.predictor ? view.predictorState : "off"];
        predictorState.textContent = `${predictorPrefix} · ${predictorLabel}`;
        predictorState.dataset.state = options.predictor ? view.predictorState : "off";
        predictorState.dataset.kind = "predictor";
        trackedStatState.textContent = `${view.isChineseLanguage() ? "预测关注" : "Focus"}: ${getTrackedStatLabel()}`;
        trackedStatState.dataset.state = options.predictor ? view.predictorState : "off";
        trackedStatState.textContent = `${focusPrefix} · ${getTrackedStatLabel()}`;
        trackedStatState.dataset.kind = "focus";

        let selectionLabel = view.isChineseLanguage() ? "暂无检视对象" : "Nothing selected";
        let selectionVisualState = "off";
        if (view.inspectorSelection?.kind === "action") {
            const action = view.getActionByVarName(view.inspectorSelection.varName);
            if (action) {
                selectionLabel = action.label;
                selectionVisualState = "ready";
            }
        } else if (view.inspectorSelection?.kind === "log") {
            selectionLabel = `${view.getGuiText("log")} #${view.inspectorSelection.index + 1}`;
            selectionVisualState = "ready";
        }
        selectionState.textContent = `${selectionPrefix} · ${selectionLabel}`;
        selectionState.dataset.kind = "selection";
        selectionState.dataset.state = selectionVisualState;
        updatePredictorPlannerPanel(view);
    }

    /** @param {View} view */
    function updatePredictorPlannerPanel(view) {
        const panel = document.getElementById("plannerPredictorPanel");
        const heading = document.getElementById("plannerPredictorHeading");
        const viewHeading = document.getElementById("plannerViewHeading");
        const trackedStatLabel = document.getElementById("plannerTrackedStatLabel");
        const trackedStatInput = document.getElementById("predictorTrackedStatInput");
        const trackedStatHint = document.getElementById("plannerTrackedStatHint");
        const totalDisplay = document.getElementById("predictorTotalDisplay");
        const statisticDisplay = document.getElementById("predictorStatisticDisplay");
        if (heading instanceof HTMLElement) {
            heading.textContent = view.getGuiText("plannerPredictorHeading");
        }
        if (viewHeading instanceof HTMLElement) {
            viewHeading.textContent = view.getGuiText("plannerViewHeading");
        }
        if (trackedStatLabel instanceof HTMLElement) {
            trackedStatLabel.textContent = view.isChineseLanguage() ? "预测关注" : "Prediction Focus";
        }
        if (trackedStatHint instanceof HTMLElement) {
            trackedStatHint.textContent = view.isChineseLanguage()
                ? "这里只决定预测器优先展示哪个指标，不会改变实际执行。"
                : "This only changes which metric the predictor emphasizes. It does not change gameplay.";
        }
        if (trackedStatInput instanceof HTMLSelectElement) {
            trackedStatInput.value = options.predictorTrackedStat;
            trackedStatInput.title = `${getTrackedStatLabel()}`;
        }
        if (!options.predictor) {
            if (totalDisplay instanceof HTMLElement) totalDisplay.textContent = "";
            if (statisticDisplay instanceof HTMLElement) statisticDisplay.textContent = "";
        }
        if (panel instanceof HTMLElement) {
            panel.classList.toggle("is-disabled", !options.predictor);
            panel.dataset.state = options.predictor ? view.predictorState : "off";
        }
    }

    function getActiveQueueTownNum() {
        return actions.currentAction?.townNum ?? actions.current[actions.currentPos]?.townNum ?? -1;
    }

    function updateQueueSegmentHighlight() {
        const activeTownNum = getActiveQueueTownNum();
        for (const element of document.querySelectorAll(".nextActionContainer")) {
            if (!(element instanceof HTMLElement)) continue;
            element.classList.toggle("zone-active-segment", Number(element.dataset.townNum) === activeTownNum);
        }
    }

    global.IdleLoopsPlannerController = {
        initializePlannerShell,
        getHotkeyReferenceSections,
        renderHotkeyReferenceHtml,
        updateHotkeyReferencePanels,
        closeHotkeyReferencePanels,
        toggleHotkeyReference,
        getTrackedStatLabel,
        getUiPresetLabel,
        getUiDensityLabel,
        getQueueRepeatToggleLabel,
        getPlannerViewToggleLabel,
        handlePredictorTrackedStatChange,
        setUiPreset,
        applyUiPreset,
        setUiDensity,
        applyUiDensity,
        updateUiPresetButtons,
        updateUiDensityButtons,
        toggleQueueCompactRepeats,
        updateQueueRepeatToggle,
        togglePlannerViewMenu,
        updatePlannerViewMenu,
        toggleQuickSetting,
        updateQuickSettings,
        setPredictorState,
        predictorUpdateHandler,
        updatePlannerStatus,
        updatePredictorPlannerPanel,
        getActiveQueueTownNum,
        updateQueueSegmentHighlight,
    };
})(globalThis);
