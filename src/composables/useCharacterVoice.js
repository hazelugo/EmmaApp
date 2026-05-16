/**
 * useCharacterVoice.js
 *
 * Web Speech API wrapper that gives each character a distinct voice personality.
 * Gracefully no-ops when speechSynthesis is unavailable or the user is muted.
 *
 * Each character has tuned pitch/rate settings and their own phrase banks.
 * sayCorrect fires ~45% of the time to avoid being annoying; streak and idle
 * calls always fire.
 */

const CHARACTER_CONFIG = {
  peach:    { pitch: 1.25, rate: 0.90, lang: 'en-US' },
  daisy:    { pitch: 1.10, rate: 1.05, lang: 'en-US' },
  rosalina: { pitch: 0.88, rate: 0.80, lang: 'en-US' },
  toad:     { pitch: 1.65, rate: 1.15, lang: 'en-US' },
}

const PHRASES = {
  peach: {
    correct:  ['Wahoo!', 'Wonderful!', "You're so smart!", 'How delightful!', 'Amazing work!', 'You got it!', 'Spectacular!', 'Brilliant!'],
    wrong:    ['Oh my! Try again!', 'Almost, sweetie!', 'Keep going!', "Don't give up!"],
    streak3:  ['Three in a row! Wonderful!'],
    streak5:  ['Five! Oh my, you are incredible!'],
    streak10: ['TEN IN A ROW! You are a math superstar!'],
    idle:     ['You can do it!', 'I believe in you!', 'Take your time!', "What's the answer?", 'You are so close!', 'Almost there!'],
    levelUp:  ['You saved the kingdom! Well done!', 'A true princess of math!'],
  },
  daisy: {
    correct:  ['Oh yeah!', 'Awesome!', "That's what I'm talking about!", 'You nailed it!', 'So good!', 'Incredible!', 'Get some!'],
    wrong:    ['Oops! Try again!', 'Almost!', "You've got this!", 'Shake it off!'],
    streak3:  ['Three for three! You are on a roll!'],
    streak5:  ['FIVE! You are absolutely crushing it!'],
    streak10: ['TEN! Oh yeah! You are a champion!'],
    idle:     ['Come on, you have got this!', 'I know you can do it!', "Let's go!", "Don't be shy!", 'You are so smart!'],
    levelUp:  ['World beaten! You rock!', 'Daisy power wins again!'],
  },
  rosalina: {
    correct:  ['Wonderful...', 'The stars shine for you!', 'Brilliant!', 'Well done, star child!', 'Superb...', 'Magnificent!'],
    wrong:    ['The stars never give up... and neither should you.', 'Try once more.', 'You will find the answer.', 'Believe in yourself.'],
    streak3:  ['Three correct... the cosmos smiles upon you.'],
    streak5:  ['Five... you burn as bright as a star!'],
    streak10: ['Ten... extraordinary. The universe is proud.'],
    idle:     ['The answer awaits you...', 'Think it through...', 'I have faith in you.', 'The stars are watching.', 'Trust your mind.'],
    levelUp:  ['A world conquered by wisdom. Magnificent.', 'The cosmos celebrates your victory.'],
  },
  toad: {
    correct:  ['Woo hoo!', 'Yeah yeah yeah!', "That's it!", 'You got it, buddy!', 'Fantastic!', 'Toadally awesome!', 'Oh boy oh boy!'],
    wrong:    ['Oopsie! Try again!', 'Almost! You will get it!', "Don't worry!", 'Keep trying!', 'So close!'],
    streak3:  ['THREE! Oh boy oh boy oh boy!'],
    streak5:  ['FIVE IN A ROW! You are incredible!'],
    streak10: ['TEN! I cannot believe it! AMAZING!'],
    idle:     ['Hey, whatcha thinking?', 'You have got this, I believe in you!', 'Come on come on come on!', 'You are so smart, just try!'],
    levelUp:  ['Victory! You are the best mathematician ever!', 'Toad is so proud of you!'],
  },
}

const DEFAULT_CHAR = 'peach'
const supported    = typeof window !== 'undefined' && 'speechSynthesis' in window

function pick (arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function speak (text, characterId) {
  if (!supported) return
  const cfg   = CHARACTER_CONFIG[characterId] ?? CHARACTER_CONFIG[DEFAULT_CHAR]
  const utter = new SpeechSynthesisUtterance(text)
  utter.pitch  = cfg.pitch
  utter.rate   = cfg.rate
  utter.lang   = cfg.lang
  utter.volume = 0.95
  window.speechSynthesis.cancel()   // prevent phrase queue buildup
  window.speechSynthesis.speak(utter)
}

export function useCharacterVoice () {
  /** Speak a correct-answer quip (~45% fire rate so it stays fun, not annoying). */
  function sayCorrect (characterId, isMuted) {
    if (isMuted || Math.random() > 0.45) return
    const p = PHRASES[characterId] ?? PHRASES[DEFAULT_CHAR]
    speak(pick(p.correct), characterId)
  }

  /** Speak a wrong-answer encouragement (~65% fire rate). */
  function sayWrong (characterId, isMuted) {
    if (isMuted || Math.random() > 0.65) return
    const p = PHRASES[characterId] ?? PHRASES[DEFAULT_CHAR]
    speak(pick(p.wrong), characterId)
  }

  /**
   * Speak a streak-milestone line (always fires at 3, 5, 10).
   * Returns the text spoken so the caller can display it in a bubble.
   */
  function sayStreakMilestone (n, characterId, isMuted) {
    const p    = PHRASES[characterId] ?? PHRASES[DEFAULT_CHAR]
    const text = n >= 10 ? p.streak10[0]
               : n >= 5  ? p.streak5[0]
               :            p.streak3[0]
    if (!isMuted) speak(text, characterId)
    return text
  }

  /**
   * Speak an idle nudge (always fires).
   * Returns the text so the caller can show it in a speech bubble.
   */
  function sayIdle (characterId, isMuted) {
    const p    = PHRASES[characterId] ?? PHRASES[DEFAULT_CHAR]
    const text = pick(p.idle)
    if (!isMuted) speak(text, characterId)
    return text
  }

  /** Speak a level-completion line (always fires). */
  function sayLevelUp (characterId, isMuted) {
    const p = PHRASES[characterId] ?? PHRASES[DEFAULT_CHAR]
    if (!isMuted) speak(pick(p.levelUp), characterId)
  }

  return { sayCorrect, sayWrong, sayStreakMilestone, sayIdle, sayLevelUp }
}
