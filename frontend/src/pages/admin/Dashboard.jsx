import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../utils/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, donationsRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getUsers(),
        adminAPI.getDonations()
      ]);
      
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setDonations(donationsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      await adminAPI.verifyUser(userId);
      fetchData();
      alert('User verified successfully!');
    } catch (error) {
      alert('Error verifying user');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-primary-600 text-white px-10 py-3 flex justify-between items-center">
        <div className="text-xl font-bold">MealNexus Admin</div>
        <div className="flex gap-4 items-center">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout} className="bg-primary-500 px-4 py-2 rounded hover:bg-primary-700">
            Logout
          </button>
        </div>
      </nav>

      <div className="w-4/5 mx-auto mt-8">
        <h2 className="text-2xl font-bold text-primary-600 mb-6">Admin Dashboard</h2>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          {['overview', 'users', 'donations'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded font-bold capitalize ${
                activeTab === tab
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-primary-600 hover:bg-primary-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold text-primary-600 mb-4">Users</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Users:</span>
                  <span className="font-bold">{stats.users.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Donors:</span>
                  <span className="font-bold">{stats.users.donors}</span>
                </div>
                <div className="flex justify-between">
                  <span>Volunteers:</span>
                  <span className="font-bold">{stats.users.volunteers}</span>
                </div>
                <div className="flex justify-between">
                  <span>NGOs:</span>
                  <span className="font-bold">{stats.users.ngos}</span>
                </div>
                <div className="flex justify-between text-orange-600">
                  <span>Pending Verification:</span>
                  <span className="font-bold">{stats.users.pendingVerification}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold text-primary-600 mb-4">Donations</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-bold">{stats.donations.total}</span>
                </div>
                <div className="flex justify-between text-orange-600">
                  <span>Pending:</span>
                  <span className="font-bold">{stats.donations.pending}</span>
                </div>
                <div className="flex justify-between text-blue-600">
                  <span>Accepted:</span>
                  <span className="font-bold">{stats.donations.accepted}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Delivered:</span>
                  <span className="font-bold">{stats.donations.delivered}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold text-primary-600 mb-4">Financial</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Donations:</span>
                  <span className="font-bold">
                    ₹{stats.donations.money[0]?.total || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-5 border-b">
              <h3 className="text-xl font-bold text-primary-600">All Users</h3>
            </div>
            <div className="p-5">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Role</th>
                      <th className="text-left py-2">Verified</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="border-b">
                        <td className="py-3">{u.name}</td>
                        <td className="py-3">{u.email}</td>
                        <td className="py-3 capitalize">{u.role}</td>
                        <td className="py-3">
                          {u.verification?.isVerified ? (
                            <span className="text-green-600">✓ Yes</span>
                          ) : (
                            <span className="text-orange-600">✗ No</span>
                          )}
                        </td>
                        <td className="py-3">
                          {!u.verification?.isVerified && u.role !== 'donor' && (
                            <button
                              onClick={() => handleVerifyUser(u._id)}
                              className="bg-primary-500 text-white px-3 py-1 rounded text-sm hover:bg-primary-600"
                            >
                              Verify
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === 'donations' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-5 border-b">
              <h3 className="text-xl font-bold text-primary-600">All Donations</h3>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                {donations.map((donation) => (
                  <div key={donation._id} className="border-l-4 border-primary-500 bg-gray-50 p-4 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold">
                          {donation.type === 'food' && `${donation.foodDetails?.foodType} - ${donation.foodDetails?.category}`}
                          {donation.type === 'clothes' && 'Clothes Donation'}
                          {donation.type === 'money' && `Money Donation - ₹${donation.moneyDetails?.amount}`}
                        </h4>
                        <p className="text-sm text-gray-600">
                          By: {donation.donor?.name} | Status: {donation.status}
                        </p>
                        {donation.assignedNGO && (
                          <p className="text-sm text-gray-600">
                            NGO: {donation.assignedNGO?.name}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        donation.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        donation.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {donation.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
