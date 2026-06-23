# Web-Desk Deployment Guide

This document provides a comprehensive, end-to-end guide on deploying the Web-Desk OS application. Since Web-Desk requires a persistent file system, a database, WebSockets (for the terminal and real-time features), and static file serving, the deployment is split into two logical parts:

1.  **Frontend**: Hosted statically on Netlify.
2.  **Backend**: Hosted in a Docker Container (e.g., on Render, Railway, or DigitalOcean) because serverless functions (which Netlify uses) do not support persistent WebSockets or PTY terminals.

---

## Part 1: Setting up the Backend Infrastructure

Before deploying the frontend, you must set up the backend and its databases.

### 1. Database (PostgreSQL)
1. Go to a provider like [Supabase](https://supabase.com/), [Neon](https://neon.tech/), or [Render](https://render.com/).
2. Create a new PostgreSQL database.
3. Copy the **Connection String** (URI). This will be your `DATABASE_URL`.

### 2. Cache/WebSockets (Redis)
1. Go to a provider like [Upstash](https://upstash.com/) or [Render](https://render.com/).
2. Create a new Redis database.
3. Copy the **Redis URL**. This will be your `REDIS_URL`.

### 3. File Storage (Backblaze B2)
You have already created your Backblaze B2 bucket and keys! Here are your exact credentials to use in the backend:

*   **MINIO_ENDPOINT:** `s3.us-east-005.backblazeb2.com`
*   **MINIO_PORT:** `443`
*   **MINIO_USE_SSL:** `true`
*   **MINIO_ACCESS_KEY:** `005e257710cb58a0000000001`
*   **MINIO_SECRET_KEY:** `K005t33YPpgoz1fNVpH3Rilbdqc89Lg`
*   **MINIO_BUCKET:** `webdesk-files`

### 4. Deploy the Backend (Docker)
1. Push this repository to GitHub. (Don't worry, this `netlify-steps.md` file is now in `.gitignore` so your secrets won't be pushed!)
2. Log into a container hosting platform like [Railway](https://railway.app/) or [Render](https://render.com/).
3. Create a **New Service** from your GitHub repository.
4. The platform should automatically detect the `Dockerfile` located in the root of the project.
5. In the service settings, add the exact Environment Variables:

| Key | Value |
| :--- | :--- |
| `DATABASE_URL` | *(Your PostgreSQL connection string)* |
| `REDIS_URL` | *(Your Redis connection string)* |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `MINIO_ENDPOINT` | `s3.us-east-005.backblazeb2.com` |
| `MINIO_PORT` | `443` |
| `MINIO_USE_SSL` | `true` |
| `MINIO_ACCESS_KEY` | `005e257710cb58a0000000001` |
| `MINIO_SECRET_KEY` | `K005t33YPpgoz1fNVpH3Rilbdqc89Lg` |
| `MINIO_BUCKET` | `webdesk-files` |

6. Deploy the backend service.
7. Once deployed, copy the **public URL** of your backend (e.g., `https://webdesk-backend.up.railway.app`). You will need this for the Frontend.

---

## Part 2: Deploying the Frontend on Netlify

Now that your backend is running, you can deploy the visual OS interface to Netlify.

### 1. Create the Netlify Project
1. Log into [Netlify](https://app.netlify.com/).
2. Click **Add new site** -> **Import an existing project**.
3. Connect your GitHub account and select your `Web-Desk` repository.

### 2. Configure Build Settings
On the deployment configuration screen, enter the exact values below:

*   **Branch to deploy:** `main`
*   **Base directory:** `frontend`
*   **Build command:** `npm run build`
*   **Publish directory:** `frontend/dist`
*   **Functions directory:** *(Leave completely blank)*

### 3. Configure Frontend Environment Variables
Scroll down to **Environment variables** on the same page (or add them via Site Settings later):

1. Click **Add variable**.
2. **Key:** `VITE_API_URL`
3. **Value:** `<YOUR_BACKEND_URL_FROM_PART_1>` *(e.g., `https://webdesk-backend.up.railway.app`. Do not include a trailing slash)*

### 4. Deploy!
1. Click **Deploy site**.
2. Netlify will download the repository, enter the `frontend` folder, install dependencies, and run `npm run build`.
3. Thanks to the `netlify.toml` file already included in the repository root, Netlify will properly handle all React routing redirects.

---

## Part 3: GitHub Actions (Optional CI/CD)

This repository includes a `.github/workflows/deploy.yml` pipeline.

*   **Automatic Checks:** Every time you push to `main`, GitHub Actions will automatically verify that the Frontend builds correctly and the Backend passes TypeScript checks.
*   **Automatic Docker Builds:** It will build the unified Docker image as a dry-run to ensure your container is always stable.
*   **Netlify Integration:** If you wish to use GitHub Actions to trigger Netlify deployments directly, uncomment the "Deploy to Netlify" step in `deploy.yml`.

## Troubleshooting

*   **WebSocket/Terminal Disconnects:** Ensure your backend hosting provider supports WebSockets (e.g., Render/Railway do natively). If deploying behind Cloudflare or Nginx, ensure WebSocket proxying is enabled.
*   **Blank Screen / 404s on Refresh:** Netlify requires the `/* /index.html 200` rewrite rule. This is already handled by the `netlify.toml` file in the project root.
*   **Uploads Failing:** Ensure your Backblaze CORS settings allow requests from your Netlify domain if you ever connect directly from the frontend (though currently the backend proxies this safely).
