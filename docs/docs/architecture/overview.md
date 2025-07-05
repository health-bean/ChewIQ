---
title: Architecture Overview
sidebar_position: 6
---

# Architecture Overview

Technical architecture of the FILO Health Platform.

## System Architecture

**Type:** AWS Amplify Fullstack

### Frontend

- **Framework:** React
- **Bundler:** Vite
- **Styling:** Tailwind CSS
- **Components:** 3 shared components


### Backend

- **Runtime:** Node.js
- **Database:** PostgreSQL
- **Authentication:** JWT
- **Deployment:** AWS Lambda


## Project Structure

```
health-platform/
├── frontend/
│   ├── shared/           # Component library
│   └── web-app/          # Main React application
├── backend/
│   └── functions/api/    # API backend
└── docs/                 # Documentation (this site)
```

## Package Management

### shared (`frontend/shared/package.json`)

**Type:** Component Library
**Dependencies:** 1
**Scripts:** test

### web-app (`frontend/web-app/package.json`)

**Type:** React Application
**Dependencies:** 5
**Scripts:** dev, build, lint, preview

### health-platform-test-db (`backend/functions/api/package.json`)

**Type:** Backend API
**Dependencies:** 3
**Scripts:** 


## Database


**Type:** PostgreSQL
**Configuration Files:** .git/objects/00/697ce39be94e3f16dbe9af97d26f57e327a222, .git/objects/00/b523012e860db69bd544f06145302cc23d6ba0, .git/objects/01/0d80bc09c81d694de7541d4e85edbc803dd7ca, .git/objects/01/1d94d7e4356d2c6ae76ca05074fddbac2c29fe, .git/objects/01/cc687afe569bd175125f0da54cbdbb9683c2dd


## Deployment

**Strategy:** AWS Amplify
**Configuration:** `amplify.yml`

---

*Architecture documentation auto-generated on 7/5/2025*
