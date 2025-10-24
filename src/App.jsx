import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AddPromotionPage from './pages/AddPromotionPage'
import EditPromotionPage from './pages/EditPromotionPage'
import PromotionDetailPage from './pages/PromotionDetailPage'
import TestPromotionPage from './pages/TestPromotionPage'
import PayoutsPage from './pages/PayoutsPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <header className="header">
          <Link to="/" className="title-link">
            <h1 className="title">🎯 BounceBack Bet Admin</h1>
          </Link>
              <nav className="nav">
                <Link to="/" className="nav-link">หน้าแรก</Link>
                <Link to="/add-promotion" className="nav-link">เพิ่มโปรโมชั่น</Link>
                <Link to="/test-promotion" className="nav-link">ทดสอบโปรโมชั่น</Link>
                <Link to="/payouts" className="nav-link">การจ่ายเงิน</Link>
              </nav>
        </header>

        <main className="main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/add-promotion" element={<AddPromotionPage />} />
              <Route path="/edit-promotion/:id" element={<EditPromotionPage />} />
              <Route path="/test-promotion" element={<TestPromotionPage />} />
              <Route path="/promotion/:id" element={<PromotionDetailPage />} />
              <Route path="/payouts" element={<PayoutsPage />} />
            </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
