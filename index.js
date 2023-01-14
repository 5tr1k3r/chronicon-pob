import { findAttackFrames, findAPS, findWolfAttackCooldown, researchNextBreakpoint } from "./attack-speed.js";

const selectAllBtn = document.getElementById("select-all-btn");
const resetBtn = document.getElementById("reset-btn");
const loadBtn = document.getElementById("load-btn");
const itemSectionEl = document.getElementById("item-section");
const wolfLevelSelect = document.getElementById("wolf-lvl");
const masterTamer = document.getElementById("master-tamer");

const damageInput = document.getElementById("dmg-input");
const attackSpeedInput = document.getElementById("as-input");
const critChanceInput = document.getElementById("critchance-input");
const critDmgInput = document.getElementById("critdmg-input");
const frostDamageInput = document.getElementById("frostdmg-input");
const companionDmgInput = document.getElementById("companiondmg-input");
const cdrInput = document.getElementById("cdr-input");

const itemBloodscent = document.getElementById("item-bloodscent");
const itemMasters = document.getElementById("item-masters");
const itemWolfTooth = document.getElementById("item-wolf-tooth");
const itemPackLeader = document.getElementById("item-packleader");
const itemWolfcaster = document.getElementById("item-wolfcaster");
const itemCall = document.getElementById("item-call");

const attackFramesCalc = document.getElementById("attack-frames-calc");
const attackCDCalc = document.getElementById("attack-cd-calc");
const apsCalc = document.getElementById("aps-calc");
const nextBPCalc = document.getElementById("next-bp-calc");
const critModCalc = document.getElementById("crit-mod-calc");
const wolfCountCalc = document.getElementById("wolf-count-calc");
const wolfpackPDmgCalc = document.getElementById("wolfpack-p-dmg-calc");
const iceshardPDmgCalc = document.getElementById("iceshard-p-dmg-calc");
const iceshardDmgCalc = document.getElementById("iceshard-dmg-calc");
const wolfAvgDmgCalc = document.getElementById("wolf-avg-dmg-calc");
const wolfCritDmgCalc = document.getElementById("wolf-crit-dmg-calc");
const wolfDpsCalc = document.getElementById("wolf-dps-calc");
const wolvesDpsCalc = document.getElementById("wolves-dps-calc");

const wolfpackBaseDmg = 0.23;
const wolfpackDmgStep = 0.03;
const alphaBaseDmg = 0.8;
const alphaDmgStep = 0.1;

let critEffectModifier = 1.0;
let wolfpackSkillDmg;
let wolfpackResultDmg;
let alphaSkillDmg;
let alphaResultDmg;
let iceshardPDmg;
let iceshardDmg;
let wolfAvgAttackDmg;
let alphaAvgAttackDmg;
let wolfAttackDmgOnCrit;
let wolfCount;
let alphaCount;
let attackFrames;
let attackCooldown;
let aps;
let wolfDps;
let wolvesDps;
let nextBPtext;

function assignEventListeners() {
    selectAllBtn.addEventListener("click", selectAllItems);
    resetBtn.addEventListener("click", resetInput);
    loadBtn.addEventListener("click", load);

    for (let element of document.querySelectorAll('input[type="number"] ')) {
        element.addEventListener("input", calcEverything);
    }

    for (let element of document.querySelectorAll('input[type="checkbox"] ')) {
        element.addEventListener("change", calcEverything);
    }

    wolfLevelSelect.addEventListener("change", calcEverything);
    itemWolfcaster.addEventListener("change", toggleWolfcasterStats);
}

function toggleWolfcasterStats() {
    for (let element of document.querySelectorAll("tr.wolfcaster-stats")) {
        if (itemWolfcaster.checked) {
            element.classList.add("wolfcaster-on");
        } else {
            element.classList.remove("wolfcaster-on");
        }
    }
}

function selectAllItems() {
    for (let element of itemSectionEl.getElementsByTagName("input")) {
        element.checked = true;
    }

    toggleWolfcasterStats();
    calcEverything();
}

function resetInput() {
    for (let element of document.getElementsByTagName("input")) {
        element.value = element.defaultValue;
        element.checked = false;
    }

    wolfLevelSelect.selectedIndex = 0;
    toggleWolfcasterStats();
    calcEverything();
}

function fromPercent(inputElement) {
    return Number(inputElement.value) / 100;
}

function toPercentString(num, precision) {
    return `${(num * 100).toFixed(precision)}%`;
}

function calcEverything() {
    calcCritEffectModifier();
    calcWolfSkillsDamage();
    calcWolfcaster();
    calcWolfAttackDamage();
    countWolves();
    calcAttackSpeed();
    calcDPS();
    calcNextBreakpoint();

    renderCalculatedStats();
}

function renderCalculatedStats() {
    critModCalc.textContent = toPercentString(critEffectModifier, 1);
    wolfpackPDmgCalc.textContent = toPercentString(wolfpackResultDmg, 0);
    if (itemWolfcaster.checked) {
        iceshardPDmgCalc.textContent = toPercentString(iceshardPDmg, 0);
        iceshardDmgCalc.textContent = getMinMaxDmgString(iceshardDmg);
    } else {
        iceshardPDmgCalc.textContent = "";
        iceshardDmgCalc.textContent = "";
    }

    wolfAvgDmgCalc.textContent = convertToShortNumber(wolfAvgAttackDmg);
    wolfCritDmgCalc.textContent = getMinMaxDmgString(wolfAttackDmgOnCrit);

    wolfCountCalc.textContent = wolfCount;
    if (alphaCount === 1) {
        wolfCountCalc.textContent += ` + Alpha`;
    }

    attackFramesCalc.textContent = attackFrames;
    attackCDCalc.textContent = attackCooldown;
    apsCalc.textContent = aps.toFixed(2);

    wolfDpsCalc.textContent = convertToShortNumber(wolfDps);
    wolvesDpsCalc.textContent = convertToShortNumber(wolvesDps);

    nextBPCalc.textContent = nextBPtext;
}

