export interface IRoundConfig {
    title: string;
    icon: string;
    duration: number;
    maxTurnsPerPlayer: number;
    responsesPerTurns: number[];
    rules: string[];
    tips: string;
    color: string;
}