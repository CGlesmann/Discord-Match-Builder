async function moveDiscordMembersToTeamVoiceChannels(generatedTeamRoster, message)
{
    let allTeamVoiceChannels = await fetchTeamVoiceChannels(message);
    if (!allTeamVoiceChannels) { return; }

    let discordUserToTeamIndexMap = generateMemberIdToTeamIndexMap(generatedTeamRoster);
    let targetGuildMembers = await fetchAllTargetGuildMembers(
        message,
        Array.from(discordUserToTeamIndexMap, ([userId, teamIndex]) => userId)
    );

    executeVoiceChatMove(targetGuildMembers, discordUserToTeamIndexMap, allTeamVoiceChannels);
}

async function fetchTeamVoiceChannels(message)
{
    let allChannelInfo = await message.guild.channels.fetch();
    let filteredChannels = allChannelInfo.filter(channel => channel.type === 'GUILD_VOICE' && channel.name.includes("Team"))
        .sort((a, b) => a.name.split(' ')[1] - b.name.split(' ')[1]);

    if (filteredChannels && filteredChannels.size > 0)
    {
        console.log(`Found ${filteredChannels.size} team channels`);
        return Array.from(filteredChannels, ([channelId, channelObject]) => channelObject);
    }

    console.log("Couldn't find team voice channels");
    return null;
}

function generateMemberIdToTeamIndexMap(generatedTeamRoster)
{
    let discordUserToTeamIndexMap = new Map();
    let teamIndex = 0;

    for (let generatedTeam of generatedTeamRoster)
    {
        for (let generatedMember of generatedTeam.teamMembers)
        {
            if (!generatedMember.discordId) { continue; }

            discordUserToTeamIndexMap.set(generatedMember.discordId, teamIndex);
        }
        teamIndex++;
    }

    return discordUserToTeamIndexMap;
}

async function fetchAllTargetGuildMembers(message, targetGuildMemberIdArray)
{
    return await message.guild.members.fetch({ user: targetGuildMemberIdArray });
}

function executeVoiceChatMove(targetGuildMembers, guildMemberIdToTeamIndexMap, allTeamVoiceChannels)
{
    for (let guildMemberFetchResult of targetGuildMembers)
    {
        let guildMemberId = guildMemberFetchResult[0];
        let guildMemberObject = guildMemberFetchResult[1];

        if (!guildMemberObject.voice || !guildMemberObject.voice.channelId) { continue; }

        let targetTeamChannelIndex = guildMemberIdToTeamIndexMap.get(guildMemberId);

        console.log(`Queueing ${guildMemberObject.user.username} for channel "Team ${targetTeamChannelIndex + 1}"`);
        guildMemberObject.voice.setChannel(allTeamVoiceChannels[targetTeamChannelIndex]);
    }
}

module.exports = { moveDiscordMembersToTeamVoiceChannels };