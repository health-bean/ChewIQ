# Health Platform

## Platform Summary

Health Platform is a sophisticated Protocol Management & Healing Platform designed for chronic illness recovery. Built as a comprehensive monorepo with modern React architecture and JSONB-based flexible data storage.

### Current Statistics
- **Total Files:** 334
- **Directories:** 191
- **Last Updated:** 7/19/2025
- **Components:** 19
- **Custom Hooks:** 6
- **API Endpoints:** 4 working, 5 protected

## Live Links

- **Live Application:** [https://main.d45x824boqj7y.amplifyapp.com](https://main.d45x824boqj7y.amplifyapp.com)
- **Source Code:** [https://github.com/deebyrne26/health-platform](https://github.com/deebyrne26/health-platform)
- **API Base:** `https://suhoxvn8ik.execute-api.us-east-1.amazonaws.com/dev`

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- AWS CLI (for deployment)

### Local Development Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/deebyrne26/health-platform
   cd health-platform
   npm install
   ```

2. **Backend Setup**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials
   ./setup-dev-env.sh
   ```

3. **Frontend Setup**
   ```bash
   cd frontend/shared && npm install
   cd ../web-app && npm install
   ```

4. **Start Development**
   ```bash
   npm run dev:web          # Start web app
   npm run docs:dev         # Start documentation
   ```

## Current Features

### Setup Wizard
**Status:** implemented  
**Details:** 4 steps detected

### Timeline Management
**Status:** implemented  
**Details:** API endpoints available

### Protocol Management
**Status:** implemented  
**Details:** API integration complete

### UI Component Library
**Status:** implemented  
**Details:** 6 reusable components

### Data Management Hooks
**Status:** implemented  
**Details:** 6 custom hooks


## Technology Stack

### Frontend
- **Framework:** React 19.1.0
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Components:** 6 shared, 13 app-specific

### Backend
- **API:** https://suhoxvn8ik.execute-api.us-east-1.amazonaws.com/dev
- **Database:** PostgreSQL (planned for production)
- **Hosting:** AWS Lambda + API Gateway
- **Deployment:** AWS Amplify

### Development
- **Monorepo:** Multi-app architecture
- **Documentation:** Auto-generated from code analysis
- **Analysis:** Automated codebase and API analysis

## Supported Health Protocols

Currently supporting 10 health protocols:

- **AIP Core:** Autoimmune Protocol - Elimination Phase. Removes nightshades, grains, legumes, dairy, eggs, nuts, seeds, and certain spices.
- **AIP Modified:** Modified Autoimmune Protocol with selective reintroductions and personalized modifications.
- **Elimination Diet:** Systematic food elimination and reintroduction
- **Low FODMAP:** Eliminates fermentable carbohydrates to manage IBS and digestive symptoms.
- **Low Histamine:** Reduces histamine-rich foods to manage histamine intolerance and allergic reactions.
- **Low Lectin:** Avoids lectin-rich foods to reduce digestive inflammation and autoimmune triggers.
- **Low Oxalate:** Limits oxalate-containing foods to prevent kidney stones and reduce inflammation.
- **No Nightshades:** Removes nightshade vegetables to reduce inflammation in sensitive individuals.
- **Paleo:** Paleolithic diet focusing on whole foods, excluding grains, legumes, and processed foods.
- **Whole30:** 30-day elimination program removing sugar, alcohol, grains, legumes, and dairy.

## Getting Started

1. **For Developers:** See [Development Setup](./development/setup)
2. **Architecture Overview:** See [System Architecture](./architecture/overview)
3. **Component Library:** See [UI Components](./components/overview)
4. **API Integration:** See [API Reference](./api/overview)

---

*This documentation is automatically generated from codebase analysis and updates with every commit.*
