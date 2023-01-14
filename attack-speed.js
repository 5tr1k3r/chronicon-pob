const BASE_ATTACK_FRAMES = 30;
const BASE_WOLF_ATTACK_COOLDOWN = 30;
const FRAMES_PER_SECOND = 60;

export function findAttackFrames(attackSpeed, isMastersOn) {
    let mastersMulti = isMastersOn ? 0.3 : 0;

    attackSpeed = attackSpeed / 100;
    let result = Math.ceil(BASE_ATTACK_FRAMES / (attackSpeed * (1 + mastersMulti)));
    return Math.max(result, 5);
}

export function findAPS(attackFrames, attackCooldown) {
    let attackTime = Math.max(attackFrames, attackCooldown);
    return FRAMES_PER_SECOND / attackTime;
}

export function findWolfAttackCooldown(cdr) {
    let result = Math.ceil(BASE_WOLF_ATTACK_COOLDOWN * (1 - cdr / 100));
    return Math.max(result, 5);
}

export function researchNextBreakpoint(attackFrames, attackCooldown, attackSpeed, cdr, isMastersOn) {
    if (attackFrames === 5 && attackCooldown === 5) {
        return "You are perfect already";
    }

    let result = [];

    // Need to decrease attack frames, or increase attack speed
    if (attackFrames >= attackCooldown) {
        let mastersMulti = isMastersOn ? 0.3 : 0;
        let nextBP = attackFrames - 1;

        let requiredAS = 1 / (((1 + mastersMulti) * nextBP) / BASE_ATTACK_FRAMES);
        requiredAS = Math.ceil(requiredAS.toFixed(5) * 100);
        result.push(`${requiredAS}% AS (+${requiredAS - attackSpeed}%)`);
    }

    // Need to decrease attack cooldown, or increase CDR
    if (attackCooldown >= attackFrames) {
        let nextBP = attackCooldown - 1;

        let requiredCDR = 1 - nextBP / BASE_WOLF_ATTACK_COOLDOWN;
        requiredCDR = Math.ceil(requiredCDR.toFixed(5) * 100);
        result.push(`${requiredCDR}% CDR (+${requiredCDR - cdr}%)`);
    }

    return result.join(" and ");
}
