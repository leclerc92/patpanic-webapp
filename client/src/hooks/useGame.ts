import {useEffect, useRef, useState} from "react";
import {GameState, type ICard, type IGameStatus, type IPlayer} from '@patpanic/shared';
import {io, type Socket} from "socket.io-client";

// Clés pour localStorage
const STORAGE_KEYS = {
    ROOM_ID: 'patpanic_roomId',
    PLAYER_ID: 'patpanic_playerId',
    PLAYER_NAME: 'patpanic_playerName',
};

export const useGame = () => {

    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [gameState, setGameState] = useState<GameState>(GameState.LOBBY);
    const [players, setPlayers] = useState<IPlayer[]>([]);
    const [currentPlayer, setCurrentPlayer] = useState<IPlayer>();
    const [mainPlayer, setMainPlayer] = useState<IPlayer>();
    const [currentCard, setCurrentCard] = useState<ICard | undefined >(undefined);
    const [currentRound, setCurrentRound] = useState<number>(1);
    const [themeCapacities, setThemeCapacities] = useState<Record<string, number>>({});
    const [themes, setThemes] = useState<string[]>([]);
    const socketRef = useRef<Socket | null>(null);
    const [timer, setTimer] = useState<number>();
    const [gamePaused, setGamePaused] = useState<boolean>(true);

    const selectTheme = (playerId: string, theme: string) => {
        socketRef.current?.emit('getPersonnalCard', { playerId, theme });
    };

    const setPlayerReady = (playerId: string, isReady: boolean) => {
        socketRef.current?.emit('setPlayerReady', { playerId, isReady });
    };

    const updateGameStatus = (gameStatus: IGameStatus) => {
        setCurrentRoomId(gameStatus.roomId);
        setPlayers(gameStatus.players);
        setCurrentPlayer(gameStatus.currentPlayer);
        setMainPlayer(gameStatus.mainPlayer);
        setCurrentCard(gameStatus.currentCard);
        setCurrentRound(gameStatus.currentRound);
        setGameState(gameStatus.gameState);
        setGamePaused(gameStatus.isPaused);
        console.log("updated game status", gameStatus);
    };

    useEffect(() => {
        const newSocket = io(`http://${window.location.hostname}:3000`);
        socketRef.current = newSocket;

        newSocket.on('error', (msg: string) => {
            console.error('❌ Erreur WebSocket:', msg);
            setError(msg);
        });

        newSocket.on('connect', () => {
            if (themes.length === 0 ) {
                socketRef.current?.emit('getThemeCapacities');
                socketRef.current?.emit('getAllThemes');
            }
        });

        newSocket.on('gameStatus', (status) => {
            updateGameStatus(status);
        });

        newSocket.on('updatedPlayerConfig', (status) => {
            localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, status.name);
        });

        newSocket.on('timerUpdate', (time: number) => {
            setTimer(time);
        });

        newSocket.on('themeCapacities', (data: Record<string, number>) => {
            setThemeCapacities(data);
        });

        newSocket.on('themes', (data: string[]) => {
            setThemes(data);
        });

        newSocket.on('roomClosed', () => {
            setError('La room a été fermée par le master');
            setCurrentRoomId(null);
        });

        newSocket.on('playerRemoved', () => {
            setCurrentRoomId(null);
            setPlayers([]);
            setGameState(GameState.LOBBY);
        });

        return () => { newSocket.disconnect(); };
    }, []);

    const joinGame = (roomId: string) => {
        setError(null);
        socketRef.current?.emit('joinGame', {roomId});
        if (themes.length === 0 ) {
            socketRef.current?.emit('getThemeCapacities');
            socketRef.current?.emit('getAllThemes');
        }
    };

    const addPlayer = (name: string) => {
        socketRef.current?.emit('addPlayer', { name });
    };

    const removePlayer = (playerId: string) => {
        socketRef.current?.emit('removePlayer', { playerId });
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

    const pause = () => {
        socketRef.current?.emit('pause');
    };

    const updatePlayerConfig = (playerId: string, newName?: string, newIcon?: string)  => {
        socketRef.current?.emit('updatePlayerConfig', { playerId, newName, newIcon });
    };

    const adjustTurnScore = (playerId: string, adjustment: number) => {
        socketRef.current?.emit('adjustTurnScore', { playerId, adjustment });
    };

    const closeRoom = () => {
        socketRef.current?.emit('closeRoom');
    };


    return {
        joinGame,
        currentRoomId,
        error,
        players ,
        themes ,
        currentCard ,
        currentPlayer ,
        mainPlayer ,
        gameState ,
        addPlayer ,
        removePlayer,
        startPlayerTurn ,
        gotToPlayerInstructions ,
        goToRoundInstructions ,
        restartGame ,
        validateCard ,
        passCard ,
        updatePlayerConfig,
        adjustTurnScore,
        pause,
        timer ,
        currentRound ,
        themeCapacities ,
        selectTheme,
        setPlayerReady,
        gamePaused,
        closeRoom,
    };
};

export type UseGame = ReturnType<typeof useGame>;