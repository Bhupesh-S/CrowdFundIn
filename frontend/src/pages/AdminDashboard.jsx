import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService.js';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchStats();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (error) {
      toast.error('Failed to fetch admin statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="container">
          <div className="admin-loading">
            <div className="loading-spinner"></div>
            <p>Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">System overview and management</p>
        </div>

        {/* Quick Stats */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-number">{stats?.totalUsers || 0}</div>
              <div className="stat-label">Total Users</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-number">{stats?.totalCampaigns || 0}</div>
              <div className="stat-label">Total Campaigns</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-number">{stats?.totalDonations || 0}</div>
              <div className="stat-label">Total Donations</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💵</div>
            <div className="stat-content">
              <div className="stat-number">
                ${stats?.totalAmountRaised?.toLocaleString() || 0}
              </div>
              <div className="stat-label">Amount Raised</div>
            </div>
          </div>
        </div>

        {/* Management Cards */}
        <div className="management-grid">
          <div className="management-card">
            <div className="card-header">
              <h3 className="card-title">User Management</h3>
              <p className="card-description">Manage user accounts and permissions</p>
            </div>
            <div className="card-stats">
              {stats?.usersByRole?.map(item => (
                <div key={item._id} className="mini-stat">
                  <span className="mini-stat-label">{item._id}:</span>
                  <span className="mini-stat-value">{item.count}</span>
                </div>
              ))}
            </div>
            <div className="card-actions">
              <button 
                onClick={() => navigate('/admin/users')}
                className="action-btn primary"
              >
                Manage Users
              </button>
            </div>
          </div>

          <div className="management-card">
            <div className="card-header">
              <h3 className="card-title">Campaign Management</h3>
              <p className="card-description">Review and moderate campaigns</p>
            </div>
            <div className="card-stats">
              {stats?.campaignsByStatus?.map(item => (
                <div key={item._id} className="mini-stat">
                  <span className="mini-stat-label">{item._id}:</span>
                  <span className="mini-stat-value">{item.count}</span>
                </div>
              ))}
            </div>
            <div className="card-actions">
              <button 
                onClick={() => navigate('/admin/campaigns')}
                className="action-btn primary"
              >
                Manage Campaigns
              </button>
            </div>
          </div>

          <div className="management-card">
            <div className="card-header">
              <h3 className="card-title">Financial Overview</h3>
              <p className="card-description">Monitor platform finances</p>
            </div>
            <div className="card-stats">
              <div className="mini-stat">
                <span className="mini-stat-label">Success Rate:</span>
                <span className="mini-stat-value">
                  {stats?.totalCampaigns ? 
                    Math.round((stats.completedCampaigns / stats.totalCampaigns) * 100) : 0}%
                </span>
              </div>
              <div className="mini-stat">
                <span className="mini-stat-label">Avg Donation:</span>
                <span className="mini-stat-value">
                  ${stats?.totalDonations ? 
                    Math.round(stats.totalAmountRaised / stats.totalDonations) : 0}
                </span>
              </div>
            </div>
            <div className="card-actions">
              <button 
                onClick={() => navigate('/admin/reports')}
                className="action-btn secondary"
              >
                View Reports
              </button>
            </div>
          </div>

          <div className="management-card">
            <div className="card-header">
              <h3 className="card-title">System Health</h3>
              <p className="card-description">Monitor system performance</p>
            </div>
            <div className="system-status">
              <div className="status-item">
                <div className="status-indicator online"></div>
                <span>Database: Online</span>
              </div>
              <div className="status-item">
                <div className="status-indicator online"></div>
                <span>Payment Gateway: Active</span>
              </div>
              <div className="status-item">
                <div className="status-indicator online"></div>
                <span>File Storage: Available</span>
              </div>
            </div>
            <div className="card-actions">
              <button 
                onClick={() => window.open('/api/health', '_blank')}
                className="action-btn secondary"
              >
                System Logs
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h2 className="section-title">Recent Activity</h2>
          <div className="activity-grid">
            <div className="activity-card">
              <h3 className="activity-title">New Registrations</h3>
              <div className="activity-chart">
                {stats?.monthlySignups?.slice(-6).map((item, index) => (
                  <div key={index} className="chart-bar">
                    <div 
                      className="bar-fill"
                      style={{ height: `${(item.count / Math.max(...stats.monthlySignups.map(s => s.count))) * 100}%` }}
                    ></div>
                    <div className="bar-label">
                      {item._id.month}/{item._id.year}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
