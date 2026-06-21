# WebDesk Phase 6 — Storage Engine & File Persistence

Goal:

Upgrade the Inventory system from metadata-only files to real file storage.

At the end of Phase 6, WebDesk should support uploading, storing, streaming, downloading, deleting, and restoring actual files.

---

# Features

* Real file uploads
* File storage abstraction
* Local storage adapter
* MinIO adapter
* S3-ready architecture
* File streaming
* Trash system
* Restore support
* Compression support
* File size tracking

---

# Philosophy

The file system should not depend on a specific provider.

Instead:

```text
Inventory App
        ↓
Storage Service
        ↓
Storage Adapter
        ↓
Local / MinIO / S3
```

This makes the system extensible.

---

# Folder Structure

Backend:

```text
Services/
    Storage.Service.ts

Adapters/
    LocalStorage.Adapter.ts
    MinIO.Adapter.ts

Uploads/

Routes/
    Upload.Route.ts

Controller/
    Upload.Controller.ts
```

Frontend:

```text
services/
    upload.api.ts
```

---

# Task 1 — Storage Interface

Create:

```ts
interface StorageAdapter {
  upload()
  delete()
  stream()
  exists()
}
```

Purpose:

Allow switching providers without changing business logic.

---

# Task 2 — Local Storage Adapter

Store files in:

```text
backend/uploads/
```

### Todo

* [ ] Save files locally
* [ ] Generate paths
* [ ] Handle folders

---

# Task 3 — Upload API

Endpoints:

```http
POST /upload
DELETE /upload/:id
GET /download/:id
```

---

# Task 4 — File Upload Middleware

Install:

```bash
bun add @fastify/multipart
```

### Todo

* [ ] Accept uploads
* [ ] Validate size
* [ ] Validate extensions

---

# Task 5 — Metadata Synchronization

After upload:

Save to PostgreSQL:

```text
name
size
mimeType
path
createdAt
```

---

# Task 6 — Download System

### Todo

* [ ] Stream files
* [ ] Preserve original names

---

# Task 7 — Trash System

Instead of deleting immediately:

```text
isDeleted = true
```

### Todo

* [ ] Move to trash
* [ ] Hide from explorer

---

# Task 8 — Restore System

### Todo

* [ ] Restore deleted files
* [ ] Restore folders

---

# Task 9 — Permanent Delete

### Todo

* [ ] Remove metadata
* [ ] Remove physical file

---

# Task 10 — File Size Formatting

Examples:

```text
1 KB
3 MB
240 MB
```

---

# Task 11 — Upload Progress

Frontend:

* Progress bar
* Upload percentage

---

# Task 12 — Drag & Drop Upload

Inventory should support:

```text
Drop files here
```

### Todo

* [ ] Drag enter
* [ ] Drag leave
* [ ] Upload on drop

---

# Task 13 — Supported Types

Images:

```text
png
jpg
jpeg
gif
webp
```

Documents:

```text
txt
pdf
md
json
```

Archives:

```text
zip
tar
gz
```

Code:

```text
js
ts
tsx
py
java
cpp
go
```

---

# Task 14 — File Preview

Images:

Preview inside browser.

Text:

Open inside Journal.

---

# Task 15 — Compression Support

Future:

```text
zip folders
extract archives
```

---

# Task 16 — MinIO Adapter

Purpose:

Prepare for object storage.

### Todo

* [ ] Upload
* [ ] Download
* [ ] Delete

---

# Task 17 — S3 Compatibility

Architecture should support:

* AWS S3
* Cloudflare R2
* MinIO

without changing the API layer.

---

# Deliverables

At the end of Phase 6:

✅ Real file uploads

✅ Download support

✅ Local storage adapter

✅ Trash system

✅ Restore support

✅ Upload progress

✅ Drag and drop upload

✅ Metadata synchronization

---

# Phase 7 Preview

Terminal System

* xterm.js
* node-pty
* Shell sessions
* Process manager
* Command history
* Session persistence
* Multiple terminals
* WebSocket communication
