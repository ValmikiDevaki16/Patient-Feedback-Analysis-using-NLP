# MediFeedback - Staff Portal Implementation Guide

## Overview

This document outlines the complete Staff Portal system integrated into the MediFeedback application. The system allows patients to give feedback about specific doctors/staff, and staff members can view their feedback and performance analytics.

## New Features Implemented

### 1. Staff Portal Login (Client-Side)

- **File**: `client/src/pages/StaffLogin.jsx`
- Staff members can login with their Staff ID and a common password
- Password is set in `.env` file as `STAFF_PASSWORD`
- Default password: `staff123`

### 2. Staff Dashboard (Client-Side)

- **File**: `client/src/pages/StaffDashboard.jsx`
- Three main tabs:
  - **Overview**: Shows key metrics (total feedback, positive/neutral/negative counts, average rating)
  - **Feedback**: Lists all recent feedback for the staff member
  - **Analysis**: Shows feedback categories, top keywords, and sentiment distribution

### 3. Patient Feedback Form Update

- **File**: `client/src/pages/PatientPortal.jsx`
- Added dropdown to select specific staff member (Doctor/Nurse/Technician)
- Added 5-star rating system for the staff member
- Updated feedback submission to include staff ID and rating

### 4. Updated Role Selection

- **File**: `client/src/pages/RoleSelection.jsx`
- Added Staff Portal as third role option
- Updated grid from 2 columns to 3 columns

### 5. Updated App Routing

- **File**: `client/src/App.jsx`
- Added staff-login and staff-dashboard routes
- Manages staff data state across pages

## Backend Implementation

### New Models

#### Staff Model

- **File**: `server/models/Staff.js`
- Fields:
  - staffId (unique)
  - name
  - role (Doctor, Nurse, Technician, Administrator)
  - department
  - specialization
  - email, phone
  - avatar
  - totalFeedbackCount, averageRating
  - positiveCount, neutralCount, negativeCount

#### Updated Feedback Model

- **File**: `server/models/Feedback.js`
- New fields:
  - `staffId`: Reference to staff member
  - `staffName`: Name of staff member
  - `doctorRating`: 1-5 star rating from patient

### New Routes

#### Staff Authentication Routes

- **File**: `server/routes/staff.js`
- `POST /api/staff/staff-login`: Login with staffId and password
- `GET /api/staff/staff-list`: Get all staff members (for dropdown in patient form)
- `GET /api/staff/staff/:staffId`: Get specific staff member details

#### Staff Feedback Routes

- **File**: `server/routes/staffFeedback.js`
- `GET /api/staff-feedback/my-feedback/:staffId`: Get all feedback for a staff member
- `GET /api/staff-feedback/dashboard/:staffId`: Get comprehensive dashboard data

#### Admin Routes (Updated)

- `GET /api/admin/top-doctors`: Get top 3 performing doctors (sorted by rating)
- `GET /api/admin/all-staff-stats`: Get all staff statistics for admin view

### Updated Server

- **File**: `server/server.js`
- Registered new routes:
  - `/api/staff`
  - `/api/staff-feedback`

## Database Setup

### Creating Staff Members

The system includes 12 pre-configured staff members in `server/seedData.js`:

```javascript
STF001 - Dr. Rajesh Kumar (Emergency - Doctor)
STF002 - Dr. Priya Singh (OPD - Doctor)
STF003 - Dr. Amitabh Verma (Surgery - Doctor)
STF004 - Dr. Neha Patel (IPD - Doctor)
STF005 - Dr. Vikram Desai (Radiology - Doctor)
STF006 - Sister Ananya Das (Emergency - Nurse)
STF007 - Nurse Priya Sharma (IPD - Nurse)
STF008 - Mr. Arjun Mehta (Laboratory - Technician)
STF009 - Ms. Ritika Gupta (Radiology - Technician)
STF010 - Dr. Anil Kapoor (Pharmacy - Doctor)
STF011 - Mr. Suresh Rao (General - Administrator)
STF012 - Dr. Pooja Iyer (General - Doctor)
```

### MongoDB Insert Command

```javascript
// In MongoDB shell or MongoDB Compass
db.staffs.insertMany([
  {
    staffId: "STF001",
    name: "Dr. Rajesh Kumar",
    role: "Doctor",
    department: "Emergency",
    specialization: "Emergency Medicine",
    email: "rajesh.kumar@hospital.com",
    phone: "+91-9876543210",
    avatar: "https://i.pravatar.cc/150?img=1",
    totalFeedbackCount: 0,
    averageRating: 0,
    positiveCount: 0,
    neutralCount: 0,
    negativeCount: 0,
  },
  // ... add remaining staff members from seedData.js
]);
```

