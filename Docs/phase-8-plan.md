# WebDesk Phase 8 — Code Editor System

Goal:

Turn WebDesk into a developer workstation by introducing a fully integrated code editor.

At the end of Phase 8, users should be able to open files from the Inventory app and edit them inside a Monaco-powered editor.

---

# Features

* Monaco Editor
* Multiple tabs
* File opening
* Save support
* Syntax highlighting
* Language detection
* Editor themes
* Unsaved changes tracking
* Search support

---

# Architecture

```text id="u5e4kp"
Inventory
     ↓
Editor Service
     ↓
Monaco Editor
     ↓
Backend File API
```

---

# Libraries

Install:

```bash id="kmkib2"
bun add @monaco-editor/react
```

---

# Folder Structure

```text id="8kdr2r"
src/

apps/
    Editor/

components/
    editor/

services/
    editor.api.ts

store/
    editor.store.ts

types/
    editor.types.ts
```

Backend:

```text id="zy5bns"
Routes/
    Editor.Route.ts

Controller/
    Editor.Controller.ts

Services/
    Editor.Service.ts
```

---

# Task 1 — Editor Application

Create:

```text id="x7k7eb"
apps/Editor/
```

### Todo

* [ ] Editor window
* [ ] Full height layout

---

# Task 2 — Monaco Integration

### Todo

* [ ] Render Monaco
* [ ] Dark theme
* [ ] Automatic resizing

---

# Task 3 — Open Files

From Inventory:

```text id="jquvq9"
Double click file
```

↓

Open Editor.

---

# Task 4 — File Tabs

Support:

```text id="mg1vqf"
index.ts
App.tsx
README.md
```

### Todo

* [ ] Switch tabs
* [ ] Close tabs

---

# Task 5 — Editor Store

State:

```ts id="6jvwjq"
openedFiles
activeFile
```

Actions:

```ts id="ctjtb4"
openFile()
closeFile()
setActiveFile()
```

---

# Task 6 — Language Detection

Examples:

```text id="6x59ah"
ts
tsx
js
json
md
py
java
cpp
go
```

Automatically configure Monaco.

---

# Task 7 — Syntax Highlighting

Enable built-in Monaco support.

---

# Task 8 — Save Files

Shortcut:

```text id="lw4s0n"
Ctrl + S
```

### Todo

* [ ] Send PATCH request
* [ ] Update backend

---

# Task 9 — Unsaved Changes

Show:

```text id="g4gl4s"
index.ts *
```

---

# Task 10 — Search

Support:

```text id="4i4f9j"
Ctrl + F
```

---

# Task 11 — Editor Themes

Themes:

* Cozy Retro
* VS Dark
* Light

---

# Task 12 — Minimap Toggle

Allow:

* Show minimap
* Hide minimap

---

# Task 13 — Word Count

Display:

```text id="em0m1t"
Lines
Characters
Words
```

---

# Task 14 — Auto Save

Modes:

* Off
* Manual
* Every 5 seconds

---

# Task 15 — Keyboard Shortcuts

Support:

```text id="r1u6s0"
Ctrl + S
Ctrl + F
Ctrl + P
```

---

# Task 16 — Editor API

Endpoints:

```http id="6n71cu"
GET /editor/file/:id
PATCH /editor/file/:id
```

---

# Task 17 — File Content Model

Prisma:

```prisma id="z1j4cw"
model FileContent {
  id        String   @id @default(uuid())
  fileId    String   @unique
  content   String
  updatedAt DateTime @updatedAt
}
```

---

# Task 18 — Error Recovery

If save fails:

Show:

```text id="9yqjja"
Failed to save file.
```

---

# Task 19 — Empty State

Display:

```text id="kt2vbj"
Open a file to begin editing.
```

---

# Task 20 — Integration With Inventory

Inventory should:

* Open text files in Editor.
* Pass file metadata.
* Switch active tab if already opened.

---

# Deliverables

At the end of Phase 8:

✅ Monaco Editor

✅ Multiple tabs

✅ File saving

✅ Syntax highlighting

✅ Editor themes

✅ Inventory integration

✅ Unsaved change tracking

---

# Phase 9 Preview

Real-Time Collaboration

* WebSockets
* Presence indicators
* Shared editing
* Redis Pub/Sub
* Conflict resolution
* Live cursors
* Collaborative workspaces
