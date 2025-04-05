# Judiciary Information System

A Full-Stack Application for managing Court Cases Online

## Features

- Three interfaces : Registrar, Judge, and Lawyer
### 👨‍⚖️ For Registrar
- Add new court cases with defendant and crime details.
- Automatically generate unique Case Identification Number (CIN).
- Assign hearing dates based on available time slots.
- Record adjournments and assign new hearing dates.
- Record hearing summaries and judgment summaries.
- View:
  - ✅ Pending cases 
  - ✅ Resolved cases 
  - ✅ Cases scheduled for hearing on a specific date.
  - ✅ Status of a specific case by CIN.
- Manage user accounts (Create/Delete for lawyers, judges)
- Clearing Bills of Lawyer

### ⚖️ For Judges
- Browse old resolved cases and pending cases for reference.
- Search past case summaries using keywords.

### 👨‍💼 For Lawyers
- Browse past resolved cases (billed per case viewed).
- View case details and summaries for preparation.

---
## Tech Stack

- **Backend**: Node.js, Express, Prisma, PostgreSQL
- **Frontend**: React, Tailwind CSS
- **Authentication**: JWT

