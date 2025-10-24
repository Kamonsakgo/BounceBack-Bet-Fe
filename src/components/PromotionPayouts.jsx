import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiService from '../services/api'
import './PromotionPayouts.css'

function PromotionPayouts() {
  const [payouts, setPayouts] = useState([])
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, pending, completed, failed
  const [selectedPromotion, setSelectedPromotion] = useState('all')
  const [userId, setUserId] = useState('')

  // Fetch promotions and initial payouts from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [payoutsData, promotionsData] = await Promise.all([
          apiService.getPromotionPayouts(),
          apiService.getPromotions()
        ])
        setPayouts(payoutsData)
        setPromotions(promotionsData)
      } catch (err) {
        console.error('Failed to fetch data:', err)
        setError('Failed to load data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Manual search function
  const handleSearch = async () => {
    try {
      setLoading(true)
      setError(null)
      const payoutsData = await apiService.getPromotionPayouts(userId || null)
      setPayouts(payoutsData)
    } catch (err) {
      console.error('Failed to fetch payouts:', err)
      setError('Failed to load payouts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Refresh data function
  const handleRefresh = async () => {
    try {
      setLoading(true)
      setError(null)
      const payoutsData = await apiService.getPromotionPayouts(userId !== '' ? userId : null)
      setPayouts(payoutsData)
    } catch (err) {
      console.error('Failed to refresh payouts:', err)
      setError('Failed to refresh data. Please try again.')
    } finally {
      setLoading(false)
    }
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

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { text: 'รอดำเนินการ', class: 'pending' },
      'completed': { text: 'สำเร็จ', class: 'completed' },
      'failed': { text: 'ล้มเหลว', class: 'failed' },
      'processing': { text: 'กำลังดำเนินการ', class: 'processing' }
    }
    
    const statusInfo = statusMap[status] || { text: status, class: 'unknown' }
    
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    )
  }

  // Get promotion name by ID
  const getPromotionName = (promotionId) => {
    const promotion = promotions.find(p => p.id === promotionId)
    return promotion ? promotion.name : `โปรโมชั่น #${promotionId}`
  }

  // Get unique promotion IDs for filter
  const uniquePromotionIds = [...new Set(payouts.map(payout => payout.promotion_id))]

  // Filter payouts based on status and promotion
  const filteredPayouts = payouts.filter(payout => {
    const statusMatch = filter === 'all' || payout.status === filter
    const promotionMatch = selectedPromotion === 'all' || payout.promotion_id.toString() === selectedPromotion
    return statusMatch && promotionMatch
  })

  // Calculate statistics
  const stats = {
    total: payouts.length,
    pending: payouts.filter(p => p.status === 'pending').length,
    completed: payouts.filter(p => p.status === 'completed').length,
    failed: payouts.filter(p => p.status === 'failed').length,
    totalAmount: payouts.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
  }

  if (loading) {
    return (
      <div className="payouts-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>กำลังโหลดข้อมูลการจ่ายเงิน...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="payouts-section">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>เกิดข้อผิดพลาดในการโหลดข้อมูลการจ่ายเงิน</h3>
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
    <div className="payouts-page">
      <div className="page-header">
        <div className="header-content">
          <h1>รายการการจ่ายเงิน</h1>
          <p>จัดการและติดตามข้อมูลการจ่ายเงินโปรโมชั่นทั้งหมด</p>
        </div>
        <div className="header-actions">
          <Link to="/" className="back-btn">
            ← กลับหน้าแรก
          </Link>
        </div>
      </div>

      <div className="payouts-section">
        <div className="payouts-header">
          <h3>รายการการจ่ายเงิน</h3>
          <p>ข้อมูลการจ่ายเงินโปรโมชั่นทั้งหมด</p>
        </div>

      {/* Statistics Summary */}
      <div className="payouts-stats">
        <div className="stat-item">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">ทั้งหมด</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.pending}</span>
          <span className="stat-label">รอดำเนินการ</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.completed}</span>
          <span className="stat-label">สำเร็จ</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.failed}</span>
          <span className="stat-label">ล้มเหลว</span>
        </div>
        <div className="stat-item total-amount">
          <span className="stat-number">{formatCurrency(stats.totalAmount)}</span>
          <span className="stat-label">ยอดรวม</span>
        </div>
      </div>

      {/* Filters */}
      <div className="payouts-filters">
        <div className="filter-group">
          <label>กรองตามสถานะ:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">ทั้งหมด</option>
            <option value="pending">รอดำเนินการ</option>
            <option value="completed">สำเร็จ</option>
            <option value="failed">ล้มเหลว</option>
            <option value="processing">กำลังดำเนินการ</option>
          </select>
        </div>
        <div className="filter-group">
          <label>กรองตามโปรโมชั่น:</label>
          <select 
            value={selectedPromotion} 
            onChange={(e) => setSelectedPromotion(e.target.value)}
            className="filter-select"
          >
            <option value="all">โปรโมชั่นทั้งหมด</option>
            {uniquePromotionIds.map(id => (
              <option key={id} value={id}>{getPromotionName(id)}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>ค้นหาตาม User ID:</label>
          <div className="search-input-group">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="ระบุ User ID (เช่น 123)"
              className="filter-input"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch}
              className="search-btn"
              disabled={loading}
            >
              {loading ? '⏳' : '🔍'} ค้นหา
            </button>
          </div>
        </div>
        <div className="filter-group">
          <label>รีเฟรชข้อมูล:</label>
          <button 
            onClick={handleRefresh}
            className="refresh-btn"
            disabled={loading}
          >
            {loading ? '⏳' : '🔄'} รีเฟรชข้อมูล
          </button>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="payouts-table-container">
        {filteredPayouts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💰</div>
            <h3>ไม่พบข้อมูลการจ่ายเงิน</h3>
            <p>ยังไม่มีข้อมูลการจ่ายเงินตามเงื่อนไขที่เลือก</p>
          </div>
        ) : (
          <table className="payouts-table">
            <thead>
              <tr>
                <th>รหัสการจ่าย</th>
                <th>ชื่อโปรโมชั่น</th>
                <th>ผู้ใช้</th>
                <th>บิล</th>
                <th>ธุรกรรม</th>
                <th>สถานะ</th>
                <th>จำนวนเงิน</th>
                <th>วันที่สร้าง</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayouts.map(payout => (
                <tr key={payout.id}>
                  <td className="payout-id">#{payout.id}</td>
                  <td className="promotion-name">{getPromotionName(payout.promotion_id)}</td>
                  <td className="user-id">#{payout.user_id}</td>
                  <td className="bill-id">#{payout.bill_id}</td>
                  <td className="transaction-id">#{payout.transaction_id}</td>
                  <td className="status-cell">
                    {getStatusBadge(payout.status)}
                  </td>
                  <td className="amount">{formatCurrency(payout.amount)}</td>
                  <td className="created-at">{formatDate(payout.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      </div>
    </div>
  )
}

export default PromotionPayouts
