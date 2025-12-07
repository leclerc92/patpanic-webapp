export var GameState;
(function (GameState) {
    GameState["LOBBY"] = "LOBBY";
    GameState["ROUND_INSTRUCTION"] = "ROUND_INSTRUCTION";
    GameState["PLAYER_INSTRUCTION"] = "PLAYER_INSTRUCTION";
    GameState["PLAYER_RESULT"] = "PLAYER_RESULT";
    GameState["PAUSED"] = "PAUSED";
    GameState["PLAYING"] = "PLAYING";
    GameState["ROUND_END"] = "ROUND_END";
    GameState["GAME_END"] = "GAME_END";
})(GameState || (GameState = {}));
