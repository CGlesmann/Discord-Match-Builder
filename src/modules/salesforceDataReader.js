// const jsforce = require("jsforce");

// const SF_LOGIN_URL = "https://login.salesforce.com";
// const SF_CONNECTION = new jsforce.Connection({
//     loginUrl: SF_LOGIN_URL
// });

const { createClient, SupabaseClient } = require("@supabase/supabase-js");

const supabaseClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

async function getAllTeamBuildingData(targetPlayerIds, targetGameId)
{
    const { data, error } = await supabaseClient.from('player').select(`
        id,
        name,
        discordNameTag:discord_id,
        roleRatings:player_role_rating!inner (
            id,
            value,
            isPrimary: is_primary,
            role:game_role!inner (
                name
            )
        )
    `)
        .in('discord_id', targetPlayerIds.split(","))
        .eq('player_role_rating.game_role.game', targetGameId)
        .eq('player_role_rating.is_active', true);

    if (error)
    {
        console.log(error);
        return;
    }

    data.forEach((player) =>
    {
        player.roleRatings = player.roleRatings.map(roleRating =>
        {
            return {
                id: roleRating.id,
                value: roleRating.value,
                role: roleRating.role.name,
                isPrimary: roleRating.isPrimary
            }
        })
    });

    return { availableTeamMembers: data };
}

async function getAllApprovedMaps(minimumPlayerCount, targetGameId)
{
    const { data, error } = await supabaseClient.from('game_map').select(`
        id,
        name,
        maxPlayerCount:max_player_count
    `)
        .eq('is_active', true)
        .eq('game', targetGameId)
        .gte('max_player_count', minimumPlayerCount);

    if (error)
    {
        console.log(error);
        return;
    }

    const maxPlayerCountToMapWrapper = new Map();
    for (let gameMapServerObject of data)
    {
        if (!maxPlayerCountToMapWrapper.has(gameMapServerObject.maxPlayerCount))
        {
            maxPlayerCountToMapWrapper.set(gameMapServerObject.maxPlayerCount, {
                maxPlayerCount: gameMapServerObject.maxPlayerCount,
                mapNames: [
                    gameMapServerObject
                ]
            });

            continue;
        }

        let mapWrapperObject = maxPlayerCountToMapWrapper.get(gameMapServerObject.maxPlayerCount);
        mapWrapperObject.mapNames.push(gameMapServerObject);

        continue;
    }

    return Array.from(maxPlayerCountToMapWrapper.values());
}

async function getAllGames(requiredPlayerCount)
{
    const { data, error } = await supabaseClient.from('game').select(`
        gameId:id, 
        gameName:name, 
        gameDescription:game_description, 
        gameLogoURL:game_logo_url, 
        minPlayerCount:minimum_player_count, 
        maxPlayerCount:maximum_player_count, 
        areGameRolesEnabled:use_game_roles, 
        gameTeamConfigs:game_team_config!game_team_config_game_fkey (
            teamConfigId:id,
            teamName:name,
            minTeamSize:minimum_player_count,
            maxTeamSize:maximum_player_count,
            isTeamRequired:is_team_required,
            availableTeamRoles:game_team_role (
                id,
                game_role (
                    name
                )
            )
        )
    `)
        .gte('maximum_player_count', requiredPlayerCount)
        .lte('minimum_player_count', requiredPlayerCount)

    if (error)
    {
        console.log(error);
        return null;
    }

    return data;
}

async function postMatchResult(matchResult)
{
    // Insert Match Results
    const currentDate = new Date(Date.now());

    const matchInsertResult = await supabaseClient
        .from('match')
        .insert([{
            game: matchResult.gameId,
            game_map: matchResult.matchMapId,
            winning_team: matchResult.winningTeam,
            match_time: currentDate.toISOString()
        }]);

    let newPlayerMatchResults = [];
    let playerRoleRatingUpdates = [];

    for (let teamResult of matchResult.teamResults)
    {
        for (let playerRoleRatingUpdate of teamResult.roleRatingUpdates)
        {
            newPlayerMatchResults.push({
                player_role_rating: playerRoleRatingUpdate.player_role_rating,
                match_result: teamResult.result,
                game_team: playerRoleRatingUpdate.game_team,
                match: matchInsertResult.data[0].id,
                role_rating_change: playerRoleRatingUpdate.role_rating_change
            });

            playerRoleRatingUpdates.push({
                id: playerRoleRatingUpdate.player_role_rating,
                value: Number(playerRoleRatingUpdate.old_role_rating) + Number(playerRoleRatingUpdate.role_rating_change)
            });
        }
    }

    const playerMatchResultsInsert = await supabaseClient
        .from('player_match_result')
        .insert(newPlayerMatchResults);

    if (playerMatchResultsInsert.error)
    {
        console.log(`playerMatchResult Insert Error: ${playerMatchResultsInsert.error}`);
    }

    let roleRatingUpdatePromises = [];
    for (let roleUpdate of playerRoleRatingUpdates)
    {
        roleRatingUpdatePromises.push(
            supabaseClient
                .from('player_role_rating')
                .update({ value: roleUpdate.value })
                .eq('id', roleUpdate.id)
        )
    }

    const updateResults = await Promise.all(roleRatingUpdatePromises);
    for (let updateResult of updateResults)
    {
        if (updateResult.error)
        {
            console.log(updateResult.error);
        }
    }
}

module.exports = { getAllTeamBuildingData, getAllApprovedMaps, postMatchResult, getAllGames }