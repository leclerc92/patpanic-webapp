import {Input} from "../components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Plus} from "lucide-react";
import type {UseGame} from "@/hooks/useGame.ts";

interface homeProps {
    gameManager: UseGame;
}

function Home ({gameManager}:homeProps) {

    console.log(gameManager.gameState);

    return (
        <div className ="flex items-center justify-center w-full">
            <Input type="text" placeholder="Nom du joueur"/>
            <Button variant="outline" size="icon">
                <Plus />
            </Button>
        </div>
    )

}
export default Home;