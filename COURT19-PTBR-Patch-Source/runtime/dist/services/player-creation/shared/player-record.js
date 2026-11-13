import { PLAYER_ATTRIBUTES } from '../../../domain/player-creation-models.js';
import { creationFailure, emptyRecord } from './creation-plan.js';
const appearance = /^(accessory|hair|facialhair|eyebrow|eye|skin|tattoo|headtypecode$|headvariation$|face|bodytypecode$|muscularitycode$|jersey|shortstyle$|undershortstyle$|sock|shoe|smallsidedshoetypecode$|sideburnscode$)/;
const protectedFields = new Set([...PLAYER_ATTRIBUTES, 'playerid', 'firstnameid', 'lastnameid', 'commonnameid',
    'playerjerseynameid', 'gender', 'nationality', 'preferredposition1', 'overallrating', 'potential', 'height', 'weight',
    'skillmoves', 'weakfootabilitytypecode', 'headassetid', 'birthdate', 'playerjointeamdate', 'contractvaliduntil',
    'pacdiv', 'shohan', 'paskic', 'driref', 'defspe', 'phypos']);
export function databaseDate(date) {
    return Math.floor((Date.parse(`${date}T00:00:00Z`) - Date.UTC(1582, 9, 14)) / 86400000);
}
export function buildPlayerRecord(table, input, playerId, position, values, gender, year, defaults) {
    const row = emptyRecord(table);
    const donor = table.records.find(row => row.gender === gender && row.headclasscode === 1 && row.hashighqualityhead !== 1);
    for (const field of table.fields) {
        if (donor && appearance.test(field.name))
            row[field.name] = donor[field.name];
        if (/^preferredposition[2-9]$/.test(field.name))
            row[field.name] = field.rangeLow !== null && field.rangeLow < 0 ? -1 : position;
    }
    const set = (name, value) => { if (Object.hasOwn(row, name))
        row[name] = value; };
    for (const [name, value] of Object.entries(defaults))
        if (!donor || !appearance.test(name))
            set(name, value);
    for (const [name, value] of Object.entries(values))
        set(name, value);
    set('playerid', playerId);
    set('headassetid', playerId);
    set('gender', gender);
    set('nationality', input.nationality);
    set('preferredposition1', position);
    set('overallrating', input.baseRating ?? 70);
    set('preferredfoot', input.preferredFoot === 'left' ? 0 : 1);
    set('headclasscode', 1);
    set('hashighqualityhead', 0);
    set('usercaneditname', 1);
    set('iscustomized', 1);
    set('internationalrep', 1);
    set('birthdate', databaseDate(input.birthDate ?? `${year - 20}-01-01`));
    set('playerjointeamdate', databaseDate(`${year}-07-01`));
    set('contractvaliduntil', year + 3);
    const average = (...names) => Math.round(names.reduce((sum, name) => sum + (values[name] ?? 0), 0) / names.length);
    set('pacdiv', position === 0 ? values.gkdiving : average('acceleration', 'sprintspeed'));
    set('shohan', position === 0 ? values.gkhandling : average('finishing', 'positioning', 'shotpower', 'longshots', 'volleys', 'penalties'));
    set('paskic', position === 0 ? values.gkkicking : average('shortpassing', 'longpassing', 'crossing', 'curve', 'vision', 'freekickaccuracy'));
    set('driref', position === 0 ? values.gkreflexes : average('dribbling', 'ballcontrol', 'agility', 'balance', 'reactions', 'composure'));
    set('defspe', position === 0 ? average('acceleration', 'sprintspeed') : average('standingtackle', 'slidingtackle', 'defensiveawareness', 'interceptions', 'headingaccuracy'));
    set('phypos', position === 0 ? values.gkpositioning : average('strength', 'stamina', 'aggression', 'jumping'));
    if (Object.hasOwn(row, 'marking'))
        set('marking', values.defensiveawareness);
    for (const [name, value] of Object.entries(input.fields ?? {})) {
        if (!Object.hasOwn(row, name) || protectedFields.has(name))
            creationFailure(`Unknown or managed player field: ${name}. Use its dedicated input option when available.`);
        row[name] = value;
    }
    for (const name of Object.keys(input.attributes ?? {}))
        if (!Object.hasOwn(row, name))
            creationFailure(`Attribute ${name} is absent from this player schema.`);
    return { row, originalPlayerId: donor?.playerid,
        originalHeadAssetId: (donor?.headassetid ?? donor?.playerid) };
}
