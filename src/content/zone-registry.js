"use strict";

(function setupZoneRegistry(global) {
    const zoneEntries = Object.freeze([
        Object.freeze({
            id: "beginnersville",
            townNum: 0,
            defaultName: "Beginnersville",
            localizationKey: "towns>town0>name",
        }),
        Object.freeze({
            id: "forest-path",
            townNum: 1,
            defaultName: "Forest Path",
            localizationKey: "towns>town1>name",
        }),
        Object.freeze({
            id: "merchanton",
            townNum: 2,
            defaultName: "Merchanton",
            localizationKey: "towns>town2>name",
        }),
        Object.freeze({
            id: "olympus",
            townNum: 3,
            defaultName: "Mt. Olympus",
            localizationKey: "towns>town3>name",
        }),
        Object.freeze({
            id: "valhalla",
            townNum: 4,
            defaultName: "Valhalla",
            localizationKey: "towns>town4>name",
        }),
        Object.freeze({
            id: "startington",
            townNum: 5,
            defaultName: "Startington",
            localizationKey: "towns>town5>name",
        }),
        Object.freeze({
            id: "jungle",
            townNum: 6,
            defaultName: "Jungle Path",
            localizationKey: "towns>town6>name",
        }),
        Object.freeze({
            id: "commerceville",
            townNum: 7,
            defaultName: "Commerceville",
            localizationKey: "towns>town7>name",
        }),
        Object.freeze({
            id: "valley",
            townNum: 8,
            defaultName: "Valley of Olympus",
            localizationKey: "towns>town8>name",
        }),
    ]);

    const zonesById = Object.freeze(Object.fromEntries(zoneEntries.map(zone => [zone.id, zone])));
    const zonesByTownNum = Object.freeze(Object.fromEntries(zoneEntries.map(zone => [String(zone.townNum), zone])));

    global.IdleLoopsZoneRegistry = Object.freeze({
        listZones() {
            return zoneEntries.slice();
        },
        getZoneById(zoneId) {
            return zonesById[zoneId] ?? null;
        },
        getZoneByTownNum(townNum) {
            return zonesByTownNum[String(townNum)] ?? null;
        },
        getZoneIdByTownNum(townNum) {
            return zonesByTownNum[String(townNum)]?.id ?? `town-${townNum}`;
        },
    });
})(globalThis);
