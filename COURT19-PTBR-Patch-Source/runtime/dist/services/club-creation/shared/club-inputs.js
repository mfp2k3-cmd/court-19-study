import { clubFailure } from './club-plan.js';
function object(value, label) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        clubFailure(`${label} must be an object.`);
}
function keys(value, allowed, label) {
    for (const name of Object.keys(value))
        if (!allowed.includes(name))
            clubFailure(`Unknown ${label} option: ${name}.`);
}
export function clubColor(value) {
    if (typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)) {
        return { r: parseInt(value.slice(1, 3), 16), g: parseInt(value.slice(3, 5), 16), b: parseInt(value.slice(5, 7), 16) };
    }
    if (value && typeof value === 'object' && Object.keys(value).length === 3 &&
        ['r', 'g', 'b'].every(name => Number.isInteger(value[name]) &&
            value[name] >= 0 && value[name] <= 255))
        return { ...value };
    return clubFailure('Colors must be #RRGGBB or { r, g, b } with integer channels in 0..255.');
}
export function clubColors(value) {
    if (!Array.isArray(value) || value.length < 1 || value.length > 3)
        clubFailure('Provide one to three club colors.');
    return value.map(v => clubColor(v));
}
export function validateClubInputs(input, options) {
    object(input, 'input');
    object(options, 'options');
    keys(input, ['name', 'leagueId', 'colors', 'teamId', 'assetId', 'countryId', 'gender', 'templateTeamId',
        'stadiumId', 'stadiumName', 'foundationYear', 'baseRating', 'defensiveDepth', 'rivalTeamId', 'kits', 'formation', 'manager', 'fields'], 'club');
    keys(options, ['autoGenerateId', 'databaseIndex', 'referenceYear', 'dryRun'], 'creation');
    if (typeof input.name !== 'string' || !input.name.trim())
        clubFailure('A nonempty club name is required.');
    clubColors(input.colors);
    for (const name of ['autoGenerateId', 'dryRun'])
        if (options[name] !== undefined && typeof options[name] !== 'boolean') {
            clubFailure(`${name} must be boolean.`);
        }
    for (const name of ['leagueId', 'teamId', 'assetId', 'countryId', 'gender', 'templateTeamId', 'stadiumId',
        'foundationYear', 'baseRating', 'defensiveDepth', 'rivalTeamId']) {
        if ((name === 'leagueId' || input[name] !== undefined) && !Number.isSafeInteger(input[name]))
            clubFailure(`${name} must be an integer.`);
    }
    if (input.gender !== undefined && input.gender !== 0 && input.gender !== 1)
        clubFailure('gender must be 0 or 1.');
    if (input.baseRating !== undefined && (input.baseRating < 1 || input.baseRating > 99))
        clubFailure('baseRating must be in 1..99.');
    if (input.defensiveDepth !== undefined && (input.defensiveDepth < 1 || input.defensiveDepth > 100))
        clubFailure('defensiveDepth must be in 1..100.');
    for (const name of ['databaseIndex', 'referenceYear']) {
        const value = options[name];
        if (value !== undefined && (typeof value !== 'number' || !Number.isSafeInteger(value) || value < (name === 'referenceYear' ? 1800 : 0) || value > (name === 'referenceYear' ? 2050 : 2147483647)))
            clubFailure(`Invalid ${name}.`);
    }
    if ((options.autoGenerateId ?? true) ? input.teamId !== undefined : input.teamId === undefined) {
        clubFailure('Provide teamId only with autoGenerateId: false; manual mode requires teamId.');
    }
    if (input.stadiumName !== undefined && (typeof input.stadiumName !== 'string' || !input.stadiumName.trim()))
        clubFailure('stadiumName must be nonempty text.');
    if (input.fields !== undefined)
        object(input.fields, 'fields');
    if (input.kits !== undefined) {
        object(input.kits, 'kits');
        keys(input.kits, ['home', 'away', 'goalkeeper', 'third'], 'kits');
        for (const [type, kit] of Object.entries(input.kits)) {
            if (type === 'third' && kit === false)
                continue;
            object(kit, `kits.${type}`);
            keys(kit, ['kitId', 'templateKitId', 'colors', 'numberColor', 'generic', 'year', 'jerseyTemplateIndex',
                'shortsTemplateIndex', 'socksTemplateIndex', 'hudPattern', 'fields'], 'kit');
            if (kit.colors !== undefined)
                clubColors(kit.colors);
            if (kit.numberColor !== undefined)
                clubColor(kit.numberColor);
            if (kit.generic !== undefined && typeof kit.generic !== 'boolean')
                clubFailure('generic must be boolean.');
            for (const name of ['kitId', 'templateKitId', 'year', 'jerseyTemplateIndex', 'shortsTemplateIndex', 'socksTemplateIndex', 'hudPattern']) {
                if (kit[name] !== undefined && !Number.isSafeInteger(kit[name]))
                    clubFailure(`${name} must be an integer.`);
            }
            if (kit.fields !== undefined)
                object(kit.fields, 'kit.fields');
        }
    }
    if (input.formation !== undefined) {
        object(input.formation, 'formation');
        keys(input.formation, ['formationId', 'templateFormationId', 'fields'], 'formation');
        for (const value of [input.formation.formationId, input.formation.templateFormationId])
            if (value !== undefined && !Number.isSafeInteger(value))
                clubFailure('Formation IDs must be integers.');
        if (input.formation.fields !== undefined)
            object(input.formation.fields, 'formation.fields');
    }
    if (input.manager !== undefined) {
        object(input.manager, 'manager');
        keys(input.manager, ['managerId', 'firstName', 'lastName', 'nationality', 'fields'], 'manager');
        for (const value of [input.manager.managerId, input.manager.nationality])
            if (value !== undefined && !Number.isSafeInteger(value))
                clubFailure('Manager IDs and nationality must be integers.');
        for (const value of [input.manager.firstName, input.manager.lastName])
            if (value !== undefined && (typeof value !== 'string' || !value.trim()))
                clubFailure('Manager names must be nonempty text.');
        if (input.manager.fields !== undefined)
            object(input.manager.fields, 'manager.fields');
    }
}
export function contrastColor(color) {
    return color.r * 0.299 + color.g * 0.587 + color.b * 0.114 > 150 ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
}
