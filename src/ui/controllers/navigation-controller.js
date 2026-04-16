"use strict";

class NavigationController {
    constructor() {
        this.activeTab = "action";
        this.toolsDrawerOpen = false;

        this.tabs = {
            "action": { elements: ["actionsColumn", "shortTownColumn"] },
            "chronicle": { elements: ["statsColumn"], action: () => {
                if (window.view && typeof window.view.setReadingPane === "function") {
                    window.view.setReadingPane("chronicle");
                }
                if (window.view && typeof window.view.setChronicleTab === "function") {
                    window.view.setChronicleTab("log");
                }
                const statsWindow = document.getElementById("statsWindow");
                if (statsWindow) statsWindow.classList.add("hidden");
                const readingShell = document.getElementById("readingShell");
                if (readingShell) readingShell.classList.remove("hidden");
            }},
            "character": { elements: ["statsColumn"], action: () => {
                if (window.view && typeof window.view.setReadingPane === "function") {
                    window.view.setReadingPane("character");
                }

                const regularStats = document.getElementById("regularStats");
                if (regularStats && !regularStats.checked) {
                    regularStats.checked = true;
                    if (window.view && typeof window.view.changeStatView === "function") {
                        window.view.changeStatView();
                    }
                }
                const statsWindow = document.getElementById("statsWindow");
                if (statsWindow) statsWindow.classList.remove("hidden");
                const readingShell = document.getElementById("readingShell");
                if (readingShell) readingShell.classList.add("hidden");
            }},
            "tools": { elements: [] }
        };
    }

    init() {
        this.initEventListeners();
        if (this.isMobile()) {
            this.setActiveTab(this.activeTab);
        } else {
            this.resetDesktopView();
        }
    }

    initEventListeners() {
        const navButtons = document.querySelectorAll(".mobile-nav-btn");
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = btn.getAttribute("data-tab");
                if (tabId) {
                    this.setActiveTab(tabId);
                }
            });
        });

        const drawerCloseBtn = document.getElementById("mobileToolsDrawerClose");
        if (drawerCloseBtn) {
            drawerCloseBtn.addEventListener('click', () => {
                this.closeToolsDrawer();
            });
        }

        window.addEventListener('resize', () => {
            if (!this.isMobile()) {
                this.resetDesktopView();
            } else {
                this.setActiveTab(this.activeTab);
            }
        });
    }

    isMobile() {
        return window.innerWidth <= 1000;
    }

    setActiveTab(tabId) {
        if (!this.isMobile()) return;

        this.activeTab = tabId;

        if (tabId === "tools") {
            this.toggleToolsDrawer();
            return;
        } else {
            this.closeToolsDrawer();
        }

        document.querySelectorAll(".mobile-nav-btn").forEach(btn => {
            if (btn.getAttribute("data-tab") === tabId) {
                btn.classList.add("is-active");
                btn.setAttribute("aria-current", "page");
            } else {
                btn.classList.remove("is-active");
                btn.setAttribute("aria-current", "false");
            }
        });

        const allColumns = ["actionsColumn", "shortTownColumn", "statsColumn"];
        allColumns.forEach(col => {
            const el = document.getElementById(col);
            if (el) {
                el.classList.add("mobile-hidden");
                el.setAttribute("aria-hidden", "true");
            }
        });

        const activeElements = this.tabs[tabId].elements;
        activeElements.forEach(col => {
            const el = document.getElementById(col);
            if (el) {
                el.classList.remove("mobile-hidden");
                el.setAttribute("aria-hidden", "false");
            }
        });

        if (this.tabs[tabId].action) {
            this.tabs[tabId].action();
        }

        window.scrollTo(0, 0);
    }

    toggleToolsDrawer() {
        this.toolsDrawerOpen = !this.toolsDrawerOpen;
        const drawer = document.getElementById("mobileToolsDrawer");
        const toolsBtn = document.querySelector('.mobile-nav-btn[data-tab="tools"]');

        if (drawer) {
        const details = document.getElementById("globalTools");
        if (details) details.open = true;
            if (this.toolsDrawerOpen) {
                drawer.classList.remove("mobile-hidden");
                drawer.classList.add("is-open");
                drawer.setAttribute("aria-hidden", "false");
                if (toolsBtn) toolsBtn.setAttribute("aria-expanded", "true");
            } else {
                drawer.classList.remove("is-open");
                drawer.classList.add("mobile-hidden");
                drawer.setAttribute("aria-hidden", "true");
                if (toolsBtn) toolsBtn.setAttribute("aria-expanded", "false");

                if (this.activeTab === "tools") {
                    this.setActiveTab("action");
                }
            }
        }
    }

    closeToolsDrawer() {
        if (this.toolsDrawerOpen) {
            this.toggleToolsDrawer();
        }
    }

    resetDesktopView() {
        const allColumns = ["actionsColumn", "shortTownColumn", "statsColumn"];
        allColumns.forEach(col => {
            const el = document.getElementById(col);
            if (el) {
                el.classList.remove("mobile-hidden");
                el.setAttribute("aria-hidden", "false");
            }
        });

        const statsWindow = document.getElementById("statsWindow");
        const readingShell = document.getElementById("readingShell");
        if (statsWindow) statsWindow.classList.remove("hidden");
        if (readingShell) readingShell.classList.remove("hidden");

        const drawer = document.getElementById("mobileToolsDrawer");
        if (drawer) {
            drawer.classList.remove("is-open");
            drawer.setAttribute("aria-hidden", "true");
        }
        this.toolsDrawerOpen = false;
    }

    onActionLogToggled(isVisible) {
        const chronicleBtn = document.querySelector('.mobile-nav-btn[data-tab="chronicle"]');
        if (chronicleBtn) {
            chronicleBtn.style.display = isVisible ? "" : "none";
        }
    }
}

globalThis.NavigationController = new NavigationController();

window.addEventListener('DOMContentLoaded', () => {
    globalThis.NavigationController.init();
});
