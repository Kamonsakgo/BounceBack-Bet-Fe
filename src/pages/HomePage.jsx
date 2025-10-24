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
    if (!dateString) return '—'
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('th-TH', {
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
          <p>กำลังโหลดโปรโมชั่น...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="homepage">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>เกิดข้อผิดพลาดในการโหลดโปรโมชั่น</h3>
          <p>{error}</p>
          <button 
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            ลองใหม่
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="homepage">
      <div className="homepage-header">
        <div className="header-content">
          <h2>จัดการโปรโมชั่น</h2>
          <p>จัดการโปรโมชั่นและโบนัสการเดิมพันของคุณ</p>
        </div>
        <div className="header-actions">
          <Link to="/add-promotion" className="add-promotion-btn">
            <span>+</span> เพิ่มโปรโมชั่นใหม่
          </Link>
          <Link to="/payouts" className="payouts-btn">
            💰 การจ่ายเงิน
          </Link>
        </div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>กรองตามสถานะ:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">โปรโมชั่นทั้งหมด</option>
            <option value="active">ใช้งานอยู่</option>
            <option value="inactive">ไม่ใช้งาน</option>
          </select>
        </div>
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-number">{promotions.length}</span>
            <span className="stat-label">ทั้งหมด</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{promotions.filter(p => p.is_active === 1).length}</span>
            <span className="stat-label">ใช้งาน</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{promotions.filter(p => p.is_active === 0).length}</span>
            <span className="stat-label">ไม่ใช้งาน</span>
          </div>
        </div>
      </div>

      <div className="promotions-grid">
        {filteredPromotions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>ไม่พบโปรโมชั่น</h3>
            <p>สร้างโปรโมชั่นแรกของคุณเพื่อเริ่มต้น</p>
            <Link to="/add-promotion" className="empty-cta">
              เพิ่มโปรโมชั่น
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
