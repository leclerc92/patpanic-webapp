import { Input } from "../components/ui/input"; // Attention aux extensions .tsx dans les imports (pas nécessaire)
import { Button } from "@/components/ui/button";
import { Plus, StarIcon } from "lucide-react";
import { useState } from "react";
import type { UseGame } from "@/hooks/useGame";

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

    return (
        <div className="flex flex-col items-center gap-6 p-4 w-full max-w-md mx-auto">
            <h1 className="text-2xl font-bold">Lobby Pat'Panic</h1>

            <div className="flex items-center gap-2 w-full">
                <Input
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    type="text"
                    placeholder="Nom du joueur"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()} // Petit bonus UX
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
                    <div key={p.id} className="flex items-center gap-2 p-3 border rounded-lg bg-card text-card-foreground shadow-sm">
                        <span className="text-2xl">{p.icon}</span>
                        <span className="font-medium">{p.name}</span>
                    </div>
                ))}
            </div>

            {gameManager.players.length >= 2 && (
                <Button
                    onClick={gameManager.startTurn} // Appel direct
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