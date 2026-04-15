import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    organization: {
      name: '',
      type: ''
    }
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const data = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        address: formData.address,
        organization: formData.organization.name ? formData.organization : undefined
      });

      // Redirect based on role
      switch (data.user.role) {
        case 'donor':
          navigate('/donor/dashboard');
          break;
        case 'ngo':
          navigate('/ngo/dashboard');
          break;
        case 'volunteer':
          navigate('/volunteer/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-primary-600 hover:text-primary-800 font-bold"
        >
          ← Back
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
            MN
          </div>
          <h2 className="text-2xl font-bold text-primary-600">Create Account</h2>
          <p className="text-gray-600">Join MealNexus Community</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-primary-600 font-bold mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border border-primary-300 rounded focus:outline-none focus:border-primary-500"
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-primary-600 font-bold mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 border border-primary-300 rounded focus:outline-none focus:border-primary-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-primary-600 font-bold mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-3 border border-primary-300 rounded focus:outline-none focus:border-primary-500"
              placeholder="Enter phone number"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-primary-600 font-bold mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-3 border border-primary-300 rounded focus:outline-none focus:border-primary-500"
                placeholder="Create password"
                required
              />
            </div>
            <div>
              <label className="block text-primary-600 font-bold mb-2">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full p-3 border border-primary-300 rounded focus:outline-none focus:border-primary-500"
                placeholder="Confirm password"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-primary-600 font-bold mb-2">Select Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full p-3 border border-primary-300 rounded focus:outline-none focus:border-primary-500"
              required
            >
              <option value="">Select Role</option>
              <option value="donor">Donor</option>
              <option value="ngo">NGO / Receiver</option>
              <option value="volunteer">Volunteer</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-primary-600 font-bold mb-2">Address</label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, street: e.target.value }
              })}
              className="w-full p-3 border border-primary-300 rounded focus:outline-none focus:border-primary-500 mb-2"
              placeholder="Street address"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, city: e.target.value }
                })}
                className="p-3 border border-primary-300 rounded focus:outline-none focus:border-primary-500"
                placeholder="City"
              />
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, state: e.target.value }
                })}
                className="p-3 border border-primary-300 rounded focus:outline-none focus:border-primary-500"
                placeholder="State"
              />
              <input
                type="text"
                value={formData.address.pincode}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, pincode: e.target.value }
                })}
                className="p-3 border border-primary-300 rounded focus:outline-none focus:border-primary-500"
                placeholder="Pincode"
              />
            </div>
          </div>

          {(formData.role === 'donor' || formData.role === 'ngo') && (
            <div className="mb-6">
              <label className="block text-primary-600 font-bold mb-2">Organization (Optional)</label>
              <input
                type="text"
                value={formData.organization.name}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  organization: { ...formData.organization, name: e.target.value }
                })}
                className="w-full p-3 border border-primary-300 rounded focus:outline-none focus:border-primary-500"
                placeholder="Organization name"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary-500 text-white py-3 rounded font-bold hover:bg-primary-600 transition"
          >
            Signup
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-bold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
