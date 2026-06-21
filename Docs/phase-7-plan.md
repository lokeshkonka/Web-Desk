# WebDesk Phase 7 — Terminal System

Goal:

Bring WebDesk to life by introducing a real browser terminal.

At the end of Phase 7, users should be able to open multiple terminal windows and execute commands through a shell running on the backend.

---

# Features

* Browser terminal
* Multiple terminal windows
* WebSocket communication
* Shell sessions
* Session persistence
* Command history
* Process management

---

# Architecture

```text id="4jq78m"
Frontend
(xterm.js)
      ↓
WebSocket
      ↓
Fastify
      ↓
node-pty
      ↓
bash / zsh
```

---

# Libraries

Frontend:

```bash id="9m6eob"
bun add xterm
bun add xterm-addon-fit
```

Backend:

```bash id="x8qv0r"
bun add node-pty
bun add @fastify/websocket
```

---

# Folder Structure

Frontend:

```text id="0ow0rw"
apps/
    Terminal/

components/
    terminal/

services/
    terminal.socket.ts
```

Backend:

```text id="by8j6x"
Routes/
    Terminal.Route.ts

Controller/
    Terminal.Controller.ts

Services/
    Terminal.Service.ts
```

---

# Task 1 — Terminal Window

Create:

```text id="h1f7eg"
apps/Terminal/
```

### Todo

* [ ] Render xterm.js
* [ ] Fullscreen terminal area

---

# Task 2 — Fit Addon

### Todo

* [ ] Resize terminal automatically
* [ ] Handle window resizing

---

# Task 3 — WebSocket Setup

### Todo

Create:

```text id="qz9r27"
ws://localhost:3000/terminal
```

---

# Task 4 — node-pty Integration

### Todo

Spawn:

```bash id="1uk8o5"
bash
```

or

```bash id="kcmx0k"
zsh
```

depending on host OS.

---

# Task 5 — Input Forwarding

Frontend:

```text id="h67vd9"
Keyboard input
```

↓

Backend

↓

Shell

---

# Task 6 — Output Streaming

Shell output should immediately appear inside xterm.

---

# Task 7 — Multiple Sessions

Support:

```text id="h7m4ki"
terminal-1
terminal-2
terminal-3
```

Each terminal should have its own process.

---

# Task 8 — Session Manager

Store:

```ts id="gbhnl4"
sessionId
pid
createdAt
```

---

# Task 9 — Command History

Future storage:

```text id="d8mx4w"
Redis
```

Temporary:

Memory.

---

# Task 10 — Terminal Themes

Themes:

* Cozy Retro
* Dark
* Light

---

# Task 11 — Process Cleanup

When a terminal closes:

* Kill shell process.
* Remove session.

---

# Task 12 — Terminal Status

Show:

```text id="jigvko"
Connected
Disconnected
Reconnecting
```

---

# Task 13 — Error Handling

If shell crashes:

Show:

```text id="4dawag"
Terminal disconnected.
```

---

# Task 14 — Copy / Paste

Support:

* Ctrl+C
* Ctrl+V

---

# Task 15 — Keyboard Shortcuts

Support:

```text id="jlwmfr"
Ctrl + Shift + C
Ctrl + Shift + V
```

---

# Task 16 — Resize Events

When terminal window changes size:

Update:

```text id="a9kdr8"
rows
cols
```

inside node-pty.

---

# Task 17 — Session Persistence

Future:

Restore terminal sessions after refresh.

---

# Task 18 — Security Layer

Prevent:

* Arbitrary host access
* Root execution
* Dangerous commands (future)

---

# Deliverables

At the end of Phase 7:

✅ Real terminal

✅ xterm.js integration

✅ node-pty backend

✅ Multiple terminal windows

✅ WebSocket communication

✅ Session manager

✅ Resize support

---

# Phase 8 Preview

Code Editor System

* Monaco Editor
* Tabs
* Open files
* Save files
* Syntax highlighting
* Language detection
* Editor themes
* File integration
