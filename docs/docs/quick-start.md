---
title: Quick Start
sidebar_position: 2
---

# Quick Start Guide

Get the FILO Health Platform running locally in minutes.

## Prerequisites

- Node.js 18+
- npm or yarn
- AWS CLI and Amplify CLI

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd health-platform

# Install dependencies
cd frontend/shared && npm install
cd frontend/web-app && npm install
cd backend/functions/api && npm install

# Start development
cd frontend/web-app && npm run dev
```

## Verify Installation

Test API connectivity:
```bash
curl https://suhoxvn8ik.execute-api.us-east-1.amazonaws.com/dev/api/v1/protocols
```

Expected response: List of health protocols

## Next Steps

1. **[Explore the API](./api/overview)** - Test available endpoints
2. **[Browse Components](./components/overview)** - Use shared components
3. **[Understand Architecture](./architecture/overview)** - System design

## Development URLs

- **Frontend:** http://localhost:5173 (Vite dev server)
- **API:** https://suhoxvn8ik.execute-api.us-east-1.amazonaws.com/dev
- **Documentation:** This site

---

*Installation verified on 7/5/2025*
