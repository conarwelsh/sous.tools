# Debugging & Logs Guide

This document tracks the locations of various logs and the strategies for debugging the `sous.tools` ecosystem.

## Core Logs

- **Combined God View**: `tail -f ~/.sous/logs/combined.log` (Aggregates API, Web, Docs, and RPi).
- **PM2 API Logs**: `pm2 logs sous-api` or `tail -f ~/.pm2/logs/sous-api-out.log` / `~/.pm2/logs/sous-api-error.log`.
- **PM2 Web Logs**: `pm2 logs sous-web`.
- **PM2 Docs Logs**: `pm2 logs sous-docs`.

## Docker Logs

- **Postgres**: `docker logs -f sous-postgres`.
- **Redis**: `docker logs -f sous-redis`.
- **Traefik**: `docker logs -f sous-proxy`.

## Environment & Config

- **Source of Truth**: Infisical (Manage via `sous env config`).
- **Bootstrap**: `.env` (Infisical credentials only).
- **Verification Script**: `node test-config.mjs` (Verifies what the config package sees).
- **DB Connection Check**: `node test-db-conn.mjs` (Tests raw driver connectivity).

## Common Issues

- **Database Connection Refused**: Often a port conflict between WSL and Host. Check `docker-compose.yml` for port mappings (currently 5433 for Postgres, 6380 for Redis).
- **Authentication Failure**: Verify `DATABASE_URL` in Infisical matches the container password.
- **Hanging Commands**: If a command hangs, check for interactive prompts or use `--non-interactive` flags where available. Avoid `stdio: inherit` in `execSync` for background-prone tasks.

## Database Viewers

- **Postgres (Adminer)**: [http://localhost:8083](http://localhost:8083)
  - **Server**: `postgres` (inside docker) or `127.0.0.1:5433` (from host)
  - **User**: `sous_user`
  - **Password**: `sous_password`
  - **Database**: `sous_db`
- **Redis (RedisInsight)**: [http://localhost:5540](http://localhost:5540)
  - **Host**: `redis` (inside docker) or `127.0.0.1:6380` (from host)
- **MinIO Console**: [http://localhost:9001](http://localhost:9001)
  - **User/Pass**: `minioadmin` / `minioadmin`
- **MailDev**: [http://localhost:1080](http://localhost:1080)
