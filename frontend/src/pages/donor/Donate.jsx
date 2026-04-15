import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { donationAPI } from '../../utils/api';

const Donate = () => {
  const navigate = useNavigate();
  const [donationType, setDonationType] = useState('food');
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [formData, setFormData] = useState({
    // Food
    foodType: 'veg',
    category: 'cooked',
    description: '',
    quantityValue: '',
    quantityUnit: 'meals',
    prepTime: '',
    expiryTime: '',
    // Clothes
    itemTypes: [],
    condition: 'good',
    clothesQuantity: '',
    sizeRange: '',
    // Common
    pickupAddress: '',
    city: '',
    preferredPickupTime: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const donationData = {
        type: donationType,
        pickupLocation: {
          address: formData.pickupAddress,
          city: formData.city,
        },
        preferredPickupTime: formData.preferredPickupTime,
        images: uploadedImages.map((img, index) => ({
          originalname: img.name || `image_${index}.jpg`,
          url: img.preview
        }))
      };

      if (donationType === 'food') {
        donationData.foodDetails = {
          foodType: formData.foodType,
          category: formData.category,
          description: formData.description,
          quantity: {
            value: parseInt(formData.quantityValue),
            unit: formData.quantityUnit,
          },
          preparationTime: formData.prepTime,
          expiryTime: formData.expiryTime,
        };
      } else if (donationType === 'clothes') {
        donationData.clothesDetails = {
          itemTypes: formData.itemTypes,
          condition: formData.condition,
          quantity: parseInt(formData.clothesQuantity),
          sizeRange: formData.sizeRange,
        };
      }

      await donationAPI.create(donationData);
      alert('Donation submitted successfully! 🎉');
      navigate('/donor/dashboard');
    } catch (error) {
      alert('Error submitting donation. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      name: file.name,
      preview: URL.createObjectURL(file)
    }));
    setUploadedImages([...uploadedImages, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = [...uploadedImages];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setUploadedImages(newImages);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="w-3/5 mx-auto bg-white p-8 rounded-lg shadow-lg border-t-4 border-primary-600">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
            MN
          </div>
          <h2 className="text-2xl font-bold text-primary-600">Make a Donation</h2>
        </div>

        {/* Donation Type Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => setDonationType('food')}
            className={`flex-1 py-3 rounded font-bold ${
              donationType === 'food' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            🍛 Food
          </button>
          <button
            type="button"
            onClick={() => setDonationType('clothes')}
            className={`flex-1 py-3 rounded font-bold ${
              donationType === 'clothes' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            👕 Clothes
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {donationType === 'food' && (
            <>
              <h3 className="text-lg font-bold text-primary-600 mb-4">Food Details</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-primary-600 font-bold mb-2">Food Type</label>
                  <select
                    name="foodType"
                    value={formData.foodType}
                    onChange={handleChange}
                    className="w-full p-3 border border-primary-300 rounded"
                    required
                  >
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-primary-600 font-bold mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full p-3 border border-primary-300 rounded"
                    required
                  >
                    <option value="cooked">Cooked</option>
                    <option value="packaged">Packaged</option>
                    <option value="raw">Raw</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-primary-600 font-bold mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-3 border border-primary-300 rounded"
                  placeholder="Describe the food items"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-primary-600 font-bold mb-2">Quantity</label>
                  <input
                    type="number"
                    name="quantityValue"
                    value={formData.quantityValue}
                    onChange={handleChange}
                    className="w-full p-3 border border-primary-300 rounded"
                    placeholder="Amount"
                    required
                  />
                </div>
                <div>
                  <label className="block text-primary-600 font-bold mb-2">Unit</label>
                  <select
                    name="quantityUnit"
                    value={formData.quantityUnit}
                    onChange={handleChange}
                    className="w-full p-3 border border-primary-300 rounded"
                  >
                    <option value="meals">Meals</option>
                    <option value="kg">Kilograms</option>
                    <option value="items">Items</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-primary-600 font-bold mb-2">Preparation Time</label>
                  <input
                    type="datetime-local"
                    name="prepTime"
                    value={formData.prepTime}
                    onChange={handleChange}
                    className="w-full p-3 border border-primary-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-primary-600 font-bold mb-2">Expiry Time</label>
                  <input
                    type="datetime-local"
                    name="expiryTime"
                    value={formData.expiryTime}
                    onChange={handleChange}
                    className="w-full p-3 border border-primary-300 rounded"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {donationType === 'clothes' && (
            <>
              <h3 className="text-lg font-bold text-primary-600 mb-4">Clothes Details</h3>
              
              <div className="mb-4">
                <label className="block text-primary-600 font-bold mb-2">Item Types</label>
                <input
                  type="text"
                  name="itemTypes"
                  value={formData.itemTypes}
                  onChange={(e) => setFormData({ ...formData, itemTypes: e.target.value.split(',') })}
                  className="w-full p-3 border border-primary-300 rounded"
                  placeholder="Shirts, Pants, etc. (comma separated)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-primary-600 font-bold mb-2">Condition</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full p-3 border border-primary-300 rounded"
                  >
                    <option value="new">New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>
                <div>
                  <label className="block text-primary-600 font-bold mb-2">Quantity</label>
                  <input
                    type="number"
                    name="clothesQuantity"
                    value={formData.clothesQuantity}
                    onChange={handleChange}
                    className="w-full p-3 border border-primary-300 rounded"
                    placeholder="Number of items"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-primary-600 font-bold mb-2">Size Range</label>
                <input
                  type="text"
                  name="sizeRange"
                  value={formData.sizeRange}
                  onChange={handleChange}
                  className="w-full p-3 border border-primary-300 rounded"
                  placeholder="e.g., S-XL, Kids, All sizes"
                />
              </div>
            </>
          )}

          {/* Image Upload */}
          <h3 className="text-lg font-bold text-primary-600 mb-4 mt-6">Photos (Optional)</h3>
          
          <div className="mb-4">
            <label className="block text-primary-600 font-bold mb-2">Upload Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full p-3 border border-primary-300 rounded"
            />
            <p className="text-sm text-gray-500 mt-1">Upload photos of the items you're donating</p>
          </div>

          {/* Image Previews */}
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-4">
              {uploadedImages.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img.preview}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <h3 className="text-lg font-bold text-primary-600 mb-4 mt-6">Pickup Details</h3>

          <div className="mb-4">
            <label className="block text-primary-600 font-bold mb-2">Pickup Address</label>
            <textarea
              name="pickupAddress"
              value={formData.pickupAddress}
              onChange={handleChange}
              className="w-full p-3 border border-primary-300 rounded"
              placeholder="Enter full address"
              rows="3"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-primary-600 font-bold mb-2">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full p-3 border border-primary-300 rounded"
              placeholder="City"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-primary-600 font-bold mb-2">Preferred Pickup Time</label>
            <input
              type="datetime-local"
              name="preferredPickupTime"
              value={formData.preferredPickupTime}
              onChange={handleChange}
              className="w-full p-3 border border-primary-300 rounded"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 text-white py-3 rounded font-bold hover:bg-primary-600 transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Donation'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Donate;
