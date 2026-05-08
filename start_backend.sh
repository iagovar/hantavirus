#!/bin/bash
cd /home/$USER/public_html/hantavirus.iagovar.com/backend

# Check if pocketbase is already running
if pgrep -f "pocketbase serve" > /dev/null
then
    echo "Pocketbase is already running."
else
    # Start pocketbase in background
    nohup ./pocketbase serve --http="127.0.0.1:60123" > pb.log 2>&1 &
    echo "Pocketbase started on port 60123."
fi
