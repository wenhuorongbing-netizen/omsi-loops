"use strict";

(function initTownBrowserController(global) {
    /** @param {View} view */
    function initializeActionCategoryLegend(view) {
        if (document.getElementById("actionCategoryLegend")) return;

        document.getElementById("townActionTitle")?.append(Rendered.html`
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
        if (!(buttons instanceof HTMLElement)) return;
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

        updateActionCategoryLegend(view);
    }

    /** @param {View} view */
    function initializeTownBrowserTools(view) {
        if (document.getElementById("townBrowserTools")) return;
        document.getElementById("townActionTitle")?.append(Rendered.html`
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
        updateTownBrowserTools(view);
    }

    /**
     * @param {AnyAction} action
     * @param {"action"|"story"|"queue"} [variant="action"]
     */
    function renderActionCategoryBadge(action, variant="action") {
        const category = action.category;
        return `<span class="actionCategoryBadge actionCategoryBadge-${variant} action-category-${category}" title="${getActionCategoryLabel(category)}">${getActionCategoryShortLabel(category)}</span>`;
    }

    /**
     * @param {AnyAction} action
     * @param {"action"|"story"} [variant="action"]
     */
    function renderActionCategoryTooltip(action, variant="action") {
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

    /**
     * @param {View} view
     * @param {ActionCategory} category
     */
    function toggleActionCategoryFilter(view, category) {
        view.actionCategoryFilter = view.actionCategoryFilter === category ? "" : category;
        if (view.actionCategoryFilter) {
            window.localStorage.setItem("actionCategoryFilter", view.actionCategoryFilter);
        } else {
            window.localStorage.removeItem("actionCategoryFilter");
        }
        updateActionCategoryLegend(view);
        applyActionCategoryFilter(view);
        updateTownBrowserTools(view);
    }

    /** @param {View} view */
    function toggleActionCategoryLegend(view) {
        view.actionCategoryLegendCollapsed = !view.actionCategoryLegendCollapsed;
        window.localStorage.setItem("actionCategoryLegendCollapsed", String(view.actionCategoryLegendCollapsed));
        updateActionCategoryLegend(view);
    }

    /** @param {View} view */
    function updateActionCategoryLegend(view) {
        const legend = document.getElementById("actionCategoryLegend");
        if (!(legend instanceof HTMLElement)) return;

        legend.classList.toggle("collapsed", view.actionCategoryLegendCollapsed);
        htmlElement("actionCategoryLegendTitle").textContent = getActionCategoryLegendTitle();

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
                if (action.visible()) counts[action.category] += 1;
            }
        }

        for (const button of document.querySelectorAll(".actionCategoryFilterButton")) {
            if (!(button instanceof HTMLButtonElement)) continue;
            const category = /** @type {ActionCategory} */ (button.dataset.category);
            button.querySelector(".actionCategoryFilterLabel").textContent = getActionCategoryLabel(category);
            button.querySelector(".actionCategoryFilterCount").textContent = String(counts[category]);
            button.classList.toggle("is-active", view.actionCategoryFilter === category);
            button.disabled = counts[category] === 0 && view.actionCategoryFilter !== category;
            button.title = `${getActionCategoryLabel(category)}: ${getActionCategoryDescription(category)}`;
        }

        const legendToggle = document.getElementById("actionCategoryLegendToggle");
        const toggleTitle = getActionCategoryLegendToggleText(view.actionCategoryLegendCollapsed);
        if (legendToggle instanceof HTMLElement) {
            legendToggle.textContent = view.actionCategoryLegendCollapsed ? "+" : "-";
            legendToggle.title = toggleTitle;
            legendToggle.setAttribute("aria-label", toggleTitle);
        }
        htmlElement("actionCategoryLegendHint").textContent = getActionCategoryLegendHint(view.actionCategoryFilter || undefined);
    }

    /** @param {View} view */
    function applyActionCategoryFilter(view) {
        const activeCategory = view.actionCategoryFilter;
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

    /**
     * @param {View} view
     * @param {string} value
     */
    function setTownActionSearch(view, value) {
        view.townActionSearch = value.trim().toLocaleLowerCase();
        window.localStorage.setItem("townActionSearch", value);
        applyTownBrowserFilters(view);
        updateTownBrowserTools(view);
    }

    /**
     * @param {View} view
     * @param {keyof View["townQuickFilters"]} filter
     */
    function toggleTownQuickFilter(view, filter) {
        view.townQuickFilters[filter] = !view.townQuickFilters[filter];
        window.localStorage.setItem("townQuickFilters", JSON.stringify(view.townQuickFilters));
        applyTownBrowserFilters(view);
        updateTownBrowserTools(view);
    }

    /** @param {AnyAction} action */
    function isTravelOrTrialAction(action) {
        return getPossibleTravel(action.name).length > 0
            || action.name.includes("Trial")
            || ["SDungeon", "LDungeon", "TheSpire"].includes(action.varName);
    }

    /** @param {View} view */
    function getTownBrowserStats(view) {
        const shownTown = towns[townShowing] ?? towns[0];
        const unreadStories = Array.isArray(unreadActionStories) ? unreadActionStories : [];
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
            categoryCounts[action.category] += 1;
        }
        return {
            visibleCount: visibleActions.length,
            unreadCount: visibleActions.filter(action => unreadStories.includes(`storyContainer${action.varName}`)).length,
            categoryCounts,
        };
    }

    /** @param {View} view */
    function updateTownBrowserTools(view) {
        const searchInput = document.getElementById("townActionSearch");
        if (searchInput instanceof HTMLInputElement) {
            if (searchInput.value !== view.townActionSearch) searchInput.value = view.townActionSearch;
            searchInput.placeholder = view.getGuiText("townSearchPlaceholder");
        }

        const {visibleCount, unreadCount, categoryCounts} = getTownBrowserStats(view);
        htmlElement("townSummaryVisible").textContent = `${view.getGuiText("townSummaryVisible")}: ${visibleCount}`;
        htmlElement("townSummaryUnread").textContent = `${view.getGuiText("townSummaryUnread")}: ${unreadCount}`;
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
            button.classList.toggle("is-active", !!view.townQuickFilters[filter]);
            button.textContent = view.getGuiText(id);
        }
    }

    /** @param {View} view */
    function applyTownBrowserFilters(view) {
        const shownTown = towns[townShowing] ?? towns[0];
        const unreadStories = Array.isArray(unreadActionStories) ? unreadActionStories : [];
        for (const action of shownTown?.totalActionList ?? []) {
            const actionElement = document.getElementById(`container${action.varName}`);
            const storyElement = document.getElementById(`storyContainer${action.varName}`);
            const isNew = !completedActions.includes(action.varName);
            const hasUnreadStory = unreadStories.includes(`storyContainer${action.varName}`);
            const isTravelTrial = isTravelOrTrialAction(action);
            const searchable = `${action.label} ${getActionCategoryLabel(action.category)} ${view.getActionTypeLabel(action.type)} ${getTownName(action.townNum)}`.toLocaleLowerCase();
            const searchMiss = !!view.townActionSearch && !searchable.includes(view.townActionSearch);
            const quickFilterMiss = (view.townQuickFilters.new && !isNew)
                || (view.townQuickFilters.unread && !hasUnreadStory)
                || (view.townQuickFilters.travelTrial && !isTravelTrial);
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

    global.IdleLoopsTownBrowserController = {
        initializeActionCategoryLegend,
        initializeTownBrowserTools,
        renderActionCategoryBadge,
        renderActionCategoryTooltip,
        toggleActionCategoryFilter,
        toggleActionCategoryLegend,
        updateActionCategoryLegend,
        applyActionCategoryFilter,
        setTownActionSearch,
        toggleTownQuickFilter,
        isTravelOrTrialAction,
        getTownBrowserStats,
        updateTownBrowserTools,
        applyTownBrowserFilters,
    };
})(globalThis);
