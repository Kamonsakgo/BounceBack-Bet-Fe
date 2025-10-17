import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PromotionCard from '../components/PromotionCard'
import apiService from '../services/api'
import './HomePage.css'

function HomePage() {
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, active, inactive

  // Fetch promotions from API
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiService.getPromotions()
        setPromotions(data)
      } catch (err) {
        console.error('Failed to fetch promotions:', err)
        setError('Failed to load promotions. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchPromotions()
  }, [])

  const filteredPromotions = promotions.filter(promo => {
    if (filter === 'active') return promo.is_active === 1
    if (filter === 'inactive') return promo.is_active === 0
    return true
  })

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="status-badge active">Active</span>
    ) : (
      <span className="status-badge inactive">Inactive</span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="homepage">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading promotions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="homepage">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Promotions</h3>
          <p>{error}</p>
          <button 
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="homepage">
      <div className="homepage-header">
        <div className="header-content">
          <h2>Promotion Management</h2>
          <p>Manage your betting promotions and bonuses</p>
        </div>
        <Link to="/add-promotion" className="add-promotion-btn">
          <span>+</span> Add New Promotion
        </Link>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Filter by status:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Promotions</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-number">{promotions.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{promotions.filter(p => p.is_active === 1).length}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{promotions.filter(p => p.is_active === 0).length}</span>
            <span className="stat-label">Inactive</span>
          </div>
        </div>
      </div>

      <div className="promotions-grid">
        {filteredPromotions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No promotions found</h3>
            <p>Create your first promotion to get started</p>
            <Link to="/add-promotion" className="empty-cta">
              Add Promotion
            </Link>
          </div>
        ) : (
          filteredPromotions.map(promotion => (
            <PromotionCard 
              key={promotion.id} 
              promotion={promotion}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              getStatusBadge={getStatusBadge}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default HomePage
