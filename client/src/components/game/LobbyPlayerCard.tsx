import { useState } from "react";
import { Pencil, Save, X, Clock, Trash2 } from "lucide-react";
import { PlayerAvatar } from "@/components/game/PlayerAvatar";
import type { IPlayer } from "@patpanic/shared";
import { GameCard } from "@/components/game/GameCard.tsx";
import { GameInput } from "@/components/game/GameInput.tsx";
import { GameButton } from "@/components/game/GameButton.tsx";
import { GameSelect } from "@/components/game/GameSelect.tsx";
import { cn } from "@/lib/utils";

interface LobbyPlayerCardProps {
    player: IPlayer;
    themes: string[];
    themeCapacities: Record<string, number>;
    players: IPlayer[];
    onUpdateProfile: (id: string, newName:string, newIcon:string) => void;
    onSelectTheme: (id: string, theme: string) => void;
    onSetPlayerReady: (playerId: string, isReady: boolean) => void;
    onRemovePlayer?: (id: string) => void;
}

export const LobbyPlayerCard = ({
                                    player,
                                    themes,
                                    themeCapacities,
                                    players,
                                    onUpdateProfile,
                                    onSelectTheme,
                                    onRemovePlayer,
                                }: LobbyPlayerCardProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(player.name);
    const [tempIcon, setTempIcon] = useState(player.icon);
    const isReady = !!player.personnalCard;


    // --- LOGIQUE DE SAUVEGARDE ---
    const handleSave = () => {
        if (tempName.trim()) {
            onUpdateProfile(player.id,tempName,tempIcon );
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setTempName(player.name);
        setTempIcon(player.icon);
        setIsEditing(false);
    };

    // --- OPTIONS DU SELECT ---
    const themeOptions = themes.map(theme => {
        const usage = players.filter(p => p.personnalCard?.category === theme).length;
        const max = themeCapacities[theme] || 0;
        const isFull = usage >= max;
        const isCurrent = player.personnalCard?.category === theme;

        return {
            value: theme,
            label: `${theme} (${usage}/${max})`,
            disabled: isFull && !isCurrent
        };
    });

    // --- MODE ÉDITION
    if (isEditing) {
        return (
            <GameCard className="bg-white/95 border-purple-400 border-2" noPadding>
                <div className="p-3 flex flex-col gap-3">
                    <div className="flex gap-2">
                        <div className="w-16">
                            <GameInput
                                value={tempIcon}
                                onChange={(e) => setTempIcon(e.target.value)}
                                className="text-center px-0 text-2xl h-12"
                                maxLength={2}
                            />
                        </div>
                        <div className="flex-1">
                            <GameInput
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                className="h-12"
                                placeholder="Nom..."
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <GameButton size="sm" variant="secondary" onClick={handleCancel}>
                            <X className="w-4 h-4" />
                        </GameButton>
                        <GameButton size="sm" variant="success" onClick={handleSave}>
                            <Save className="w-4 h-4 mr-1" /> Enregistrer
                        </GameButton>
                    </div>
                </div>
            </GameCard>
        );
    }

    // --- MODE LECTURE ---
    return (
        <div className={cn(
            "relative flex flex-col gap-2 p-3 rounded-2xl shadow-sm border transition-all duration-300",
            isReady ? 'bg-emerald-50/90 border-emerald-200' : 'bg-white/90 border-white',
            'ring-2 ring-purple-400 ring-offset-2 ring-offset-purple-800'
        )}>
            {/* Ligne du haut : Avatar + Nom + Roles */}
            <div className="flex items-center gap-3">
                <PlayerAvatar icon={player.icon} size="sm" />

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    {/* Nom + Bouton Edit */}
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-slate-800 truncate leading-tight">
                            {player.name}
                        </span>

                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-1 rounded-full bg-slate-100 hover:bg-purple-100 text-slate-400 hover:text-purple-600 transition-colors"
                            >
                                <Pencil className="w-3 h-3" />
                            </button>

                    </div>

                    {/* Sous-titre : Statut ou Rôle */}
                    <div className="flex items-center gap-2 mt-0.5 h-6">

                            <div className="flex items-center gap-2">

                                    <span className="text-xs font-medium flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        <span className="text-slate-400">Choisit un thème...</span>
                                    </span>

                            </div>

                    </div>
                </div>

                {/* --- ACTIONS DU MASTER --- */}
                <div className="flex gap-2">

                        <button
                            onClick={() => onRemovePlayer?.(player.id)}
                            className="flex items-center justify-center w-10 h-12 rounded-xl border-2 bg-white border-slate-100 hover:border-red-300 hover:bg-red-50 transition-all duration-200 active:scale-95"
                            title="Supprimer le joueur"
                        >
                            <Trash2 className="w-5 h-5 text-slate-300 hover:text-red-500 transition-colors" />
                        </button>

                </div>
            </div>

            {/* --- SELECTION DU THEME --- */}

                <GameSelect
                    value={player.personnalCard?.category || ""}
                    onChange={(e) => onSelectTheme(player.id, e.target.value)}
                    options={themeOptions}
                    className="h-10 text-sm mt-1"
                />


            {player.personnalCard && (
                <div className="bg-emerald-100/50 px-3 py-2 rounded-lg text-sm font-bold text-emerald-800 text-center mt-1">
                    {player.personnalCard?.category}
                </div>
            )}
        </div>
    );
};