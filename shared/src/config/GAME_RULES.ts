import {IRoundConfig} from "../types/IRoundConfig";

export const GAME_RULES: Record<number, IRoundConfig> = {
    1: {
        title: "L'Anguille",
        icon: "🪱",
        duration: 45,
        maxTurnsPerPlayer: 1,
        responsesPerTurns:[2],
        rules: [
            "Temps imparti de 45 secondes",
            "Tu dois donner deux réponses par carte",
            "Chaque carte te rapporte 1 point",
            "Valide-en autant que possible !!",
            "Tu peux passer la carte sans pénalité",
            "Tu peux mettre pause en appuyant sur la carte pour débattre de la réponse !"
        ],
        tips: "soit rapide pour donner tes réponses !",
        color: "blue"
    },
    2: {
        title: "Le Hibou",
        icon: "🦉",
        duration: 30,
        maxTurnsPerPlayer: 3,
        responsesPerTurns:[2,3,4],
        rules: [
            "Temps imparti de 30 secondes",
            "Tu dois donner le nombre de réponses indiqué à chaque tour",
            "Chaque carte te rapporte le nombre de points restant sur le chrono",
            "Si tu passes une carte, tu perds autant de points que de réponses que tu dois donner",
            "Tu peux mettre pause en appuyant sur la carte pour débattre de la réponse !"
        ],
        tips: "Panique pas et n'hésite pas passer rapidement si tu bug !",
        color: "purple"
    },
    3: {
        title: "L'Abeille",
        icon: "🐝",
        duration: 30,
        maxTurnsPerPlayer: 1,
        responsesPerTurns:[1],
        rules: [
            "Temps imparti de 20 secondes",
            "Cette manche se joue avec ta catégorie personnelle",
            "Tu ne peux pas passer sinon tu gagnes 0 points",
            "Chaque adversaire qui passe ou répète est éliminé et tu gagnes 1 point",
            "Sois le dernier en liste pour gagner 2× le nombre de joueurs en points"
        ],
        tips: "Elimine le plus de joueurs bro !",
        color: "orange"
    }
};