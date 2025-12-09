import {useEffect, useRef, useState} from "react";
import {GameState, type ICard, type IGameStatus, type IPlayer} from '@patpanic/shared';
import {io, type Socket} from "socket.io-client";

export const useGame = () => {

    const [gameState, setGameState] = useState<GameState>(GameState.LOBBY);
    const [players, setPlayers] = useState<IPlayer[]>([]);
    const [currentPlayer, setCurrentPlayer] = useState<IPlayer>();
    const [mainPlayer, setMainPlayer] = useState<IPlayer>();
    const [master1Player, setMaster1Player] = useState<IPlayer>();
    const [master2Player, setMaster2Player] = useState<IPlayer>();
    const [currentCard, setCurrentCard] = useState<ICard | undefined >(undefined);
    const [currentRound, setCurrentRound] = useState<number>(1);
    const [themeCapacities, setThemeCapacities] = useState<Record<string, number>>({});
    const [themes, setThemes] = useState<string[]>([]);
    const socketRef = useRef<Socket | null>(null);
    const [timer, setTimer] = useState<number>(45);

    const selectTheme = (playerId: string, theme: string) => {
        socketRef.current?.emit('getPersonnalCard', { playerId, theme });
    };


    const updateGameStatus =  (gameStatus:IGameStatus) => {
        setPlayers(gameStatus.players);
        setCurrentPlayer(gameStatus.currentPlayer);
        setMainPlayer(gameStatus.mainPlayer);
        setMaster1Player(gameStatus.mainPlayer);
        setMaster2Player(gameStatus.mainPlayer);
        setCurrentCard(gameStatus.currentCard);
        setCurrentRound(gameStatus.currentRound);
        setGameState(gameStatus.gameState);
    };

    useEffect(() => {
        const newSocket = io('http://localhost:3000');
        socketRef.current = newSocket;

        newSocket.on('gameStatus', (status) => {
            console.log("Mise à jour reçue du serveur !", status);
            updateGameStatus(status);
        });

        newSocket.on('timerUpdate', (time: number) => {
            setTimer(time);
        });

        newSocket.on('connect', () => {
            newSocket.emit('getThemeCapacities');
        });

        newSocket.on('connect', () => {
            newSocket.emit('getAllThemes');
        });

        newSocket.on('themeCapacities', (data: Record<string, number>) => {
            console.log("Capacités reçues :", data);
            setThemeCapacities(data);
        });

        newSocket.on('themes', (data: string[]) => {
            console.log("themes reçues :", data);
            setThemes(data);
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


    return {
        players ,
        themes ,
        currentCard ,
        currentPlayer ,
        mainPlayer ,
        master1Player ,
        master2Player ,
        gameState ,
        addPlayer ,
        startPlayerTurn ,
        gotToPlayerInstructions ,
        goToRoundInstructions ,
        restartGame ,
        validateCard ,
        passCard ,
        timer ,
        currentRound ,
        themeCapacities ,
        selectTheme
    };
};

export type UseGame = ReturnType<typeof useGame>;