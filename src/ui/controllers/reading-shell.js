"use strict";

(function initReadingShellController(global) {
    /** @param {View} view */
    function initializeReadingShell(view) {
        const chronicleLogPane = htmlElement("chronicleLogBody");
        const actionLogContainer = htmlElement("actionLogContainer");
        if (actionLogContainer.parentElement !== chronicleLogPane) {
            chronicleLogPane.appendChild(actionLogContainer);
        }
        view.refreshGuiLanguage(true);
        setReadingPane(view, view.readingPane);
        setInspectorTab(view, view.inspectorTab);
        setChronicleTab(view, view.chronicleTab);
        view.renderChronicleLogControls();
        view.renderChronicleChapters();
        view.renderChronicleStories();
        view.renderInspector();
        updateMobileReadingState(view);
        global.IdleLoopsAccessibilityController?.refreshAccessibilityShell(view);
    }

    /** @param {View} view */
    function isMobileReadingUi(view) {
        return options.responsiveUI && window.matchMedia("(max-width: 810px)").matches;
    }

    /** @param {View} view */
    function updateMobileReadingState(view) {
        const mobileReadingUi = isMobileReadingUi(view);
        const isDrawerOpen = mobileReadingUi && view.readingPane !== "character";
        document.body.classList.toggle("mobile-reading-ui", mobileReadingUi);
        document.body.classList.toggle("mobile-reading-open", isDrawerOpen);
        htmlElement("statsColumn").dataset.readingDrawer = isDrawerOpen ? "open" : "closed";
    }

    /** @param {View} view */
    function responsiveLayoutHandler(view) {
        updateMobileReadingState(view);
    }

    /**
     * @param {View} view
     * @param {"inspector"|"chronicle"|"character"} pane
     */
    function setReadingPane(view, pane) {
        if (isMobileReadingUi(view) && pane === view.readingPane && pane !== "character") {
            pane = "character";
        }
        view.readingPane = pane;
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
        updateMobileReadingState(view);
        global.IdleLoopsAccessibilityController?.refreshReadingShellAccessibility(view);
    }

    /**
     * @param {View} view
     * @param {"summary"|"story"|"numbers"} tab
     */
    function setInspectorTab(view, tab) {
        view.inspectorTab = tab;
        htmlElement("inspectorTabSummary").classList.toggle("is-active", tab === "summary");
        htmlElement("inspectorTabStory").classList.toggle("is-active", tab === "story");
        htmlElement("inspectorTabNumbers").classList.toggle("is-active", tab === "numbers");
        htmlElement("inspectorSummaryPane").classList.toggle("hidden", tab !== "summary");
        htmlElement("inspectorStoryPane").classList.toggle("hidden", tab !== "story");
        htmlElement("inspectorNumbersPane").classList.toggle("hidden", tab !== "numbers");
        global.IdleLoopsAccessibilityController?.refreshReadingShellAccessibility(view);
    }

    /**
     * @param {View} view
     * @param {"log"|"chapters"|"stories"} tab
     */
    function setChronicleTab(view, tab) {
        view.chronicleTab = tab;
        htmlElement("chronicleTabLog").classList.toggle("is-active", tab === "log");
        htmlElement("chronicleTabChapters").classList.toggle("is-active", tab === "chapters");
        htmlElement("chronicleTabStories").classList.toggle("is-active", tab === "stories");
        htmlElement("chronicleLogPane").classList.toggle("hidden", tab !== "log");
        htmlElement("chronicleChaptersPane").classList.toggle("hidden", tab !== "chapters");
        htmlElement("chronicleStoriesPane").classList.toggle("hidden", tab !== "stories");
        if (tab === "log") view.renderChronicleLogControls();
        if (tab === "chapters") view.renderChronicleChapters();
        if (tab === "stories") view.renderChronicleStories();
        global.IdleLoopsAccessibilityController?.refreshReadingShellAccessibility(view);
    }

    /** @param {View} view @param {number} chapter */
    function setChronicleChapter(view, chapter) {
        view.chronicleChapter = chapter;
        view.renderChronicleChapters();
    }

    /**
     * @param {View} view
     * @param {"inspector"|"chronicle"|"character"} pane
     * @param {"log"|"chapters"|"stories"} [tab]
     */
    function openReadingPaneFromNav(view, pane, tab) {
        setReadingPane(view, pane);
        if (pane === "chronicle" && tab) {
            setChronicleTab(view, tab);
        }
    }

    /** @param {View} view @param {MouseEvent} event */
    function documentClickHandler(view, event) {
        if (!(event.target instanceof HTMLElement)) return;
        const target = event.target;
        const insidePopup = target.closest(".showthis,.showthis2,.showthisH,.showthisloadout,.showthisstory");
        const menuTrigger = target.closest("#menu > li.showthatH");

        if (menuTrigger && !insidePopup) {
            toggleMenuPopup(view, menuTrigger.id);
        } else if (!target.closest("#menu")) {
            closeOpenMenus(view);
        }

        if (insidePopup) return;

        const storyContainer = target.closest(".storyContainer");
        if (storyContainer instanceof HTMLElement) {
            const varName = storyContainer.id.replace("storyContainer", "");
            view.openInspectorForStory(varName);
            return;
        }

        const actionContainer = target.closest(".actionOrTravelContainer");
        if (actionContainer instanceof HTMLElement) {
            const varName = actionContainer.id.replace("container", "");
            queueMicrotask(() => view.openInspectorForAction(varName));
            return;
        }

        const logEntry = target.closest(".actionLogEntry");
        if (logEntry instanceof HTMLElement) {
            const index = Number(logEntry.id.replace("actionLogEntry", ""));
            if (Number.isFinite(index)) {
                view.openInspectorForLog(index);
            }
        }
    }

    /** @param {View} view @param {KeyboardEvent} event */
    function keydownHandler(view, event) {
        if (!(event.target instanceof HTMLElement)) return;
        if (event.key === "Escape") {
            closeOpenMenus(view);
            global.IdleLoopsAccessibilityController?.handleEscape(event);
            if (view.readingPane === "inspector" && view.inspectorSelection) {
                view.clearInspectorSelection();
            }
            return;
        }
        if (!(event.key === "Enter" || event.key === " ")) return;

        const target = event.target;
        const storyContainer = target.closest(".storyContainer");
        if (storyContainer instanceof HTMLElement) {
            event.preventDefault();
            view.openInspectorForStory(storyContainer.id.replace("storyContainer", ""));
            return;
        }
        const queueRow = target.closest(".nextActionContainer");
        if (queueRow instanceof HTMLElement) {
            event.preventDefault();
            const actionId = Number(queueRow.getAttribute("data-action-id"));
            if (Number.isFinite(actionId)) view.openInspectorForQueue(actionId);
            return;
        }
        const logEntry = target.closest(".actionLogEntry");
        if (logEntry instanceof HTMLElement) {
            event.preventDefault();
            const index = Number(logEntry.id.replace("actionLogEntry", ""));
            if (Number.isFinite(index)) view.openInspectorForLog(index);
        }
    }

    /** @param {View} view @param {string} menuId */
    function toggleMenuPopup(view, menuId) {
        const menuElement = htmlElement(menuId);
        const isOpen = menuElement.classList.contains("menu-open");
        closeOpenMenus(view);
        if (!isOpen) {
            menuElement.classList.add("menu-open");
            menuElement.setAttribute("aria-expanded", "true");
        }
        global.IdleLoopsAccessibilityController?.syncTooltipStates();
    }

    /** @param {View} view */
    function closeOpenMenus(view) {
        view.closeHotkeyReferencePanels();
        for (const menu of document.querySelectorAll("#menu > li.showthatH.menu-open")) {
            if (!(menu instanceof HTMLElement)) continue;
            menu.classList.remove("menu-open");
            menu.setAttribute("aria-expanded", "false");
        }
        global.IdleLoopsAccessibilityController?.syncTooltipStates();
    }

    global.IdleLoopsReadingShellController = {
        initializeReadingShell,
        isMobileReadingUi,
        updateMobileReadingState,
        responsiveLayoutHandler,
        setReadingPane,
        setInspectorTab,
        setChronicleTab,
        setChronicleChapter,
        openReadingPaneFromNav,
        documentClickHandler,
        keydownHandler,
        toggleMenuPopup,
        closeOpenMenus,
    };
})(globalThis);
