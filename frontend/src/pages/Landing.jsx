import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'donor': return '/donor/dashboard';
      case 'ngo': return '/ngo/dashboard';
      case 'volunteer': return '/volunteer/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/login';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-primary-600 text-white px-12 py-4 flex justify-between items-center">
        <div className="text-xl font-bold">🍽️ MealNexus</div>
        <ul className="flex gap-6 list-none">
          <li><Link to="/" className="text-white font-bold hover:text-primary-200">Home</Link></li>
          <li><a href="#about" className="text-white font-bold hover:text-primary-200">About</a></li>
          <li><a href="#works" className="text-white font-bold hover:text-primary-200">How it Works</a></li>
          <li><Link to="/donate-money" className="text-white font-bold hover:text-primary-200">Donate Money</Link></li>
          {user ? (
            <li><Link to={getDashboardLink()} className="text-white font-bold hover:text-primary-200">Dashboard</Link></li>
          ) : (
            <>
              <li><Link to="/login" className="text-white font-bold hover:text-primary-200">Login</Link></li>
              <li><Link to="/register" className="text-white font-bold hover:text-primary-200">Signup</Link></li>
            </>
          )}
        </ul>
      </nav>

      {/* Hero */}
      <section 
        className="h-[80vh] flex justify-center items-center text-center text-white px-5"
        style={{
          background: `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1504674900247-0877df9cc836")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div>
          <h1 className="text-5xl mb-5 font-bold">Reduce Food Waste, Feed the Needy</h1>
          <p className="text-lg mb-8">Connecting surplus food donors with NGOs and volunteers.</p>
          <div className="flex gap-4 justify-center">
            <Link to="/register" className="bg-primary-500 px-6 py-3 rounded text-white font-bold hover:bg-primary-600 transition">
              Get Started
            </Link>
            <Link to="/login" className="bg-primary-500 px-6 py-3 rounded text-white font-bold hover:bg-primary-600 transition">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-16 px-20 text-center">
        <h2 className="text-3xl mb-5 text-primary-600 font-bold">About MealNexus</h2>
        <p className="max-w-3xl mx-auto text-lg leading-relaxed text-gray-700">
          MealNexus is a smart platform that reduces food waste by connecting donors
          with NGOs and volunteers. It ensures surplus food reaches the needy in time,
          creating a sustainable and hunger-free community.
        </p>
      </section>

      {/* How it Works */}
      <section id="works" className="py-16 px-20 text-center bg-gray-50">
        <h2 className="text-3xl mb-10 text-primary-600 font-bold">How It Works</h2>
        <div className="flex justify-center gap-8 flex-wrap">
          <div className="bg-white p-6 w-64 rounded-lg shadow-lg border-t-4 border-primary-500">
            <h3 className="text-primary-600 font-bold text-xl mb-3">1. Donor Posts Food</h3>
            <p className="text-gray-600">Restaurants or individuals upload surplus food details.</p>
          </div>
          <div className="bg-white p-6 w-64 rounded-lg shadow-lg border-t-4 border-primary-500">
            <h3 className="text-primary-600 font-bold text-xl mb-3">2. NGO Accepts Request</h3>
            <p className="text-gray-600">Nearby NGOs or volunteers accept the pickup request.</p>
          </div>
          <div className="bg-white p-6 w-64 rounded-lg shadow-lg border-t-4 border-primary-500">
            <h3 className="text-primary-600 font-bold text-xl mb-3">3. Food Distributed</h3>
            <p className="text-gray-600">Food is delivered to people in need quickly and safely.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-20 text-center">
        <h2 className="text-3xl mb-10 text-primary-600 font-bold">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="p-5">
            <div className="text-4xl mb-3">🍛</div>
            <h4 className="font-bold text-primary-600">Food Donations</h4>
            <p className="text-sm text-gray-600">Donate surplus food from events & restaurants</p>
          </div>
          <div className="p-5">
            <div className="text-4xl mb-3">👕</div>
            <h4 className="font-bold text-primary-600">Clothes Donations</h4>
            <p className="text-sm text-gray-600">Share clothes with those in need</p>
          </div>
          <div className="p-5">
            <div className="text-4xl mb-3">💰</div>
            <h4 className="font-bold text-primary-600">Money Support</h4>
            <p className="text-sm text-gray-600">Financial contributions with tax benefits</p>
          </div>
          <div className="p-5">
            <div className="text-4xl mb-3">🚚</div>
            <h4 className="font-bold text-primary-600">Volunteer Network</h4>
            <p className="text-sm text-gray-600">Quick pickup and delivery system</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-600 text-white text-center py-4 mt-10">
        <p>© 2026 MealNexus | Built for Social Good</p>
      </footer>
    </div>
  );
};

export default Landing;
