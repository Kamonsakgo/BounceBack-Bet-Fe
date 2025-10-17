import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AddPromotionPage from './pages/AddPromotionPage'
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
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/add-promotion" className="nav-link">Add Promotion</Link>
          </nav>
        </header>

        <main className="main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/add-promotion" element={<AddPromotionPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
