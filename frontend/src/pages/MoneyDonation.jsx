import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentAPI } from '../utils/api';

const MoneyDonation = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [loading, setLoading] = useState(false);

  const presetAmounts = [100, 500, 1000, 5000];

  const handleDonate = async () => {
    const finalAmount = amount === 'custom' ? parseInt(customAmount) : parseInt(amount);
    
    if (!finalAmount || finalAmount < 10) {
      alert('Please enter a valid amount (minimum ₹10)');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderRes = await paymentAPI.createOrder({
        amount: finalAmount,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      });

      // Razorpay checkout options
      const options = {
        key: 'your_razorpay_key_id', // Replace with your key
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: 'MealNexus',
        description: 'Donation for social cause',
        order_id: orderRes.data.id,
        handler: async function (response) {
          try {
            // Verify payment
            await paymentAPI.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: finalAmount,
              isRecurring
            });
            
            alert('Thank you for your donation! 🎉');
            navigate('/');
          } catch (error) {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#cc7a00'
        }
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Error initiating payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="w-2/5 mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
            💰
          </div>
          <h2 className="text-2xl font-bold text-primary-600">Donate Money</h2>
          <p className="text-gray-600">Your contribution makes a difference</p>
        </div>

        {/* Amount Selection */}
        <div className="mb-6">
          <label className="block text-primary-600 font-bold mb-3">Select Amount</label>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {presetAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt.toString())}
                className={`p-3 rounded border-2 font-bold ${
                  amount === amt.toString()
                    ? 'border-primary-500 bg-primary-50 text-primary-600'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setAmount('custom')}
            className={`w-full p-3 rounded border-2 font-bold ${
              amount === 'custom'
                ? 'border-primary-500 bg-primary-50 text-primary-600'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            Custom Amount
          </button>
        </div>

        {/* Custom Amount Input */}
        {amount === 'custom' && (
          <div className="mb-6">
            <label className="block text-primary-600 font-bold mb-2">Enter Amount (₹)</label>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full p-3 border border-primary-300 rounded focus:outline-none focus:border-primary-500"
              placeholder="Minimum ₹10"
              min="10"
            />
          </div>
        )}

        {/* Recurring Option */}
        <div className="mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-5 h-5 text-primary-500"
            />
            <span className="text-gray-700">Make this a monthly donation</span>
          </label>
        </div>

        {/* Selected Amount Display */}
        <div className="bg-primary-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <span className="text-primary-700 font-bold">You are donating:</span>
            <span className="text-2xl font-bold text-primary-600">
              ₹{amount === 'custom' ? customAmount || 0 : amount || 0}
            </span>
          </div>
          {isRecurring && (
            <p className="text-sm text-primary-600 mt-1">Monthly recurring donation</p>
          )}
        </div>

        {/* Tax Benefits Info */}
        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-green-700">
            <span className="font-bold">Tax Benefits:</span> Your donation is eligible for 80G tax deduction. 
            You will receive a tax receipt via email after successful payment.
          </p>
        </div>

        {/* Pay Button */}
        <button
          onClick={handleDonate}
          disabled={loading || (!amount && !customAmount)}
          className="w-full bg-primary-500 text-white py-3 rounded font-bold hover:bg-primary-600 transition disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Proceed to Pay'}
        </button>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="w-full mt-3 bg-gray-200 text-gray-700 py-3 rounded font-bold hover:bg-gray-300 transition"
        >
          Go Back
        </button>

        {/* Security Note */}
        <p className="text-center text-xs text-gray-500 mt-4">
          🔒 Secured by Razorpay. Your payment information is encrypted and secure.
        </p>
      </div>

      {/* Load Razorpay Script */}
      <script
        src="https://checkout.razorpay.com/v1/checkout.js"
        async
      />
    </div>
  );
};

export default MoneyDonation;
