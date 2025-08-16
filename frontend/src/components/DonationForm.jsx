import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DonationForm.css';
import toast from 'react-hot-toast';
import { donationService } from '../services/donationService';
import { useAuth } from '../context/AuthContext';

const DonationForm = ({ campaign, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to make a donation');
      return;
    }

    const donationAmount = parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Processing your donation...');

    try {
      // Create a simple donation without Stripe for testing
      const donationData = {
        campaignId: campaign._id || campaign.id,
        amount: donationAmount,
        message: comment.trim(),
        isAnonymous
      };

      // Create payment intent (simplified)
      const { clientSecret, paymentIntentId } = await donationService.createPaymentIntent(donationData);

      // For testing, we'll simulate a successful payment
      // In production, this would be handled by Stripe
      const mockPaymentIntent = {
        id: paymentIntentId || `pi_${Date.now()}`,
        status: 'succeeded'
      };

      if (mockPaymentIntent.status === 'succeeded') {
        // Confirm donation on backend
        await donationService.confirmDonation({
          campaignId: campaign._id || campaign.id,
          paymentIntentId: mockPaymentIntent.id,
          amount: donationAmount,
          message: comment.trim(),
          isAnonymous
        });

        toast.success('Thank you for your donation!', { id: toastId });
        
        // Reset form
        setAmount('');
        setComment('');
        setIsAnonymous(false);
        
        // Call success callback
        if (onSuccess) {
          onSuccess({
            amount: donationAmount,
            message: comment,
            isAnonymous,
            paymentIntentId: mockPaymentIntent.id
          });
        }
      }
    } catch (error) {
      console.error('Donation error:', error);
      toast.error(error.response?.data?.message || 'Failed to process donation', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <h3 className="card-title">Support This Campaign</h3>
          <p className="text-muted mb-3">Please log in to make a donation</p>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/login')}
          >
            Log In to Donate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Make a Donation</h3>
        <p className="text-muted mb-0">Support "{campaign.title}"</p>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Donation Amount ($)</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="form-control"
              placeholder="Enter amount"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Comment (Optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="form-control"
              placeholder="Leave a message of support..."
              rows="3"
              maxLength="500"
            />
            <small className="text-muted">{comment.length}/500 characters</small>
          </div>

          <div className="form-group">
            <label className="d-flex align-items-center gap-2">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <span>Make this donation anonymous</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !amount}
            className="btn btn-primary btn-large"
            style={{ width: '100%' }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '20px', height: '20px', margin: '0 8px 0 0' }}></div>
                Processing...
              </>
            ) : (
              `Donate $${amount || '0'}`
            )}
          </button>
        </form>
      </div>
      <div className="card-footer">
        <small className="text-muted">
          Your donation will be processed securely. This is a test environment.
        </small>
      </div>
    </div>
  );
};

export default DonationForm;
