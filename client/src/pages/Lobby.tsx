import { useState } from "react";
import { Plus, Star, X } from "lucide-react";
import type { UseGame } from "@/hooks/useGame";
import { GameLayout } from "@/components/layout/GameLayout";
import { LobbyPlayerCard } from "@/components/game/LobbyPlayerCard";
import {GameBadge} from "@/components/game/GameBadge.tsx";
import {GameButton} from "@/components/game/GameButton.tsx";
import {GameInput} from "@/components/game/GameInput.tsx";
import {GameCard} from "@/components/game/GameCard.tsx";
import {StickyFooter} from "@/components/layout/StickyFooter.tsx"; // Import du nouveau composant

export default function Lobby({ gameManager }: { gameManager: UseGame }) {
    const [playerName, setPlayerName] = useState("");

    const myPlayer = gameManager.players.find(p => p.socketId === gameManager.mySocketId);
    const amIRegistered = !!myPlayer;

    const hasEnoughPlayers = gameManager.players.length >= 2;
    const allPlayersReady = gameManager.players.length > 0 && gameManager.players.every(p => p.personnalCard);
    const hasEnoughMasters = gameManager.players.find((p)=>p.masterNumber == 2);
    const canStart = hasEnoughPlayers && allPlayersReady && hasEnoughMasters;

    const handleAddPlayer = () => {
        if (!playerName.trim()) return;
        gameManager.addPlayer(playerName);
        setPlayerName("");
    };

    return (
        <GameLayout variant="lobby">
            {/* HEADER */}
            <div className="text-center mt-6 mb-8">
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500 transform -rotate-2">
                    Pat'Panic
                </h1>
                <div className="mt-4 flex justify-center items-center gap-2">
                    <GameBadge variant="default">
                        <Star className="w-3 h-3 mr-1 text-yellow-300 fill-yellow-300" />
                        Code Salle: {gameManager.currentRoomId}
                    </GameBadge>
                    {gameManager.amImaster1 && (
                        <button
                            onClick={gameManager.closeRoom}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-full p-2 transition-colors"
                            title="Fermer la room"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* FORMULAIRE INSCRIPTION (Si je ne suis pas encore inscrit) */}
            {!amIRegistered || gameManager.amImaster1 && (
                <GameCard className="mb-6 p-4 animate-in slide-in-from-top">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-500 uppercase">Rejoins la partie !</label>
                        <div className="flex gap-2">
                            <GameInput
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                placeholder="Ton Pseudo..."
                                onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                            />
                            <GameButton onClick={handleAddPlayer} size="md" className="aspect-square px-0 w-14 shrink-0">
                                <Plus />
                            </GameButton>
                        </div>
                    </div>
                </GameCard>
            )}

            {/* LISTE DES JOUEURS */}
            <div className="space-y-3 pb-4">
                {gameManager.players.length === 0 && (
                    <p className="text-center text-white/50 italic mt-8">En attente de joueurs...</p>
                )}

                {gameManager.players.map((p) => (
                    <LobbyPlayerCard
                        key={p.id}
                        player={p}
                        canPromote={gameManager.amImaster1 || false}
                        visibleEditing={gameManager.amImaster1 && p.socketId === 'invite' || p.socketId === myPlayer?.socketId}
                        players={gameManager.players}
                        themes={gameManager.themes}
                        themeCapacities={gameManager.themeCapacities}
                        onUpdateProfile={gameManager.updatePlayerConfig}
                        onSelectTheme={gameManager.selectTheme}
                        onToggleMaster={()=>gameManager.setMasterPlayer(p.id, 2)}
                        onRemovePlayer={gameManager.removePlayer}
                    />
                ))}
            </div>

            {/* FOOTER ACTIONS */}
            <StickyFooter>
                {gameManager.amImaster1 &&
                <GameButton
                    size="lg"
                    onClick={gameManager.goToRoundInstructions}
                    disabled={!canStart}
                    className={!canStart ? "bg-slate-500/50 text-slate-300 shadow-none" : ""}
                >
                    {canStart ? (
                        <>🚀 LANCER LA PARTIE</>
                    ) : (
                        <span className="text-base font-medium">
                            {!hasEnoughPlayers ? "Attente joueurs (min 2)..." : !hasEnoughMasters ? "Attente des masters " : "Attente des thèmes..."}
                        </span>
                    )}
                </GameButton>
                }
            </StickyFooter>
        </GameLayout>
    );
}