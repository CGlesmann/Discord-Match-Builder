const jsforce = require("jsforce");

const SF_LOGIN_URL = "https://login.salesforce.com";
const SF_CONNECTION = new jsforce.Connection({
    loginUrl: SF_LOGIN_URL
});

async function getAllTeamBuildingData(targetPlayerIds)
{
    const DATA_QUERY_PATH = `/Starcraft/v1/TeamBuilder?targetPlayerIds=${targetPlayerIds}`;
    await SF_CONNECTION.login(process.env.SF_INSTANCE_USERNAME, process.env.SF_INSTANCE_PASSWORD);

    let returnData = await SF_CONNECTION.apex.get(DATA_QUERY_PATH);
    return returnData;
}

async function getAllApprovedMaps(minimumPlayerCount)
{
    const DATA_QUERY_PATH = `/Starcraft/v1/MapData?minimumPlayerCount=${minimumPlayerCount}`;
    await SF_CONNECTION.login(process.env.SF_INSTANCE_USERNAME, process.env.SF_INSTANCE_PASSWORD);

    let returnData = await SF_CONNECTION.apex.get(DATA_QUERY_PATH);
    return returnData;
}

module.exports = { getAllTeamBuildingData, getAllApprovedMaps }