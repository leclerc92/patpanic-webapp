import {useEffect, useRef, useState} from "react";
import {GameState, type ICard, type IGameStatus, type IPlayer} from '@patpanic/shared';
import {io, type Socket} from "socket.io-client";

export const useGame = () => {

    const [gameState, setGameState] = useState<GameState>(GameState.LOBBY);
    const [players, setPlayers] = useState<IPlayer[]>([]);
    const [currentPlayer, setCurrentPlayer] = useState<IPlayer>();
    const [mainPlayer, setMainPlayer] = useState<IPlayer>();
    const [currentCard, setCurrentCard] = useState<ICard | undefined >(undefined);
    const [currentRound, setCurrentRound] = useState<number>(1);
    const socketRef = useRef<Socket | null>(null);
    const [timer, setTimer] = useState<number>(45);


    const updateGameStatus =  (gameStatus:IGameStatus) => {
        setPlayers(gameStatus.players);
        setCurrentPlayer(gameStatus.currentPlayer);
        setMainPlayer(gameStatus.mainPlayer);
        setCurrentCard(gameStatus.currentCard);
        setCurrentRound(gameStatus.currentRound);
        setGameState(gameStatus.gameState);
    };

    useEffect(() => {
        const newSocket = io('http://localhost:3000');
        socketRef.current = newSocket;

        // 👂 ÉCOUTE PASSIVE : C'est la seule façon de mettre à jour le jeu !
        newSocket.on('gameStatus', (status) => {
            console.log("Mise à jour reçue du serveur !", status);
            updateGameStatus(status); // Ta fonction magique qui setPlayers, setCard, etc.
        });

        //TIMER LISTENER
        newSocket.on('timerUpdate', (time: number) => {
            setTimer(time);
        });

        return () => { newSocket.disconnect(); };
    }, []);

    const addPlayer = (name: string) => {
        socketRef.current?.emit('addPlayer', { name });
    };

    const gotToPlayerInstructions = () => {
        socketRef.current?.emit('gotToPlayerInstructions');
    }

    const goToRoundInstructions = () => {
        socketRef.current?.emit('goToRoundInstructions');
    }

    const restartGame = () => {
        socketRef.current?.emit('restartGame');
    }

    const startPlayerTurn = () => {
        socketRef.current?.emit('startPlayerTurn');
    };

    const validateCard = () => {
        socketRef.current?.emit('validate');
    };

    const passCard = () => {
        socketRef.current?.emit('pass');
    };


    return { players, currentCard, currentPlayer,mainPlayer, gameState, addPlayer, startPlayerTurn , gotToPlayerInstructions,goToRoundInstructions,restartGame, validateCard, passCard, timer,currentRound};
};

export type UseGame = ReturnType<typeof useGame>;