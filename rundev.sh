#!/bin/bash

# Lance le backend dans un nouveau terminal
gnome-terminal --title="Backend" -- bash -c "cd backend && npm run start:dev; exec bash"

# Lance le client dans un nouveau terminal (correction du chemin .client -> client et start -> dev)
gnome-terminal --title="Client" -- bash -c "cd client && npm run dev; exec bash"