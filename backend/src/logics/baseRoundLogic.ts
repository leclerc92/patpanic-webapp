import { GameService } from '../services/game.service';

export abstract class BaseRoundLogic {
  constructor(protected gameService: GameService) {}

  abstract validateCard(): void;
  abstract passCard(): void;
  abstract initializeRound(): void;
  abstract handleTimerEnd(): void;
  abstract checkEndRound(): boolean;
  abstract generateRoundCards(): void;
  abstract getRoundDuration(): number;
}
