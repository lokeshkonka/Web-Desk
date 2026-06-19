# phase-1.md

# WebDesk Phase 1 — Frontend Foundation

Goal:

Build the desktop experience first before integrating backend persistence.

---

# Tech Stack

Core:

* React 19
* TypeScript
* Vite

Styling:

* Tailwind CSS v4

State:

* Zustand

Animations:

* Framer Motion

Icons:

* Pixelarticons (PNG assets)

Fallback icons:

* Lucide React

Fonts:

* Pixelify Sans
* JetBrains Mono
Both Fonts are in public/jetbrains-fonts and public/Pixelify_Sans-fonts
---

# Installation
Project Already Created : frontend
Install dependencies:

```bash
bun add tailwindcss @tailwindcss/vite
bun add zustand
bun add framer-motion
bun add lucide-react
```

Fonts:

```html
Pixelify Sans
JetBrains Mono
```

---

# Folder Structure

```text
frontend/

public/
│
├── wallpapers/
├── icons/
│   ├── desktop/
│   ├── windows/
│   ├── taskbar/
│   ├── files/
│   ├── terminal/
│   └── settings/
│
└── sounds/

src/
│
├── components/
├── pages/
├── hooks/
├── store/
├── styles/
├── types/
├── App.tsx
└── main.tsx
```

---

# Libraries Used

| Purpose        | Library       |
| -------------- | ------------- |
| State          | Zustand       |
| Animation      | Framer Motion |
| Fallback Icons | Lucide React  |
| Retro Icons    | Pixelarticons |
| Styling        | Tailwind CSS  |

---

# Phase 1 Tasks

## Task 1 — Setup

### Todo

* [ ] Create Vite app
* [ ] Install dependencies
* [ ] Configure Tailwind
* [ ] Configure fonts

---

## Task 2 — Assets

### Todo

* [ ] Add wallpapers
* [ ] Add icon folders
* [ ] Add sound folders

---

## Task 3 — Wallpaper System

### Todo

* [ ] Fullscreen wallpaper
* [ ] Background container

---

## Task 4 — Desktop

### Todo

* [ ] Desktop container
* [ ] Icon area

---

## Task 5 — Taskbar

### Todo

* [ ] Menu button
* [ ] Running apps area
* [ ] Clock

---

## Task 6 — Desktop Icons

### Todo

* [ ] Terminal
* [ ] Journal
* [ ] Inventory
* [ ] Workshop

---

## Task 7 — Window Component

### Todo

* [ ] Header
* [ ] Title
* [ ] Close button
* [ ] Minimize button
* [ ] Maximize button

---

## Task 8 — Zustand Store

### Todo

* [ ] openWindow()
* [ ] closeWindow()
* [ ] setActiveWindow()

---

## Task 9 — Animations

### Todo

* [ ] Window open animation
* [ ] Hover animation

---

# Public Assets

## Desktop Icons

```text
public/icons/desktop/

terminal.png
inventory.png
journal.png
workshop.png
explorer.png
radio.png
trash.png
```

## Window Controls

```text
public/icons/windows/

close.png
minimize.png
maximize.png
```

## Taskbar

```text
public/icons/taskbar/

menu.png
clock.png
search.png
notification.png
```

## File Manager

```text
public/icons/files/

folder.png
file.png
image.png
video.png
music.png
zip.png
code.png
```

## Terminal

```text
public/icons/terminal/

console.png
command.png
```

## Settings

```text
public/icons/settings/

palette.png
wallpaper.png
theme.png
sound.png
```

---

# Deliverable

At the end of Phase 1:

* Wallpaper
* Desktop
* Taskbar
* Icons
* One Window Component

No backend integration.
