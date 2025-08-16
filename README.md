# CrowdFundIn - MERN Stack Crowdfunding Platform

A full-stack crowdfunding application built with MongoDB, Express.js, React, and Node.js.

## Features

- User authentication with role-based access (Donor, Campaign Owner, Admin)
- Campaign creation and management
- Donation system with payment gateway integration
- Progress tracking and campaign statistics
- Image upload for campaigns

## Project Structure

```
CrowdFundIn/
├── backend/          # Node.js/Express server
├── frontend/         # React application
└── README.md
```

## Setup Instructions

### Backend
1. Navigate to the backend directory
2. Install dependencies: `npm install`
3. Create `.env` file with required environment variables
4. Start the server: `npm run dev`

### Frontend
1. Navigate to the frontend directory
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

## Environment Variables

Create a `.env` file in the backend directory:
```
MONGODB_URI=mongodb://localhost:27017/crowdfundin
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
PORT=5000
```
