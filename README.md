# Digital Shield Academy

A web-based platform for learning essential cybersecurity skills through interactive simulations.

## Features

- Interactive learning modules for cybersecurity awareness
- User progress tracking and gamification
- Real-world simulation scenarios
- Modern, responsive UI

## Learning Modules

1. **Phishing Spotter**: Learn to identify and avoid dangerous phishing emails
2. **MFA Setup Guide**: Master Multi-Factor Authentication setup and usage
3. **Scam Recognizer**: Learn to spot and avoid common phone and SMS scams

## Tech Stack

- Frontend: React with Material-UI
- Backend: Node.js with Express
- Database: MongoDB
- Authentication: JWT

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd digital-shield-academy
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the backend directory
   - Add the following variables:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/digital-shield-academy
     JWT_SECRET=your_jwt_secret_key_here
     NODE_ENV=development
     ```

4. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

5. Start the development servers:

   Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

6. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Project Structure

```
digital-shield-academy/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.