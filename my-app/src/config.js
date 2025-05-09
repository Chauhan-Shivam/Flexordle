import wordList from './words.json'

// Game configuration object
let gameConfig = {
  NUMBER_OF_GRIDS: 4,
  MAX_ATTEMPTS: 8,
  WORD_LENGTH: 5
}

// Use only the first list for answers
const ANSWER_WORDS = wordList[0].filter(word => 
  word.length === gameConfig.WORD_LENGTH && 
  /^[a-zA-Z]+$/.test(word)
).map(word => word.toLowerCase())

// Combine both lists for valid guesses
const ALL_VALID_WORDS = [...new Set([
  ...wordList[0],
  ...wordList[1]
].filter(word => 
  word.length === gameConfig.WORD_LENGTH && 
  /^[a-zA-Z]+$/.test(word)
).map(word => word.toLowerCase()))]

// Animation timing constants
const ANIMATION_TIMING = {
  STAGGER_DELAY: 200,
  END_GAME_DELAY: 1500
}

// Keyboard layout
const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
]

// Configuration update function
const updateGameConfig = (newConfig) => {
  gameConfig = { ...gameConfig, ...newConfig }
  if (newConfig.WORD_LENGTH) {
    // Update both arrays on word length change
    ANSWER_WORDS.length = 0
    ALL_VALID_WORDS.length = 0
    ANSWER_WORDS.push(...wordList[0].filter(word => 
      word.length === newConfig.WORD_LENGTH && 
      /^[a-zA-Z]+$/.test(word)
    ).map(word => word.toLowerCase()))
    ALL_VALID_WORDS.push(...new Set([
      ...wordList[0],
      ...wordList[1]
    ].filter(word => 
      word.length === newConfig.WORD_LENGTH && 
      /^[a-zA-Z]+$/.test(word)
    ).map(word => word.toLowerCase())))
  }
  return gameConfig
}

// Random word selection function
const getRandomWord = () => {
  if (ANSWER_WORDS.length === 0) {
    console.error('No words available for current word length')
    return 'error'
  }
  return ANSWER_WORDS[Math.floor(Math.random() * ANSWER_WORDS.length)]
}

// Export all configurations and functions
export {
  gameConfig as GAME_CONFIG,
  ANSWER_WORDS,
  ALL_VALID_WORDS,
  ANIMATION_TIMING,
  KEYBOARD_ROWS,
  updateGameConfig,
  getRandomWord
}