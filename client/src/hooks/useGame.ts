import {useEffect, useState} from "react";
import { GameState, type ICard, type IPlayer} from '@patpanic/shared';

export const useGame = () => {

    const [gameState, setGameState] = useState<GameState>(GameState.LOBBY);
    const [players, setPlayers] = useState<IPlayer[]>([]);
    const [currentCard, setCurrentCard] = useState<ICard | null >(null);

    useEffect(() => {
        fetch('http://localhost:3000/game/players')
            .then(res => res.json())
            .then(data => setPlayers(data))
            .catch(err => console.error(err));
        fetch('http://localhost:3000/game/state')
        .then(res => res.json())
        .then(data => setGameState(data))
        .catch(err => console.error(err));
    }, []);

    const startTurn = async () =>  {
        const res = await fetch('http://localhost:3000/game/startTurn', { method: 'POST' });
        if (res.ok) {
            setGameState(GameState.PLAYING);
        }
    }

    const addPlayer = async (name: string) => {
        const res = await fetch('http://localhost:3000/game/addplayer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        if (res.ok) {
            const newPlayer = await res.json();
            setPlayers([...players, newPlayer]);
            console.log(newPlayer);
            return newPlayer;
        }
        return null;
    };


    const drawCard = async () => {
        const res = await fetch('http://localhost:3000/game/card');
        if (res.ok) {
            const card = await res.json();
            setCurrentCard(card);
        }
    };

    return { players, currentCard, gameState, addPlayer, drawCard, startTurn };
};

export type UseGame = ReturnType<typeof useGame>;