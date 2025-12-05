import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useGame = () => {

    const [players, setPlayers] = useState<any[]>([]);
    const [currentCard, setCurrentCard] = useState<any>(null);
    const navigate = useNavigate();

    // Charge les joueurs au démarrage
    useEffect(() => {
        fetch('http://localhost:3000/game/players')
            .then(res => res.json())
            .then(data => setPlayers(data))
            .catch(err => console.error(err));
    }, []);

    const addPlayer = async (name: string) => {
        const res = await fetch('http://localhost:3000/game/addplayer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        if (res.ok) {
            const newPlayer = await res.json();
            setPlayers([...players, newPlayer]);
            return true; // Succès
        }
        return false;
    };

    const startGame = async () => {
        const res = await fetch('http://localhost:3000/game/start', { method: 'POST' });
        if (res.ok) {
            navigate("/game");
        }
    };

    const drawCard = async () => {
        const res = await fetch('http://localhost:3000/game/card');
        if (res.ok) {
            const card = await res.json();
            setCurrentCard(card);
        }
    };

    return { players, currentCard, addPlayer, startGame, drawCard };
};