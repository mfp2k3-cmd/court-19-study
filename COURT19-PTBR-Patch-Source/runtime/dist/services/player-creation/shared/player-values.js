import { EaFileError } from '../../../domain/errors.js';
import { PLAYER_ATTRIBUTES, PLAYER_POSITIONS } from '../../../domain/player-creation-models.js';
const defense = { standingtackle: 6, slidingtackle: 3, defensiveawareness: 6, interceptions: 5,
    strength: 7, jumping: 5, headingaccuracy: 5, aggression: 4, finishing: -30, dribbling: -18, agility: -15,
    acceleration: -12, sprintspeed: -8, positioning: -25, vision: -15, crossing: -20 };
const fullback = { acceleration: 5, sprintspeed: 5, stamina: 6, standingtackle: 3,
    slidingtackle: 3, interceptions: 1, defensiveawareness: 1, crossing: 4, shortpassing: 0, finishing: -22, headingaccuracy: -8 };
const holding = { interceptions: 6, standingtackle: 4, defensiveawareness: 5, strength: 3,
    stamina: 5, shortpassing: 4, longpassing: 3, vision: 1, aggression: 4, finishing: -18, sprintspeed: -8 };
const central = { shortpassing: 6, longpassing: 5, vision: 5, ballcontrol: 4, stamina: 4,
    composure: 3, reactions: 2, dribbling: 2, finishing: -8, interceptions: -2, defensiveawareness: -4 };
const attacking = { vision: 7, shortpassing: 6, ballcontrol: 5, dribbling: 5, agility: 4,
    positioning: 5, composure: 3, finishing: 1, longshots: 2, standingtackle: -30, defensiveawareness: -30, strength: -10 };
const wide = { acceleration: 7, sprintspeed: 7, agility: 6, dribbling: 5, ballcontrol: 4,
    crossing: 6, positioning: 2, shortpassing: 1, stamina: 4, standingtackle: -20, defensiveawareness: -20, strength: -14 };
const striker = { finishing: 7, positioning: 7, shotpower: 5, headingaccuracy: 3, volleys: 4,
    reactions: 3, composure: 3, strength: 2, penalties: 3, standingtackle: -35, slidingtackle: -35,
    interceptions: -30, defensiveawareness: -35, crossing: -20, longpassing: -16 };
export const RANDOMIZABLE_PLAYER_FIELDS = [...PLAYER_ATTRIBUTES,
    'height', 'weight', 'potential', 'skillmoves', 'weakfootabilitytypecode'];
export function playerValueLimits(field) {
    return field === 'height' ? [130, 215] : field === 'weight' ? [30, 115] :
        field === 'skillmoves' || field === 'weakfootabilitytypecode' ? [1, 5] : [1, 99];
}
export function positionId(position) {
    const id = typeof position === 'string' ? PLAYER_POSITIONS[position] : position;
    if (!Number.isInteger(id) || id < 0 || id > 27)
        throw new EaFileError('INVALID_OPTIONS', 'position must be a supported name or an integer from 0 through 27.');
    return id;
}
function offsets(position) {
    if (position === 0)
        return { reactions: 2, jumping: 2, strength: 0, agility: -2, finishing: -55,
            standingtackle: -50, slidingtackle: -50, defensiveawareness: -50, interceptions: -50, positioning: -50,
            gkdiving: 3, gkhandling: 1, gkkicking: -2, gkpositioning: 2, gkreflexes: 4 };
    if (position === 1)
        return { ...defense, longpassing: 2, shortpassing: 3, vision: -2, acceleration: -4 };
    if ([4, 5, 6].includes(position))
        return defense;
    if ([3, 7].includes(position))
        return fullback;
    if ([2, 8].includes(position))
        return { ...fullback, crossing: 7, dribbling: 3, acceleration: 7, defensiveawareness: -5 };
    if ([9, 10, 11].includes(position))
        return holding;
    if ([13, 14, 15].includes(position))
        return central;
    if ([17, 18, 19].includes(position))
        return attacking;
    if ([12, 16].includes(position))
        return wide;
    if ([23, 27].includes(position))
        return { ...wide, finishing: 3, positioning: 5, stamina: 0 };
    if ([20, 21, 22].includes(position))
        return { ...attacking, finishing: 5, positioning: 6, shotpower: 3, headingaccuracy: -10 };
    return striker;
}
export function playerValues(input, options) {
    const position = positionId(input.position), rating = input.baseRating ?? 70, policy = offsets(position);
    const clamp = (value, min = 1, max = 99) => Math.max(min, Math.min(max, value));
    const attributes = Object.fromEntries(PLAYER_ATTRIBUTES.map(name => [name,
        position !== 0 && name.startsWith('gk') ? 10 : clamp(rating + (policy[name] ?? (position === 0 ? -35 : -8)))]));
    const centerBack = [1, 4, 5, 6].includes(position);
    const baseValues = { ...attributes, height: position === 0 ? 190 : centerBack ? 187 : 178,
        weight: position === 0 ? 85 : centerBack ? 82 : 74, potential: clamp(rating + 5),
        skillmoves: position === 0 || centerBack ? 1 : [9, 10, 11, 3, 7].includes(position) ? 2 : 3,
        weakfootabilitytypecode: 3 };
    const values = { ...baseValues };
    const randomizedFields = [];
    let randomSeed = null;
    if (options.randomize) {
        const random = options.randomize === true ? {} : options.randomize;
        randomSeed = random.seed ?? Math.floor(Math.random() * 4294967296);
        let state = randomSeed;
        const next = () => {
            state = (state + 0x6D2B79F5) | 0;
            let value = Math.imul(state ^ (state >>> 15), state | 1);
            value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
            return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
        };
        const allowed = new Set(random.fields ?? [...PLAYER_ATTRIBUTES, ...Object.keys(random.ranges ?? {})]);
        for (const field of RANDOMIZABLE_PLAYER_FIELDS) {
            if (!allowed.has(field))
                continue;
            const variation = random.variation ?? 5;
            const range = random.ranges?.[field] ?? { min: baseValues[field] - variation, max: baseValues[field] + variation };
            const [min, max] = playerValueLimits(field);
            values[field] = clamp(range.min + Math.floor(next() * (range.max - range.min + 1)), min, max);
            randomizedFields.push(field);
        }
    }
    const explicit = { ...input.attributes, ...(input.height === undefined ? {} : { height: input.height }),
        ...(input.weight === undefined ? {} : { weight: input.weight }), ...(input.potential === undefined ? {} : { potential: input.potential }),
        ...(input.skillMoves === undefined ? {} : { skillmoves: input.skillMoves }),
        ...(input.weakFootAbility === undefined ? {} : { weakfootabilitytypecode: input.weakFootAbility }) };
    Object.assign(values, explicit);
    if (input.potential === undefined)
        values.potential = Math.max(rating, values.potential);
    return { position, baseValues: baseValues, values: values, randomSeed,
        randomizedFields: randomizedFields.filter(name => !Object.hasOwn(explicit, name)) };
}
