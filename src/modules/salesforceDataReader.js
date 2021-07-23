const jsforce = require("jsforce");

const SF_LOGIN_URL = "https://login.salesforce.com";
const SF_CONNECTION = new jsforce.Connection({
    loginUrl: SF_LOGIN_URL
});

async function getAllTeamBuildingData()
{
    const DATA_QUERY_PATH = "/Starcraft/v1/TeamBuilder";
    await SF_CONNECTION.login(process.env.SF_INSTANCE_USERNAME, process.env.SF_INSTANCE_PASSWORD);

    let returnData = await SF_CONNECTION.apex.get(DATA_QUERY_PATH);
    return returnData;
}

async function getAllApprovedMaps()
{
    const DATA_QUERY_PATH = "/Starcraft/v1/MapData";
    await SF_CONNECTION.login(process.env.SF_INSTANCE_USERNAME, process.env.SF_INSTANCE_PASSWORD);

    let returnData = await SF_CONNECTION.apex.get(DATA_QUERY_PATH);
    return returnData;
}

module.exports = { getAllTeamBuildingData, getAllApprovedMaps }