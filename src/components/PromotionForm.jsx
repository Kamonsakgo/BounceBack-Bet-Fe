import { useState, useEffect } from 'react'
import apiService from '../services/api'
import './PromotionForm.css'

function PromotionForm({ type, initialData, onSubmit, isEdit = false }) {
  const [formData, setFormData] = useState({
    name: '',
    is_active: 1,
    starts_at: '',
    ends_at: '',
    priority: 100,
    is_stackable: 0,
    user_limit_total: '',
    user_limit_per_day: '',
    global_quota: '',
    global_budget: '',
    max_payout_per_bill: '',
    max_payout_per_day: '',
    max_payout_per_user: '',
    settings: {
      betting_types: []
    }
  })

  // Load initial data when component mounts or initialData changes
  useEffect(() => {
    if (initialData) {
      // Format dates for datetime-local inputs
      const formatDateForInput = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:MM
      }

      // Parse settings if it's a JSON string
      let parsedSettings = {}
      if (initialData.settings) {
        if (typeof initialData.settings === 'string') {
          try {
            parsedSettings = JSON.parse(initialData.settings)
          } catch (e) {
            console.error('Failed to parse settings:', e)
            parsedSettings = {}
          }
        } else {
          parsedSettings = initialData.settings
        }
      }

      const newFormData = {
        ...initialData,
        starts_at: formatDateForInput(initialData.starts_at),
        ends_at: formatDateForInput(initialData.ends_at),
        schedule_start_time: initialData.schedule_start_time || '',
        schedule_end_time: initialData.schedule_end_time || '',
        schedule_days: Array.isArray(initialData.schedule_days) ? initialData.schedule_days : [],
        // Parse settings properly
        settings: {
          betting_types: [],
          ...parsedSettings
        }
      }
      
      
      setFormData(newFormData)
    }
  }, [initialData])

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(!!initialData?.schedule_days?.length || !!initialData?.schedule_start_time || !!initialData?.schedule_end_time)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSettingsChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }))
  }

  const addTier = () => {
    const newTier = { pairs: '', multiplier: '' }
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        tiers: [...(prev.settings.tiers || []), newTier]
      }
    }))
  }

  const removeTier = (index) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        tiers: prev.settings.tiers?.filter((_, i) => i !== index) || []
      }
    }))
  }

  const updateTier = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        tiers: prev.settings.tiers?.map((tier, i) => 
          i === index ? { ...tier, [field]: value } : tier
        ) || []
      }
    }))
  }

  const handleBettingTypeChange = (bettingType, checked) => {
    setFormData(prev => {
      const currentTypes = prev.settings.betting_types || []
      let newTypes
      
      if (bettingType === 'all') {
        // If "all" is selected, clear other selections
        newTypes = checked ? ['all'] : []
      } else {
        // If specific type is selected, remove "all" and add/remove the type
        if (checked) {
          newTypes = currentTypes.filter(t => t !== 'all').concat([bettingType])
        } else {
          newTypes = currentTypes.filter(t => t !== bettingType)
        }
      }
      
      return {
        ...prev,
        settings: {
          ...prev.settings,
          betting_types: newTypes
        }
      }
    })
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อโปรโมชั่น'
    }
    
    if (formData.starts_at && formData.ends_at && new Date(formData.starts_at) >= new Date(formData.ends_at)) {
      newErrors.ends_at = 'วันที่สิ้นสุดต้องอยู่หลังวันที่เริ่มต้น'
    }
    
    if (formData.priority < 1 || formData.priority > 100) {
      newErrors.priority = 'ความสำคัญต้องอยู่ระหว่าง 1-100'
    }
    
    if (!formData.settings.betting_types || formData.settings.betting_types.length === 0) {
      newErrors.betting_types = 'กรุณาเลือกประเภทการเดิมพันที่ใช้ได้'
    }

    // Type-specific validation
    if (type === 'welcome_bonus' && (!formData.settings.bonus_percentage || formData.settings.bonus_percentage < 1)) {
      newErrors.bonus_percentage = 'กรุณากรอกเปอร์เซ็นต์โบนัสและต้องไม่น้อยกว่า 1%'
    }
    
    if (type === 'cashback' && (!formData.settings.cashback_percentage || formData.settings.cashback_percentage < 1)) {
      newErrors.cashback_percentage = 'กรุณากรอกเปอร์เซ็นต์คืนเงินและต้องไม่น้อยกว่า 1%'
    }
    
    if (type === 'lose_all_refund') {
      const tiers = formData.settings.tiers || []
      if (tiers.length === 0) {
        newErrors.tiers = 'กรุณาเพิ่มระดับการคืนเงินอย่างน้อย 1 ระดับ'
      } else {
        tiers.forEach((tier, index) => {
          if (!tier.pairs || tier.pairs < 1) {
            newErrors[`tier_${index}_pairs`] = `ระดับ ${index + 1}: กรุณากรอกจำนวนคู่ที่ต้องเสีย`
          }
          if (!tier.multiplier || tier.multiplier < 1) {
            newErrors[`tier_${index}_multiplier`] = `ระดับ ${index + 1}: กรุณากรอกตัวคูณการคืน`
          }
        })
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const submitData = {
        ...formData,
        type: type,
        settings: JSON.stringify({
          ...formData.settings
        })
      }

      // Convert empty strings to null for optional fields
      const cleanedData = Object.fromEntries(
        Object.entries(submitData).map(([key, value]) => [
          key,
          value === '' ? null : value
        ])
      )

      // Ensure schedule_days is properly formatted as array
      if (cleanedData.schedule_days && Array.isArray(cleanedData.schedule_days)) {
        cleanedData.schedule_days = cleanedData.schedule_days.filter(day => 
          typeof day === 'number' && day >= 1 && day <= 7
        )
      } else if (cleanedData.schedule_days === null || cleanedData.schedule_days === '') {
        cleanedData.schedule_days = null
      }


      let response
      if (isEdit) {
        response = await apiService.updatePromotion(cleanedData.id, cleanedData)
      } else {
        response = await apiService.createPromotion(cleanedData)
      }
      
      // Call the parent onSubmit callback
      onSubmit(response)
    } catch (error) {
      console.error('Failed to create promotion:', error)
      setErrors({ 
        submit: 'ไม่สามารถสร้างโปรโมชั่นได้ กรุณาลองใหม่อีกครั้ง' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTypeSpecificFields = () => {
    switch (type) {
      case 'welcome_bonus':
        return (
          <div className="form-section">
            <h3>การตั้งค่าโบนัสต้อนรับ</h3>
            <div className="form-group">
              <label htmlFor="bonus_percentage">เปอร์เซ็นต์โบนัส (%)</label>
              <input
                type="number"
                id="bonus_percentage"
                min="1"
                max="1000"
                value={formData.settings.bonus_percentage || ''}
                onChange={(e) => handleSettingsChange('bonus_percentage', parseInt(e.target.value))}
                className={errors.bonus_percentage ? 'error' : ''}
              />
              {errors.bonus_percentage && <span className="error-text">{errors.bonus_percentage}</span>}
            </div>
          </div>
        )
      
      case 'cashback':
        return (
          <div className="form-section">
            <h3>การตั้งค่าคืนเงิน</h3>
            <div className="form-group">
              <label htmlFor="cashback_percentage">เปอร์เซ็นต์คืนเงิน (%)</label>
              <input
                type="number"
                id="cashback_percentage"
                min="1"
                max="100"
                value={formData.settings.cashback_percentage || ''}
                onChange={(e) => handleSettingsChange('cashback_percentage', parseInt(e.target.value))}
                className={errors.cashback_percentage ? 'error' : ''}
              />
              {errors.cashback_percentage && <span className="error-text">{errors.cashback_percentage}</span>}
            </div>
          </div>
        )
      
      case 'weekend_bonus':
        return (
          <div className="form-section">
            <h3>การตั้งค่าโบนัสสุดสัปดาห์</h3>
            <div className="form-group">
              <label htmlFor="bonus_multiplier">ตัวคูณโบนัส</label>
              <input
                type="number"
                id="bonus_multiplier"
                min="1"
                max="10"
                step="0.1"
                value={formData.settings.bonus_multiplier || ''}
                onChange={(e) => handleSettingsChange('bonus_multiplier', parseFloat(e.target.value))}
              />
            </div>
          </div>
        )
      
      case 'deposit_bonus':
        return (
          <div className="form-section">
            <h3>การตั้งค่าโบนัสฝากเงิน</h3>
            <div className="form-group">
              <label htmlFor="deposit_bonus_percentage">เปอร์เซ็นต์โบนัสฝากเงิน (%)</label>
              <input
                type="number"
                id="deposit_bonus_percentage"
                min="1"
                max="500"
                value={formData.settings.deposit_bonus_percentage || ''}
                onChange={(e) => handleSettingsChange('deposit_bonus_percentage', parseInt(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="min_deposit">จำนวนเงินฝากขั้นต่ำ</label>
              <input
                type="number"
                id="min_deposit"
                min="0"
                value={formData.settings.min_deposit || ''}
                onChange={(e) => handleSettingsChange('min_deposit', parseFloat(e.target.value))}
              />
            </div>
          </div>
        )
      
      case 'referral_bonus':
        return (
          <div className="form-section">
            <h3>การตั้งค่าโบนัสแนะนำเพื่อน</h3>
            <div className="form-group">
              <label htmlFor="referral_bonus_amount">จำนวนโบนัสแนะนำ</label>
              <input
                type="number"
                id="referral_bonus_amount"
                min="0"
                value={formData.settings.referral_bonus_amount || ''}
                onChange={(e) => handleSettingsChange('referral_bonus_amount', parseFloat(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="referee_bonus_amount">จำนวนโบนัสผู้ถูกแนะนำ</label>
              <input
                type="number"
                id="referee_bonus_amount"
                min="0"
                value={formData.settings.referee_bonus_amount || ''}
                onChange={(e) => handleSettingsChange('referee_bonus_amount', parseFloat(e.target.value))}
              />
            </div>
          </div>
        )
      
      case 'lose_all_refund':
        return (
          <div className="form-section">
            <h3>การตั้งค่าแพ้ทุกคู่คืนเงิน</h3>
            <div className="form-group">
              <label>ระดับการคืนเงิน (Tiers)</label>
              <div className="tiers-container">
                {errors.tiers && <span className="error-text">{errors.tiers}</span>}
                {formData.settings.tiers?.map((tier, index) => (
                  <div key={index} className="tier-item">
                    <div className="tier-header">
                      <span className="tier-label">ระดับ {index + 1}</span>
                      <button 
                        type="button" 
                        className="remove-tier-btn"
                        onClick={() => removeTier(index)}
                      >
                        ลบ
                      </button>
                    </div>
                    <div className="tier-fields">
                      <div className="form-group">
                        <label>จำนวนคู่ที่ต้องเสีย</label>
                        <input
                          type="number"
                          min="1"
                          value={tier.pairs || ''}
                          onChange={(e) => updateTier(index, 'pairs', parseInt(e.target.value))}
                          placeholder="เช่น 5 คู่"
                          className={errors[`tier_${index}_pairs`] ? 'error' : ''}
                        />
                        {errors[`tier_${index}_pairs`] && <span className="error-text">{errors[`tier_${index}_pairs`]}</span>}
                      </div>
                      <div className="form-group">
                        <label>ตัวคูณการคืน</label>
                        <input
                          type="number"
                          min="1"
                          step="0.1"
                          value={tier.multiplier || ''}
                          onChange={(e) => updateTier(index, 'multiplier', parseFloat(e.target.value))}
                          placeholder="เช่น 2 เท่า"
                          className={errors[`tier_${index}_multiplier`] ? 'error' : ''}
                        />
                        {errors[`tier_${index}_multiplier`] && <span className="error-text">{errors[`tier_${index}_multiplier`]}</span>}
                      </div>
                    </div>
                  </div>
                )) || []}
                <button 
                  type="button" 
                  className="add-tier-btn"
                  onClick={addTier}
                >
                  + เพิ่มระดับ
                </button>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="min_odds">อัตราต่อรองขั้นต่ำ</label>
                <input
                  type="number"
                  id="min_odds"
                  min="1"
                  step="0.01"
                  value={formData.settings.min_odds || ''}
                  onChange={(e) => handleSettingsChange('min_odds', parseFloat(e.target.value))}
                  placeholder="เช่น 1.5"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="min_stake">ยอดเดิมพันขั้นต่ำ</label>
                <input
                  type="number"
                  id="min_stake"
                  min="0"
                  value={formData.settings.min_stake || ''}
                  onChange={(e) => handleSettingsChange('min_stake', parseFloat(e.target.value))}
                  placeholder="เช่น 50 บาท"
                />
              </div>
              <div className="form-group">
                <label htmlFor="max_refund_amount">จำนวนเงินคืนสูงสุด (บาท)</label>
                <input
                  type="number"
                  id="max_refund_amount"
                  min="0"
                  value={formData.settings.max_refund_amount || ''}
                  onChange={(e) => handleSettingsChange('max_refund_amount', parseFloat(e.target.value))}
                  placeholder="ปล่อยว่างไว้สำหรับไม่จำกัด"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="refund_delay_hours">ระยะเวลาคืนเงิน (ชั่วโมง)</label>
                <input
                  type="number"
                  id="refund_delay_hours"
                  min="0"
                  value={formData.settings.refund_delay_hours || ''}
                  onChange={(e) => handleSettingsChange('refund_delay_hours', parseInt(e.target.value))}
                  placeholder="เช่น 24 ชั่วโมง"
                />
              </div>
              <div className="form-group">
                <label htmlFor="refund_conditions">เงื่อนไขเพิ่มเติม</label>
                <input
                  type="text"
                  id="refund_conditions"
                  value={formData.settings.refund_conditions || ''}
                  onChange={(e) => handleSettingsChange('refund_conditions', e.target.value)}
                  placeholder="เช่น ต้องเสียติดต่อกัน"
                />
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="promotion-form">
      <div className="form-section">
        <h3>ข้อมูลพื้นฐาน</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">ชื่อโปรโมชั่น *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? 'error' : ''}
              placeholder="กรอกชื่อโปรโมชั่น"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="priority">ความสำคัญ (1-100)</label>
            <input
              type="number"
              id="priority"
              name="priority"
              min="1"
              max="100"
              value={formData.priority}
              onChange={handleInputChange}
              className={errors.priority ? 'error' : ''}
            />
            {errors.priority && <span className="error-text">{errors.priority}</span>}
          </div>
        </div>

        <div className="form-section schedule-section">
          <div className="schedule-header" onClick={() => setIsScheduleExpanded(!isScheduleExpanded)}>
            <h3>⏰ ตารางเวลาโปรโมชั่น</h3>
            <button type="button" className="toggle-btn">
              {isScheduleExpanded ? '−' : '+'}
            </button>
          </div>
          
          {isScheduleExpanded && (
            <>
              <p className="section-note">
                💡 หมายเหตุ: หากไม่ระบุจะใช้งานทุกวัน เริ่มทุกเวลา
              </p>
              
              <div className="schedule-container">
            <div className="schedule-group">
              <h4>📅 วันที่เริ่มต้นและสิ้นสุด</h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="starts_at">วันที่เริ่มต้น</label>
                  <input
                    type="datetime-local"
                    id="starts_at"
                    name="starts_at"
                    value={formData.starts_at}
                    onChange={handleInputChange}
                    className={errors.starts_at ? 'error' : ''}
                    placeholder="dd/mm/yyyy, --:--"
                  />
                  {errors.starts_at && <span className="error-text">{errors.starts_at}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="ends_at">วันที่สิ้นสุด</label>
                  <input
                    type="datetime-local"
                    id="ends_at"
                    name="ends_at"
                    value={formData.ends_at}
                    onChange={handleInputChange}
                    className={errors.ends_at ? 'error' : ''}
                    placeholder="dd/mm/yyyy, --:--"
                  />
                  {errors.ends_at && <span className="error-text">{errors.ends_at}</span>}
                </div>
              </div>
            </div>
            <div className="schedule-group">
              <h4>📅 วันในสัปดาห์ที่ใช้งาน</h4>
              <div className="schedule-days">
                {[
                  { value: 1, label: 'จันทร์', short: 'จ' },
                  { value: 2, label: 'อังคาร', short: 'อ' },
                  { value: 3, label: 'พุธ', short: 'พ' },
                  { value: 4, label: 'พฤหัสบดี', short: 'พฤ' },
                  { value: 5, label: 'ศุกร์', short: 'ศ' },
                  { value: 6, label: 'เสาร์', short: 'ส' },
                  { value: 7, label: 'อาทิตย์', short: 'อา' }
                ].map(day => (
                  <label key={day.value} className="schedule-day-item">
                    <input
                      type="checkbox"
                      checked={formData.schedule_days?.includes(day.value) || false}
                      onChange={(e) => {
                        const currentDays = Array.isArray(formData.schedule_days) ? formData.schedule_days : []
                        let newDays
                        if (e.target.checked) {
                          newDays = [...currentDays, day.value]
                        } else {
                          newDays = currentDays.filter(d => d !== day.value)
                        }
                        setFormData(prev => ({
                          ...prev,
                          schedule_days: newDays
                        }))
                      }}
                    />
                    <span className="day-label">
                      <span className="day-short">{day.short}</span>
                      <span className="day-full">{day.label}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="schedule-group">
              <h4>🕐 ช่วงเวลาการใช้งาน</h4>
              <div className="time-range">
                <div className="form-group">
                  <label htmlFor="schedule_start_time">เวลาเริ่มต้น</label>
                  <input
                    type="time"
                    id="schedule_start_time"
                    name="schedule_start_time"
                    value={formData.schedule_start_time || ''}
                    onChange={handleInputChange}
                    placeholder="เช่น 09:00"
                  />
                </div>
                
                <div className="time-separator">
                  <span>ถึง</span>
                </div>
                
                <div className="form-group">
                  <label htmlFor="schedule_end_time">เวลาสิ้นสุด</label>
                  <input
                    type="time"
                    id="schedule_end_time"
                    name="schedule_end_time"
                    value={formData.schedule_end_time || ''}
                    onChange={handleInputChange}
                    placeholder="เช่น 18:00"
                  />
                </div>
              </div>
            </div>
          </div>
            </>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>ประเภทการเดิมพันที่ใช้ได้</label>
            <div className="betting-types">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.settings.betting_types?.includes('football') || false}
                  onChange={(e) => handleBettingTypeChange('football', e.target.checked)}
                />
                <span className="checkbox-text">⚽ ฟุตบอล</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.settings.betting_types?.includes('boxing') || false}
                  onChange={(e) => handleBettingTypeChange('boxing', e.target.checked)}
                />
                <span className="checkbox-text">🥊 มวย</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.settings.betting_types?.includes('all') || false}
                  onChange={(e) => handleBettingTypeChange('all', e.target.checked)}
                />
                <span className="checkbox-text">🎯 ทั้งหมด</span>
              </label>
            </div>
            {errors.betting_types && <span className="error-text">{errors.betting_types}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
              />
              <span className="checkbox-text">ใช้งาน</span>
            </label>
          </div>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_stackable"
                checked={formData.is_stackable}
                onChange={handleInputChange}
              />
              <span className="checkbox-text">รวมกับโปรโมชั่นอื่นได้</span>
            </label>
          </div>
        </div>
      </div>

      {getTypeSpecificFields()}

      <div className="form-section">
        <h3>ขีดจำกัดผู้ใช้</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="user_limit_total">จำนวนครั้งรวมต่อผู้ใช้</label>
            <input
              type="number"
              id="user_limit_total"
              name="user_limit_total"
              min="0"
              value={formData.user_limit_total}
              onChange={handleInputChange}
              placeholder="ปล่อยว่างไว้สำหรับไม่จำกัด"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="user_limit_per_day">จำนวนครั้งต่อวันต่อผู้ใช้</label>
            <input
              type="number"
              id="user_limit_per_day"
              name="user_limit_per_day"
              min="0"
              value={formData.user_limit_per_day}
              onChange={handleInputChange}
              placeholder="ปล่อยว่างไว้สำหรับไม่จำกัด"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>ขีดจำกัดรวม</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="global_quota">โควต้าทั้งหมด</label>
            <input
              type="number"
              id="global_quota"
              name="global_quota"
              min="0"
              value={formData.global_quota}
              onChange={handleInputChange}
              placeholder="ปล่อยว่างไว้สำหรับไม่จำกัด"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="global_budget">งบประมาณรวม (บาท)</label>
            <input
              type="number"
              id="global_budget"
              name="global_budget"
              min="0"
              step="0.01"
              value={formData.global_budget}
              onChange={handleInputChange}
              placeholder="ปล่อยว่างไว้สำหรับไม่จำกัด"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>ขีดจำกัดการจ่าย</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="max_payout_per_bill">สูงสุดต่อบิล (บาท)</label>
            <input
              type="number"
              id="max_payout_per_bill"
              name="max_payout_per_bill"
              min="0"
              step="0.01"
              value={formData.max_payout_per_bill}
              onChange={handleInputChange}
              placeholder="ปล่อยว่างไว้สำหรับไม่จำกัด"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="max_payout_per_day">สูงสุดต่อวัน (บาท)</label>
            <input
              type="number"
              id="max_payout_per_day"
              name="max_payout_per_day"
              min="0"
              step="0.01"
              value={formData.max_payout_per_day}
              onChange={handleInputChange}
              placeholder="ปล่อยว่างไว้สำหรับไม่จำกัด"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="max_payout_per_user">สูงสุดต่อผู้ใช้ (บาท)</label>
            <input
              type="number"
              id="max_payout_per_user"
              name="max_payout_per_user"
              min="0"
              step="0.01"
              value={formData.max_payout_per_user}
              onChange={handleInputChange}
              placeholder="ปล่อยว่างไว้สำหรับไม่จำกัด"
            />
          </div>
        </div>
      </div>

      {errors.submit && (
        <div className="error-message">
          <span className="error-text">{errors.submit}</span>
        </div>
      )}

      <div className="form-actions">
        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? (isEdit ? 'กำลังแก้ไข...' : 'กำลังสร้าง...') : (isEdit ? 'แก้ไขโปรโมชั่น' : 'สร้างโปรโมชั่น')}
        </button>
        <button 
          type="button" 
          className="cancel-btn" 
          onClick={() => window.history.back()}
          disabled={isSubmitting}
        >
          ยกเลิก
        </button>
      </div>
    </form>
  )
}

export default PromotionForm
