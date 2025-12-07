"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameState = void 0;
var GameState;
(function (GameState) {
    GameState["LOBBY"] = "LOBBY";
    GameState["ROUND_INSTRUCTION"] = "ROUND_INSTRUCTION";
    GameState["PLAYER_INSTRUCTION"] = "PLAYER_INSTRUCTION";
    GameState["PLAYER_RESULT"] = "PLAYER_RESULT";
    GameState["PAUSED"] = "PAUSED";
    GameState["PLAYING"] = "PLAYING";
    GameState["ROUND_END"] = "ROUND_END";
    GameState["GAME_END"] = "GAME_END";
})(GameState || (exports.GameState = GameState = {}));
