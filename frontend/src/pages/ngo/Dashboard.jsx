import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { donationAPI, userAPI, taskAPI } from '../../utils/api';

const NGODashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [stats, setStats] = useState({
    available: 0,
    accepted: 0,
    picked: 0,
    delivered: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [donationsRes, volunteersRes] = await Promise.all([
        donationAPI.getAll(),
        userAPI.getVolunteers()
      ]);
      
      setDonations(donationsRes.data);
      setVolunteers(volunteersRes.data);
      
      // Calculate stats
      const available = donationsRes.data.filter(d => d.status === 'pending').length;
      const accepted = donationsRes.data.filter(d => d.status === 'accepted' && d.assignedNGO === user?.id).length;
      const picked = donationsRes.data.filter(d => d.status === 'picked').length;
      const delivered = donationsRes.data.filter(d => d.status === 'delivered' && d.assignedNGO === user?.id).length;
      
      setStats({ available, accepted, picked, delivered });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (donationId) => {
    try {
      await donationAPI.accept(donationId);
      fetchData();
      alert('Donation accepted successfully!');
    } catch (error) {
      alert('Error accepting donation');
    }
  };

  const handleAssignVolunteer = async (donationId, volunteerId) => {
    try {
      await donationAPI.assignVolunteer(donationId, volunteerId);
      fetchData();
      alert('Volunteer assigned successfully!');
    } catch (error) {
      alert('Error assigning volunteer');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-primary-600 text-white px-10 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:text-primary-200 font-bold"
          >
            ← Back
          </button>
          <div className="text-xl font-bold">MealNexus NGO Portal</div>
        </div>
        <ul className="flex gap-5 list-none">
          <li><Link to="/ngo/dashboard" className="text-white font-bold hover:text-primary-200">Dashboard</Link></li>
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
          <p className="text-primary-700">Manage and distribute food efficiently to help communities 🍽️</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-lg shadow text-center">
            <h3 className="text-3xl font-bold text-primary-600">{stats.available}</h3>
            <p className="text-gray-600">Available</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow text-center">
            <h3 className="text-3xl font-bold text-primary-600">{stats.accepted}</h3>
            <p className="text-gray-600">Accepted</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow text-center">
            <h3 className="text-3xl font-bold text-primary-600">{stats.picked}</h3>
            <p className="text-gray-600">Picked</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow text-center">
            <h3 className="text-3xl font-bold text-primary-600">{stats.delivered}</h3>
            <p className="text-gray-600">Delivered</p>
          </div>
        </div>

        {/* Available Donations */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-5 border-b">
            <h3 className="text-xl font-bold text-primary-600">Available Food Donations</h3>
          </div>
          
          <div className="p-5">
            {donations.filter(d => d.status === 'pending').length === 0 ? (
              <p className="text-center text-gray-500 py-10">No pending donations available</p>
            ) : (
              <div className="space-y-4">
                {donations
                  .filter(d => d.status === 'pending')
                  .sort((a, b) => {
                    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                  })
                  .map((donation) => (
                    <div key={donation._id} className="border-l-4 border-primary-500 bg-gray-50 p-4 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-lg">
                              {donation.foodDetails?.foodType} - {donation.foodDetails?.category}
                            </h4>
                            <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(donation.priority)}`}>
                              {donation.priority?.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-gray-600">
                            {donation.foodDetails?.quantity?.value} {donation.foodDetails?.quantity?.unit}
                          </p>
                          <p className="text-gray-600">
                            📍 {donation.pickupLocation?.city}
                          </p>
                          <p className="text-sm text-gray-500">
                            Expires: {new Date(donation.foodDetails?.expiryTime).toLocaleString()}
                          </p>
                          <p className="text-sm text-primary-600">
                            By: {donation.donor?.name} ({donation.donor?.organization?.name || 'Individual'})
                          </p>
                        </div>
                        <button
                          onClick={() => handleAccept(donation._id)}
                          className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* My Accepted Donations */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-5 border-b">
            <h3 className="text-xl font-bold text-primary-600">My Accepted Donations</h3>
          </div>
          
          <div className="p-5">
            {donations.filter(d => d.status !== 'pending' && d.assignedNGO === user?.id).length === 0 ? (
              <p className="text-center text-gray-500 py-10">No accepted donations yet</p>
            ) : (
              <div className="space-y-4">
                {donations
                  .filter(d => d.status !== 'pending' && d.assignedNGO === user?.id)
                  .map((donation) => (
                    <div key={donation._id} className="border-l-4 border-primary-500 bg-gray-50 p-4 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-lg">
                            {donation.foodDetails?.foodType} - {donation.foodDetails?.category}
                          </h4>
                          <p className="text-gray-600">
                            Status: <span className="font-bold capitalize">{donation.status}</span>
                          </p>
                          <p className="text-gray-600">
                            📍 {donation.pickupLocation?.address}
                          </p>
                        </div>
                        {donation.status === 'accepted' && !donation.assignedVolunteer && (
                          <select
                            onChange={(e) => handleAssignVolunteer(donation._id, e.target.value)}
                            className="p-2 border border-primary-300 rounded"
                            defaultValue=""
                          >
                            <option value="">Assign Volunteer</option>
                            {volunteers.map(v => (
                              <option key={v._id} value={v._id}>{v.name}</option>
                            ))}
                          </select>
                        )}
                      </div>
                      {donation.assignedVolunteer && (
                        <p className="mt-2 text-sm text-green-600">
                          ✓ Assigned to: {donation.assignedVolunteer?.name}
                        </p>
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

export default NGODashboard;
