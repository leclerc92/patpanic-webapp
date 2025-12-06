import {useEffect, useState} from "react";
import {GameState, type ICard, type IGameStatus, type IPlayer} from '@patpanic/shared';

export const useGame = () => {

    const [gameState, setGameState] = useState<GameState>(GameState.LOBBY);
    const [players, setPlayers] = useState<IPlayer[]>([]);
    const [currentPlayer, setCurrentPlayer] = useState<IPlayer>();
    const [currentCard, setCurrentCard] = useState<ICard | undefined >(undefined);
    const [currentRound, setCurrentRound] = useState<number>(1);

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
        const res = await fetch('http://localhost:3000/game/startTurn', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
            const gameStatus = await res.json();
            updateGameStatus(gameStatus);
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

    const validateCard = async () => {
        const res = await fetch('http://localhost:3000/game/validateCard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
            const gameStatus = await res.json();
            updateGameStatus(gameStatus);
        }
    };

    const passCard = async () => {
        const res = await fetch('http://localhost:3000/game/passCard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
            const gameStatus = await res.json();
            updateGameStatus(gameStatus);
        }
    };

    const endTurn = async () =>  {
        const res = await fetch('http://localhost:3000/game/endTurn', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
            const gameStatus = await res.json();
            updateGameStatus(gameStatus);
        }
    }

    const updateGameStatus =  (gameStatus:IGameStatus) => {
        setPlayers(gameStatus.players);
        setCurrentPlayer(gameStatus.currentPlayer);
        setCurrentCard(gameStatus.currentCard);
        setCurrentRound(gameStatus.currentRound);
        setGameState(gameStatus.gameState);
    };

    return { players, currentCard, currentPlayer, gameState, addPlayer, drawCard, startTurn , validateCard, passCard, endTurn};
};

export type UseGame = ReturnType<typeof useGame>;