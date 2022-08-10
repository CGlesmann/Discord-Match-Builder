module.exports = {
    MATCH_CAROUSEL_SCROLL_DIRECTION: {
        RIGHT: 1,
        LEFT: -1
    },

    NO_TEAM_WON_INDEX: -1,

    MATCH_RESULT_ACTUAL_AMOUNT: {
        WON: 1,
        DRAW: 0.5,
        LOST: 0,
    },

    APPLICATION_CACHE_KEYS: {
        GENERATED_TEAMS: "GENERATED_TEAMS",
        MATCH_GENERATION_REQUESTS: "MATCH_GENERATION_REQUESTS",
        IN_PROGRESS_MATCH_TRACKERS: "IN_PROGRESS_MATCH_TRACKERS",
        ALL_GAME_DATA: "ALL_GAME_DATA"
    },

    DATABASE_KEYWORDS: {
        MATCH_RESULT: {
            WON: "Won",
            LOST: "Lost"
        }
    }
}