const trackedResourcesView = Views.registerView("trackedResources", {
    selector: "#trackedResources",
    html() {
        let html = "";
        const resources = _txtsObj("tracked_resources>resource");
        $(resources).each((_index, resource) => {
            const resourceId = $(resource).attr("id");
            const hasCount = !$(resource).attr("no_count");
            const resetOnRestart = !$(resource).attr("no_reset_on_restart");
            const isHidden = $(resource).attr("initially_hidden");
            html +=
                `<div class='showthat resource' id='${resourceId}Div' data-resource-id='${resourceId}' data-resource-order='${_index}'${isHidden ? " style='display:none'" : ""}>
                    <button type='button' class='trackedResourcePinButton' onclick='view.toggleTrackedResourcePin("${resourceId}", event)'></button>
                    <div class='bold'>${$(resource).find("title").text()}</div>
                    ${hasCount ? `<div id='${resourceId}'>0</div>` : ""}
                    <div class='showthis'>
                        ${$(resource).find("desc").text()}
                        ${resetOnRestart ? `<br>${_txt("tracked_resources>reset_on_restart_txt")}` : ""}
                    </div>
                </div>`;
        });
        return html;
    },
});
