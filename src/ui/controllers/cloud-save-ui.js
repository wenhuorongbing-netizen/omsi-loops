"use strict";

(function initCloudSaveUi(global) {
    /**
     * @param {View} view
     * @param {string|gapi.client.drive.File} fileOrText
     */
    function updateCloudSave(view, fileOrText) {
        const list = document.getElementById("cloud_save_result");
        if (!(list instanceof HTMLElement)) return;
        if (typeof fileOrText === "string") {
            list.innerHTML = fileOrText;
            return;
        }
        if (!fileOrText) return;

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
        const name = /** @type {HTMLElement|null} */ (li.querySelector(".cloud_save_name"));
        if (name) {
            name.textContent = fileName;
            name.title = fileName;
        }
    }

    /** @param {string} fileId */
    function startRenameCloudSave(fileId) {
        const li = document.getElementById(`cloud_save_${fileId}`);
        const nameInput = li?.querySelector(".cloud_save_name");
        if (!li || !nameInput) return;

        if (nameInput instanceof HTMLInputElement) {
            if (!nameInput.value || nameInput.value === li.dataset.fileName) {
                const div = document.createElement("div");
                div.className = nameInput.className;
                div.textContent = li.dataset.fileName ?? "";
                div.title = li.dataset.fileName ?? "";
                li.replaceChild(div, nameInput);
            } else {
                googleCloud?.renameFile(fileId, nameInput.value);
            }
            return;
        }

        const input = document.createElement("input");
        input.className = nameInput.className;
        input.style.width = `${nameInput.clientWidth}px`;
        input.value = li.dataset.fileName ?? "";
        input.onkeydown = (event) => event.key === "Enter" ? (startRenameCloudSave(fileId), false) : true;
        li.replaceChild(input, nameInput);
        input.focus();
    }

    /** @param {string} fileId */
    async function askDeleteCloudSave(fileId) {
        const li = document.getElementById(`cloud_save_${fileId}`);
        const button = li?.querySelector(".button.cloud_delete");
        if (!(button instanceof HTMLButtonElement)) return;
        if (button.classList.contains("warning")) {
            googleCloud?.deleteFile(fileId);
            return;
        }
        button.textContent = _txt("menu>save>confirm_button");
        button.classList.add("warning");
        await delay(3000);
        button.classList.remove("warning");
        button.textContent = _txt("menu>save>delete_button");
    }

    global.IdleLoopsCloudSaveUI = {
        updateCloudSave,
        startRenameCloudSave,
        askDeleteCloudSave,
    };
})(globalThis);
