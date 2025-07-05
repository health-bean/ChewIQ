---
title: Component Library
sidebar_position: 5
---

# Component Library

Shared React components for the FILO Health Platform.

## Available Components (3)

### Auth

**Type:** Functional (Hooks)
**Location:** `frontend/web-app/src/components/Auth.jsx`

**Exports:** AuthPage

**Props:** `{
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    userType: 'patient'
  }`


### CorrelationInsights

**Type:** Functional (Hooks)
**Location:** `frontend/web-app/src/components/CorrelationInsights.jsx`

**Exports:** CorrelationInsights


### ProtocolFoods

**Type:** Functional (Hooks)
**Location:** `frontend/web-app/src/components/ProtocolFoods.jsx`

**Exports:** ProtocolFoods

**Props:** `{ protocolId }`



## Usage

```javascript
// Import from shared library
import { ComponentName } from '../shared';

// Use in your app
<ComponentName {...props} />
```

## Component Development

All shared components are located in `frontend/shared/components/`.

### Adding New Components

1. Create component file in `frontend/shared/components/`
2. Export from `frontend/shared/index.js`
3. Document props and usage
4. Test in isolation

---

*Component documentation auto-generated on 7/5/2025*
