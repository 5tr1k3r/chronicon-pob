const selectAllBtn = document.getElementById("select-all-btn");
const resetBtn = document.getElementById("reset-btn");
const itemSectionEl = document.getElementById("item-section");
const wolfLevel = document.getElementById("wolf-lvl");
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

const critModCalc = document.getElementById("crit-mod-calc");
const apsCalc = document.getElementById("aps-calc");
const wolfCountCalc = document.getElementById("wolf-count-calc");
const wolfpackPDmgCalc = document.getElementById("wolfpack-p-dmg-calc");
const iceshardPDmgCalc = document.getElementById("iceshard-p-dmg-calc");
const iceshardDmgCalc = document.getElementById("iceshard-dmg-calc");
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

function assignEventListeners() {
    selectAllBtn.addEventListener("click", selectAllItems);
    selectAllBtn.addEventListener("click", calcEverything);
    resetBtn.addEventListener("click", resetInput);
    resetBtn.addEventListener("click", calcEverything);

    for (let element of document.querySelectorAll('input[type="number"] ')) {
        element.addEventListener("input", calcEverything);
    }

    for (let element of document.querySelectorAll('input[type="checkbox"] ')) {
        element.addEventListener("change", calcEverything);
    }

    wolfLevel.addEventListener("change", calcEverything);
}

function selectAllItems() {
    for (let element of itemSectionEl.getElementsByTagName("input")) {
        element.checked = true;
    }
}

function resetInput() {
    for (let element of document.getElementsByTagName("input")) {
        element.value = element.defaultValue;
        element.checked = false;
    }

    wolfLevel.selectedIndex = 0;
}

function fromPercent(inputElement) {
    return Number(inputElement.value) / 100;
}

function toPercentString(num, precision) {
    return `${(num * 100).toFixed(precision)}%`;
}

function calcEverything() {
    critEffectModifier = calcCritEffectModifier();
    wolfpackResultDmg = calcWolfpackDamage();
    if (itemWolfcaster.checked) {
        iceshardPDmg = calcIceshardPDamage();
        iceshardDmg = calcIceshardDamage();
    }

    renderCalculatedStats();
}

function renderCalculatedStats() {
    critModCalc.textContent = toPercentString(critEffectModifier, 1);
    wolfpackPDmgCalc.textContent = toPercentString(wolfpackResultDmg, 0);
    if (itemWolfcaster.checked) {
        iceshardPDmgCalc.textContent = toPercentString(iceshardPDmg, 0);
        let iceshardMin = Math.round(iceshardDmg * 0.85);
        let iceshardMax = Math.round(iceshardDmg * 1.15);
        iceshardDmgCalc.textContent = `${iceshardMin.toLocaleString()} - ${iceshardMax.toLocaleString()}`;
    } else {
        iceshardPDmgCalc.textContent = "";
        iceshardDmgCalc.textContent = "";
    }
}

function calcCritEffectModifier() {
    let critChance = fromPercent(critChanceInput);
    let critDamage = fromPercent(critDmgInput);
    critChance = Math.min(critChance, 1.0);
    let nonCritPortion = 1 - critChance;
    let critPortion = critChance * critDamage;

    return nonCritPortion + critPortion;
}

function calcWolfpackDamage() {
    wolfpackSkillDmg = wolfpackBaseDmg + wolfpackDmgStep * wolfLevel.selectedIndex;
    return wolfpackSkillDmg * calcSkillMultipliers();
}

function calcAlphaDamage() {
    alphaSkillDmg = alphaBaseDmg + alphaDmgStep * wolfLevel.selectedIndex;
    return alphaSkillDmg * calcSkillMultipliers();
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

function calcIceshardPDamage() {
    return calcAlphaDamage() * 2.0;
}

function calcIceshardDamage() {
    return Math.round(iceshardPDmg * Number(damageInput.value) * fromPercent(frostDamageInput));
}

assignEventListeners();
calcEverything();
