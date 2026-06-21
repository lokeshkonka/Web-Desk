# WebDesk Phase 10 — Containerized Development Environment

Goal:

Transform WebDesk from a browser desktop into a cloud development platform capable of running isolated projects.

At the end of Phase 10, users should be able to launch sandboxed containers and execute projects safely.

---

# Features

* Container manager
* Docker integration
* Project runtimes
* Resource isolation
* Container lifecycle
* Workspace containers
* Process monitoring
* Container logs

---

# Architecture

```text id="d7r2vn"
Frontend
     ↓
Fastify API
     ↓
Container Service
     ↓
Docker Engine
     ↓
Isolated Containers
```

---

# Technologies

Backend:

```bash id="1r1g1p"
bun add dockerode
```

Infrastructure:

* Docker
* Docker Compose

Future:

* Kubernetes

---

# Folder Structure

Backend:

```text id="v8p2yb"
Services/
    Container.Service.ts

Routes/
    Container.Route.ts

Controller/
    Container.Controller.ts

Adapters/
    Docker.Adapter.ts
```

Frontend:

```text id="tz3v24"
apps/
    Containers/

services/
    container.api.ts
```

---

# Task 1 — Docker Adapter

Create:

```text id="4ttprn"
Docker.Adapter.ts
```

Purpose:

Abstract Docker operations.

Methods:

```ts id="f2l7x6"
createContainer()
startContainer()
stopContainer()
removeContainer()
listContainers()
```

---

# Task 2 — Container Model

Prisma:

```prisma id="r7wkr9"
model Container {
  id          String   @id @default(uuid())
  containerId String
  name        String
  status      String
  createdAt   DateTime @default(now())
}
```

---

# Task 3 — Container APIs

Endpoints:

```http id="d8k6b4"
GET /containers
POST /containers
POST /containers/:id/start
POST /containers/:id/stop
DELETE /containers/:id
```

---

# Task 4 — Default Images

Support:

```text id="k1r5zq"
node:22
python:3.12
golang:1.24
ubuntu:latest
```

---

# Task 5 — Container Lifecycle

States:

```text id="n5rj1s"
created
running
stopped
removed
```

---

# Task 6 — Resource Limits

Configure:

```text id="44mn6u"
CPU limits
Memory limits
Disk limits
```

Example:

```text id="3m0pg2"
1 CPU
512 MB RAM
```

---

# Task 7 — Container Logs

Endpoint:

```http id="x4f6v8"
GET /containers/:id/logs
```

---

# Task 8 — Terminal Integration

Terminal should attach to running containers.

Flow:

```text id="c0rzg6"
xterm.js
      ↓
WebSocket
      ↓
Container shell
```

---

# Task 9 — Workspace Containers

One workspace can own multiple containers.

Example:

```text id="n2i3zb"
backend-container
frontend-container
database-container
```

---

# Task 10 — Container Dashboard

Application:

```text id="x5w2ev"
Containers
```

Display:

* Name
* Status
* Runtime
* Resource usage

---

# Task 11 — Start / Stop Controls

Buttons:

* Start
* Stop
* Restart
* Delete

---

# Task 12 — Health Monitoring

Track:

```text id="r9gxq5"
running
exited
dead
```

---

# Task 13 — Auto Cleanup

Remove:

* Dead containers
* Orphan containers

---

# Task 14 — Volume Support

Persist:

```text id="u0x8gs"
project files
terminal history
```

---

# Task 15 — Network Support

Allow containers to communicate.

Example:

```text id="f7m8tb"
frontend ↔ backend
backend ↔ database
```

---

# Task 16 — Image Pulling

If image doesn't exist:

Automatically pull.

---

# Task 17 — Error Handling

Handle:

* Missing image
* Docker unavailable
* Container crash

---

# Task 18 — Security

Prevent:

* Privileged containers
* Host filesystem access
* Root escalation

---

# Task 19 — Container Metrics

Track:

```text id="q8e7h3"
CPU
RAM
Uptime
```

---

# Task 20 — Redis Cache

Cache:

* Container status
* Container list

---

# Deliverables

At the end of Phase 10:

✅ Docker integration

✅ Container dashboard

✅ Logs

✅ Resource limits

✅ Terminal attachment

✅ Multiple runtimes

✅ Workspace containers

---

# Phase 11 Preview

Kubernetes & Distributed Infrastructure

* Kubernetes
* Pods
* Deployments
* Service discovery
* Kafka
* Scaling
* Observability
* Multi-node architecture
