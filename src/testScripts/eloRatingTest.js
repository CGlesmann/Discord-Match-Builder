const { contructMatchResultWrapper } = require("../modules/eloRatingManager.js");

const PROTOSS_ROLE_INDEX = 0;
const TERRAN_ROLE_INDEX = 1;
const ZERG_ROLE_INDEX = 2;

const NICK = {
    discordId: "317879303725383690",
    name: "Nick",
    memberRoleRatings: [
        {
            roleName: "Protoss",
            roleRating: 700
        },
        {
            roleName: "Terran",
            roleRating: 850
        },
        {
            roleName: "Zerg",
            roleRating: 900
        }
    ]
};
const CHRIS = {
    discordId: "248975576876974080",
    name: "Chris",
    memberRoleRatings: [
        {
            roleName: "Protoss",
            roleRating: 800
        },
        {
            roleName: "Terran",
            roleRating: 400
        },
        {
            roleName: "Zerg",
            roleRating: 600
        }
    ]
};
const JACOB = {
    discordId: "274067602429706241",
    name: "Jacob",
    memberRoleRatings: [
        {
            roleName: "Protoss",
            roleRating: 450
        },
        {
            roleName: "Terran",
            roleRating: 400
        },
        {
            roleName: "Zerg",
            roleRating: 100
        }
    ]
};
const CHARLESE = {
    discordId: "764318717894721558",
    name: "Charlese",
    memberRoleRatings: [
        {
            roleName: "Protoss",
            roleRating: 300
        },
        {
            roleName: "Terran",
            roleRating: 200
        },
        {
            roleName: "Zerg",
            roleRating: 500
        }
    ]
};
const KAYSIA = {
    discordId: "782099653041848340",
    name: "Kaysia",
    memberRoleRatings: [
        {
            roleName: "Protoss",
            roleRating: 200
        },
        {
            roleName: "Terran",
            roleRating: 500
        },
        {
            roleName: "Zerg",
            roleRating: 100
        }
    ]
};
const LANCE = {
    discordId: "311626728965537803",
    name: "Lance",
    memberRoleRatings: [
        {
            roleName: "Protoss",
            roleRating: 300
        },
        {
            roleName: "Terran",
            roleRating: 700
        },
        {
            roleName: "Zerg",
            roleRating: 500
        }
    ]
};
const JOHN = {
    discordId: "782100725861449728",
    name: "John",
    memberRoleRatings: [
        {
            roleName: "Protoss",
            roleRating: 500
        },
        {
            roleName: "Terran",
            roleRating: 300
        },
        {
            roleName: "Zerg",
            roleRating: 100
        }
    ]
};
const CODY = {
    discordId: "536012752049799199",
    name: "Cody",
    memberRoleRatings: [
        {
            roleName: "Protoss",
            roleRating: 500
        },
        {
            roleName: "Terran",
            roleRating: 400
        },
        {
            roleName: "Zerg",
            roleRating: 350
        }
    ]
};

const PLAYER_MAP = new Map();
PLAYER_MAP.set(NICK.discordId, NICK);
PLAYER_MAP.set(CHRIS.discordId, CHRIS);
PLAYER_MAP.set(JACOB.discordId, JACOB);
PLAYER_MAP.set(CHARLESE.discordId, CHARLESE);
PLAYER_MAP.set(KAYSIA.discordId, KAYSIA);
PLAYER_MAP.set(LANCE.discordId, LANCE);
PLAYER_MAP.set(JOHN.discordId, JOHN);
PLAYER_MAP.set(CODY.discordId, CODY);