function calcCritEffectModifier() {
    let critChance = fromPercent(critChanceInput);
    let critDamage = fromPercent(critDmgInput);
    critChance = Math.min(critChance, 1.0);
    let nonCritPortion = 1 - critChance;
    let critPortion = critChance * critDamage;

    critEffectModifier = nonCritPortion + critPortion;
}

function calcWolfSkillsDamage() {
    let skillMultipliers = calcSkillMultipliers();
    wolfpackSkillDmg = wolfpackBaseDmg + wolfpackDmgStep * wolfLevelSelect.selectedIndex;
    wolfpackResultDmg = wolfpackSkillDmg * skillMultipliers;

    alphaSkillDmg = alphaBaseDmg + alphaDmgStep * wolfLevelSelect.selectedIndex;
    alphaResultDmg = alphaSkillDmg * skillMultipliers;
}

function calcSkillMultipliers() {
    let companionDamage = fromPercent(companionDmgInput);
    let mastersMulti = itemMasters.checked ? 5.0 : 1.0;
    let wolfToothMulti = itemWolfTooth.checked ? 1.0 : 0.0;
    let packleaderMulti = itemPackLeader.checked ? 5.0 : 0.0;
    let masterTamerMulti = masterTamer.checked ? 1.5 : 1.0;
    let increasedDmgMulti = 1.0 + wolfToothMulti + packleaderMulti;

    return companionDamage * mastersMulti * masterTamerMulti * increasedDmgMulti;
}

function calcWolfcaster() {
    if (itemWolfcaster.checked) {
        iceshardPDmg = alphaResultDmg * 2.0;
        iceshardDmg = iceshardPDmg * Number(damageInput.value) * fromPercent(frostDamageInput);
    }
}

function calcWolfAttackDamage() {
    let bloodscentMulti = itemBloodscent.checked ? 4.0 : 1.0;
    let wolfAttackDmg = wolfpackResultDmg * Number(damageInput.value) * fromPercent(frostDamageInput) * bloodscentMulti;
    let alphaAttackDmg = alphaResultDmg * Number(damageInput.value) * fromPercent(frostDamageInput) * bloodscentMulti;

    wolfAvgAttackDmg = wolfAttackDmg * critEffectModifier;
    alphaAvgAttackDmg = alphaAttackDmg * critEffectModifier;
    wolfAttackDmgOnCrit = wolfAttackDmg * fromPercent(critDmgInput);
}

function getMinMaxDmgString(dmg) {
    return `${convertToShortNumber(dmg * 0.85)} - ${convertToShortNumber(dmg * 1.15)}`;
}

function load() {
    selectAllBtn.click();
    wolfLevelSelect.selectedIndex = 5;
    masterTamer.checked = true;

    damageInput.value = "12808487";
    attackSpeedInput.value = "96";
    critChanceInput.value = "96";
    critDmgInput.value = "570";
    frostDamageInput.value = "668";
    companionDmgInput.value = "2956";
    cdrInput.value = "74";

    calcEverything();
}

function convertToShortNumber(num) {
    if (num > 1e12) {
        return `${(num / 1e12).toFixed(1)}T`;
    } else if (num > 1e9) {
        return `${(num / 1e9).toFixed(1)}B`;
    } else if (num > 1e6) {
        return `${(num / 1e6).toFixed(1)}M`;
    } else if (num > 1e3) {
        return `${(num / 1e3).toFixed(1)}K`;
    }

    return Math.round(num).toString();
}

function countWolves() {
    let wolfLevel = wolfLevelSelect.selectedIndex + 1;
    if (wolfLevel >= 5) {
        wolfCount = 4;
    } else if (wolfLevel >= 3) {
        wolfCount = 3;
    } else {
        wolfCount = 2;
    }

    if (itemCall.checked) {
        wolfCount += 3;
    }

    alphaCount = itemPackLeader.checked ? 1 : 0;
}

function calcAttackSpeed() {
    if (attackSpeedInput.value > 0) {
        attackFrames = findAttackFrames(attackSpeedInput.value, itemMasters.checked);
        attackCooldown = findWolfAttackCooldown(cdrInput.value);
        aps = findAPS(attackFrames, attackCooldown);
    } else {
        attackFrames = "";
        attackCooldown = "";
        aps = 0;
    }
}

function calcDPS() {
    wolfDps = aps * wolfAvgAttackDmg;
    wolvesDps = wolfDps * wolfCount;
    if (alphaCount > 0) {
        let alphaDps = aps * alphaAvgAttackDmg;
        wolvesDps += alphaDps * alphaCount;
    }
}

function calcNextBreakpoint() {
    nextBPtext = researchNextBreakpoint(
        attackFrames,
        attackCooldown,
        attackSpeedInput.value,
        cdrInput.value,
        itemMasters.checked
    );
}

assignEventListeners();
calcEverything();
