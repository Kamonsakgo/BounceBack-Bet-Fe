import { useState } from 'react'
import './App.css'

function App() {
  const [balance, setBalance] = useState(1000)
  const [betAmount, setBetAmount] = useState(10)
  const [gameResult, setGameResult] = useState(null)
  const [isSpinning, setIsSpinning] = useState(false)

  const handleBet = () => {
    if (betAmount > balance) return
    
    setIsSpinning(true)
    setGameResult(null)
    
    // Simulate game logic
    setTimeout(() => {
      const isWin = Math.random() > 0.5
      const multiplier = isWin ? 2 : 0
      const winnings = betAmount * multiplier
      
      setBalance(prev => prev - betAmount + winnings)
      setGameResult({ isWin, winnings, multiplier })
      setIsSpinning(false)
    }, 2000)
  }

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">🎯 BounceBack Bet</h1>
        <div className="balance">
          <span className="balance-label">Balance:</span>
          <span className="balance-amount">${balance.toLocaleString()}</span>
        </div>
      </header>

      <main className="main">
        <div className="game-container">
          <div className="game-area">
            <div className={`spinner ${isSpinning ? 'spinning' : ''}`}>
              {isSpinning ? '🎰' : '🎲'}
            </div>
            
            {gameResult && (
              <div className={`result ${gameResult.isWin ? 'win' : 'lose'}`}>
                <h2>{gameResult.isWin ? '🎉 You Win!' : '😔 You Lose'}</h2>
                <p>
                  {gameResult.isWin 
                    ? `+$${gameResult.winnings} (${gameResult.multiplier}x)` 
                    : `-$${betAmount}`
                  }
                </p>
              </div>
            )}
          </div>

          <div className="controls">
            <div className="bet-controls">
              <label htmlFor="bet-amount">Bet Amount:</label>
              <div className="bet-input-group">
                <input
                  id="bet-amount"
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  min="1"
                  max={balance}
                  disabled={isSpinning}
                />
                <div className="quick-bet-buttons">
                  <button 
                    onClick={() => setBetAmount(10)}
                    disabled={isSpinning}
                    className="quick-bet"
                  >
                    $10
                  </button>
                  <button 
                    onClick={() => setBetAmount(50)}
                    disabled={isSpinning}
                    className="quick-bet"
                  >
                    $50
                  </button>
                  <button 
                    onClick={() => setBetAmount(100)}
                    disabled={isSpinning}
                    className="quick-bet"
                  >
                    $100
                  </button>
                </div>
              </div>
            </div>

            <button 
              className={`bet-button ${isSpinning ? 'spinning' : ''}`}
              onClick={handleBet}
              disabled={isSpinning || betAmount > balance || betAmount <= 0}
            >
              {isSpinning ? 'Spinning...' : 'Place Bet'}
            </button>
          </div>
        </div>

        <div className="stats">
          <div className="stat-card">
            <h3>Total Bets</h3>
            <p>0</p>
          </div>
          <div className="stat-card">
            <h3>Win Rate</h3>
            <p>0%</p>
          </div>
          <div className="stat-card">
            <h3>Biggest Win</h3>
            <p>$0</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
