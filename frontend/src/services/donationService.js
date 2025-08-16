import api from './api';

export const donationService = {
  async createPaymentIntent(donationData) {
    const response = await api.post('/donations/create-payment-intent', donationData);
    return response.data;
  },

  async confirmDonation(donationData) {
    const response = await api.post('/donations/confirm', donationData);
    return response.data;
  },

  async getCampaignDonations(campaignId, params = {}) {
    const response = await api.get(`/donations/campaign/${campaignId}`, { params });
    return response.data;
  },

  async getMyDonations(params = {}) {
    const response = await api.get('/donations/my-donations', { params });
    return response.data;
  },

  async getDonationStats() {
    const response = await api.get('/donations/stats');
    return response.data;
  }
};
