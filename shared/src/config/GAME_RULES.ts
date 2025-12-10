import {IRoundConfig} from "../types/IRoundConfig";

export const GAME_RULES: Record<number, IRoundConfig> = {
    1: {
        title: "L'Anguille",
        icon: "🪱",
        duration: 45,
        maxTurnsPerPlayer: 1,
        responsesPerTurns:[2],
        rules: [
            "Décrivez les cartes librement.",
            "Vous pouvez tout dire sauf les mots de la carte.",
            "Pas de limite de mots !"
        ],
        tips: "Soyez rapides, c'est le moment d'apprendre les cartes !",
        color: "blue"
    },
    2: {
        title: "Le Hibou",
        icon: "🦉",
        duration: 30,
        maxTurnsPerPlayer: 3,
        responsesPerTurns:[2,3,4],
        rules: [
            "Un seul mot par carte !",
            "Le mot doit exister (pas de bruitage).",
            "On ne peut pas répéter un mot déjà dit."
        ],
        tips: "Choisissez le mot clé le plus percutant.",
        color: "purple"
    },
    3: {
        title: "L'Abeille",
        icon: "🐝",
        duration: 30,
        maxTurnsPerPlayer: 1,
        responsesPerTurns:[1],
        rules: [
            "Silence absolu !",
            "Mimez l'action ou l'objet.",
            "Bruitages interdits."
        ],
        tips: "Utilisez tout votre corps !",
        color: "orange"
    }
};