## Environment Variables

### Update `.env` File

Add the following variable to your `.env` file:

```
STAFF_PASSWORD=staff123
```

The `.env.example` has been updated to include this.

## Usage Flow

### For Patients:

1. Click "Patient Portal" from role selection
2. Enter patient name and ID
3. Select department
4. **NEW**: Select specific staff member from dropdown
5. **NEW**: Rate the staff member (1-5 stars, optional)
6. Enter feedback about the staff member
7. Submit

### For Staff:

1. Click "Staff Portal" from role selection
2. Enter your Staff ID (e.g., STF001)
3. Enter password (default: staff123)
4. Login
5. View your feedback dashboard with:
   - Overview of all feedback metrics
   - Individual feedback entries with patient names and ratings
   - Analysis of feedback by category and keywords

### For Admins:

1. Click "Admin Dashboard" from role selection
2. Enter admin password
3. In the dashboard, view:
   - **Overview**: General analytics
   - **Top Doctors**: New section showing top 3 performing staff (sortable by rating)
   - **All Staff Stats**: See all staff members with their performance metrics

## API Endpoints Summary

### Staff Authentication

- `POST /api/staff/staff-login`

  - Body: `{ staffId, password }`
  - Returns: Staff member details if successful

- `GET /api/staff/staff-list`

  - Returns: Array of all staff members

- `GET /api/staff/staff/:staffId`
  - Returns: Specific staff member details

### Staff Feedback

- `GET /api/staff-feedback/my-feedback/:staffId`

  - Returns: All feedback for staff member with stats

- `GET /api/staff-feedback/dashboard/:staffId`
  - Returns: Comprehensive dashboard data (stats, categories, keywords, trends)

### Admin Features

- `GET /api/admin/top-doctors`

  - Returns: Top 3 performing staff members

- `GET /api/admin/all-staff-stats`
  - Returns: All staff with their performance metrics

## Key Features

✅ **12 Pre-configured Staff Members**: Ready-to-use list of doctors, nurses, technicians, and administrators

✅ **Common Password System**: All staff use the same password (configurable in .env) but login with their unique ID

✅ **Patient Feedback for Specific Staff**: Patients can now target feedback to specific staff members

✅ **Staff Performance Ratings**: 1-5 star system for rating staff members

✅ **Comprehensive Staff Dashboard**:

- Overview with key metrics
- Detailed feedback listing
- Analysis with category breakdown and keyword analysis

✅ **Admin Insights**:

- View top 3 performing doctors
- See all staff performance metrics
- Monitor satisfaction rates

✅ **Sentiment Analysis Integration**: Automatically categorizes feedback sentiment

✅ **Real-time Analytics**: Metrics update as new feedback is submitted

## Testing the System

### Test Login with Demo Credentials

```
Staff ID: STF001 (or any STF001-STF012)
Password: staff123 (or your configured STAFF_PASSWORD)
```

### Test Patient Feedback

1. Submit feedback as a patient
2. Select any staff member from the dropdown
3. Give a 1-5 star rating
4. Submit feedback
5. Login as that staff member to see the feedback

### Admin View

1. Go to Admin Dashboard
2. Look for "Top Doctors" section showing:
   - Top 3 staff by average rating
   - Their total feedback count
   - Satisfaction rate percentage

## File Structure

```
server/
├── models/
│   ├── Staff.js (NEW)
│   ├── Feedback.js (UPDATED)
│   ├── Patient.js
├── routes/
│   ├── staff.js (NEW)
│   ├── staffFeedback.js (NEW)
│   ├── feedback.js (UPDATED)
│   ├── admin.js (UPDATED)
│   ├── auth.js
├── seedData.js (NEW)
├── server.js (UPDATED)

client/
├── src/
│   ├── pages/
│   │   ├── StaffLogin.jsx (NEW)
│   │   ├── StaffDashboard.jsx (NEW)
│   │   ├── PatientPortal.jsx (UPDATED)
│   │   ├── RoleSelection.jsx (UPDATED)
│   │   ├── AdminDashboard.jsx
│   ├── App.jsx (UPDATED)
```

## Configuration

All systems are pre-configured and ready to use. Just ensure:

1. MongoDB is running
2. `.env` file has `STAFF_PASSWORD=staff123` (or your chosen password)
3. Staff members are seeded into the database
4. Server is running on port 5000
5. Client is running on its configured port

## Notes

- All staff members share the SAME password (set in .env)
- Each staff differentiates by their unique staffId
- Passwords can be easily changed by updating the .env file
- The system is fully integrated with existing sentiment analysis
- Admin can see actual scores, not just feedback summaries
