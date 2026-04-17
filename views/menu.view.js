
const menuView = Views.registerView("menu", {
    selector: "#menu",
    html() {
        let html = "";
        html += Views.menu.htmlMenusMenu();
        html += Views.menu.htmlChangelog();
        html += Views.menu.htmlSaveMenu();
        html += Views.menu.htmlFAQMenu();
        html += Views.menu.htmlOptionsMenu();
        html += Views.menu.htmlQuickSettingsMenu();
        html += Views.menu.htmlExtrasMenu();
        html += Views.menu.htmlChallengeMenu();
        html += Views.menu.htmlTotalsMenu();
        html += Views.menu.htmlPrestigeMenu();
        html += Views.menu.htmlWarningMenu();
        return html;
    },
    isChineseLanguage() {
        return Localization.currentLang?.startsWith("zh");
    },
    uiText(key) {
        const texts = this.isChineseLanguage()
            ? {
                quickSettingsTitle: "\u5feb\u6377\u8bbe\u7f6e",
                quickSettingsHelp: "\u5e2e\u52a9",
                simpleTooltips: "\u7b80\u5316\u63d0\u793a",
                simpleTooltipsTooltip: "\u4e00\u952e\u964d\u4f4e hover \u63d0\u793a\u7684\u5bc6\u5ea6\uff0c\u5b8c\u6574\u6570\u503c\u4ecd\u4fdd\u7559\u5728 Inspector \u91cc\u3002",
                viewHotkeys: "\u67e5\u770b\u952e\u4f4d",
            }
            : {
                quickSettingsTitle: "Quick Settings",
                quickSettingsHelp: "Help",
                simpleTooltips: "Simple Tooltips",
                simpleTooltipsTooltip: "Reduce hover tooltip density in one click. Full detail stays available in the Inspector.",
                viewHotkeys: "View Hotkeys",
            };
        return texts[key] ?? key;
    },
    quickSettingsTitle() {
        return this.uiText("quickSettingsTitle");
    },
    htmlMenusMenu() {
        const menus = [
            "changelog",
            "save",
            "faq",
            "options",
            "extras",
            "challenges",
            "totals",
            "prestige_bonus",
        ];
        const disabledMenus = this.getDisabledMenus();
        const html =
        `<div id='menusMenu' style='display: none;' class='${menus.map(menu => disabledMenus.includes(menu) ? ` disabled-${menu}` : "").join("")}'>
            <div id='menus'>
                <ul style='display: none;'>
                    ${menus.map(menu => `
                    <li>
                        <input type='checkbox' id='enableMenu_${menu}' data-menu='${menu}' onchange='Views.menu.onEnableMenu(this)' ${disabledMenus.includes(menu) ? "" : "checked"}>
                        <label for='enableMenu_${menu}'>${_txt(`menu>${menu}>meta>title`)}</label>
                    </li>`).join("\n")}
                </ul>
            </div>
        </div>`;
        return html;

    },
    getDisabledMenus() {
        let disabledMenus = [];
        try {
            disabledMenus = JSON.parse(localStorage.getItem("disabledMenus")) ?? disabledMenus;
        } catch { }
        return disabledMenus;
    },
    /** @param {HTMLInputElement} input  */
    onEnableMenu(input) {
        const menu = input.dataset.menu;
        htmlElement("menusMenu").classList.toggle(`disabled-${menu}`, !input.checked);
        const disabledMenus = this.getDisabledMenus();
        const index = disabledMenus.indexOf(menu);
        if (index === -1 && !input.checked) {
            disabledMenus.push(menu);
        } else if (index >= 0 && input.checked) {
            disabledMenus.splice(index, 1);
        }
        localStorage.setItem("disabledMenus", JSON.stringify(disabledMenus));
    },
    versions() {
        let html = "";
        const versions = _txtsObj("menu>changelog>version");
        $(versions).each((_index, version) => {
            const caption = $(version).attr("caption");
            const verNum = $(version).attr("verNum");
            html += `
                    <li class='showthat2' tabindex='0' ${verNum ? `data-verNum="${verNum}"` : ""}>
                        ${caption ? caption : `${_txt("menu>changelog>meta>version_prefix")} ${verNum}`}
                        <div class='showthis2'>
                            ${$(version).text()}
                        </div>
                    </li>`;
        });
        return html;
    },
    htmlChangelog() {
        const html =
        `<li id='changelogMenu' tabindex='0' style='display:inline-block;height:30px;margin-left:10px;' class='showthatH'>
            ${_txt("menu>changelog>meta>title")}
            <ul class='showthisH' id='changelog'>
                ${this.versions()}
            </ul>
        </li>`;
        return html;
    },
    htmlSaveMenu() {
        const html =
        `<li id='saveMenu' tabindex='0' style='display:inline-block;height:30px;margin-left:10px;' class='showthatH'>
            ${_txt("menu>save>meta>title")}
            <div class='showthisH'>
                <button class='button' onclick='save()'>${_txt("menu>save>manual_save")}</button>
                <br>
                <textarea id='exportImportList'></textarea><label for='exportImportList'> ${_txt("menu>save>list_label")}</label>
                <br>
                <button class='button' style='margin-right: 2px;' onclick='exportCurrentList()'>${_txt("menu>save>export_button")}</button>
                <button class='button' onclick='importCurrentList()'>${_txt("menu>save>import_button")}</button>
                <br>
                ${_txt("menu>save>list_comment")}
                <br><br>
                <input id='exportImport'><label for='exportImport'> ${_txt("menu>save>input_label")}</label><br>
                <button class='button' style='margin-top: 5px; margin-right: 2px;' onclick='exportSave()'>${_txt("menu>save>export_button")}</button>
                <button class='button' style='margin-top: 1px;' onclick='importSave()'>${_txt("menu>save>import_button")}</button><br>
                ${_txt("menu>save>export_comment")}<br>
                ${_txt("menu>save>import_comment")}<br>
                <button class='button' style='margin-top: 5px; margin-right: 2px;' onclick='exportSaveFile()'>${_txt("menu>save>exportfile_button")}</button>
                <button class='button' style='margin-top: 1px;' onclick='openSaveFile()'>${_txt("menu>save>importfile_button")}</button>
                <input id="SaveFileInput" type='file' style="visibility:hidden;" onchange="importSaveFile(event)" />
                <br>
                <div id="cloud_save" class="block" style="display:none">
                    ${_txt("menu>save>cloud_label")}<br>
                    <button class='button' style='margin-top: 5px; margin-right: 2px;' onclick='googleCloud.exportSave()'>${_txt("menu>save>exportcloud_button")}</button>
                    <button class='button' style='margin-top: 1px;' onclick='googleCloud.loadSaves(true)'>${_txt("menu>save>importcloud_button")}</button>
                    <ul id='cloud_save_result'></ul>
                </div>
            </div>
        </li>`;
        return html;
    },
    FAQs() {
        let html = "";
        const QAs = _txtsObj("menu>faq>q_a");
        $(QAs).each((_index, QA) => {
            html += `
                <li class='showthat2' tabindex='0'>
                    ${$(QA).find("q").html()}
                    <div class='showthis2'>
                        ${$(QA).find("a").html()}
                    </div>
                </li>`;
        });
        return html;
    },
    htmlFAQMenu() {
        const html = 
        `<li id='faqMenu' tabindex='0' style='display:inline-block;height:30px;margin-left:10px;' class='showthatH'>
            ${_txt("menu>faq>meta>title")}
            <ul class='showthisH' id="faq">
                ${this.FAQs()}
            </ul>
        </li>`;
        return html;
    },
    htmlOptionsMenu() {
        const html =
            `<li id='optionsMenu' tabindex='0' style='display:inline-block;height:30px;margin-left:10px;' class='showthatH'>
            ${_txt("menu>options>meta>title")}
            <div class='showthisH'>
                <a target='_blank' href='${_txt("menu>options>discord>link")}'>${_txt("menu>options>discord>title")}</a><br>
                ${Views.menu.htmlThemeMenu()}
                ${Object.keys(Localization.supportedLang).length > 1 ? Views.menu.htmlLocalizationMenu() : ""}
                ${_txt("menu>options>adblock_warning")}<br>
                <input id='responsiveUIInput' type='checkbox' onchange='setOption("responsiveUI", this.checked)'/>
                    <label for='responsiveUIInput'>${_txt("menu>options>responsive_ui")}</label>
                <br>
                <input id='actionLogInput' type='checkbox' onchange='setOption("actionLog", this.checked)'/>
                    <label for='actionLogInput'>${_txt("menu>options>action_log")}</label>
                <br>
                <input id='googleCloudInput' type='checkbox' onchange='setOption("googleCloud", this.checked)'/>
                    <label for='googleCloudInput'>${_txt("menu>options>google_cloud")}</label>
                <br>
                <input id='highlightNewInput' type='checkbox' onchange='setOption("highlightNew", this.checked)'/>
                    <label for='highlightNewInput'>${_txt("menu>options>highlight_new")}</label>
                <br>
                <input id='statColorsInput' type='checkbox' onchange='setOption("statColors", this.checked)'/>
                    <label for='statColorsInput'>${_txt("menu>options>stat_colors")}</label>
                <br>
                <input id='statHintsInput' type='checkbox' onchange='setOption("statHints", this.checked)'/>
                    <label for='statHintsInput'>${_txt("menu>options>stat_hints")}</label>
                <br>
                <input id='simpleTooltipsInput' type='checkbox' onchange='setOption("simpleTooltips", this.checked)'/>
                    <label class='showthat' for='simpleTooltipsInput'><span id='simpleTooltipsOptionLabel'>${this.uiText("simpleTooltips")}</span>
                    <div class='showthis'><span id='simpleTooltipsOptionTooltip'>${this.uiText("simpleTooltipsTooltip")}</span></div>
                </label>
                <br>
                <input id='pingOnPauseInput' type='checkbox' onchange='setOption("pingOnPause", this.checked)'/>
                    <label for='pingOnPauseInput'>${_txt("menu>options>pause_audio_cue")}</label>
                <br>
                <input id='notifyOnPauseInput' type='checkbox' onchange='setOption("notifyOnPause", this.checked)'/>
                    <label for='notifyOnPauseInput'>${_txt("menu>options>pause_notify_cue")}</label>
                <br>
                <input id='autoMaxTrainingInput' type='checkbox' onchange='setOption("autoMaxTraining", this.checked)'/>
                    <label for='autoMaxTrainingInput'>${_txt("menu>options>auto_max_training")}</label>
                <br>
                <input id='hotkeysInput' type='checkbox' onchange='setOption("hotkeys", this.checked)'/>
                    <label class='showthat' for='hotkeysInput'>${_txt("menu>options>hotkeys")}
                    <div class='showthis'>${_txt("menu>options>hotkeys_tooltip")}</div>
                </label>
                <br>
                <button id='optionsHotkeyReferenceButton' type='button' class='button hotkeyReferenceToggle' onclick='view.toggleHotkeyReference("options")' aria-expanded='false'>${this.uiText("viewHotkeys")}</button>
                <div id='hotkeyReferencePanelOptions' class='hotkeyReferencePanel hidden'></div>
                <br>
                ${_txt("menu>options>update_rate")}
                <input id='updateRateInput' type='number' value='50' min='1' style='width: 50px;transform: translateY(-2px);' oninput='setOption("updateRate", parseInt(this.value))' />
                <br>
                ${_txt("menu>options>autosave_rate")}
                <input id='autosaveRateInput' type='number' value='30' min='1' style='width: 50px;transform: translateY(-2px);' oninput='setOption("autosaveRate", parseInt(this.value))' />
                <br>
            </div>
        </li>`;
        return html;
    },
    htmlQuickSettingsMenu() {
        return `
        <li id='quickSettingsMenu' tabindex='0' style='display:inline-block;height:30px;margin-left:10px;' class='showthatH'>
            <span id='quickSettingsMenuLabel'>${this.quickSettingsTitle()}</span>
            <div class='showthisH quickSettingsPanel'>
                <div class='quickSettingsSection'>
                    <div id='quickSettingsToggleHeading' class='quickSettingsHeading'></div>
                    <div class='quickSettingsToggleGrid'>
                        <button id='quickSettingResponsiveUI' type='button' class='button quickSettingButton' onclick='view.toggleQuickSetting("responsiveUI")'>${_txt("menu>options>responsive_ui")}</button>
                        <button id='quickSettingActionLog' type='button' class='button quickSettingButton' onclick='view.toggleQuickSetting("actionLog")'>${_txt("menu>options>action_log")}</button>
                        <button id='quickSettingPredictor' type='button' class='button quickSettingButton' onclick='view.toggleQuickSetting("predictor")'>${_txt("menu>options>predictor")}</button>
                        <button id='quickSettingStatColors' type='button' class='button quickSettingButton' onclick='view.toggleQuickSetting("statColors")'>${_txt("menu>options>stat_colors")}</button>
                        <button id='quickSettingHighlightNew' type='button' class='button quickSettingButton' onclick='view.toggleQuickSetting("highlightNew")'>${_txt("menu>options>highlight_new")}</button>
                        <button id='quickSettingHotkeys' type='button' class='button quickSettingButton' onclick='view.toggleQuickSetting("hotkeys")'>${_txt("menu>options>hotkeys")}</button>
                        <button id='quickSettingSimpleTooltips' type='button' class='button quickSettingButton' onclick='view.toggleQuickSetting("simpleTooltips")'>${this.uiText("simpleTooltips")}</button>
                    </div>
                </div>
                <div class='quickSettingsSection'>
                    <div id='quickSettingsDensityHeading' class='quickSettingsHeading'></div>
                    <div id='quickSettingsDensityBar' class='quickSettingsDensityBar' role='group' aria-label='UI Density'>
                        <button id='uiDensityCompact' type='button' class='button quickSettingsDensityButton' onclick='view.setUiDensity("compact")'></button>
                        <button id='uiDensityStandard' type='button' class='button quickSettingsDensityButton' onclick='view.setUiDensity("standard")'></button>
                        <button id='uiDensityLarge' type='button' class='button quickSettingsDensityButton' onclick='view.setUiDensity("large")'></button>
                    </div>
                </div>
                <div class='quickSettingsSection quickSettingsSupportSection'>
                    <div id='quickSettingsHelpHeading' class='quickSettingsHeading'>${this.uiText("quickSettingsHelp")}</div>
                    <button id='quickSettingHotkeyReference' type='button' class='button quickSettingButton quickSettingUtilityButton' onclick='view.toggleHotkeyReference("quick")' aria-expanded='false'>${this.uiText("viewHotkeys")}</button>
                    <div id='hotkeyReferencePanelQuick' class='hotkeyReferencePanel hidden'></div>
                </div>
            </div>
        </li>`;
    },
    htmlLocalizationMenu() {
        const lg = Localization.supportedLang;
        let html = `${_txt("menu>options>localization_title")}: <select id='localization_menu' onchange='Localization.change();'>`;
        $.each(lg, (val, str) => {
            html += `<option value='${val}'${Localization.currentLang === val ? "selected" : ""}>${str}</option>`;
        });
        html += "</select><br>";
        return html;
    },
    htmlThemeMenu() {
        const themeList = ["normal", "dark", "cubic", "cubic t-dark", "zen", "zen t-dark"];
        const themes = _txtsObj("menu>options>theme");
        let html = `${_txt("menu>options>theme_title")}: <select id='themeInput' onchange='view.changeTheme();'>`;
        $(themes).each((index, theme) => {
            html += `<option value='${themeList[index]}'>${$(theme).find(themeList[index].replaceAll(" ","_")).text()}</option>`;
        });
        html += "</select><br>";
        html += `<div class='block' id='themeVariantSection'>${_txt("menu>options>theme_variant_title")}: <select id='themeVariantInput' onchange='view.changeTheme();'>`;
        $(themes).each((index, theme) => {
            $(theme).find("variants>*").each((vindex, variant) => {
                html += `<option class='variant-${themeList[index].replaceAll(" ","_")}' value='${variant.tagName}'>${$(variant).text()}</option>`;
            });
        });
        html += "</select></div>"
        return html;
    },
    htmlExtrasMenu() {
        const html =
            `<li id='extrasMenu' tabindex='0' style='display:inline-block;height:30px;margin-left:10px;' class='showthatH'>
            ${_txt("menu>extras>meta>title")}
            <div class='showthisH' style='padding-top:1ex'>
                ${_txt("menu>options>extras_warning")}<br>
                <br>
                <input id='fractionalManaInput' type='checkbox' onchange='setOption("fractionalMana", this.checked)'/>
                    <label for='fractionalManaInput'>${_txt("menu>options>fractional_mana")}</label>
                <br>
                <input id='predictorInput' type='checkbox' onchange='setOption("predictor", this.checked)'/>
                    <label for='predictorInput'>${_txt("menu>options>predictor")}</label>
                <br>
                <div class='control'>
                    <input type='checkbox' id='speedIncrease10xInput' onchange='setOption("speedIncrease10x", this.checked)'>
                    <label for='speedIncrease10xInput'>${_txt("menu>options>speedIncrease10x_text")}</label>
                </div>
                <br>
                <div class='control'>
                    <input type='checkbox' id='speedIncrease20xInput' onchange='setOption("speedIncrease20x", this.checked)'>
                    <label for='speedIncrease20xInput'>${_txt("menu>options>speedIncrease20x_text")}</label>
                </div>
                <br>
                ${_txt("menu>options>speedIncreaseCustom_text")}
                <input id='speedIncreaseCustomInput' type='number' value='5' min='1' style='width: 50px;transform: translateY(-2px);' oninput='setOption("speedIncreaseCustom", parseInt(this.value))' />
                <br>
                ${_txt("menu>options>speedIncreaseBackground_text")}
                <input id='speedIncreaseBackgroundInput' type='number' value='' placeholder='same' min='0' style='width: 50px;transform: translateY(-2px);' oninput='setOption("speedIncreaseBackground", parseFloat(this.value))' />
                <div id='speedIncreaseBackgroundWarning' class='small block' style='display:none'>${_txt("menu>options>speedIncreaseBackground_warning")}</div>
                <br>
                <button id='borrowTimeButton' class='button showthat control' onclick='borrowTime()'>${_txt("menu>options>borrow_time")}
                    <div class='showthis'>${_txt("menu>options>borrow_time_tooltip")}</div>
                </button>
                <div class='show-when-time-borrowed'>
                    <button id='returnTimeButton' class='button control' onclick='returnTime()'>${_txt("menu>options>return_time")}</button>
                    ${_txt("menu>options>time_borrowed")} <span id='borrowedTimeDays'></span>
                </div><br>
                <div id='predictorSettings'>
                    <br>
                    <b>${_txt("predictor>settings")}</b>
                    <br>
                    <input id='predictorBackgroundThreadInput' type='checkbox' onchange='setOption("predictorBackgroundThread", this.checked)'>
                    <label for='predictorBackgroundThreadInput'>${_txt("predictor>background_thread")}</label>
                    <br>
                    <label for='predictorTimePrecisionInput'>${_txt("predictor>time_precision")}</label>
                    <input id='predictorTimePrecisionInput' type='number' value='1' min='1' max='10' style='width: 50px;' oninput='setOption("predictorTimePrecision", parseInt(this.value))'>
                    <br>
                    <label for='predictorNextPrecisionInput'>${_txt("predictor>next_precision")}</label>
                    <input id='predictorNextPrecisionInput' type='number' value='2' min='1' max='10' style='width: 50px;' oninput='setOption("predictorNextPrecision", parseInt(this.value))'>
                    <br>
                    <label for='predictorActionWidthInput'>${_txt("predictor>action_list_width")}</label>
                    <input id='predictorActionWidthInput' type='number' value='500' min='100' max='4000' style='width: 50px; margin-left:40px' oninput='setOption("predictorActionWidth", parseInt(this.value))'>
                    <br>
                    <input id='predictorRepeatPredictionInput' type='checkbox' onchange='setOption("predictorRepeatPrediction", this.checked)'>
                    <label for='predictorRepeatPredictionInput'>${_txt("predictor>repeat_last_action")}</label>
                    <br>
                    <input id='predictorSlowModeInput' type='checkbox' onchange='setOption("predictorSlowMode", this.checked)'>
                    <label for='predictorSlowModeInput'>${
                        _txt("predictor>slow_mode")
                        .replace("{slowMode}",
                            `<input id='predictorSlowTimerInput' type='number' value='1' min='1' style='width: 20px;' oninput='setOption("predictorSlowTimer", parseInt(this.value))'>`
                        )
                    }</label>
                </div>
            </div>
        </li>`;
        return html;
    },
    htmlChallengeMenu() {
        const html = 
        `<li id='challengesMenu' tabindex='0' style='display:inline-block;height:30px;margin-left:10px;' class='showthatH'>
            ${_txt("menu>challenges>meta>title")}
            <div class='showthisH'>
                ${this.challenges()}
            </div>
        </li>`;
        return html;
    },
    htmlTotalsMenu() {
        const html = 
        `<li id='totalsMenu' tabindex='0' style='display:inline-block;height:30px;margin-left:10px;' class='showthatH'>
            ${_txt("menu>totals>meta>title")}
            <div class='showthisH'>
                ${this.totals()}
            </div>
        </li>`;
        return html;
    },
    htmlPrestigeMenu() {
        const html = 
        `<li id='prestige_bonusesMenu' tabindex='0' style='display:inline-block;height:30px;margin-left:10px;' class='showthatH'>
            ${_txt("menu>prestige_bonus>meta>title")}
            <div class='showthisH'>
                ${this.prestige_bonuses()}
            </div>
        </li>`;
        return html;
    },
    htmlWarningMenu() {
        const html = 
        `<li id='browser_warningMenu' tabindex='0' style='display:inline-block;height:30px;margin-left:10px;' class='showthatH alert'>
            ${_txt("menu>browser_warning>title")}
            <div class='showthisH'>${_txt("menu>browser_warning>body")}</div>
        </li>`;
        return navigator.vendor === 'Google Inc.' ? html : "";
    },
    challenges() {
        let html = 
        `<div>${_txt("menu>challenges>intro")}<br> 
            ${_txt("menu>challenges>no_rewards")}<br>
            ${_txt("menu>challenges>recommendation")}<br>
            ${_txt("menu>challenges>save_warning")}<br>
            <b>${_txt("menu>challenges>delete_warning")}</b><br>
            `;
        if (challengeSave.challengeMode !== 0 || 1===1)
            html += `<button class='button showthat control' style='margin-top: 2px;' onclick='exitChallenge()'>${_txt("menu>challenges>exit_challenge")}
                </button>
                <button class='button showthat control' style='margin-top: 2px;' onclick='resumeChallenge()'>${_txt("menu>challenges>resume_challenge")}
                </button><br>`;
        html += 
        `<button class='button showthat control' style='margin-top: 2px;' onclick='beginChallenge(1)'>${_txt("menu>challenges>mana_drought_name")}
            <div class='showthis' style='color:var(--default-color);width:230px;margin-left:100px;'>${_txt("menu>challenges>mana_drought")}</div>
        </button><br>
        <button class='button showthat control' style='margin-top: 2px;' onclick='beginChallenge(2)'>${_txt("menu>challenges>noodle_arms_name")}
            <div class='showthis' style='color:var(--default-color);width:230px;margin-left:100px;'>${_txt("menu>challenges>noodle_arms")}</div>
        </button><br>
        <button class='button showthat control' style='margin-top: 2px;' onclick='beginChallenge(3)'>${_txt("menu>challenges>mana_burn_name")}
            <div class='showthis' style='color:var(--default-color);width:230px;margin-left:100px;'>${_txt("menu>challenges>mana_burn")}</div>
        </button><br>`
        html += `</div>`
        return html;
    },
    totals() {
        let html =
        `<div>
        ${_txt("menu>totals>effective_time")} <div id='totalEffectiveTime'></div><br>
        ${_txt("menu>totals>running_time")} <div id='totalPlaytime'></div><br>
        <span class='show-when-time-borrowed'>${_txt("menu>options>time_borrowed")} <div id='borrowedTimeBalance'></div><br></span>
        ${_txt("menu>totals>loops")} <div id='totalLoops'></div><br>
        ${_txt("menu>totals>actions")} <div id='totalActions'></div><br>
        </div>`;
        return html;
    },
    prestige_bonuses() {
        let html =
        `<div><br> 
        ${_txt("menu>prestige_bonus>intro")}<br>
        ${_txt("menu>prestige_bonus>points_reward")}<br>
        ${_txt("menu>prestige_bonus>export_warning")}<br>
        <br>
        <b>${_txt("menu>prestige_bonus>reset_warning")}</b>
        <br><br>
        ${_txt("menu>prestige_bonus>imbue_carryover")}<br>
        ${_txt("menu>prestige_bonus>max_carryover")} <div id='maxTotalImbueSoulLevels'></div>
        <br>
        <br><br><br>
        <b>${_txt("menu>prestige_bonus>total_completed")} <div id='currentPrestigesCompleted'></div></b><br>
        ${_txt("menu>prestige_bonus>available_points")} <div id='currentPrestigePoints'></div> / <div id='totalPrestigePoints'></div>
        <br>
        ${_txt("menu>prestige_bonus>upgrade_cost_header")}
        <br>
        ${_txt("menu>prestige_bonus>upgrade_cost_example")}
        <br>

        `;
        html +=
        
        `
        <br>
        <button class='button showthat control' style='margin-top: -50px;' onclick='prestigeUpgrade("PrestigePhysical")'>${_txt("buffs>prestige_-_physical>label")}
            <div class='showthis' style='color:var(--default-color);width:230px;margin-left:200px;'>${_txt("menu>prestige_bonus>PrestigePhysical")}
                <br><br>
                ${_txt("menu>prestige_bonus>current_bonus")} <div id='prestigePhysicalCurrentBonus'></div>%<br>
                ${_txt("menu>prestige_bonus>next_level_cost")} <div id='prestigePhysicalNextCost'></div> ${_txt("menu>prestige_bonus>points")}<br> 
            </div>
        </button><br>

        <button class='button showthat control' style='margin-top: -50px;' onclick='prestigeUpgrade("PrestigeMental")'>${_txt("buffs>prestige_-_mental>label")}
        <div class='showthis' style='color:var(--default-color);width:230px;margin-left:200px;'>${_txt("menu>prestige_bonus>PrestigeMental")}
            <br><br>
            ${_txt("menu>prestige_bonus>current_bonus")} <div id='prestigeMentalCurrentBonus'></div>%<br>
            ${_txt("menu>prestige_bonus>next_level_cost")} <div id='prestigeMentalNextCost'></div> ${_txt("menu>prestige_bonus>points")}<br> 
        </div>
        </button><br>


        <button class='button showthat control' style='margin-top: -50px;' onclick='prestigeUpgrade("PrestigeCombat")'>${_txt("buffs>prestige_-_combat>label")}
            <div class='showthis' style='color:var(--default-color);width:230px;margin-left:200px;'>${_txt("menu>prestige_bonus>PrestigeCombat")}
                <br><br>
                ${_txt("menu>prestige_bonus>current_bonus")} <div id='prestigeCombatCurrentBonus'></div>%<br>
                ${_txt("menu>prestige_bonus>next_level_cost")} <div id='prestigeCombatNextCost'></div> ${_txt("menu>prestige_bonus>points")}<br> 
            </div>
        </button><br>

        <button class='button showthat control' style='margin-top: -50px;' onclick='prestigeUpgrade("PrestigeSpatiomancy")'>${_txt("buffs>prestige_-_spatiomancy>label")}
            <div class='showthis' style='color:var(--default-color);width:230px;margin-left:200px;'>${_txt("menu>prestige_bonus>PrestigeSpatiomancy")}
                <br><br>
                ${_txt("menu>prestige_bonus>current_bonus")} <div id='prestigeSpatiomancyCurrentBonus'></div>%<br>
                ${_txt("menu>prestige_bonus>next_level_cost")} <div id='prestigeSpatiomancyNextCost'></div> ${_txt("menu>prestige_bonus>points")}<br> 
            </div>
        </button><br>

        <button class='button showthat control' style='margin-top: -50px;' onclick='prestigeUpgrade("PrestigeChronomancy")'>${_txt("buffs>prestige_-_chronomancy>label")}
            <div class='showthis' style='color:var(--default-color);width:230px;margin-left:200px;'>${_txt("menu>prestige_bonus>PrestigeChronomancy")}
                <br><br>
                ${_txt("menu>prestige_bonus>current_bonus")} <div id='prestigeChronomancyCurrentBonus'></div>%<br>
                ${_txt("menu>prestige_bonus>next_level_cost")} <div id='prestigeChronomancyNextCost'></div> ${_txt("menu>prestige_bonus>points")}<br> 
            </div>
        </button><br>

        <button class='button showthat control' style='margin-top: -50px;' onclick='prestigeUpgrade("PrestigeBartering")'>${_txt("buffs>prestige_-_bartering>label")}
            <div class='showthis' style='color:var(--default-color);width:230px;margin-left:200px;'>${_txt("menu>prestige_bonus>PrestigeBartering")}
                <br><br>
                ${_txt("menu>prestige_bonus>current_bonus")} <div id='prestigeBarteringCurrentBonus'></div>%<br>
                ${_txt("menu>prestige_bonus>next_level_cost")} <div id='prestigeBarteringNextCost'></div> ${_txt("menu>prestige_bonus>points")}<br> 
            </div>
        </button><br>

        <button class='button showthat control' style='margin-top: -50px;' onclick='prestigeUpgrade("PrestigeExpOverflow")'>${_txt("buffs>prestige_-_experience_overflow>label")}
            <div class='showthis' style='color:var(--default-color);width:230px;margin-left:200px;'>${_txt("menu>prestige_bonus>PrestigeExpOverflow")}
                <br><br>
                ${_txt("menu>prestige_bonus>current_bonus")} <div id='prestigeExpOverflowCurrentBonus'></div>%<br>
                ${_txt("menu>prestige_bonus>next_level_cost")} <div id='prestigeExpOverflowNextCost'></div> ${_txt("menu>prestige_bonus>points")}<br> 
            </div>
        </button><br>

        <br><br>

        <button class='button showthat control' style='margin-top: -50px;' onclick='resetAllPrestiges()'>${_txt("menu>prestige_bonus>reset_button")}
            <div class='showthis' style='color:var(--default-color);width:230px;margin-left:200px;'>${_txt("menu>prestige_bonus>PrestigeResetAll")}
            </div>
        </button><br>

        `

        ;
        return html;
    }
});
