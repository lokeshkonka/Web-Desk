# phase-2-plan.md

# WebDesk Phase 2 — Desktop Interaction System

Goal:

Transform the static desktop from Phase 1 into an interactive desktop environment.

At the end of Phase 2, WebDesk should feel like a real operating system.

---

# Features

* Desktop icons
* Icon selection
* Double click support
* Window system
* Open / close windows
* Active window state
* Basic dragging
* Taskbar running applications
* Clock
* Menu button

No backend integration yet.

---

# Libraries

Already Installed:

* React
* TypeScript
* Tailwind CSS
* Zustand
* Framer Motion

New Libraries:

```bash
bun add react-rnd
```

Purpose:

* Window dragging
* Window resizing

---

# Folder Structure

```text
src/

components/
│
├── desktop/
├── taskbar/
├── windows/
├── menu/
└── icons/

store/

types/

hooks/
```

---

# Task 1 — Desktop Icons

### Todo

* [ ] Render desktop icons
* [ ] Icon label
* [ ] Hover state
* [ ] Selected state

Icons:

* Terminal
* Journal
* Inventory
* Workshop
* Radio
* Trash

---

# Task 2 — Double Click System

### Todo

* [ ] Double click detection
* [ ] Open applications
* [ ] Prevent accidental opens

---

# Task 3 — Zustand Desktop Store

### Todo

Create:

```ts
openWindow()
closeWindow()
focusWindow()
minimizeWindow()
```

State:

```ts
activeWindowId
openedWindows
```

---

# Task 4 — Window Component

### Todo

* [ ] Window header
* [ ] Title
* [ ] Icon
* [ ] Close button
* [ ] Minimize button
* [ ] Maximize button

---

# Task 5 — Window Animations

### Todo

* [ ] Fade in
* [ ] Scale animation
* [ ] Smooth close

Library:

Framer Motion

---

# Task 6 — Window Dragging

Library:

react-rnd

### Todo

* [ ] Drag window
* [ ] Maintain position
* [ ] Keep inside viewport

---

# Task 7 — Active Window

### Todo

* [ ] Bring focused window to front
* [ ] z-index system

---

# Task 8 — Multiple Windows

### Todo

Support:

* Terminal
* Journal
* Inventory
* Workshop

---

# Task 9 — Taskbar Running Apps

### Todo

* [ ] Show opened apps
* [ ] Highlight active app
* [ ] Restore minimized app

---

# Task 10 — Clock

### Todo

* [ ] Real time clock
* [ ] 12h format
* [ ] Update every second

---

# Task 11 — Menu Button

### Todo

* [ ] Open menu
* [ ] Close menu
* [ ] Animation

---

# Task 12 — Application Placeholders

Create:

```text
apps/

Terminal.tsx
Journal.tsx
Inventory.tsx
Workshop.tsx
```

Temporary content:

```text
Coming Soon
```

---

# Deliverables

At the end of Phase 2:

✅ Desktop icons

✅ Multiple windows

✅ Dragging

✅ Focus system

✅ Taskbar

✅ Running applications

✅ Menu button

✅ Clock

No backend persistence yet.

---

# Phase 3 Preview

Persistence Layer

* Workspace API
* Theme saving
* Wallpaper saving
* Local storage fallback
* Backend integration
* PostgreSQL synchronization
