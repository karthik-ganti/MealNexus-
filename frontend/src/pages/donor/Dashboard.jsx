import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { donationAPI, userAPI } from '../../utils/api';

const DonorDashboard = () => {
  const { user, logout } = useAuth();
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    mealsServed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await donationAPI.getAll({ myDonations: 'true' });
      setDonations(res.data);
      
      // Calculate stats
      const total = res.data.length;
      const pending = res.data.filter(d => d.status === 'pending').length;
      const delivered = res.data.filter(d => d.status === 'delivered').length;
      const mealsServed = res.data.reduce((acc, d) => acc + (d.impact?.mealsServed || 0), 0);
      
      setStats({ total, pending, delivered, mealsServed });
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-orange-500';
      case 'accepted': return 'text-blue-500';
      case 'picked': return 'text-primary-600';
      case 'delivered': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-primary-600 text-white px-10 py-3 flex justify-between items-center">
        <div className="text-xl font-bold">MealNexus</div>
        <ul className="flex gap-5 list-none">
          <li><Link to="/donor/dashboard" className="text-white font-bold hover:text-primary-200">Dashboard</Link></li>
          <li><Link to="/donor/donate" className="text-white font-bold hover:text-primary-200">Donate</Link></li>
          <li><Link to="/donate-money" className="text-white font-bold hover:text-primary-200">Donate Money</Link></li>
        </ul>
        <div className="flex gap-4 items-center">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout} className="bg-primary-500 px-4 py-2 rounded hover:bg-primary-700">
            Logout
          </button>
        </div>
      </nav>

      <div className="w-4/5 mx-auto mt-8">
        {/* Welcome */}
        <div className="bg-primary-50 p-5 rounded-lg border-l-4 border-primary-500 mb-6">
          <h2 className="text-2xl font-bold text-primary-700 mb-2">Welcome, {user?.name} 👋</h2>
          <p className="text-primary-700">
            {stats.delivered > 0 
              ? `Amazing! You helped serve ${stats.mealsServed}+ meals 🎉`
              : stats.total > 0 
                ? 'Your donations are being processed 🚀'
                : 'Start donating and help people ❤️'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-lg shadow text-center">
            <h3 className="text-3xl font-bold text-primary-600">{stats.total}</h3>
            <p className="text-gray-600">Total Donations</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow text-center">
            <h3 className="text-3xl font-bold text-primary-600">{stats.pending}</h3>
            <p className="text-gray-600">Pending</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow text-center">
            <h3 className="text-3xl font-bold text-primary-600">{stats.delivered}</h3>
            <p className="text-gray-600">Delivered</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow text-center">
            <h3 className="text-3xl font-bold text-primary-600">{stats.mealsServed}+</h3>
            <p className="text-gray-600">Meals Served</p>
          </div>
        </div>

        {/* Donations List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-5 border-b flex justify-between items-center">
            <h3 className="text-xl font-bold text-primary-600">My Donations</h3>
            <Link to="/donor/donate" className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600">
              + New Donation
            </Link>
          </div>
          
          <div className="p-5">
            {donations.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No donations yet. Start by making your first donation!</p>
            ) : (
              <div className="space-y-4">
                {donations.map((donation) => (
                  <div key={donation._id} className="border-l-4 border-primary-500 bg-gray-50 p-4 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg">
                          {donation.type === 'food' && donation.foodDetails?.foodType}
                          {donation.type === 'clothes' && 'Clothes Donation'}
                          {donation.type === 'money' && 'Money Donation'}
                        </h4>
                        <p className="text-gray-600">
                          {donation.type === 'food' && `${donation.foodDetails?.quantity?.value} ${donation.foodDetails?.quantity?.unit}`}
                          {donation.type === 'clothes' && `${donation.clothesDetails?.quantity} items`}
                          {donation.type === 'money' && `₹${donation.moneyDetails?.amount}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(donation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`font-bold capitalize ${getStatusColor(donation.status)}`}>
                        {donation.status}
                      </span>
                    </div>
                    {donation.priority && donation.priority !== 'low' && (
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          donation.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          donation.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {donation.priority.toUpperCase()} PRIORITY
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
