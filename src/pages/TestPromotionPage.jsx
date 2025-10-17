import { useState, useEffect } from 'react'
import apiService from '../services/api'
import './TestPromotionPage.css'

function TestPromotionPage() {
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPromotion, setSelectedPromotion] = useState(null)
  const [testData, setTestData] = useState({
    stake: '',
    promotion_id: '',
    selections: [
      { sport: 'football', result: 'lose', market: 'handicap', period: 'full_time', odds: 1.9 }
    ]
  })
  const [testResult, setTestResult] = useState(null)
  const [isTesting, setIsTesting] = useState(false)
  const [testError, setTestError] = useState(null)

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const data = await apiService.getPromotions()
      setPromotions(data)
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลโปรโมชั่นได้')
      console.error('Error fetching promotions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePromotionSelect = (promotion) => {
    setSelectedPromotion(promotion)
    setTestData(prev => ({
      ...prev,
      promotion_id: promotion.id
    }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setTestData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectionChange = (index, field, value) => {
    setTestData(prev => ({
      ...prev,
      selections: prev.selections.map((selection, i) => 
        i === index ? { ...selection, [field]: value } : selection
      )
    }))
  }

  const addSelection = () => {
    setTestData(prev => ({
      ...prev,
      selections: [...prev.selections, {
        sport: 'boxing',
        result: 'lose',
        market: 'handicap',
        period: 'full_time',
        odds: 1.9
      }]
    }))
  }

  const removeSelection = (index) => {
    if (testData.selections.length > 1) {
      setTestData(prev => ({
        ...prev,
        selections: prev.selections.filter((_, i) => i !== index)
      }))
    }
  }

  const handleTest = async () => {
    if (!testData.stake || !testData.promotion_id) {
      setTestError('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    setIsTesting(true)
    setTestError(null)
    setTestResult(null)

    try {
      const response = await apiService.testPromotion({
        stake: parseFloat(testData.stake),
        promotion_id: parseInt(testData.promotion_id),
        selections: testData.selections.map(selection => ({
          ...selection,
          odds: parseFloat(selection.odds)
        }))
      })
      
      setTestResult(response)
    } catch (err) {
      setTestError('ไม่สามารถทดสอบโปรโมชั่นได้: ' + (err.message || 'เกิดข้อผิดพลาด'))
      console.error('Test error:', err)
    } finally {
      setIsTesting(false)
    }
  }

  const getPromotionTypeName = (type) => {
    const typeNames = {
      'welcome_bonus': 'โบนัสต้อนรับ',
      'cashback': 'คืนเงิน',
      'weekend_bonus': 'โบนัสสุดสัปดาห์',
      'deposit_bonus': 'โบนัสฝากเงิน',
      'referral_bonus': 'โบนัสแนะนำเพื่อน',
      'lose_all_refund': 'แพ้ทุกคู่คืนเงิน'
    }
    return typeNames[type] || type
  }

  const getResultName = (result) => {
    const resultNames = {
      'win': 'ชนะ',
      'lose': 'แพ้',
      'draw': 'เสมอ'
    }
    return resultNames[result] || result
  }

  const getSportName = (sport) => {
    const sportNames = {
      'football': 'ฟุตบอล',
      'boxing': 'มวย',
      'all': 'ทั้งหมด'
    }
    return sportNames[sport] || sport
  }

  if (loading) {
    return (
      <div className="test-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="test-page">
        <div className="error-container">
          <h2>เกิดข้อผิดพลาด</h2>
          <p>{error}</p>
          <button onClick={fetchPromotions} className="retry-btn">
            ลองใหม่
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="test-page">
      <div className="test-header">
        <h1>🧪 ทดสอบโปรโมชั่น</h1>
        <p>ทดสอบการทำงานของโปรโมชั่นแต่ละประเภท</p>
      </div>

      <div className="test-content">
        <div className="promotion-selector">
          <h2>เลือกโปรโมชั่น</h2>
          <div className="promotions-grid">
            {promotions.map(promotion => (
              <div 
                key={promotion.id}
                className={`promotion-card ${selectedPromotion?.id === promotion.id ? 'selected' : ''}`}
                onClick={() => handlePromotionSelect(promotion)}
              >
                <div className="card-header">
                  <h3>{promotion.name}</h3>
                  <span className="promotion-type">{getPromotionTypeName(promotion.type)}</span>
                </div>
                <div className="card-content">
                  <p>{promotion.description}</p>
                  <div className="promotion-info">
                    <span>ID: {promotion.id}</span>
                    <span className={`status ${promotion.is_active ? 'active' : 'inactive'}`}>
                      {promotion.is_active ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedPromotion && (
          <div className="test-form">
            <h2>ข้อมูลการทดสอบ</h2>
            
            <div className="form-section">
              <h3>ข้อมูลโปรโมชั่น</h3>
              <div className="selected-promotion">
                <h4>{selectedPromotion.name}</h4>
                <p>ประเภท: {getPromotionTypeName(selectedPromotion.type)}</p>
                <p>ID: {selectedPromotion.id}</p>
              </div>
            </div>

            <div className="form-section">
              <h3>ข้อมูลการเดิมพัน</h3>
              <div className="form-group">
                <label>จำนวนเงินเดิมพัน (บาท)</label>
                <input
                  type="number"
                  name="stake"
                  value={testData.stake}
                  onChange={handleInputChange}
                  placeholder="100"
                  min="1"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-section">
              <h3>ผลการเดิมพัน</h3>
              {testData.selections.map((selection, index) => (
                <div key={index} className="selection-item">
                  <div className="selection-header">
                    <h4>การเดิมพัน #{index + 1}</h4>
                    {testData.selections.length > 1 && (
                      <button 
                        type="button" 
                        className="remove-btn"
                        onClick={() => removeSelection(index)}
                      >
                        ลบ
                      </button>
                    )}
                  </div>
                  
                  <div className="selection-fields">
                    <div className="form-group">
                      <label>กีฬา</label>
                      <select
                        value={selection.sport}
                        onChange={(e) => handleSelectionChange(index, 'sport', e.target.value)}
                      >
                        <option value="football">ฟุตบอล</option>
                        <option value="boxing">มวย</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>ผล</label>
                      <select
                        value={selection.result}
                        onChange={(e) => handleSelectionChange(index, 'result', e.target.value)}
                      >
                        <option value="win">ชนะ</option>
                        <option value="lose">แพ้</option>
                        <option value="draw">เสมอ</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>ตลาด</label>
                      <select
                        value={selection.market}
                        onChange={(e) => handleSelectionChange(index, 'market', e.target.value)}
                      >
                        <option value="handicap">แฮนดิแคป</option>
                        <option value="over_under">สูง/ต่ำ</option>
                        <option value="1x2">1X2</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>ช่วงเวลา</label>
                      <select
                        value={selection.period}
                        onChange={(e) => handleSelectionChange(index, 'period', e.target.value)}
                      >
                        <option value="full_time">เต็มเวลา</option>
                        <option value="first_half">ครึ่งแรก</option>
                        <option value="second_half">ครึ่งหลัง</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>อัตราต่อรอง</label>
                      <input
                        type="number"
                        value={selection.odds}
                        onChange={(e) => handleSelectionChange(index, 'odds', parseFloat(e.target.value))}
                        placeholder="1.9"
                        min="1"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button type="button" className="add-selection-btn" onClick={addSelection}>
                + เพิ่มการเดิมพัน
              </button>
            </div>

            <div className="form-actions">
              <button 
                className="test-btn"
                onClick={handleTest}
                disabled={isTesting}
              >
                {isTesting ? 'กำลังทดสอบ...' : '🧪 ทดสอบโปรโมชั่น'}
              </button>
            </div>

            {testError && (
              <div className="error-message">
                <h4>❌ เกิดข้อผิดพลาด</h4>
                <p>{testError}</p>
              </div>
            )}

            {testResult && (
              <div className="test-result">
                <h3>📊 ผลการทดสอบ</h3>
                <div className="result-content">
                  <div className="result-section">
                    <h4>ข้อมูลโปรโมชั่น</h4>
                    <p><strong>ID:</strong> {testResult.promotion?.id || 'ไม่ระบุ'}</p>
                    <p><strong>ชื่อ:</strong> {testResult.promotion?.name || 'ไม่ระบุ'}</p>
                    <p><strong>ประเภท:</strong> {getPromotionTypeName(testResult.promotion?.type)}</p>
                  </div>

                  <div className="result-section">
                    <h4>การคำนวณ</h4>
                    <p><strong>เงินเดิมพัน:</strong> {testResult.stake} บาท</p>
                    <p><strong>จำนวนการเดิมพัน:</strong> {testData.selections.length} รายการ</p>
                    <p><strong>จำนวนคู่ที่ส่ง:</strong> {testResult.selectionsCount || 0} คู่</p>
                    <p><strong>ตัวคูณ:</strong> {testResult.multiplier || 0}x</p>
                    <p><strong>สถานะ:</strong> {testResult.eligible ? 'ผ่านเงื่อนไข' : 'ไม่ผ่านเงื่อนไข'}</p>
                  </div>

                  <div className="result-section">
                    <h4>ผลลัพธ์</h4>
                    <p><strong>ผ่านเงื่อนไข:</strong> {testResult.eligible ? '✅ ผ่าน' : '❌ ไม่ผ่าน'}</p>
                    <p><strong>โบนัสที่ได้รับ:</strong> {testResult.bonus_amount || ((testResult.cappedRefund || 0) - testResult.stake < 0 ? testResult.cappedRefund || 0 : (testResult.cappedRefund || 0) - testResult.stake)} บาท</p>
                    <p><strong>เงินคืนที่คำนวณ:</strong> {testResult.computedRefund || 0} บาท</p>
                    <p><strong>เงินคืนที่จ่ายจริง:</strong> {testResult.cappedRefund || 0} บาท</p>
                  </div>

                  {testResult.caps && (
                    <div className="result-section">
                      <h4>ขีดจำกัด</h4>
                      <p><strong>สูงสุดต่อบิล:</strong> {testResult.caps.maxPayoutPerBill ? `${testResult.caps.maxPayoutPerBill} บาท` : 'ไม่จำกัด'}</p>
                      <p><strong>สูงสุดต่อวัน:</strong> {testResult.caps.maxPayoutPerDay ? `${testResult.caps.maxPayoutPerDay} บาท` : 'ไม่จำกัด'}</p>
                      <p><strong>สูงสุดต่อผู้ใช้:</strong> {testResult.caps.maxPayoutPerUser ? `${testResult.caps.maxPayoutPerUser} บาท` : 'ไม่จำกัด'}</p>
                    </div>
                  )}

                  {testResult.reasons && testResult.reasons.length > 0 && (
                    <div className="result-section">
                      <h4>❌ เหตุผลที่ไม่ผ่าน</h4>
                      <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                        {testResult.reasons.map((reason, index) => (
                          <li key={index} style={{ color: '#dc2626', marginBottom: '4px' }}>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {testResult.message && (
                    <div className="result-message">
                      <h4>ข้อความ</h4>
                      <p>{testResult.message}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TestPromotionPage