const STATS = new Map();
STATS.set(NICK.discordId, {
    name: "Nick",
    gamesPlayed: 0,
    wins: 0,
    loses: 0,
    ratingChanges: [
        {
            ratingName: "Protoss",
            startingValue: NICK.memberRoleRatings[PROTOSS_ROLE_INDEX].roleRating,
            changeValue: 0
        }, {
            ratingName: "Terran",
            startingValue: NICK.memberRoleRatings[TERRAN_ROLE_INDEX].roleRating,
            changeValue: 0
        }, {
            ratingName: "Zerg",
            startingValue: NICK.memberRoleRatings[ZERG_ROLE_INDEX].roleRating,
            changeValue: 0
        }
    ]
});
STATS.set(CHRIS.discordId, {
    name: "Chris",
    gamesPlayed: 0,
    wins: 0,
    loses: 0,
    ratingChanges: [
        {
            ratingName: "Protoss",
            startingValue: CHRIS.memberRoleRatings[PROTOSS_ROLE_INDEX].roleRating,
            changeValue: 0
        }, {
            ratingName: "Terran",
            startingValue: CHRIS.memberRoleRatings[TERRAN_ROLE_INDEX].roleRating,
            changeValue: 0
        }, {
            ratingName: "Zerg",
            startingValue: CHRIS.memberRoleRatings[ZERG_ROLE_INDEX].roleRating,
            changeValue: 0
        }
    ]
});
STATS.set(JACOB.discordId, {
    name: "Jacob",
    gamesPlayed: 0,
    wins: 0,
    loses: 0,
    ratingChanges: [
        {
            ratingName: "Protoss",
            startingValue: JACOB.memberRoleRatings[PROTOSS_ROLE_INDEX].roleRating,
            changeValue: 0
        }, {
            ratingName: "Terran",
            startingValue: JACOB.memberRoleRatings[TERRAN_ROLE_INDEX].roleRating,
            changeValue: 0
        }, {
            ratingName: "Zerg",
            startingValue: JACOB.memberRoleRatings[ZERG_ROLE_INDEX].roleRating,
            changeValue: 0
        }
    ]
});
STATS.set(CHARLESE.discordId, {
    name: "Charlese",
    gamesPlayed: 0,
    wins: 0,
    loses: 0,
    ratingChanges: [
        {
            ratingName: "Protoss",
            startingValue: CHARLESE.memberRoleRatings[PROTOSS_ROLE_INDEX].roleRating,
            changeValue: 0
        }, {
            ratingName: "Terran",
            startingValue: CHARLESE.memberRoleRatings[TERRAN_ROLE_INDEX].roleRating,
            changeValue: 0
        }, {
            ratingName: "Zerg",
            startingValue: CHARLESE.memberRoleRatings[ZERG_ROLE_INDEX].roleRating,
            changeValue: 0
        }
    ]
});
STATS.set(KAYSIA.discordId, {
    name: "Kaysia",
    gamesPlayed: 0,
    wins: 0,
    loses: 0,
    ratingChanges: [
        {
            ratingName: "Protoss",
            startingValue: KAYSIA.memberRoleRatings[PROTOSS_ROLE_INDEX].roleRating,
            changeValue: 0
        }, {
            ratingName: "Terran",
            startingValue: KAYSIA.memberRoleRatings[TERRAN_ROLE_INDEX].roleRating,
            changeValue: 0
        }, {
            ratingName: "Zerg",
            startingValue: KAYSIA.memberRoleRatings[ZERG_ROLE_INDEX].roleRating,
            changeValue: 0
        }
    ]
});
STATS.set(LANCE.discordId, {
    name: "Lance",
    gamesPlayed: 0,
    wins: 0,
    loses: 0,
    ratingChanges: [
        {
            ratingName: "Protoss",
            startingValue: LANCE.memberRoleRatings[PROTOSS_ROLE_INDEX].roleRating,
            changeValue: 0
        }, {
            ratingName: "Terran",
            startingValue: LANCE.memberRoleRatings[TERRAN_ROLE_INDEX].roleRating,
            changeValue: 0
        }, {
            ratingName: "Zerg",
            startingValue: LANCE.memberRoleRatings[ZERG_ROLE_INDEX].roleRating,
            changeValue: 0
        }
    ]
});
STATS.set(JOHN.discordId, {
    name: "John",
    gamesPlayed: 0,
    wins: 0,
    loses: 0,
    ratingChanges: [
        {
            ratingName: "Protoss",
            startingValue: JOHN.memberRoleRatings[PROTOSS_ROLE_INDEX].roleRating,
            changeValue: 0
        }, {
            ratingName: "Terran",
            startingValue: JOHN.memberRoleRatings[TERRAN_ROLE_INDEX].roleRating,
            changeValue: 0
        }, {
            ratingName: "Zerg",
            startingValue: JOHN.memberRoleRatings[ZERG_ROLE_INDEX].roleRating,
            changeValue: 0
        }
    ]
});
STATS.set(CODY.discordId, {
    name: "Cody",
    gamesPlayed: 0,
    wins: 0,
    loses: 0,
    ratingChanges: [
        {
            ratingName: "Protoss",
            startingValue: CODY.memberRoleRatings[PROTOSS_ROLE_INDEX].roleRating,
            changeValue: 0
        }, {
            ratingName: "Terran",
            startingValue: CODY.memberRoleRatings[TERRAN_ROLE_INDEX].roleRating,
            changeValue: 0
        }, {
            ratingName: "Zerg",
            startingValue: CODY.memberRoleRatings[ZERG_ROLE_INDEX].roleRating,
            changeValue: 0
        }
    ]
});

