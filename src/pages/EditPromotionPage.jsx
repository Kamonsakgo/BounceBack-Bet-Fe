import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PromotionForm from '../components/PromotionForm'
import apiService from '../services/api'
import './AddPromotionPage.css'

function EditPromotionPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [promotion, setPromotion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPromotion()
  }, [id])

  const fetchPromotion = async () => {
    try {
      setLoading(true)
      const data = await apiService.getPromotion(id)
      setPromotion(data)
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลโปรโมชั่นได้')
      console.error('Error fetching promotion:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (response) => {
    try {
      await apiService.updatePromotion(id, response)
      console.log('Promotion updated successfully:', response)
      alert('แก้ไขโปรโมชั่นสำเร็จ!')
      navigate('/')
    } catch (err) {
      console.error('Failed to update promotion:', err)
      alert('ไม่สามารถแก้ไขโปรโมชั่นได้ กรุณาลองใหม่อีกครั้ง')
    }
  }

  if (loading) {
    return (
      <div className="add-promotion-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="add-promotion-page">
        <div className="error-container">
          <h2>เกิดข้อผิดพลาด</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="retry-btn">
            กลับไปยังโปรโมชั่น
          </button>
        </div>
      </div>
    )
  }

  if (!promotion) {
    return (
      <div className="add-promotion-page">
        <div className="error-container">
          <h2>ไม่พบโปรโมชั่น</h2>
          <p>โปรโมชั่นที่คุณกำลังมองหาอาจถูกลบไปแล้ว</p>
          <button onClick={() => navigate('/')} className="retry-btn">
            กลับไปยังโปรโมชั่น
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="add-promotion-page">
      <div className="page-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/')}
        >
          ← กลับไปยังโปรโมชั่น
        </button>
        <h2>แก้ไขโปรโมชั่น</h2>
        <p>แก้ไขข้อมูลโปรโมชั่น: {promotion.name}</p>
      </div>

      <div className="form-container">
        <PromotionForm
          type={promotion.type}
          initialData={promotion}
          onSubmit={handleSubmit}
          isEdit={true}
        />
      </div>
    </div>
  )
}

export default EditPromotionPage
