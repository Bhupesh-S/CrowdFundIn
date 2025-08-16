# CrowdFundIn Setup Guide

This guide will help you set up and run the CrowdFundIn MERN stack application.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Stripe account (for payment processing)

## Quick Start

### 1. Clone and Setup
```bash
cd CrowdFundIn
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Update the `.env` file with your actual values:
```env
MONGODB_URI=mongodb://localhost:27017/crowdfundin
JWT_SECRET=your_super_secure_jwt_secret_key_make_it_very_long_and_random_123456789
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
PORT=5000
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
```

The backend will run on http://localhost:5000

### 3. Frontend Setup

Open a new terminal:
```bash
cd frontend
npm install
```

Update the `.env` file with your actual values:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

Start the frontend:
```bash
npm start
```

The frontend will run on http://localhost:3000

## Configuration

### MongoDB Setup

#### Option 1: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Use: `MONGODB_URI=mongodb://localhost:27017/crowdfundin`

#### Option 2: MongoDB Atlas (Cloud)
1. Create account at https://cloud.mongodb.com
2. Create a cluster
3. Get connection string and replace in `.env`

### Stripe Setup

1. Create account at https://stripe.com
2. Go to Dashboard → Developers → API Keys
3. Copy your test keys:
   - Secret key (sk_test_...) → Backend `.env`
   - Publishable key (pk_test_...) → Frontend `.env`

## Testing the Application

### 1. User Registration
- Visit http://localhost:3000/register
- Create accounts with different roles:
  - Donor: Can donate to campaigns
  - Campaign Owner: Can create and manage campaigns

### 2. Campaign Creation
- Login as Campaign Owner
- Navigate to "Create Campaign"
- Fill in campaign details and upload image
- Set goal amount and deadline

### 3. Donation Testing
- Login as Donor
- Browse campaigns
- Click "Donate" on any campaign
- Use Stripe test cards:
  - Success: 4242 4242 4242 4242
  - Decline: 4000 0000 0000 0002

## Project Structure

```
CrowdFundIn/
├── backend/
│   ├── config/          # Database configuration
│   ├── middleware/      # Authentication, file upload
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API endpoints
│   ├── uploads/        # Image uploads
│   └── server.js       # Express server
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable React components
│   │   ├── pages/      # Page components
│   │   ├── context/    # React Context (Auth)
│   │   ├── services/   # API services
│   │   ├── utils/      # Helper functions
│   │   └── styles/     # CSS styles
│   └── public/         # Static files
└── README.md
```

## Features Implemented

✅ **User Authentication**
- JWT-based auth with role-based access
- Login/Register with validation
- Protected routes

✅ **Campaign Management**
- CRUD operations for campaigns
- Image upload functionality
- Progress tracking

✅ **Donation System**
- Stripe payment integration
- Anonymous donations
- Donation history

✅ **Responsive UI**
- Mobile-friendly design
- Interactive components
- Real-time updates

## API Endpoints

### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- GET `/api/auth/profile` - Get user profile
- PUT `/api/auth/profile` - Update profile

### Campaigns
- GET `/api/campaigns` - Get all campaigns
- GET `/api/campaigns/:id` - Get single campaign
- POST `/api/campaigns` - Create campaign
- PUT `/api/campaigns/:id` - Update campaign
- DELETE `/api/campaigns/:id` - Delete campaign

### Donations
- POST `/api/donations/create-payment-intent` - Create payment
- POST `/api/donations/confirm` - Confirm donation
- GET `/api/donations/campaign/:id` - Get campaign donations
- GET `/api/donations/my-donations` - Get user donations

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **Stripe Payment Errors**
   - Verify Stripe keys are correct
   - Use test card numbers for testing

3. **CORS Issues**
   - Backend runs on port 5000
   - Frontend proxy configured in package.json

4. **File Upload Issues**
   - Check backend/uploads directory exists
   - Verify file permissions

### Development Tips

- Use MongoDB Compass to view database
- Check browser console for errors
- Monitor backend logs for API issues
- Use Stripe Dashboard to view test payments

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use production Stripe keys
3. Configure production database
4. Set up proper file storage (AWS S3, etc.)
5. Use HTTPS for security
6. Set up proper error logging

## Support

If you encounter issues:
1. Check this setup guide
2. Verify all environment variables
3. Ensure all dependencies are installed
4. Check console/server logs for errors
