import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AddPromotionPage from './pages/AddPromotionPage'
import TestPromotionPage from './pages/TestPromotionPage'
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
              </nav>
        </header>

        <main className="main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/add-promotion" element={<AddPromotionPage />} />
              <Route path="/test-promotion" element={<TestPromotionPage />} />
            </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
