"use strict";

(function setupGameLoop(global) {
    function calculateBaseManaToBurn(gameTicksLeft, {baseManaPerSecond, gameSpeed, Mana}) {
        return Mana.floor(gameTicksLeft * baseManaPerSecond * gameSpeed / 1000);
    }

    function executeBudgetedTicks(loopState, dependencies) {
        const {
            Mana,
            performanceNow,
            isGameStopped,
            getShouldRestart,
            getBonusSpeed,
            getFractionalMana,
            getTotalOfflineMs,
            getSpeedMult,
            actionTick,
            addOffline,
            refreshDungeons,
        } = dependencies;

        let cleanExit = false;
        while (loopState.baseManaToBurn * getBonusSpeed() >= (getFractionalMana() ? 0.01 : 1) && performanceNow() < loopState.deadline) {
            if (isGameStopped()) {
                cleanExit = true;
                break;
            }

            let manaAvailable = loopState.baseManaToBurn;
            let totalMultiplier = 1;
            const bonusSpeed = getBonusSpeed();

            manaAvailable *= bonusSpeed;
            totalMultiplier *= bonusSpeed;

            if (bonusSpeed > 1) {
                manaAvailable = Math.min(
                    manaAvailable,
                    Mana.ceil(getTotalOfflineMs() * loopState.baseManaPerSecond * loopState.gameSpeed * bonusSpeed / 1000),
                );
            }

            const speedMult = getSpeedMult();
            manaAvailable *= speedMult;
            totalMultiplier *= speedMult;

            manaAvailable = Math.min(manaAvailable, loopState.timeNeeded - loopState.timer);

            if (getShouldRestart()) {
                manaAvailable = Math.min(manaAvailable, 1);
            }

            const manaSpent = Mana.ceil(actionTick(manaAvailable), loopState.timer / 1e15);
            const baseManaSpent = manaSpent / totalMultiplier;
            const timeSpent = baseManaSpent / loopState.gameSpeed / loopState.baseManaPerSecond;

            loopState.timer += manaSpent;
            loopState.timeCounter += timeSpent;
            loopState.effectiveTime += timeSpent * loopState.gameSpeed * bonusSpeed;
            loopState.baseManaToBurn -= baseManaSpent;
            loopState.gameTicksLeft -= timeSpent * 1000;

            if (bonusSpeed !== 1) {
                addOffline(-timeSpent * (bonusSpeed - 1) * 1000);
            }

            refreshDungeons(manaSpent);

            if (getShouldRestart() || loopState.timer >= loopState.timeNeeded) {
                cleanExit = true;
                loopState.reachedLoopEnd = true;
                break;
            }
        }

        return {
            cleanExit,
            reachedLoopEnd: !!loopState.reachedLoopEnd,
            baseManaToBurn: loopState.baseManaToBurn,
            timer: loopState.timer,
            timeCounter: loopState.timeCounter,
            effectiveTime: loopState.effectiveTime,
            gameTicksLeft: loopState.gameTicksLeft,
        };
    }

    global.IdleLoopsGameLoop = Object.freeze({
        calculateBaseManaToBurn,
        executeBudgetedTicks,
    });
})(globalThis);
