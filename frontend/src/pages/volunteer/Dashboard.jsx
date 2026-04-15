import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { taskAPI, donationAPI } from '../../utils/api';

const VolunteerDashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await taskAPI.getAll();
      setTasks(res.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPickup = async (taskId) => {
    try {
      await taskAPI.start(taskId);
      fetchTasks();
      alert('Pickup started! 🚚');
    } catch (error) {
      alert('Error starting pickup');
    }
  };

  const handleCompleteDelivery = async (taskId) => {
    try {
      await taskAPI.complete(taskId, {
        photo: '', // Would be uploaded file URL
        recipientName: 'Beneficiary',
        notes: 'Delivery completed'
      });
      fetchTasks();
      alert('Delivery completed! 🎉');
    } catch (error) {
      alert('Error completing delivery');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'text-orange-500';
      case 'in-progress': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-primary-600 text-white px-10 py-3 flex justify-between items-center">
        <div className="text-xl font-bold">MealNexus Volunteer</div>
        <div className="flex gap-4 items-center">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout} className="bg-primary-500 px-4 py-2 rounded hover:bg-primary-700">
            Logout
          </button>
        </div>
      </nav>

      <div className="w-4/5 mx-auto mt-8">
        <h2 className="text-2xl font-bold text-primary-600 mb-6">Pickup & Delivery Tasks</h2>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-10 text-center">
            <p className="text-gray-500 text-lg">No tasks assigned yet</p>
            <p className="text-gray-400 mt-2">Tasks will appear here when an NGO assigns you</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task._id} className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-primary-600 mb-2">
                      {task.donation?.foodDetails?.foodType} Donation
                    </h3>
                    <p className="text-gray-600 mb-1">
                      <span className="font-bold">Quantity:</span> {task.donation?.foodDetails?.quantity?.value} {task.donation?.foodDetails?.quantity?.unit}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <span className="font-bold">Pickup:</span> {task.pickupLocation?.address}
                    </p>
                    <p className="text-gray-600 mb-3">
                      <span className="font-bold">Status:</span>{' '}
                      <span className={`font-bold capitalize ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </p>
                    
                    {task.status === 'assigned' && (
                      <button
                        onClick={() => handleStartPickup(task._id)}
                        className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600 mr-2"
                      >
                        Start Pickup
                      </button>
                    )}
                    
                    {task.status === 'in-progress' && (
                      <button
                        onClick={() => handleCompleteDelivery(task._id)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      Assigned: {new Date(task.assignedAt).toLocaleDateString()}
                    </p>
                    {task.estimatedDistance && (
                      <p className="text-sm text-primary-600">
                        📍 {task.estimatedDistance} km
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerDashboard;
