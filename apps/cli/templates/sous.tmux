#!/bin/bash
SESSION="sous"

# --- WINDOWS TERMINAL / TMUX COMPATIBILITY ---
# Use modern terminal features for tmux 3.2+
tmux set-option -g default-terminal "xterm-256color"
tmux set-option -as terminal-features ",xterm-256color:RGB"
tmux set-option -as terminal-features ",xterm-256color:clipboard"

# Mouse is OFF as requested (we will revisit later)
tmux set-option -g mouse off
# Rapid escape sequence handling
tmux set-option -s escape-time 0
# Focus events for terminal integration
tmux set-option -g focus-events on

# Basic terminal overrides
tmux set-option -ga terminal-overrides ",xterm*:XT:Ms=\\E]52;%p1%s;%p2%s\\a"

# Set pane border titles
tmux set-option -g pane-border-status top
tmux set-option -g pane-border-format " #P: #T "

# Kill existing session if it exists to start fresh
tmux kill-session -t $SESSION 2>/dev/null

# Create new session
tmux new-session -d -s $SESSION -n "Initializing"

# 1. Initializing Window
tmux select-pane -t $SESSION:0.0 -T "Setup"
tmux send-keys -t $SESSION:0 "pnpm exec sous dev --init-only && tmux display-message 'Initialization Complete! Switching to Local...' && sleep 1 && tmux select-window -t $SESSION:1" C-m

# 2. Local Window
tmux new-window -t $SESSION:1 -n "Local"

# --- LAYOUT CONSTRUCTION ---

# Create Left and Right Columns (50/50 split)
tmux split-window -h -t $SESSION:1

# LEFT COLUMN: Gemini Shell (top) and Shell (bottom)
tmux select-pane -t $SESSION:1.0
tmux split-window -v -t $SESSION:1.0
tmux select-pane -t $SESSION:1.0 -T "Gemini Shell"
# Start Gemini CLI
tmux send-keys -t $SESSION:1.0 "gemini" C-m
tmux select-pane -t $SESSION:1.1 -T "Shell"

# RIGHT COLUMN: Create 3 rows (Top: API, Mid: Web, Bot: Tabs)
tmux select-pane -t $SESSION:1.2
tmux split-window -v -t $SESSION:1.2 # Creates 1.3
tmux select-pane -t $SESSION:1.3
tmux split-window -v -t $SESSION:1.3 # Creates 1.4

# Row 1: API
tmux select-pane -t $SESSION:1.2 -T "API"
tmux send-keys -t $SESSION:1.2 "pnpm dev --filter @sous/api --skip-db" C-m

# Row 2: Web
tmux select-pane -t $SESSION:1.3 -T "Web"
tmux send-keys -t $SESSION:1.3 "pnpm dev --filter @sous/web --skip-db" C-m

# Row 3: Suspended Tabs (Horizontal splits for apps)
tmux select-pane -t $SESSION:1.4
tmux split-window -h -t $SESSION:1.4 # Creates 1.5
tmux split-window -h -t $SESSION:1.4 # Creates 1.6
tmux select-pane -t $SESSION:1.6
tmux split-window -h -t $SESSION:1.6 # Creates 1.7

# Assign labels and commands to bottom row "tabs"
tmux select-pane -t $SESSION:1.4 -T "Docs"
tmux send-keys -t $SESSION:1.4 "echo 'Press Enter to start Docs App'; read; pnpm dev --filter @sous/docs --skip-db" C-m

tmux select-pane -t $SESSION:1.5 -T "Native"
tmux send-keys -t $SESSION:1.5 "echo 'Press Enter to start Native App'; read; pnpm dev --filter @sous/native --skip-db" C-m

tmux select-pane -t $SESSION:1.6 -T "Headless"
tmux send-keys -t $SESSION:1.6 "echo 'Press Enter to start Headless App'; read; pnpm dev --filter @sous/headless --skip-db" C-m

tmux select-pane -t $SESSION:1.7 -T "Watch"
tmux send-keys -t $SESSION:1.7 "echo 'Press Enter to start Watch App'; read; pnpm dev --filter @sous/watch --skip-db" C-m

# Adjust resizing for better balance
tmux select-pane -t $SESSION:1.2
tmux resize-pane -y 12
tmux select-pane -t $SESSION:1.3
tmux resize-pane -y 12

# 3. Remote Window
tmux new-window -t $SESSION:2 -n "Remote"
tmux select-window -t $SESSION:0
tmux attach-session -t $SESSION
