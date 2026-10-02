# 🏘️ GramFix

### Community Infrastructure Complaint & Resolution Platform

GramFix is a full-stack civic issue management platform designed to help citizens report local infrastructure problems and enable administrators and field workers to manage, assign, track, and resolve those complaints.

The platform creates a complete workflow between **Citizens → Admins → Field Workers**, making community issue management more organized and transparent.

---

## 🚀 Project Overview

In many communities, infrastructure problems such as damaged roads, broken handpumps, drainage issues, streetlight failures, and other public problems are difficult to report and track.

GramFix provides a centralized platform where:

**Citizen reports an issue → Admin reviews it → Admin assigns a worker → Worker resolves it → Status is updated**

---

## ✨ Current Features

### 🛡️ Admin Dashboard

- View all reported complaints
- View total number of reports
- Track complaint status
- View complaint priority
- View citizen information
- View complaint location
- View available workers
- Assign complaints to workers
- Prevent reassignment of already-assigned complaints
- Monitor resolved complaints
- Admin authentication

### 🛠️ Worker Dashboard

- Secure worker login
- View assigned complaints
- View complaint details
- View priority
- View citizen information
- View location coordinates
- Start assigned work
- Change status to `In Progress`
- Mark complaint as `Resolved`
- View resolved assignments

### 📊 Complaint Management

Each complaint can contain:

- Category
- Title
- Description
- Priority
- Location
- Latitude
- Longitude
- Citizen information
- Assigned worker
- Current status
- Created date
- Updated date

### 🔐 Authentication

GramFix uses:

- JWT authentication
- Role-based access control
- Admin authentication
- Worker authentication
- Protected API routes

---

## 🔄 Complaint Workflow

```text
┌──────────────┐
│    Citizen   │
└──────┬───────┘
       │
       │ Submit Complaint
       ▼
┌──────────────┐
│    Admin     │
└──────┬───────┘
       │
       │ Review & Assign
       ▼
┌──────────────┐
│ Field Worker │
└──────┬───────┘
       │
       │ Start Work
       ▼
┌──────────────┐
│ In Progress  │
└──────┬───────┘
       │
       │ Complete Work
       ▼
┌──────────────┐
│   Resolved   │
└──────────────┘
