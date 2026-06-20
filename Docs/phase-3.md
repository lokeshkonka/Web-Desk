# phase-3-plan.md

# WebDesk Phase 3 — Persistence & Workspace System

Goal:

Move WebDesk from a temporary UI into a persistent desktop environment.

At the end of Phase 3, users should be able to refresh the browser and keep their desktop preferences.

---

# Features

* Workspace system
* Theme persistence
* Wallpaper persistence
* Desktop icon persistence
* Local storage support
* Backend synchronization
* PostgreSQL storage
* API integration

---

# Existing Backend

Already available:

* Fastify
* Prisma
* PostgreSQL
* Redis
* Health Route

No Kafka yet.

---

# Task 1 — Workspace Model

Prisma:

```prisma id="1qgj1l"
model Workspace {
  id          String   @id @default(uuid())
  theme       String
  wallpaper   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Todo

* [ ] Create model
* [ ] Run migration
* [ ] Generate Prisma client

---

# Task 2 — Workspace Service

Create:

```text id="d6b4uz"
Services/

Workspace.Service.ts
```

### Todo

* [ ] createWorkspace()
* [ ] getWorkspace()
* [ ] updateWorkspace()

---

# Task 3 — Workspace Controller

Create:

```text id="w7oyul"
Controller/

Workspace.Controller.ts
```

### Todo

* [ ] GET workspace
* [ ] PATCH workspace

---

# Task 4 — Workspace Routes

Create:

```text id="h2w8r2"
Routes/

Workspace.Route.ts
```

Endpoints:

```http id="kwxg4a"
GET /workspace
PATCH /workspace
```

---

# Task 5 — Frontend API Layer

Create:

```text id="22j07m"
src/services/

workspace.api.ts
```

### Todo

* [ ] fetchWorkspace()
* [ ] updateWorkspace()

---

# Task 6 — Theme Persistence

### Todo

Save:

```text id="s0yod1"
dark
light
cozy-retro
```

---

# Task 7 — Wallpaper Persistence

### Todo

Save:

```text id="34q1ep"
cozy-bedroom.png
rainy-city.png
pixel-cafe.png
mountain-cabin.png
```

---

# Task 8 — Local Storage Fallback

Purpose:

Desktop should still work without backend.

### Todo

* [ ] Save theme locally
* [ ] Save wallpaper locally

Priority:

```text id="z33ufl"
Backend → LocalStorage → Default values
```

---

# Task 9 — Zustand Workspace Store

State:

```ts id="aebvt7"
theme
wallpaper
```

Actions:

```ts id="qj7ukm"
setTheme()
setWallpaper()
```

---

# Task 10 — Theme Switcher UI

Create:

```text id="y8v8n2"
Workshop App
```

### Todo

* [ ] Select theme
* [ ] Apply immediately
* [ ] Persist changes

---

# Task 11 — Wallpaper Selector

### Todo

Display:

* Cozy Bedroom
* Rainy City
* Mountain Cabin
* Pixel Cafe
* Pixel Library

---

# Task 12 — Loading State

### Todo

Before workspace loads:

Show:

```text id="4hyjlwm"
Loading WebDesk...
```

---

# Task 13 — Error State

If backend fails:

Fallback to defaults.

---

# Deliverables

At the end of Phase 3:

✅ Themes saved

✅ Wallpapers saved

✅ Workspace API

✅ PostgreSQL integration

✅ Local storage fallback

✅ Settings app working

---

# Phase 4 Preview

Application System

* File Explorer
* Journal
* Terminal
* Application registry
* Dynamic window rendering
* App metadata system
