# MealNexus - Food Donation Platform

MealNexus is a full-stack web application that connects food donors with NGOs and volunteers to reduce food waste and help feed the needy.

## Features

- **Multi-Role System**: Donor, Volunteer, NGO, and Admin portals
- **Food Donations**: Post surplus food with expiry tracking
- **Clothes Donations**: Donate clothes to those in need
- **Money Donations**: Secure payment integration with tax receipts
- **Real-time Tracking**: Track donation status from pickup to delivery
- **Smart Priority**: Auto-priority based on food expiry time
- **Admin Dashboard**: User verification and platform analytics

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios

### Backend
- Node.js
- Express.js
- JWT Authentication
- Mock Database (for development)
- MongoDB ready (for production)

### Payment
- Razorpay integration

## Project Structure

```
MealNexus-main/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── utils/
│   └── package.json
├── backend/           # Node.js backend
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/MealNexus.git
cd MealNexus
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. In a new terminal, start the frontend:
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Default Login (Mock Data)
You can register new accounts directly through the application. The mock database stores users in memory.

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mealnexus
JWT_SECRET=your_jwt_secret_key_here
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## Deployment

### Frontend (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder

### Backend (Render/Railway/Heroku)
1. Set environment variables
2. Deploy with `npm start`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built for social good
- Helping reduce food waste and feed the needy
- Connecting communities through technology
