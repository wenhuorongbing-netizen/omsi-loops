"use strict";

(function setupQueueStore(global) {
    function clampIndex(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function cloneActionRecords(actionList) {
        const cloned = structuredClone(actionList);
        for (const [index, action] of cloned.entries()) {
            const descriptor = Object.getOwnPropertyDescriptor(actionList[index], "actionId");
            if (descriptor) {
                Object.defineProperty(action, "actionId", descriptor);
            }
        }
        return cloned;
    }

    function findIndexOfActionWithId(actionList, actionId) {
        return actionList.findIndex(action => action.actionId === Number(actionId));
    }

    function getMaxActionId(actionList) {
        return Math.max(0, ...actionList.map(action => action.actionId).filter(actionId => actionId));
    }

    function ensureActionId(actionList, action) {
        if (!Number.isFinite(action.actionId) || findIndexOfActionWithId(actionList, action.actionId) >= 0) {
            Object.defineProperty(action, "actionId", {
                value: getMaxActionId(actionList) + 1,
                configurable: true,
                writable: false,
                enumerable: false,
            });
        }
        return action.actionId;
    }

    function insertActionRecord(actionList, action, index) {
        actionList.splice(index, 0, action);
        return index;
    }

    function moveActionRecord(actionList, initialIndex, resultingIndex) {
        if (initialIndex === resultingIndex) {
            return resultingIndex;
        }
        const actionToMove = actionList[initialIndex];
        if (initialIndex < resultingIndex) {
            actionList.copyWithin(initialIndex, initialIndex + 1, resultingIndex + 1);
        } else {
            actionList.copyWithin(resultingIndex + 1, resultingIndex, initialIndex);
        }
        actionList[resultingIndex] = actionToMove;
        return resultingIndex;
    }

    function removeActionRecord(actionList, index) {
        return actionList.splice(index, 1)[0];
    }

    function updateActionRecord(actionList, index, update) {
        return Object.assign(actionList[index], update);
    }

    class ZoneSpan {
        start;
        end;
        zones;
        spanIndex;
        actionList;
        #isValidAndEnabled;

        get startAction() {
            return this.actionList[this.start];
        }

        get endAction() {
            return this.actionList[this.end];
        }

        get isCollapsed() {
            const {endAction, zones} = this;
            return endAction
                && this.#isValidAndEnabled(endAction, (_action, actionProto) => zones.includes(actionProto.townNum))
                && !!endAction.collapsed;
        }

        constructor(start, end, zones, spanIndex, actionList, isValidAndEnabled) {
            this.start = start;
            this.end = end;
            this.zones = zones;
            this.spanIndex = spanIndex;
            this.actionList = actionList;
            this.#isValidAndEnabled = isValidAndEnabled;
        }

        ignoringStart(ignoringIndex) {
            if (ignoringIndex == null) return this.start;
            return this.start - (this.start > ignoringIndex ? 1 : 0);
        }

        ignoringEnd(ignoringIndex) {
            if (ignoringIndex == null) return this.end;
            if (this.end === ignoringIndex) return Infinity;
            return this.end - (this.end > ignoringIndex ? 1 : 0);
        }
    }

    function createZoneSpans(actionList, {getActionPrototype, getPossibleTravel, isValidAndEnabled}) {
        let currentZones = [0];
        let currentStartIndex = 0;
        const zoneSpans = [];
        for (const [index, action] of actionList.entries()) {
            const actionProto = getActionPrototype(action.name);
            if (action.disabled || !action.loops || !actionProto) {
                continue;
            }
            const travelDeltas = getPossibleTravel(action.name);
            if (!travelDeltas.length) continue;
            if (currentZones.length > 1 && currentZones.includes(actionProto.townNum)) {
                currentZones = [actionProto.townNum];
            }
            zoneSpans.push(new ZoneSpan(currentStartIndex, index, currentZones, zoneSpans.length, actionList, isValidAndEnabled));
            currentStartIndex = index + 1;
            currentZones = travelDeltas.map(delta => delta + actionProto.townNum);
        }
        zoneSpans.push(new ZoneSpan(currentStartIndex, actionList.length, currentZones, zoneSpans.length, actionList, isValidAndEnabled));
        return zoneSpans;
    }

    function closestValidIndexForAction(actionList, townNum, desiredIndex, ignoreIndex, zoneSpans) {
        if (desiredIndex < 0) desiredIndex += actionList.length + 1;
        desiredIndex = clampIndex(desiredIndex, 0, actionList.length);
        if (townNum == null) return desiredIndex;

        const spanIndex = zoneSpans.findIndex(zoneSpan =>
            desiredIndex >= zoneSpan.ignoringStart(ignoreIndex) && desiredIndex <= zoneSpan.ignoringEnd(ignoreIndex)
        );
        if (spanIndex < 0 || zoneSpans[spanIndex].zones.includes(townNum)) {
            return desiredIndex;
        }

        let nextValidIndex = Infinity;
        let previousValidIndex = -Infinity;
        for (let index = spanIndex + 1; index < zoneSpans.length; index++) {
            if (zoneSpans[index]?.zones.includes(townNum)) {
                nextValidIndex = zoneSpans[index].ignoringStart(ignoreIndex);
                break;
            }
        }
        for (let index = spanIndex - 1; index >= 0; index--) {
            if (zoneSpans[index]?.zones.includes(townNum)) {
                previousValidIndex = clampIndex(zoneSpans[index].ignoringEnd(ignoreIndex), 0, actionList.length);
                break;
            }
        }
        if (nextValidIndex === Infinity && previousValidIndex === -Infinity) {
            return desiredIndex;
        }
        return nextValidIndex - desiredIndex <= desiredIndex - previousValidIndex ? nextValidIndex : previousValidIndex;
    }

    global.ZoneSpan = ZoneSpan;
    global.IdleLoopsQueueStore = Object.freeze({
        ZoneSpan,
        cloneActionRecords,
        findIndexOfActionWithId,
        getMaxActionId,
        ensureActionId,
        insertActionRecord,
        moveActionRecord,
        removeActionRecord,
        updateActionRecord,
        createZoneSpans,
        closestValidIndexForAction,
    });
})(globalThis);