const matches = [
    {
        winningTeamIndex: 0,
        teams: [
            {
                teamMembers: [
                    { ...CHRIS, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...LANCE, selectedMemberRoleIndex: TERRAN_ROLE_INDEX }
                ]
            },
            {
                teamMembers: [
                    { ...JACOB, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...NICK, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...CHARLESE, selectedMemberRoleIndex: TERRAN_ROLE_INDEX }
                ]
            }
        ]
    },
    {
        winningTeamIndex: 0,
        teams: [
            {
                teamMembers: [
                    { ...CHRIS, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...LANCE, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...CHARLESE, selectedMemberRoleIndex: TERRAN_ROLE_INDEX },
                    { ...JOHN, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },

                ]
            },
            {
                teamMembers: [
                    { ...JACOB, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...NICK, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...KAYSIA, selectedMemberRoleIndex: TERRAN_ROLE_INDEX },
                ]
            }
        ]
    },
    {
        winningTeamIndex: 0,
        teams: [
            {
                teamMembers: [
                    { ...CHRIS, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...CHARLESE, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...JOHN, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...JACOB, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                ]
            },
            {
                teamMembers: [
                    { ...LANCE, selectedMemberRoleIndex: TERRAN_ROLE_INDEX },
                    { ...NICK, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...KAYSIA, selectedMemberRoleIndex: TERRAN_ROLE_INDEX },
                ]
            }
        ]
    },
    {
        winningTeamIndex: 0,
        teams: [
            {
                teamMembers: [
                    { ...CHRIS, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...CHARLESE, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...JOHN, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...LANCE, selectedMemberRoleIndex: TERRAN_ROLE_INDEX },
                ]
            },
            {
                teamMembers: [
                    { ...JACOB, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...NICK, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...KAYSIA, selectedMemberRoleIndex: TERRAN_ROLE_INDEX },
                    { ...CODY, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                ]
            }
        ]
    },
    {
        winningTeamIndex: 1,
        teams: [
            {
                teamMembers: [
                    { ...CHRIS, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...KAYSIA, selectedMemberRoleIndex: TERRAN_ROLE_INDEX },
                    { ...JOHN, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...JACOB, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                ]
            },
            {
                teamMembers: [
                    { ...CHARLESE, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...NICK, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...LANCE, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...CODY, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                ]
            }
        ]
    },
    {
        winningTeamIndex: 1,
        teams: [
            {
                teamMembers: [
                    { ...CHRIS, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...KAYSIA, selectedMemberRoleIndex: TERRAN_ROLE_INDEX },
                    { ...JOHN, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...JACOB, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                ]
            },
            {
                teamMembers: [
                    { ...CHARLESE, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...NICK, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...LANCE, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...CODY, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                ]
            }
        ]
    },
    {
        winningTeamIndex: 1,
        teams: [
            {
                teamMembers: [
                    { ...CHRIS, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...NICK, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...KAYSIA, selectedMemberRoleIndex: TERRAN_ROLE_INDEX },
                ]
            },
            {
                teamMembers: [
                    { ...CHARLESE, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...JOHN, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...LANCE, selectedMemberRoleIndex: TERRAN_ROLE_INDEX },
                ]
            }
        ]
    },
    {
        winningTeamIndex: 1,
        teams: [
            {
                teamMembers: [
                    { ...CHRIS, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...KAYSIA, selectedMemberRoleIndex: TERRAN_ROLE_INDEX },
                    { ...JACOB, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...JOHN, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                ]
            },
            {
                teamMembers: [
                    { ...CHARLESE, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...NICK, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...LANCE, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                ]
            }
        ]
    },
    {
        winningTeamIndex: 0,
        teams: [
            {
                teamMembers: [
                    { ...CHRIS, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...NICK, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...JACOB, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },

                ]
            },
            {
                teamMembers: [
                    { ...CHARLESE, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...JOHN, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...LANCE, selectedMemberRoleIndex: TERRAN_ROLE_INDEX },
                    { ...KAYSIA, selectedMemberRoleIndex: TERRAN_ROLE_INDEX },
                ]
            }
        ]
    },
    {
        winningTeamIndex: 0,
        teams: [
            {
                teamMembers: [
                    { ...CHRIS, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...NICK, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...JACOB, selectedMemberRoleIndex: TERRAN_ROLE_INDEX },

                ]
            },
            {
                teamMembers: [
                    { ...CHARLESE, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...LANCE, selectedMemberRoleIndex: TERRAN_ROLE_INDEX },
                    { ...CODY, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                ]
            }
        ]
    },
    {
        winningTeamIndex: 1,
        teams: [
            {
                teamMembers: [
                    { ...CODY, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...NICK, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...CHARLESE, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                ]
            },
            {
                teamMembers: [
                    { ...CHRIS, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...JACOB, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...LANCE, selectedMemberRoleIndex: TERRAN_ROLE_INDEX },
                ]
            }
        ]
    },
    {
        winningTeamIndex: 0,
        teams: [
            {
                teamMembers: [
                    { ...CHRIS, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...CODY, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...LANCE, selectedMemberRoleIndex: TERRAN_ROLE_INDEX },
                ]
            },
            {
                teamMembers: [
                    { ...NICK, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...JACOB, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...CHARLESE, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                ]
            }
        ]
    },
    {
        winningTeamIndex: 0,
        teams: [
            {
                teamMembers: [
                    { ...CHRIS, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...CODY, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...CHARLESE, selectedMemberRoleIndex: ZERG_ROLE_INDEX },

                ]
            },
            {
                teamMembers: [
                    { ...NICK, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                    { ...LANCE, selectedMemberRoleIndex: TERRAN_ROLE_INDEX },
                ]
            }
        ]
    },
    {
        winningTeamIndex: 1,
        teams: [
            {
                teamMembers: [
                    { ...CHRIS, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...NICK, selectedMemberRoleIndex: ZERG_ROLE_INDEX },
                ]
            },
            {
                teamMembers: [
                    { ...JOHN, selectedMemberRoleIndex: PROTOSS_ROLE_INDEX },
                    { ...KAYSIA, selectedMemberRoleIndex: TERRAN_ROLE_INDEX },
                    { ...LANCE, selectedMemberRoleIndex: TERRAN_ROLE_INDEX },
                ]
            }
        ]
    }
];

let matchCount = 1;
for (let match of matches)
{
    for (let team of match.teams)
    {
        team.teamRating = team.teamMembers.reduce((previousValue, currentValue) =>
        {
            return previousValue + currentValue.memberRoleRatings[currentValue.selectedMemberRoleIndex].roleRating;
        }, 0);
    }

    let results = contructMatchResultWrapper(match.winningTeamIndex, match);

    console.log(`==================Match ${matchCount} Updates==================`);
    for (let result of results.teamResults)
    {
        for (let roleRatingUpdate of result.roleRatingUpdates)
        {
            let targetPlayerObject = PLAYER_MAP.get(roleRatingUpdate.playerDiscordId);
            let targetPlayerStats = STATS.get(roleRatingUpdate.playerDiscordId);

            targetPlayerStats.gamesPlayed += 1;
            if (result.result === "Won")
            {
                targetPlayerStats.wins += 1;
            }
            else
            {
                targetPlayerStats.loses += 1;
            }

            for (let playerRole of targetPlayerObject.memberRoleRatings)
            {
                if (playerRole.roleName === roleRatingUpdate.roleName)
                {
                    for (let ratingChangeTracker of targetPlayerStats.ratingChanges)
                    {
                        if (ratingChangeTracker.ratingName === roleRatingUpdate.roleName)
                        {
                            ratingChangeTracker.changeValue += roleRatingUpdate.ratingChange;
                            break;
                        }
                    }

                    console.log(`${targetPlayerObject.name}'s ${playerRole.roleName} going from ${playerRole.roleRating} -> ${playerRole.roleRating + roleRatingUpdate.ratingChange} (${roleRatingUpdate.ratingChange})`);

                    playerRole.roleRating = playerRole.roleRating + roleRatingUpdate.ratingChange;
                    break;
                }
            }
        }
        console.log();
    }

    matchCount++;
}

console.log("==================Overall Stats==================")
for (let statObject of Array.from(STATS.values()))
{
    console.log(`${statObject.name} (G: ${statObject.gamesPlayed} / W: ${((statObject.wins / statObject.gamesPlayed) * 100).toFixed(2)}% / L: ${((statObject.loses / statObject.gamesPlayed) * 100).toFixed(2)}%)`);
    for (let roleChangeTracker of statObject.ratingChanges)
    {
        console.log(`  ${roleChangeTracker.ratingName}: ${roleChangeTracker.startingValue} -> ${roleChangeTracker.startingValue + roleChangeTracker.changeValue}`);
    }
}