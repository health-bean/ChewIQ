---
title: API Reference
sidebar_position: 3
---

# API Reference

Live API documentation for all implemented endpoints.

**Base URL:** `https://suhoxvn8ik.execute-api.us-east-1.amazonaws.com/dev`

## Authentication

**Status:** ✅ Implemented (JWT)

**Features:**
- Login
- Registration
- Token Refresh
- Logout
- Email Verification


## Endpoints by Category

### Health Protocols

#### GET /api/v1/protocols

Get available health protocols

**Status:** ✅ Working

**Response Time:** 1558ms

**Example:**
```bash
curl "https://suhoxvn8ik.execute-api.us-east-1.amazonaws.com/dev/api/v1/protocols"
```

**Response Schema:**
```json
{
  "protocols": "array[10]",
  "total": "number"
}
```

---

### Food Database

#### GET /api/v1/foods/search

Food database operations

**Status:** ✅ Working

**Response Time:** 65ms

**Example:**
```bash
curl "https://suhoxvn8ik.execute-api.us-east-1.amazonaws.com/dev/api/v1/foods/search"
```

**Response Schema:**
```json
{
  "foods": "array[0]",
  "total": "number",
  "search_term": "string",
  "protocol_id": "object"
}
```

---

#### GET /api/v1/foods/by-protocol

Food database operations

**Status:** ⚠️ Implemented but not working

**Response Time:** 81ms

**Example:**
```bash
curl "https://suhoxvn8ik.execute-api.us-east-1.amazonaws.com/dev/api/v1/foods/by-protocol"
```

**Response Schema:**
```json
{
  "error": "string"
}
```

---

### AI & Analytics

#### GET /api/v1/correlations/insights

AI-powered food-symptom correlations

**Status:** ⚠️ Implemented but not working

**Response Time:** 294ms

**Example:**
```bash
curl "https://suhoxvn8ik.execute-api.us-east-1.amazonaws.com/dev/api/v1/correlations/insights"
```

**Response Schema:**
```json
{
  "error": "string"
}
```

---

### Health Tracking

#### GET /api/v1/timeline/entries

User timeline and logging

**Status:** ✅ Working

**Response Time:** 68ms

**Example:**
```bash
curl "https://suhoxvn8ik.execute-api.us-east-1.amazonaws.com/dev/api/v1/timeline/entries"
```

**Response Schema:**
```json
{
  "entries": "array[0]",
  "total": "number"
}
```

---

#### GET /api/v1/journal/entries

Health journaling

**Status:** ✅ Working

**Response Time:** 63ms

**Example:**
```bash
curl "https://suhoxvn8ik.execute-api.us-east-1.amazonaws.com/dev/api/v1/journal/entries"
```

**Response Schema:**
```json
{
  "entries": "array[0]",
  "total": "number"
}
```

---

### User Management

#### GET /api/v1/users

User management

**Status:** ✅ Working

**Response Time:** 39ms

**Example:**
```bash
curl "https://suhoxvn8ik.execute-api.us-east-1.amazonaws.com/dev/api/v1/users"
```

**Response Schema:**
```json
{
  "user": "object"
}
```

---

#### GET /api/v1/user/protocols

User-specific operations

**Status:** ✅ Working

**Response Time:** 43ms

**Example:**
```bash
curl "https://suhoxvn8ik.execute-api.us-east-1.amazonaws.com/dev/api/v1/user/protocols"
```

**Response Schema:**
```json
{
  "protocols": "array[0]"
}
```

---

#### GET /api/v1/user/preferences

User-specific operations

**Status:** ✅ Working

**Response Time:** 46ms

**Example:**
```bash
curl "https://suhoxvn8ik.execute-api.us-east-1.amazonaws.com/dev/api/v1/user/preferences"
```

**Response Schema:**
```json
{
  "preferences": "object"
}
```

---

### Core

#### GET /api/v1/symptoms/search

Symptom database

**Status:** ✅ Working

**Response Time:** 60ms

**Example:**
```bash
curl "https://suhoxvn8ik.execute-api.us-east-1.amazonaws.com/dev/api/v1/symptoms/search"
```

**Response Schema:**
```json
{
  "symptoms": "array[0]",
  "total": "number",
  "search_term": "string"
}
```

---

#### GET /api/v1/supplements/search

Supplement database

**Status:** ✅ Working

**Response Time:** 49ms

**Example:**
```bash
curl "https://suhoxvn8ik.execute-api.us-east-1.amazonaws.com/dev/api/v1/supplements/search"
```

**Response Schema:**
```json
{
  "supplements": "array[0]",
  "total": "number",
  "search_term": "string"
}
```

---

#### GET /api/v1/medications/search

Medication database

**Status:** ✅ Working

**Response Time:** 48ms

**Example:**
```bash
curl "https://suhoxvn8ik.execute-api.us-east-1.amazonaws.com/dev/api/v1/medications/search"
```

**Response Schema:**
```json
{
  "medications": "array[0]",
  "total": "number",
  "search_term": "string"
}
```

---

#### GET /api/v1/detox-types

Detox protocols

**Status:** ✅ Working

**Response Time:** 50ms

**Example:**
```bash
curl "https://suhoxvn8ik.execute-api.us-east-1.amazonaws.com/dev/api/v1/detox-types"
```

**Response Schema:**
```json
{
  "detox_types": "array[10]",
  "total": "number",
  "search_term": "string"
}
```

---


*API documentation auto-generated on 7/5/2025*
