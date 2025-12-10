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
        const newSocket = io('http://localhost:3000');
        socketRef.current = newSocket;

        newSocket.on('error', (msg: string) => {
            console.error('❌ Erreur WebSocket:', msg);
            setError(msg);

            // Si c'est une erreur de reconnexion, fallback : créer un nouveau joueur
            if (isReconnecting.current) {
                console.log('⚠️ Échec de reconnexion - tentative de création nouveau joueur...');
                isReconnecting.current = false;

                const savedRoomId = localStorage.getItem(STORAGE_KEYS.ROOM_ID);
                const savedPlayerName = localStorage.getItem(STORAGE_KEYS.PLAYER_NAME);

                if (savedRoomId && savedPlayerName && msg.includes('introuvable')) {
                    console.log('🔄 Création automatique d\'un nouveau joueur avec le nom sauvegardé...');
                    // Nettoyer l'ancien playerId
                    localStorage.removeItem(STORAGE_KEYS.PLAYER_ID);
                    // Rejoindre comme nouveau joueur
                    newSocket.emit('joinGame', { roomId: savedRoomId, name: savedPlayerName });
                    setError(null); // Effacer l'erreur car on tente un fallback
                } else {
                    // Autres erreurs → retour à HOME
                    setCurrentRoomId(null);
                }
            } else {
                // Erreur lors d'un joinGame normal → nettoyer
                setCurrentRoomId(null);
                localStorage.removeItem(STORAGE_KEYS.ROOM_ID);
                localStorage.removeItem(STORAGE_KEYS.PLAYER_ID);
                localStorage.removeItem(STORAGE_KEYS.PLAYER_NAME);
            }
        });

        newSocket.on('connect', () => {
            newSocket.emit('getThemeCapacities');
            newSocket.emit('getAllThemes');
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

        newSocket.on('timerUpdate', (time: number) => {
            setTimer(time);
        });

        newSocket.on('themeCapacities', (data: Record<string, number>) => {
            setThemeCapacities(data);
        });

        newSocket.on('themes', (data: string[]) => {
            setThemes(data);
        });

        return () => { newSocket.disconnect(); };
    }, []);

    const joinGame = (roomId: string, playerName: string) => {
        setError(null);
        // Stocker dans localStorage pour la reconnexion future
        localStorage.setItem(STORAGE_KEYS.ROOM_ID, roomId.toUpperCase());
        localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, playerName);
        // Note: PLAYER_ID sera stocké après réception du gameStatus
        socketRef.current?.emit('joinGame', { roomId, name: playerName });
        // Note: currentRoomId sera défini après réception du gameStatus
    };

    const addPlayer = (name: string) => {
        socketRef.current?.emit('addPlayer', { name });
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
        startPlayerTurn ,
        gotToPlayerInstructions ,
        goToRoundInstructions ,
        setMasterPlayer,
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