const BASE_ATTACK_FRAMES = 30;
const BASE_WOLF_ATTACK_COOLDOWN = 30;
const FRAMES_PER_SECOND = 60;

export function findAttackFrames(attackSpeed, isMastersOn, isEnrageOn) {
    let mastersMulti = isMastersOn ? 0.3 : 0;
    let enrageMulti = isEnrageOn ? 0.4 : 0;

    attackSpeed = attackSpeed / 100;
    let result = Math.ceil(BASE_ATTACK_FRAMES / (attackSpeed * (1 + mastersMulti + enrageMulti)));
    return Math.max(result, 5);
}

export function findAPS(attackFrames, cooldownFrames) {
    let attackTime = Math.max(attackFrames, cooldownFrames);
    return FRAMES_PER_SECOND / attackTime;
}

export function findWolfAttackCooldown(cdr) {
    let result = Math.ceil(BASE_WOLF_ATTACK_COOLDOWN * (1 - cdr / 100));
    return Math.max(result, 5);
}
