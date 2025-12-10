#!/bin/bash

# Récupère le répertoire du script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Fonction pour lancer une commande dans une nouvelle fenêtre
launch_in_window() {
    local cmd="$1"

    # Détection de l'OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS - Essayer iTerm2 en premier
        if osascript -e 'application "iTerm2" is running' 2>/dev/null; then
            osascript -e "
            tell application \"iTerm2\"
                create window with default profile
                tell current session of current window
                    write text \"$cmd\"
                end tell
            end tell
            " 2>/dev/null
        else
            # Fallback sur Terminal.app
            osascript -e "
            tell application \"Terminal\"
                do script \"$cmd\"
                activate
            end tell
            " 2>/dev/null
        fi
    else
        # Linux - Essayer différents émulateurs de terminal
        if command -v gnome-terminal &> /dev/null; then
            gnome-terminal -- bash -c "$cmd; exec bash"
        elif command -v konsole &> /dev/null; then
            konsole -e bash -c "$cmd; exec bash" &
        elif command -v xterm &> /dev/null; then
            xterm -e bash -c "$cmd; exec bash" &
        else
            echo "Aucun émulateur de terminal supporté trouvé"
            exit 1
        fi
    fi
}

# Lance le backend dans une nouvelle fenêtre
launch_in_window "cd '$SCRIPT_DIR/backend' && npm run start:dev"
