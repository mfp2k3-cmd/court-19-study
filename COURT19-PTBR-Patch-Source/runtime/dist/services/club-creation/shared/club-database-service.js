import { clubContext } from './club-context.js';
import { addClubKits } from './club-kits.js';
import { addClubManager, addClubRelations, addClubTeam } from './club-records.js';
import { addClubTactics } from './club-tactics.js';
export class ClubDatabaseService {
    profile;
    year;
    mentalitiesPerClub;
    constructor(profile, year, mentalitiesPerClub) {
        this.profile = profile;
        this.year = year;
        this.mentalitiesPerClub = mentalitiesPerClub;
    }
    create(database, input, options) {
        const context = clubContext(database, input, options, this.year);
        const team = addClubTeam(context);
        const kits = addClubKits(context);
        const formationId = addClubTactics(context, this.mentalitiesPerClub);
        addClubRelations(context);
        const managerId = addClubManager(context);
        const tables = context.plan.finish(!options.dryRun);
        const assetId = team.assetid;
        return { profile: this.profile, databaseIndex: database.index, teamId: context.teamId, assetId,
            templateTeamId: context.donor.teamid, leagueId: input.leagueId, countryId: context.countryId,
            stadiumId: context.stadium.stadiumid, formationId, managerId, colors: context.colors, kits, team,
            idGenerated: options.autoGenerateId ?? true, created: !options.dryRun, rosterSize: 0,
            assets: { badgeAssetId: assetId, badgeAssetProvided: input.assetId !== undefined, kitAssetTeamId: context.teamId,
                externalKitTexturesRequired: kits.some(kit => !kit.generic) }, tables };
    }
}
