"use strict";

(function initLoadoutController(global) {
    /**
     * @param {string} locale
     * @param {string} timestamp
     */
    function formatLoadoutSavedAt(locale, timestamp) {
        if (!timestamp) return "";
        try {
            return new Date(timestamp).toLocaleString(locale || undefined, {dateStyle: "short", timeStyle: "short"});
        } catch {
            return new Date(timestamp).toLocaleString();
        }
    }

    /** @param {ActionRecord} record */
    function simplifyActionRecord(record) {
        return {
            name: record.name,
            loops: record.loops,
            disabled: !!record.disabled,
            collapsed: !!record.collapsed,
        };
    }

    /**
     * @param {ActionRecord[]} [left=[]]
     * @param {ActionRecord[]} [right=[]]
     */
    function areActionRecordsEquivalent(left=[], right=[]) {
        if (left.length !== right.length) return false;
        return left.every((record, index) => {
            const comparison = right[index];
            if (!comparison) return false;
            const a = simplifyActionRecord(record);
            const b = simplifyActionRecord(comparison);
            return a.name === b.name
                && a.loops === b.loops
                && a.disabled === b.disabled
                && a.collapsed === b.collapsed;
        });
    }

    /** @param {View} view */
    function initializeLoadoutManager(view) {
        const managerPanel = document.getElementById("loadoutManagerPanel");
        const slotGrid = document.getElementById("loadoutSlotGrid");
        const actionsBar = document.getElementById("loadoutManagerActions");
        const legacyShell = document.querySelector(".showthatloadout");
        const legacyPanel = legacyShell?.querySelector(".showthisloadout");
        const renameInput = document.getElementById("renameLoadout");
        if (!(managerPanel instanceof HTMLElement)
            || !(slotGrid instanceof HTMLElement)
            || !(actionsBar instanceof HTMLElement)
            || !(legacyPanel instanceof HTMLElement)
            || !(renameInput instanceof HTMLElement)) {
            return;
        }

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
        toggleLoadoutManager(view, view.loadoutManagerOpen);
        updateLoadoutManager(view);
    }

    /**
     * @param {View} view
     * @param {boolean} [force]
     */
    function toggleLoadoutManager(view, force) {
        if (typeof force === "boolean") {
            view.loadoutManagerOpen = force;
        } else {
            view.loadoutManagerOpen = !view.loadoutManagerOpen;
        }
        window.localStorage.setItem("loadoutManagerOpen", String(view.loadoutManagerOpen));
        const panel = document.getElementById("loadoutManagerPanel");
        const toggle = document.getElementById("loadoutManagerToggle");
        if (panel instanceof HTMLElement) panel.classList.toggle("hidden", !view.loadoutManagerOpen);
        if (toggle instanceof HTMLElement) toggle.setAttribute("aria-expanded", String(view.loadoutManagerOpen));
    }

    /**
     * @param {View} view
     * @param {number} num
     */
    function noteLoadoutSaved(view, num) {
        view.loadoutSaveTimes[num] = new Date().toISOString();
        window.localStorage.setItem("loadoutSaveTimes", JSON.stringify(view.loadoutSaveTimes));
        updateLoadoutManager(view);
    }

    /** @param {View} view */
    function updateLoadoutManager(view) {
        const selectionSummary = document.getElementById("loadoutSelectionSummary");
        const differenceSummary = document.getElementById("loadoutDifferenceSummary");
        const loadButton = document.getElementById("loadLoadoutButton");
        const saveButton = document.getElementById("saveLoadoutButton");
        const renameButton = document.getElementById("renameLoadoutButton");
        const renameInput = document.getElementById("renameLoadout");
        const loadoutLabels = Array.isArray(globalThis.loadoutnames) ? globalThis.loadoutnames : [];
        if (!(selectionSummary instanceof HTMLElement) || !(differenceSummary instanceof HTMLElement)) return;

        for (let i = 1; i <= 15; i++) {
            const button = document.getElementById(`load${i}`);
            if (!(button instanceof HTMLElement)) continue;
            const records = loadouts?.[i] ?? [];
            const isEmpty = !records || records.length === 0;
            const matchesCurrent = !isEmpty && areActionRecordsEquivalent(records, actions.next);
            const savedAt = formatLoadoutSavedAt(Localization.currentLang, view.loadoutSaveTimes[i]);
            const loadoutName = loadoutLabels[i - 1] ?? getDefaultLoadoutName(i);
            const actionCountText = isEmpty
                ? view.getGuiText("loadoutEmpty")
                : `${records.length} ${view.getGuiText("loadoutActions")}`;
            const savedAtText = savedAt
                ? `${view.getGuiText("loadoutSavedAt")}: ${savedAt}`
                : `${view.getGuiText("loadoutSavedAt")}: -`;
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
            selectionSummary.textContent = view.getGuiText("loadoutNoSelection");
            differenceSummary.textContent = view.getGuiText("loadoutReplaceWarning");
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
        const matchesCurrent = !isEmpty && areActionRecordsEquivalent(selectedRecords, actions.next);
        const savedAt = formatLoadoutSavedAt(Localization.currentLang, view.loadoutSaveTimes[curLoadout]);
        selectionSummary.textContent = `${view.getGuiText("loadoutSelected")}: ${loadoutLabels[curLoadout - 1] ?? getDefaultLoadoutName(curLoadout)}`;
        differenceSummary.textContent = isEmpty
            ? view.getGuiText("loadoutEmpty")
            : `${selectedRecords.length} ${view.getGuiText("loadoutActions")} / ${matchesCurrent ? view.getGuiText("loadoutMatchesCurrent") : view.getGuiText("loadoutDiffersCurrent")}${savedAt ? ` / ${view.getGuiText("loadoutSavedAt")}: ${savedAt}` : ""}`;
        if (loadButton instanceof HTMLButtonElement) loadButton.disabled = isEmpty;
        if (saveButton instanceof HTMLButtonElement) saveButton.disabled = false;
        if (renameButton instanceof HTMLButtonElement) renameButton.disabled = false;
        if (renameInput instanceof HTMLInputElement && document.activeElement !== renameInput) {
            renameInput.value = loadoutLabels[curLoadout - 1] ?? getLoadoutNameDefault();
        }
    }

    global.IdleLoopsLoadoutController = {
        initializeLoadoutManager,
        toggleLoadoutManager,
        formatLoadoutSavedAt,
        simplifyActionRecord,
        areActionRecordsEquivalent,
        noteLoadoutSaved,
        updateLoadoutManager,
    };
})(globalThis);
