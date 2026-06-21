# WebDesk Phase 9 — Real-Time Collaboration

Goal:

Transform WebDesk from a personal workspace into a collaborative environment.

At the end of Phase 9, multiple users should be able to work inside the same workspace simultaneously.

---

# Features

* Real-time updates
* Presence system
* Shared workspaces
* Live cursors
* Collaborative editing
* User awareness
* Redis Pub/Sub
* WebSockets

---

# Architecture

```text id="x6r8jc"
User A
      ↓
WebSocket
      ↓
Backend
      ↓
Redis Pub/Sub
      ↓
Backend
      ↓
WebSocket
      ↓
User B
```

---

# Libraries

Frontend:

```bash id="okivch"
bun add socket.io-client
```

Backend:

```bash id="rqjvbb"
bun add socket.io
```

---

# Folder Structure

Frontend:

```text id="f10o74"
services/
    collaboration.socket.ts

store/
    collaboration.store.ts

components/
    presence/
```

Backend:

```text id="6cnj3m"
Routes/
    Collaboration.Route.ts

Controller/
    Collaboration.Controller.ts

Services/
    Collaboration.Service.ts
```

---

# Task 1 — Workspace Rooms

Users joining:

```text id="ngnt9k"
workspace-1
workspace-2
```

### Todo

* [ ] Join room
* [ ] Leave room

---

# Task 2 — Presence System

Track:

```ts id="vhnc0u"
userId
username
workspaceId
```

---

# Task 3 — Online Users

Display:

```text id="tcl0mb"
3 users online
```

---

# Task 4 — Live Cursor Positions

Broadcast:

```ts id="yj7otk"
x
y
username
```

---

# Task 5 — Cursor Colors

Assign:

* Blue
* Green
* Purple
* Orange

---

# Task 6 — Redis Pub/Sub

Purpose:

Synchronize multiple backend instances.

---

# Task 7 — Editor Collaboration

Broadcast:

```text id="0gvc7e"
insert
delete
update
```

Temporary approach:

Whole document sync.

Future:

Operational Transform.

---

# Task 8 — Inventory Synchronization

Examples:

```text id="kq3mab"
User A creates folder.
```

↓

User B immediately sees folder.

---

# Task 9 — Workspace Events

Broadcast:

* Theme changed
* Wallpaper changed

---

# Task 10 — Notifications

Examples:

```text id="m5j77h"
John joined workspace.
```

```text id="3m0np9"
Sarah left workspace.
```

---

# Task 11 — Activity Feed

Show:

```text id="kpx3rz"
Created folder
Deleted file
Renamed file
```

---

# Task 12 — Typing Indicators

Examples:

```text id="w81oig"
Editing index.ts...
```

---

# Task 13 — Reconnection Logic

If disconnected:

* Retry automatically
* Restore room

---

# Task 14 — Conflict Handling

Temporary:

Last write wins.

Future:

CRDT.

---

# Task 15 — Session Expiration

Remove inactive users automatically.

---

# Task 16 — Collaboration Store

State:

```ts id="tfte2a"
onlineUsers
activeEditors
cursorPositions
```

---

# Task 17 — Presence UI

Show:

* User avatars
* User names
* Status

---

# Task 18 — Redis Events

Channels:

```text id="9i6v0d"
workspace-events
editor-events
presence-events
```

---

# Task 19 — Workspace Ownership

Roles:

* Owner
* Member

Future:

Admin.

---

# Task 20 — Error Recovery

Handle:

* Lost connection
* Duplicate sessions
* Invalid workspace

---

# Deliverables

At the end of Phase 9:

✅ Shared workspaces

✅ Real-time editor

✅ Presence system

✅ Live cursors

✅ Redis Pub/Sub

✅ Activity feed

✅ Online users

---

# Phase 10 Preview

Containerized Development Environment

* Docker containers
* Project execution
* Sandboxed terminals
* Isolated runtimes
* Resource limits
* Container manager
