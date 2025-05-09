import { useEffect, useState, useCallback, useRef } from 'react'
import MainMenu from './MainMenu'
import {
  GAME_CONFIG,
  ANIMATION_TIMING,
  KEYBOARD_ROWS,
  ALL_VALID_WORDS,
  getRandomWord
} from './config'
import './App.css'

function App() {
  const [gameState, setGameState] = useState('menu') // 'menu', 'playing', 'instructions'
  const [currentRow, setCurrentRow] = useState(0)
  const [currentCell, setCurrentCell] = useState(0)
  const [grids, setGrids] = useState(Array(GAME_CONFIG.NUMBER_OF_GRIDS).fill([]))
  const [targetWords, setTargetWords] = useState([])
  const [completedGrids, setCompletedGrids] = useState(new Set())
  const [configVersion, setConfigVersion] = useState(0) // Add configVersion to force re-renders when config changes
  const isMounted = useRef(false)

  const generateGrid = useCallback(() => {
    const newGrid = []
    for (let i = 0; i < GAME_CONFIG.MAX_ATTEMPTS; i++) {
      const row = []
      for (let j = 0; j < GAME_CONFIG.WORD_LENGTH; j++) {
        row.push(<div 
          className="cell" 
          data-row={i} 
          data-col={j} 
          key={`${i}-${j}`}
        ></div>)
      }
      newGrid.push(<div className="row" key={i}>{row}</div>)
    }
    return newGrid
  }, [])

  const getUniqueRandomWords = useCallback(() => {
    const words = new Set()
    while(words.size < GAME_CONFIG.NUMBER_OF_GRIDS) {
      var word = getRandomWord()
      console.log('Random word:', word)
      words.add(word)
    }
    return Array.from(words)
  }, [])

  const checkWord = useCallback((word) => {
    return ALL_VALID_WORDS.includes(word.toLowerCase())
  }, [])

  const checkLetters = useCallback((word, target) => {
    const result = Array(GAME_CONFIG.WORD_LENGTH).fill('absent');
    const targetArr = target.split('');
    const wordArr = word.split('');
    
    // First check for correct positions (green)
    for (let i = 0; i < GAME_CONFIG.WORD_LENGTH; i++) {
      if (wordArr[i] === targetArr[i]) {
        result[i] = 'correct';
        targetArr[i] = null;
        wordArr[i] = null;
      }
    }
    
    // Then check for present but wrong position (yellow)
    for (let i = 0; i < GAME_CONFIG.WORD_LENGTH; i++) {
      if (wordArr[i] !== null) {
        const targetIndex = targetArr.indexOf(wordArr[i]);
        if (targetIndex !== -1) {
          result[i] = 'present';
          targetArr[targetIndex] = null;
        }
      }
    }
    
    return result;
  }, []);

  const handleKeyDown = useCallback((event) => {
    const key = event.key.toLowerCase()

    if (key === 'enter' && currentCell === GAME_CONFIG.WORD_LENGTH) {
      // Check if all current words are valid before proceeding
      const allWordsValid = Array.from({ length: GAME_CONFIG.NUMBER_OF_GRIDS }).every((_, gridIndex) => {
        if (completedGrids.has(gridIndex)) return true // Skip completed grids
        const cells = document.querySelectorAll(
          `.flexordle .grid:nth-child(${gridIndex + 1}) .row:nth-child(${currentRow + 1}) .cell`
        )
        const word = Array.from(cells).map(cell => cell.textContent).join('').toLowerCase()
        return checkWord(word)
      })

      if (!allWordsValid) return

      // Check each grid's word against its target
      let newCompletedGrids = new Set(completedGrids)
      
      for(let gridIndex = 0; gridIndex < GAME_CONFIG.NUMBER_OF_GRIDS; gridIndex++) {
        if (completedGrids.has(gridIndex)) continue // Skip completed grids
        
        const cells = document.querySelectorAll(
          `.flexordle .grid:nth-child(${gridIndex + 1}) .row:nth-child(${currentRow + 1}) .cell`
        )
        const word = Array.from(cells).map(cell => cell.textContent).join('').toLowerCase()
        const target = targetWords[gridIndex].toLowerCase()

        // Simplified keyboard key marking - only mark as used
        word.split('').forEach((letter) => {
          const keyButton = document.querySelector(`.keyboard-key[data-key="${letter.toUpperCase()}"]`)
          if (keyButton) {
            keyButton.classList.add('used')
          }
        })

        // Check for exact match
        if (word === target) {
          cells.forEach((cell) => {
            cell.classList.remove('active', 'present', 'absent', 'invalid')
            cell.classList.add('correct')
          })
          
          newCompletedGrids.add(gridIndex)
          const grid = document.querySelector(`.flexordle .grid:nth-child(${gridIndex + 1})`)
          grid.classList.add('completed')
        } else {
          // Normal letter checking logic
          const letterStatuses = checkLetters(word, target)
          cells.forEach((cell, index) => {
            cell.classList.remove('active')
            cell.classList.add(letterStatuses[index])
          })
        }
      }

      // Check for game end conditions after processing all grids
      if (newCompletedGrids.size === GAME_CONFIG.NUMBER_OF_GRIDS) {
        // Win condition - all grids completed
        document.querySelectorAll('.grid').forEach((grid, idx) => {
          setTimeout(() => {
            grid.classList.add('win')
          }, idx * ANIMATION_TIMING.STAGGER_DELAY) // Stagger the win animation
        })
        setTimeout(() => {
          alert('Congratulations! You won! 🎉')
        }, ANIMATION_TIMING.END_GAME_DELAY)
      } else if (currentRow === GAME_CONFIG.MAX_ATTEMPTS - 1) {
        // Lose condition - no more guesses and incomplete grids
        document.querySelectorAll('.grid:not(.completed)').forEach((grid, idx) => {
          const gridIndex = Array.from(grid.parentNode.children).indexOf(grid)
          setTimeout(() => {
            grid.classList.add('lose')
            alert(`Grid ${gridIndex + 1} word was: ${targetWords[gridIndex].toUpperCase()}`)
          }, idx * ANIMATION_TIMING.STAGGER_DELAY) // Stagger the lose animation
        })
        setTimeout(() => {}, ANIMATION_TIMING.END_GAME_DELAY)
      }

      setCompletedGrids(newCompletedGrids)
      
      // Only move to next row if there are still incomplete grids
      if (newCompletedGrids.size < GAME_CONFIG.NUMBER_OF_GRIDS && currentRow < GAME_CONFIG.MAX_ATTEMPTS - 1) {
        setCurrentRow(prev => prev + 1)
        setCurrentCell(0)
      }
      return
    }

    if (key === 'backspace' && currentCell > 0) {
      const prevCell = currentCell - 1
      const cells = document.querySelectorAll(
        `.flexordle .grid:not(.completed) .row:nth-child(${currentRow + 1}) .cell:nth-child(${currentCell})`
      )
      cells.forEach(cell => {
        cell.textContent = ''
        cell.classList.remove('active')
      })

      // Check if remaining word is complete and invalid
      if (prevCell === GAME_CONFIG.WORD_LENGTH - 1) {
        for (let gridIndex = 0; gridIndex < GAME_CONFIG.NUMBER_OF_GRIDS; gridIndex++) {
          if (completedGrids.has(gridIndex)) continue;
          
          const rowCells = document.querySelectorAll(
            `.flexordle .grid:nth-child(${gridIndex + 1}) .row:nth-child(${currentRow + 1}) .cell`
          )
          const word = Array.from(rowCells).map(cell => cell.textContent).join('').toLowerCase()
          
          rowCells.forEach(cell => {
            if (word.length === GAME_CONFIG.WORD_LENGTH && !checkWord(word)) {
              cell.classList.add('invalid')
            } else {
              cell.classList.remove('invalid')
            }
          })
        }
      } else {
        // If word is no longer complete, remove invalid class
        const rowCells = document.querySelectorAll(
          `.flexordle .grid:not(.completed) .row:nth-child(${currentRow + 1}) .cell`
        )
        rowCells.forEach(cell => {
          cell.classList.remove('invalid')
        })
      }
      
      setCurrentCell(prevCell)
      return
    }

    if (key.length === 1 && key.match(/[a-z]/i) && currentCell < GAME_CONFIG.WORD_LENGTH) {
      // Only select cells from non-completed grids
      const cells = document.querySelectorAll(
        `.flexordle .grid:not(.completed) .row:nth-child(${currentRow + 1}) .cell:nth-child(${currentCell + 1})`
      )
      cells.forEach(cell => {
        cell.textContent = key.toUpperCase()
        cell.classList.add('active')
      })
      
      setCurrentCell(prev => {
        const newCell = Math.min(prev + 1, GAME_CONFIG.WORD_LENGTH)
        
        // Check words when GAME_CONFIG.WORD_LENGTH letters are entered
        if (newCell === GAME_CONFIG.WORD_LENGTH) {
          for (let gridIndex = 0; gridIndex < GAME_CONFIG.NUMBER_OF_GRIDS; gridIndex++) {
            if (completedGrids.has(gridIndex)) continue;
            
            const rowCells = document.querySelectorAll(
              `.flexordle .grid:nth-child(${gridIndex + 1}) .row:nth-child(${currentRow + 1}) .cell`
            )
            const word = Array.from(rowCells).map(cell => cell.textContent).join('').toLowerCase()
            
            rowCells.forEach(cell => {
              if (!checkWord(word)) {
                cell.classList.add('invalid')
                cell.classList.remove('active')
              } else {
                cell.classList.remove('invalid')
              }
            })
          }
        } else {
          // If word is not complete, remove invalid class
          const rowCells = document.querySelectorAll(
            `.flexordle .grid:not(.completed) .row:nth-child(${currentRow + 1}) .cell`
          )
          rowCells.forEach(cell => {
            cell.classList.remove('invalid')
          })
        }
        return newCell
      })
    }
  }, [currentCell, currentRow, targetWords, checkWord, checkLetters, completedGrids])

  const handleKeyboardClick = useCallback((key) => {
    const keyEvent = {
      key: key === '⌫' ? 'backspace' : key.toLowerCase(),
      preventDefault: () => {}
    };
    handleKeyDown(keyEvent);
  }, [handleKeyDown]);

  const startGame = useCallback(() => {
    setGameState('playing')
    // Reset game state
    setCurrentRow(0)
    setCurrentCell(0)
    setCompletedGrids(new Set())
    
    // Initialize new game with current config
    const initialGrids = Array(GAME_CONFIG.NUMBER_OF_GRIDS).fill(generateGrid())
    setGrids(initialGrids)
    const words = getUniqueRandomWords()
    setTargetWords(words)
    // Increment config version to force re-render
    setConfigVersion(v => v + 1)
  }, [generateGrid, getUniqueRandomWords])

  const showInstructions = useCallback(() => {
    setGameState('instructions')
  }, [])

  const returnToMenu = useCallback(() => {
    setGameState('menu')
  }, [])

  const renderContent = () => {
    switch (gameState) {
      case 'menu':
        return <MainMenu onStartGame={startGame} onShowInstructions={showInstructions} />
      
      case 'instructions':
        return (
          <div className="instructions">
            <h2>How to Play</h2>
            <ul>
              <li>Guess four 4-letter words at the same time</li>
              <li>Each guess applies to all four grids</li>
              <li>Green means the letter is correct and in the right spot</li>
              <li>Yellow means the letter is in the word but in the wrong spot</li>
              <li>Gray means the letter is not in the word</li>
            </ul>
            <button className="menu-button" onClick={returnToMenu}>Back to Menu</button>
          </div>
        )
      
      case 'playing':
        return (
          <>
            <div className="title">
              <h1>
                {'FLEXORDLE'.split('').map((letter, index) => (
                  <span key={index} className="title-letter">{letter}</span>
                ))}
              </h1>
              <button className="menu-button small" onClick={returnToMenu}>Menu</button>
            </div>
            <div className="flexordle">
              {grids.map((grid, index) => (
                <div className="grid" key={`grid-${index}`}>
                  {grid}
                </div>
              ))}
            </div>
            <div className="keyboard">
              {KEYBOARD_ROWS.map((row, rowIndex) => (
                <div key={rowIndex} className="keyboard-row">
                  {row.map((key) => (
                    <button
                      key={key}
                      data-key={key}
                      className={`keyboard-key ${key === 'ENTER' || key === '⌫' ? 'keyboard-key-wide' : ''}`}
                      onClick={() => handleKeyboardClick(key)}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </>
        )
    }
  }

  useEffect(() => {
    if (!isMounted.current || configVersion > 0) {
      const initialGrids = Array(GAME_CONFIG.NUMBER_OF_GRIDS).fill(generateGrid())
      setGrids(initialGrids)
      
      const words = getUniqueRandomWords()
      setTargetWords(words)
      
      isMounted.current = true
    }
  }, [configVersion]) // Add configVersion to dependencies

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="container">
      {renderContent()}
    </div>
  )
}

export default App
