// const { GENERATED_TEAMS_CACHE_KEY } = require("../utils/Constants.js");

// async function moveDiscordMembersToTeamVoiceChannels(targetGeneratedMatch, message, applicationCache)
// {
//     // let allTeamVoiceChannels = await fetchTeamVoiceChannels(message);
//     allTeamVoiceChannels = await createTempGameVoiceChannels(targetGeneratedMatch, message, applicationCache);
//     if (!allTeamVoiceChannels) { return; }

//     // let discordUserToTeamIndexMap = generateMemberIdToTeamIndexMap(targetGeneratedMatch.teams);
//     // let targetGuildMembers = await fetchAllTargetGuildMembers(
//     //     message,
//     //     Array.from(discordUserToTeamIndexMap, ([userId, teamIndex]) => userId)
//     // );

//     executeVoiceChatMove(targetGuildMembers, discordUserToTeamIndexMap, allTeamVoiceChannels);
// }

// async function createTempGameVoiceChannels(targetGeneratedMatch, message, applicationCache)
// {
//     let discordIdToVoiceChannelMap = new Map();
//     let createChannelPromises = [];
//     // let allNewChannelIds = [];

//     // Create the Category Channel to house the VCs
//     const parentCategoryChannel = await message.guild.channels.create(`${targetGeneratedMatch.game.gameName} Match`, {
//         type: 'GUILD_CATEGORY'
//     });

//     // Create one VC for each game team
//     // allNewChannelIds.push(parentCategoryChannel.id);
//     for (let generatedTeam of targetGeneratedMatch.teams)
//     {
//         createChannelPromises.push(message.guild.channels.create(`${generatedTeam.teamName}`, {
//             type: 'GUILD_VOICE',
//             parent: parentCategoryChannel
//         }));
//     }

//     let newChildChannels = await Promise.all(createChannelPromises);

//     // newChildChannels.forEach(childChannel =>
//     // {
//     //     allNewChannelIds.push(childChannel.id);
//     // });

//     return [parentCategoryChannel, ...newChildChannels];
// }

// // function generateMemberIdToTeamIndexMap(generatedTeamRoster)
// // {
// //     let discordUserToTeamIndexMap = new Map();
// //     let teamIndex = 0;

// //     for (let generatedTeam of generatedTeamRoster)
// //     {
// //         for (let generatedMember of generatedTeam.teamMembers)
// //         {
// //             if (!generatedMember.discordId) { continue; }

// //             discordUserToTeamIndexMap.set(generatedMember.discordId, teamIndex);
// //         }
// //         teamIndex++;
// //     }

// //     return discordUserToTeamIndexMap;
// // }

// // async function fetchAllTargetGuildMembers(message, targetGuildMemberIdArray)
// // {
// //     return await message.guild.members.fetch({ user: targetGuildMemberIdArray });
// // }

// // function executeVoiceChatMove(targetGuildMembers, guildMemberIdToTeamIndexMap, allTeamVoiceChannels)
// // {
// //     console.log(allTeamVoiceChannels);
// //     for (let guildMemberFetchResult of targetGuildMembers)
// //     {
// //         let guildMemberId = guildMemberFetchResult[0];
// //         let guildMemberObject = guildMemberFetchResult[1];

// //         // Ensure the user is in voice chat already
// //         if (!guildMemberObject.voice || !guildMemberObject.voice.channelId) { continue; }

// //         let targetTeamChannelIndex = guildMemberIdToTeamIndexMap.get(guildMemberId);

// //         console.log(`Queueing ${guildMemberObject.user.username} for channel "Team ${targetTeamChannelIndex + 1}"`);
// //         console.log(allTeamVoiceChannels[targetTeamChannelIndex]);
// //         guildMemberObject.voice.setChannel(allTeamVoiceChannels[targetTeamChannelIndex]);
// //     }
// // }

// function executeVoiceChatMove(targetGuildMembers, guildMemberIdToTeamIndexMap, allTeamVoiceChannels)
// {
//     console.log(allTeamVoiceChannels);
//     for (let guildMemberFetchResult of targetGuildMembers)
//     {
//         let guildMemberId = guildMemberFetchResult[0];
//         let guildMemberObject = guildMemberFetchResult[1];

//         // Ensure the user is in voice chat already
//         if (!guildMemberObject.voice || !guildMemberObject.voice.channelId) { continue; }

//         let targetTeamChannelIndex = guildMemberIdToTeamIndexMap.get(guildMemberId);

//         console.log(`Queueing ${guildMemberObject.user.username} for channel "Team ${targetTeamChannelIndex + 1}"`);
//         console.log(allTeamVoiceChannels[targetTeamChannelIndex]);
//         guildMemberObject.voice.setChannel(allTeamVoiceChannels[targetTeamChannelIndex]);
//     }
// }

// module.exports = { moveDiscordMembersToTeamVoiceChannels };