import React, { useState, useMemo } from 'react'
import { GAME_CONFIG, updateGameConfig } from './config'
import './MainMenu.css'

const MainMenu = ({ onStartGame, onShowInstructions }) => {
  const [config, setConfig] = useState(GAME_CONFIG)
  const [showConfig, setShowConfig] = useState(false)

  // Calculate max attempts based on number of grids
  const maxAttempts = useMemo(() => {
    return {
      min: config.NUMBER_OF_GRIDS + 1,
      max: config.NUMBER_OF_GRIDS + 5
    }
  }, [config.NUMBER_OF_GRIDS])

  const handleConfigChange = (key, value) => {
    const numValue = parseInt(value, 10)
    if (isNaN(numValue)) return
    
    const newConfig = { ...config, [key]: numValue }
    
    // Adjust MAX_ATTEMPTS if NUMBER_OF_GRIDS changes
    if (key === 'NUMBER_OF_GRIDS') {
      const minAttempts = numValue + 1
      newConfig.MAX_ATTEMPTS = Math.max(
        minAttempts,
        Math.min(config.MAX_ATTEMPTS, numValue + 5)
      )
    }
    
    setConfig(newConfig)
    updateGameConfig(newConfig)
  }

  const handleStartGame = () => {
    updateGameConfig(config)
    onStartGame()
  }

  return (
    <div className="main-menu">
      <div className="menu-content">
        <h1 className="main-menu-title">
          <span className="title-letter">F</span>
          <span className="title-letter">L</span>
          <span className="title-letter">E</span>
          <span className="title-letter">X</span>
          <span className="title-letter">O</span>
          <span className="title-letter">R</span>
          <span className="title-letter">D</span>
          <span className="title-letter">L</span>
          <span className="title-letter">E</span>
        </h1>
        
        <div className="main-menu-buttons">
          <button className="menu-button primary" onClick={handleStartGame}>
            Play Game
          </button>
          <button className="menu-button secondary" onClick={onShowInstructions}>
            How to Play
          </button>
          <button 
            className={`menu-button ${showConfig ? 'active' : 'config'}`}
            onClick={() => setShowConfig(!showConfig)}
          >
            {showConfig ? 'Hide Settings' : 'Game Settings'}
          </button>
        </div>

        {showConfig && (
          <div className="config-panel">
            <h2 className="config-title">Game Settings</h2>
            <div className="config-item">
              <label htmlFor="grids">Number of Grids: {config.NUMBER_OF_GRIDS}</label>
              <div className="input-wrapper">
                <input
                  id="grids"
                  type="range"
                  min="4"
                  max="16"
                  value={config.NUMBER_OF_GRIDS}
                  onChange={(e) => handleConfigChange('NUMBER_OF_GRIDS', e.target.value)}
                />
                <span className="input-limits">4-16</span>
              </div>
            </div>
            <div className="config-item">
              <label htmlFor="attempts">Max Attempts: {config.MAX_ATTEMPTS}</label>
              <div className="input-wrapper">
                <input
                  id="attempts"
                  type="range"
                  min={maxAttempts.min}
                  max={maxAttempts.max}
                  value={config.MAX_ATTEMPTS}
                  onChange={(e) => handleConfigChange('MAX_ATTEMPTS', e.target.value)}
                />
                <span className="input-limits">{maxAttempts.min}-{maxAttempts.max}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MainMenu