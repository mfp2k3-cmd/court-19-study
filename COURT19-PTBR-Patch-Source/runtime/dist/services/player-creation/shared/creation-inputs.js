import { EaFileError } from '../../../domain/errors.js';
import { PLAYER_ATTRIBUTES } from '../../../domain/player-creation-models.js';
import { playerValueLimits, positionId, RANDOMIZABLE_PLAYER_FIELDS } from './player-values.js';
export function creationInputs(input, options) {
    const fail = (message) => { throw new EaFileError('INVALID_OPTIONS', message); };
    const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
    const integer = (value, min, max) => typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;
    const text = (value, empty = false) => typeof value === 'string' && (empty || value.trim().length > 0) &&
        value.length <= 255 && !value.includes('\0') && new TextDecoder().decode(new TextEncoder().encode(value)) === value;
    if (!object(input) || !object(options))
        fail('Player input and creation options must be objects.');
    const keys = ['firstName', 'lastName', 'teamId', 'position', 'nationality', 'playerId', 'commonName', 'jerseyName',
        'jerseyNumber', 'nationalTeamId', 'nationalJerseyNumber', 'baseRating', 'potential', 'birthDate', 'height', 'weight', 'preferredFoot',
        'skillMoves', 'weakFootAbility', 'attributes', 'fields'];
    if (Object.keys(input).some(key => !keys.includes(key)) || Object.keys(options).some(key => !['autoGenerateId', 'randomize', 'databaseIndex', 'referenceYear', 'dryRun'].includes(key)))
        fail('Unknown player creation input or option.');
    if (!text(input.firstName) || !text(input.lastName) || (input.commonName !== undefined && !text(input.commonName, true)) ||
        (input.jerseyName !== undefined && !text(input.jerseyName)))
        fail('Player names must contain valid text.');
    positionId(input.position);
    for (const key of ['teamId', 'nationality', 'playerId', 'nationalTeamId']) {
        if ((input[key] !== undefined || key === 'teamId' || key === 'nationality') && !integer(input[key], 1, 2147483647))
            fail(`${key} must be a positive integer.`);
    }
    for (const key of ['jerseyNumber', 'nationalJerseyNumber', 'baseRating', 'potential']) {
        if (input[key] !== undefined && !integer(input[key], 1, 99))
            fail(`${key} must be an integer from 1 through 99.`);
    }
    if (input.nationalJerseyNumber !== undefined && input.nationalTeamId === undefined)
        fail('nationalJerseyNumber requires nationalTeamId.');
    if (input.potential !== undefined && input.potential < (input.baseRating ?? 70))
        fail('potential must be at least baseRating.');
    if ((input.height !== undefined && !integer(input.height, 130, 215)) || (input.weight !== undefined && !integer(input.weight, 30, 115)))
        fail('height and weight must be supported integer measurements.');
    if (input.preferredFoot !== undefined && !['left', 'right'].includes(input.preferredFoot))
        fail('preferredFoot must be left or right.');
    for (const key of ['skillMoves', 'weakFootAbility'])
        if (input[key] !== undefined && !integer(input[key], 1, 5))
            fail(`${key} must be an integer from 1 through 5.`);
    if (input.birthDate !== undefined && (typeof input.birthDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate) ||
        !Number.isFinite(Date.parse(`${input.birthDate}T00:00:00Z`)) || new Date(`${input.birthDate}T00:00:00Z`).toISOString().slice(0, 10) !== input.birthDate || input.birthDate < '1582-10-14'))
        fail('birthDate must be a valid YYYY-MM-DD date after the database epoch.');
    for (const key of ['autoGenerateId', 'dryRun'])
        if (options[key] !== undefined && typeof options[key] !== 'boolean')
            fail(`${key} must be a boolean.`);
    if ((options.autoGenerateId ?? true) ? input.playerId !== undefined : input.playerId === undefined)
        fail('Provide playerId only with autoGenerateId: false.');
    if (options.databaseIndex !== undefined && !integer(options.databaseIndex, 0, 2147483647))
        fail('databaseIndex must be a nonnegative integer.');
    if (options.referenceYear !== undefined && !integer(options.referenceYear, 1900, 2100))
        fail('referenceYear must be from 1900 through 2100.');
    if (input.attributes !== undefined && (!object(input.attributes) || Object.entries(input.attributes).some(([name, value]) => !PLAYER_ATTRIBUTES.includes(name) || !integer(value, 1, 99))))
        fail('attributes must contain supported attribute names and integers from 1 through 99.');
    if (input.fields !== undefined && (!object(input.fields) || Object.values(input.fields).some(value => typeof value !== 'number' && typeof value !== 'string')))
        fail('fields must contain mapped numeric or text values.');
    if (options.randomize !== undefined && typeof options.randomize !== 'boolean') {
        const random = options.randomize;
        if (!object(random) || Object.keys(random).some(key => !['seed', 'variation', 'fields', 'ranges'].includes(key)) ||
            (random.seed !== undefined && !integer(random.seed, 0, 4294967295)) ||
            (random.variation !== undefined && !integer(random.variation, 0, 99)) ||
            (random.fields !== undefined && (!Array.isArray(random.fields) || random.fields.some(field => !RANDOMIZABLE_PLAYER_FIELDS.includes(field)) ||
                new Set(random.fields).size !== random.fields.length)))
            fail('Invalid randomization configuration.');
        if (random.ranges !== undefined && (!object(random.ranges) || Object.entries(random.ranges).some(([field, range]) => {
            const name = field;
            if (!RANDOMIZABLE_PLAYER_FIELDS.includes(name) || !object(range))
                return true;
            const [min, max] = playerValueLimits(name);
            return Object.keys(range).some(key => !['min', 'max'].includes(key)) || !integer(range.min, min, max) ||
                !integer(range.max, min, max) || range.min > range.max ||
                (random.fields !== undefined && !random.fields.includes(name));
        })))
            fail('Random ranges require valid selected fields and ordered integer limits within their value domains.');
    }
}
