"use strict";

(function setupResourceState(global) {
    const TEAM_COMBAT_RESOURCES = new Set(["teamMembers", "armor", "zombie"]);

    function applyResourceDelta(resources, resource, amount) {
        if (Number.isFinite(amount)) {
            resources[resource] += amount;
        } else {
            resources[resource] = amount;
        }
        return {
            resource,
            shouldUpdateTeamCombat: TEAM_COMBAT_RESOURCES.has(resource),
        };
    }

    function setResourceValue(resources, resource, value) {
        resources[resource] = value;
        return {
            resource,
            shouldUpdateTeamCombat: TEAM_COMBAT_RESOURCES.has(resource),
        };
    }

    function resetResourceToTemplate(resources, resourcesTemplate, resource) {
        resources[resource] = resourcesTemplate[resource];
        return {
            resource,
            shouldUpdateTeamCombat: TEAM_COMBAT_RESOURCES.has(resource),
        };
    }

    function buildResetResources(resourcesTemplate, dependencies) {
        const nextResources = dependencies.copyObject(resourcesTemplate);
        if (dependencies.shouldGrantGlasses) {
            nextResources.glasses = true;
        }
        return nextResources;
    }

    global.IdleLoopsResourceState = Object.freeze({
        applyResourceDelta,
        setResourceValue,
        resetResourceToTemplate,
        buildResetResources,
    });
})(globalThis);
