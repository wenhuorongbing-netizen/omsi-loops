"use strict";

(function initAccessibilityController(global) {
    const triggerSelector = ".showthat,.showthatO,.showthat2,.showthatH,.showthatloadout,.showthatstory";
    const tooltipClassNames = new Set([
        "showthis",
        "showthis2",
        "showthisH",
        "showthisloadout",
        "showthisstory",
    ]);
    let nextTooltipId = 0;

    function isChineseLanguage() {
        return Localization.currentLang?.startsWith("zh");
    }

    function getAccessibilityText(key) {
        const texts = isChineseLanguage()
            ? {
                timeBarLabel: "\u672c\u8f6e\u6cd5\u529b\u8fdb\u5ea6",
                timeBarValuePrefix: "\u5269\u4f59",
                newStoryGeneric: "\u65b0\u6545\u4e8b\u5df2\u89e3\u9501",
                newStoryPrefix: "\u65b0\u6545\u4e8b\u5df2\u89e3\u9501\uff1a",
                globalStoryIndicator: "\u6709\u65b0\u4e3b\u7ebf\u6545\u4e8b",
                storyPanel: "\u5168\u5c40\u6545\u4e8b",
                previousStory: "\u4e0a\u4e00\u5219\u6545\u4e8b",
                nextStory: "\u4e0b\u4e00\u5219\u6545\u4e8b",
                paused: "\u6e38\u620f\u5df2\u6682\u505c",
            }
            : {
                timeBarLabel: "Loop mana progress",
                timeBarValuePrefix: "Remaining",
                newStoryGeneric: "New story unlocked",
                newStoryPrefix: "New story unlocked: ",
                globalStoryIndicator: "New global story available",
                storyPanel: "Global story",
                previousStory: "Previous story",
                nextStory: "Next story",
                paused: "Game paused",
            };
        return texts[key] ?? key;
    }

    function ensureLiveRegion(id, role, live) {
        let region = document.getElementById(id);
        if (!(region instanceof HTMLElement)) {
            region = document.createElement("div");
            region.id = id;
            region.className = "sr-only";
            document.body.appendChild(region);
        }
        region.setAttribute("role", role);
        region.setAttribute("aria-live", live);
        region.setAttribute("aria-atomic", "true");
        return region;
    }

    function ensureLiveRegions() {
        ensureLiveRegion("accessibilityStatus", "status", "polite");
        ensureLiveRegion("accessibilityAlert", "alert", "assertive");
    }

    function isNativeInteractive(element) {
        if (!(element instanceof HTMLElement)) return false;
        const tagName = element.tagName;
        return tagName === "BUTTON"
            || tagName === "A"
            || tagName === "INPUT"
            || tagName === "SELECT"
            || tagName === "TEXTAREA"
            || element.isContentEditable;
    }

    function hasFocusableDescendant(element) {
        return !!element.querySelector("button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    }

    function getDirectTooltipChildren(trigger) {
        return Array.from(trigger.children).filter(child =>
            child instanceof HTMLElement
            && Array.from(child.classList).some(className => tooltipClassNames.has(className)));
    }

    function ensureTooltipId(tooltip) {
        if (!tooltip.id) {
            nextTooltipId += 1;
            tooltip.id = `accessibilityTooltip${nextTooltipId}`;
        }
        return tooltip.id;
    }

    function isTooltipVisible(tooltip) {
        const style = window.getComputedStyle(tooltip);
        return !tooltip.hidden
            && style.display !== "none"
            && style.visibility !== "hidden"
            && parseFloat(style.opacity || "1") > 0;
    }

    function syncTooltipTrigger(trigger) {
        if (!(trigger instanceof HTMLElement)) return false;
        const tooltips = getDirectTooltipChildren(trigger);
        if (!tooltips.length) return false;
        let anyVisible = false;
        for (const tooltip of tooltips) {
            const visible = isTooltipVisible(tooltip);
            tooltip.setAttribute("role", "tooltip");
            tooltip.setAttribute("aria-hidden", String(!visible));
            anyVisible ||= visible;
        }
        if (trigger.matches(".showthatH,.showthatloadout,.showthatstory,[aria-haspopup='true']")) {
            trigger.setAttribute("aria-expanded", String(anyVisible));
        }
        return anyVisible;
    }

    function syncTooltipStates(root=document) {
        const triggers = root instanceof HTMLElement && root.matches(triggerSelector)
            ? [root]
            : Array.from(root.querySelectorAll(triggerSelector));
        for (const trigger of triggers) {
            syncTooltipTrigger(trigger);
        }
    }

    function enhanceTooltipTriggers(root=document) {
        const triggers = root instanceof HTMLElement && root.matches(triggerSelector)
            ? [root]
            : Array.from(root.querySelectorAll(triggerSelector));
        for (const trigger of triggers) {
            if (!(trigger instanceof HTMLElement)) continue;
            const tooltips = getDirectTooltipChildren(trigger);
            if (!tooltips.length) continue;
            if (!isNativeInteractive(trigger) && !trigger.hasAttribute("tabindex") && !hasFocusableDescendant(trigger)) {
                trigger.tabIndex = 0;
            }
            const ids = tooltips.map(tooltip => {
                tooltip.setAttribute("role", "tooltip");
                tooltip.setAttribute("aria-live", "off");
                return ensureTooltipId(tooltip);
            });
            trigger.setAttribute("aria-describedby", ids.join(" "));
            if (trigger.matches(".showthatH,.showthatloadout,.showthatstory") && !trigger.hasAttribute("aria-expanded")) {
                trigger.setAttribute("aria-expanded", "false");
            }
            syncTooltipTrigger(trigger);
        }
    }

    function setTabState(buttonId, panelId, selected) {
        const button = document.getElementById(buttonId);
        const panel = document.getElementById(panelId);
        if (!(button instanceof HTMLElement) || !(panel instanceof HTMLElement)) return;
        button.setAttribute("role", "tab");
        button.setAttribute("aria-controls", panelId);
        button.setAttribute("aria-selected", String(selected));
        button.tabIndex = selected ? 0 : -1;
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("aria-labelledby", buttonId);
        panel.hidden = !selected;
    }

    function refreshReadingShellAccessibility(view) {
        setTabState("readingTabInspector", "inspectorPane", view.readingPane === "inspector");
        setTabState("readingTabChronicle", "chroniclePane", view.readingPane === "chronicle");
        setTabState("readingTabCharacter", "statsWindow", view.readingPane === "character");
        setTabState("inspectorTabSummary", "inspectorSummaryPane", view.inspectorTab === "summary");
        setTabState("inspectorTabStory", "inspectorStoryPane", view.inspectorTab === "story");
        setTabState("inspectorTabNumbers", "inspectorNumbersPane", view.inspectorTab === "numbers");
        setTabState("chronicleTabLog", "chronicleLogPane", view.chronicleTab === "log");
        setTabState("chronicleTabChapters", "chronicleChaptersPane", view.chronicleTab === "chapters");
        setTabState("chronicleTabStories", "chronicleStoriesPane", view.chronicleTab === "stories");
    }

    function setPopupTriggerAttributes(trigger, fallbackLabel) {
        if (!(trigger instanceof HTMLElement)) return;
        const popup = getDirectTooltipChildren(trigger)[0];
        if (!(popup instanceof HTMLElement)) return;
        const popupId = ensureTooltipId(popup);
        trigger.setAttribute("aria-haspopup", "true");
        trigger.setAttribute("aria-controls", popupId);
        trigger.setAttribute("aria-expanded", String(isTooltipVisible(popup)));
        if (fallbackLabel && !trigger.getAttribute("aria-label")) {
            trigger.setAttribute("aria-label", fallbackLabel);
        }
    }

    function refreshAccessibilityShell(view) {
        ensureLiveRegions();
        enhanceTooltipTriggers(document);
        refreshReadingShellAccessibility(view);

        const timeBar = document.getElementById("timeBar");
        if (timeBar instanceof HTMLElement) {
            timeBar.setAttribute("aria-hidden", "true");
        }

        const storyControl = document.getElementById("story_control");
        if (storyControl instanceof HTMLElement) {
            setPopupTriggerAttributes(storyControl, getAccessibilityText("storyPanel"));
        }

        const storyLeft = document.getElementById("storyLeft");
        if (storyLeft instanceof HTMLElement) {
            storyLeft.setAttribute("aria-label", getAccessibilityText("previousStory"));
            storyLeft.setAttribute("title", getAccessibilityText("previousStory"));
        }
        const storyRight = document.getElementById("storyRight");
        if (storyRight instanceof HTMLElement) {
            storyRight.setAttribute("aria-label", getAccessibilityText("nextStory"));
            storyRight.setAttribute("title", getAccessibilityText("nextStory"));
        }

        for (const menuTrigger of document.querySelectorAll("#menu > li.showthatH")) {
            if (menuTrigger instanceof HTMLElement) {
                setPopupTriggerAttributes(menuTrigger, extractReadableLabel(menuTrigger) || undefined);
                menuTrigger.setAttribute("role", "button");
            }
        }

        const loadoutManagerToggle = document.getElementById("loadoutManagerToggle");
        if (loadoutManagerToggle instanceof HTMLElement) {
            loadoutManagerToggle.setAttribute("aria-controls", "loadoutManagerPanel");
            loadoutManagerToggle.setAttribute("aria-expanded", String(view.loadoutManagerOpen));
        }

        const newStory = document.getElementById("newStory");
        if (newStory instanceof HTMLElement) {
            newStory.setAttribute("role", "status");
            newStory.setAttribute("aria-live", "polite");
            newStory.setAttribute("aria-label", getAccessibilityText("globalStoryIndicator"));
        }

        updateTimeBarState();
        syncTooltipStates();
    }

    function updateTimeBarState() {
        const timeBarContainer = document.getElementById("timeBarContainer");
        if (!(timeBarContainer instanceof HTMLElement) || !Number.isFinite(timeNeeded)) return;
        const remainingMana = Math.max(0, timeNeeded - timer);
        const timeLabel = `${intToString(remainingMana, options.fractionalMana ? 2 : 1, true)} | ${formatTime(remainingMana / 50 / getActualGameSpeed())}`;
        timeBarContainer.setAttribute("role", "progressbar");
        timeBarContainer.setAttribute("aria-label", getAccessibilityText("timeBarLabel"));
        timeBarContainer.setAttribute("aria-valuemin", "0");
        timeBarContainer.setAttribute("aria-valuemax", `${timeNeeded}`);
        timeBarContainer.setAttribute("aria-valuenow", `${remainingMana}`);
        timeBarContainer.setAttribute("aria-valuetext", `${getAccessibilityText("timeBarValuePrefix")} ${timeLabel}`);
    }

    function extractReadableLabel(container) {
        if (!(container instanceof HTMLElement)) return "";
        const clone = container.cloneNode(true);
        if (!(clone instanceof HTMLElement)) return "";
        for (const selector of [".showthis", ".showthis2", ".showthisH", ".showthisloadout", ".showthisstory", ".notification", "img", "button"]) {
            for (const element of clone.querySelectorAll(selector)) {
                element.remove();
            }
        }
        return clone.textContent?.replace(/\s+/g, " ").trim() ?? "";
    }

    function announceStatus(message, assertive=false) {
        if (!message) return;
        ensureLiveRegions();
        const region = document.getElementById(assertive ? "accessibilityAlert" : "accessibilityStatus");
        if (!(region instanceof HTMLElement)) return;
        region.textContent = "";
        window.setTimeout(() => {
            region.textContent = message;
        }, 10);
    }

    function announceNamedNotification(name) {
        const notificationTarget = document.getElementById(name);
        const label = extractReadableLabel(notificationTarget);
        if (label) {
            announceStatus(`${getAccessibilityText("newStoryPrefix")}${label}`);
            return;
        }
        announceStatus(getAccessibilityText("newStoryGeneric"));
    }

    function handleFocusIn(view, target) {
        if (!(target instanceof HTMLElement)) return;

        const actionContainer = target.closest(".actionOrTravelContainer");
        if (actionContainer instanceof HTMLElement) {
            const varName = actionContainer.id.replace("container", "");
            if (varName) view.updateAction(varName);
        }

        const statContainer = target.closest(".statContainer");
        if (statContainer instanceof HTMLElement) {
            const statClass = Array.from(statContainer.classList).find(className => className.startsWith("stat-"));
            const stat = statClass?.slice(5);
            if (stat && stats[stat]) {
                view.showStat(stat);
            }
        }

        const skillContainer = target.closest(".skillContainer");
        if (skillContainer instanceof HTMLElement) {
            const match = /^skill(.+)Container$/.exec(skillContainer.id);
            const skill = match?.[1];
            if (skill && skills[skill]) {
                view.showSkill(skill);
            }
        }

        const buffContainer = target.closest(".buffContainer");
        if (buffContainer instanceof HTMLElement) {
            const match = /^buff(.+)Container$/.exec(buffContainer.id);
            const buff = match?.[1];
            if (buff && buffs[buff]) {
                view.showBuff(buff);
            }
        }

        syncTooltipStates();
    }

    function handleFocusOut(view, event) {
        const {target, relatedTarget} = event;
        if (!(target instanceof HTMLElement)) return;

        const movedInsideSameContainer = container =>
            relatedTarget instanceof HTMLElement && relatedTarget.closest(container) === target.closest(container);

        if (target.closest(".actionOrTravelContainer") && !movedInsideSameContainer(".actionOrTravelContainer")) {
            view.updateAction(undefined);
        }
        if (target.closest(".statContainer") && !movedInsideSameContainer(".statContainer")) {
            view.showStat(undefined);
        }
        if (target.closest(".skillContainer") && !movedInsideSameContainer(".skillContainer")) {
            view.showSkill(undefined);
        }
        if (target.closest(".buffContainer") && !movedInsideSameContainer(".buffContainer")) {
            view.showBuff(undefined);
        }

        queueMicrotask(() => syncTooltipStates());
    }

    function handleEscape(event) {
        if (!(event.target instanceof HTMLElement)) return;
        const insideTransientUi = event.target.closest(`${triggerSelector}, .showthis, .showthis2, .showthisH, .showthisloadout, .showthisstory`);
        if (!(insideTransientUi instanceof HTMLElement)) return;
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        queueMicrotask(() => syncTooltipStates());
    }

    global.IdleLoopsAccessibilityController = {
        initializeAccessibilityShell: refreshAccessibilityShell,
        refreshAccessibilityShell,
        refreshReadingShellAccessibility,
        enhanceTooltipTriggers,
        syncTooltipTrigger,
        syncTooltipStates,
        updateTimeBarState,
        announceStatus,
        announceNamedNotification,
        handleFocusIn,
        handleFocusOut,
        handleEscape,
    };
})(globalThis);
