const BASE_ATTACK_FRAMES = 30;
const FRAMES_PER_SECOND = 60;

export function findAttackFrames(attackSpeed, isMastersOn, isEnrageOn) {
    let mastersMulti = isMastersOn ? 0.3 : 0;
    let enrageMulti = isEnrageOn ? 0.4 : 0;

    attackSpeed = attackSpeed / 100;
    let result = Math.ceil(BASE_ATTACK_FRAMES / (attackSpeed * (1 + mastersMulti + enrageMulti)));
    return Math.max(result, 5);
}

export function findAPS(attackFrames) {
    return FRAMES_PER_SECOND / attackFrames;
}
