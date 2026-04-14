const buffsView = Views.registerView("buffsContainer", {
    selector: "#buffsContainer",
    html() {
        const fullNames = Buff.fullNames;
        const groups = [
            {id: "trials", buffs: ["Heroism", "Aspirant"]},
            {id: "ritual", buffs: ["Ritual", "Imbuement", "Imbuement2", "Imbuement3"]},
            {id: "feast", buffs: ["Feast"]},
            {id: "prestige", buffs: ["PrestigePhysical", "PrestigeMental", "PrestigeCombat", "PrestigeSpatiomancy", "PrestigeChronomancy", "PrestigeBartering", "PrestigeExpOverflow"]},
        ];
        let html = "";
        for (const group of groups) {
            html += `<section class="buffGroup" id="buffGroup${group.id}"><div class="buffGroupHeader" id="buffGroupHeader${group.id}"></div><div class="buffGroupList">`;
            for (const buff of group.buffs) {
            const fullName = fullNames[buff];
            const XMLName = getXMLName(fullName);
            const desc2 = _txtsObj(`buffs>${XMLName}`)[0].innerHTML.includes("desc2");
            html +=
                `<div class="buffContainer showthat" id="buff${buff}Container" onmouseover="view.showBuff('${buff}')" onmouseout="view.showBuff(undefined)">
                    <div class="buffNameContainer">
                        <img class="buffIcon" src="img/${camelize(fullName)}.svg">
                        <div class="skillLabel medium bold">${_txt(`buffs>${XMLName}>label`)}</div>
                        <div class="showthis">
                            <span>${_txt(`buffs>${XMLName}>desc`)}</span>
                            <br>
                            ${desc2 ? `<span class="localized" data-lockey="buffs>${XMLName}>desc2"></span>` : ""}
                        </div>
                    </div>
                    <div class="buffNumContainer">
                        <div id="buff${buff}Level">0/</div>
                        <input type="number" id="buff${buff}Cap" class="buffmaxinput" value="${buffHardCaps[buff]}" onchange="updateBuffCaps()">
                    </div>
                </div>`;
            }
            html += "</div></section>";
        }
        return html;
    },
});
//                            ${desc2 ? `<span class="localized" data-lockey="buffs>${XMLName}>desc2"></span>` : ""}

