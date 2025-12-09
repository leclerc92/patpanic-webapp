import { Input } from "../components/ui/input"; // Attention aux extensions .tsx dans les imports (pas nécessaire)
import { Button } from "@/components/ui/button";
import {Plus, StarIcon} from "lucide-react";
import { useState } from "react";
import type { UseGame } from "@/hooks/useGame";
import {Select,SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";

interface HomeProps {
    gameManager: UseGame;
}

function Home({ gameManager }: HomeProps) {

    const [playerName, setPlayerName] = useState("");


    const handleAddPlayer = () => {
        if (!playerName.trim()) return;

        gameManager.addPlayer(playerName);
        setPlayerName("");
    }

    const getThemeUsage = (theme: string) => {
        return gameManager.players.filter(p => p.personnalCard?.category === theme).length;
    };

    return (
        <div className="flex flex-col items-center gap-6 p-4 w-full max-w-md mx-auto">
            <h1 className="text-2xl font-bold">Lobby Pat'Panic</h1>

            <div className="flex items-center gap-2 w-full">
                <Input
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    type="text"
                    placeholder="Nom du joueur"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                />
                <Button onClick={handleAddPlayer} variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <div className="w-full space-y-2">
                {gameManager.players.length === 0 && (
                    <p className="text-center text-muted-foreground italic">Aucun joueur inscrit</p>
                )}

                {gameManager.players.map((p) => (
                    <div>
                        <div key={p.id} className="flex items-center gap-2 p-3 border rounded-lg bg-card text-card-foreground shadow-sm">
                            <span className="text-2xl">{p.icon}</span>
                            <span className="text-2xl">{p.name}</span>


                            <Select>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>categories</SelectLabel>
                                        {gameManager.themes.map(theme => {
                                            // On utilise les capacités reçues par socket
                                            const max = gameManager.themeCapacities[theme] || 0;
                                            const current = getThemeUsage(theme);

                                            // Logique de désactivation (inchangée)
                                            const isFull = current >= max;

                                            return (
                                                <SelectItem
                                                    key={theme}
                                                    value={theme}
                                                    disabled={isFull}
                                                >
                                                    {theme} ({current}/{max})
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                    </div>


                ))}
            </div>

            {gameManager.players.length >= 2 && (
                <Button
                    onClick={gameManager.goToRoundInstructions} // Appel direct
                    className="w-full mt-4"
                    size="lg"
                >
                    <StarIcon className="mr-2 h-4 w-4" /> Démarrer la partie !
                </Button>
            )}
        </div>
    )
}

export default Home;