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
    const [master1Player, setMaster1Player] = useState<IPlayer>();
    const [master2Player, setMaster2Player] = useState<IPlayer>();
    const [currentCard, setCurrentCard] = useState<ICard | undefined >(undefined);
    const [currentRound, setCurrentRound] = useState<number>(1);
    const [mySocketId, setMySocketId] = useState<string>();
    const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
    const [themeCapacities, setThemeCapacities] = useState<Record<string, number>>({});
    const [themes, setThemes] = useState<string[]>([]);
    const socketRef = useRef<Socket | null>(null);
    const [timer, setTimer] = useState<number>();
    const isReconnecting = useRef(false);
    const [gamePaused, setGamePaused] = useState<boolean>(true);

    const amImaster1 = !!(mySocketId && master1Player && mySocketId === master1Player.socketId);
    const amImaster2 = !!(mySocketId && master2Player && mySocketId === master2Player.socketId);
    const isMyTurn = !!(currentPlayer && mySocketId === currentPlayer.socketId);
    const isMaster1Turn = !!(master1Player && currentPlayer && master1Player.id === currentPlayer.id);
    const isMaster2Turn = !!(master2Player && currentPlayer && master2Player.id === currentPlayer.id);
    const isMaster2Invite = master2Player?.socketId == 'invite';

    const selectTheme = (playerId: string, theme: string) => {
        socketRef.current?.emit('getPersonnalCard', { playerId, theme });
    };


    const updateGameStatus = (gameStatus: IGameStatus) => {
        setPlayers(gameStatus.players);
        setCurrentPlayer(gameStatus.currentPlayer);
        setMainPlayer(gameStatus.mainPlayer);
        setMaster1Player(gameStatus.master1Player);
        setMaster2Player(gameStatus.master2Player);
        setCurrentCard(gameStatus.currentCard);
        setCurrentRound(gameStatus.currentRound);
        setGameState(gameStatus.gameState);
        setGamePaused(gameStatus.isPaused);

        // Trouver notre joueur par socketId et stocker son playerId
        const myPlayer = gameStatus.players.find(p => p.socketId === socketRef.current?.id);
        if (myPlayer && !myPlayerId) {
            setMyPlayerId(myPlayer.id);
            // Sauvegarder dans localStorage pour la reconnexion
            const savedRoomId = localStorage.getItem(STORAGE_KEYS.ROOM_ID);
            if (savedRoomId) {
                localStorage.setItem(STORAGE_KEYS.PLAYER_ID, myPlayer.id);
            }
        }
    };

    useEffect(() => {
        const newSocket = io(`http://${window.location.hostname}:3000`);
        socketRef.current = newSocket;

        newSocket.on('error', (msg: string) => {
            console.error('❌ Erreur WebSocket:', msg);
            localStorage.removeItem(STORAGE_KEYS.ROOM_ID);
            localStorage.removeItem(STORAGE_KEYS.PLAYER_ID);
            localStorage.removeItem(STORAGE_KEYS.PLAYER_NAME);
            setError(msg);
        });

        newSocket.on('connect', () => {

            setMySocketId(newSocket.id);

            // Tentative de reconnexion automatique
            const savedRoomId = localStorage.getItem(STORAGE_KEYS.ROOM_ID);
            const savedPlayerId = localStorage.getItem(STORAGE_KEYS.PLAYER_ID);
            const savedPlayerName = localStorage.getItem(STORAGE_KEYS.PLAYER_NAME);

            if (savedRoomId && savedPlayerId && savedPlayerName) {
                console.log(`🔄 Reconnexion automatique à ${savedRoomId} (playerId: ${savedPlayerId})...`);
                isReconnecting.current = true;
                newSocket.emit('reconnectPlayer', {
                    roomId: savedRoomId,
                    playerId: savedPlayerId,
                });
            } else {
                console.log('ℹ️ Aucune session sauvegardée - affichage de HOME');
            }

            if (themes.length === 0 ) {
                socketRef.current?.emit('getThemeCapacities');
                socketRef.current?.emit('getAllThemes');
            }
        });

        newSocket.on('gameStatus', (status) => {
            console.log("✅ Mise à jour reçue du serveur !", status);

            // Reconnexion réussie
            if (isReconnecting.current) {
                console.log('✅ Reconnexion réussie !');
                isReconnecting.current = false;
            }

            updateGameStatus(status);
            // Définir currentRoomId seulement après avoir reçu un gameStatus valide
            const savedRoomId = localStorage.getItem(STORAGE_KEYS.ROOM_ID);
            if (savedRoomId) {
                setCurrentRoomId(savedRoomId);
            }
        });

        newSocket.on('updatedPlayerConfig', (status) => {
            console.log("✅ Mise à jour reçue du serveur !", status);
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
            console.log('🚪 La room a été fermée par le master');
            // Nettoyer le localStorage
            localStorage.removeItem(STORAGE_KEYS.ROOM_ID);
            localStorage.removeItem(STORAGE_KEYS.PLAYER_ID);
            localStorage.removeItem(STORAGE_KEYS.PLAYER_NAME);
            // Réinitialiser l'état
            setCurrentRoomId(null);
            setError('La room a été fermée par le master');
        });

        newSocket.on('playerRemoved', () => {
            console.log('🚫 Vous avez été supprimé de la room par le master');
            // Nettoyer le localStorage
            localStorage.removeItem(STORAGE_KEYS.ROOM_ID);
            localStorage.removeItem(STORAGE_KEYS.PLAYER_ID);
            localStorage.removeItem(STORAGE_KEYS.PLAYER_NAME);
            // Réinitialiser tous les états
            setCurrentRoomId(null);
            setPlayers([]);
            setGameState(GameState.LOBBY);
            setError('Le master vous a supprimé de la room');
        });

        return () => { newSocket.disconnect(); };
    }, []);

    const joinGame = (roomId: string, playerName: string) => {
        setError(null);
        // Stocker dans localStorage pour la reconnexion future
        localStorage.setItem(STORAGE_KEYS.ROOM_ID, roomId.toUpperCase());
        localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, playerName);
        socketRef.current?.emit('joinGame', {roomId, name: playerName});

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

    const setMasterPlayer = (playerId: string, type:number) => {
        socketRef.current?.emit('setMasterPlayer', { playerId, type});
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
        master1Player ,
        master2Player ,
        gameState ,
        mySocketId,
        addPlayer ,
        removePlayer,
        startPlayerTurn ,
        gotToPlayerInstructions ,
        goToRoundInstructions ,
        setMasterPlayer,
        restartGame ,
        validateCard ,
        passCard ,
        updatePlayerConfig,
        pause,
        timer ,
        currentRound ,
        themeCapacities ,
        selectTheme,
        gamePaused,
        amImaster1,
        amImaster2,
        isMyTurn,
        isMaster1Turn,
        isMaster2Turn,
        closeRoom,
        isMaster2Invite
    };
};

export type UseGame = ReturnType<typeof useGame>;