# Judiciary Information System

A full-stack application for managing court cases, judges, lawyers, and case proceedings.

## Features

- Three user roles: Registrar, Judge, and Lawyer
- Case management (registration, updates, queries)
- User management (create/delete judges and lawyers)
- Billing system for lawyers

## Tech Stack

- **Backend**: Node.js, Express, Prisma, PostgreSQL
- **Frontend**: React, Tailwind CSS
- **Authentication**: JWT

## Setup and Installation

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- PostgreSQL database (or use the provided Neon PostgreSQL database)

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your environment variables in `.env` file (already provided)

4. Generate Prisma client:
   ```
   npx prisma generate
   ```

5. Initialize the database (when the database is accessible):
   ```
   npx prisma migrate dev --name init
   ```

6. Seed the database with initial users:
   ```
   npm run prisma:seed
   ```

7. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm run dev
   ```

## Default Users

After running the seed script, the following users will be available:

- **Registrar**: username `registrar1`, password `password123`
- **Judge**: username `judge1`, password `password123`
- **Lawyer**: username `lawyer1`, password `password123`

## Application Flow

1. Start at the landing page to select your role (Registrar/Judge/Lawyer)
2. Login with your credentials
3. Access the dashboard based on your role
4. Perform role-specific actions
