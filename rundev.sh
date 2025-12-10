#!/bin/bash

# Récupère le répertoire du script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Lance le backend dans un nouvel onglet iTerm2
osascript -e "
tell application \"iTerm2\"
    tell current window
        create tab with default profile
        tell current session
            write text \"cd '$SCRIPT_DIR/backend' && npm run start:dev\"
        end tell
    end tell
end tell
"

# Petite pause pour éviter les conflits
sleep 0.5

# Lance le client dans un nouvel onglet iTerm2
osascript -e "
tell application \"iTerm2\"
    tell current window
        create tab with default profile
        tell current session
            write text \"cd '$SCRIPT_DIR/client' && npm run dev\"
        end tell
    end tell
end tell
"