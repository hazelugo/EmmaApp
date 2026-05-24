/**
 * useCharacterVoice.js
 *
 * Plays pre-recorded MP3s from /public/voices/{character}/{type}/{index}.mp3
 * Falls back to Web Speech API (pitch/rate tuned per character) when a file
 * is missing or audio playback fails.
 *
 * To add a voice line: drop the MP3 in the matching folder and it's picked up
 * automatically — no code changes needed.
 */

/* ── Web Speech fallback config ──────────────────────────────────── */
const TTS_CONFIG = {
  peach:    { pitch: 1.25, rate: 0.90, lang: 'en-US' },
  daisy:    { pitch: 1.10, rate: 1.05, lang: 'en-US' },
  rosalina: { pitch: 0.88, rate: 0.80, lang: 'en-US' },
  toad:     { pitch: 1.65, rate: 1.15, lang: 'en-US' },
}

/* ── Phrase banks (used by Web Speech fallback) ───────────────────── */
const PHRASES = {
  peach: {
    correct:  ['Wahoo!', 'Wonderful!', "You're so smart!", 'How delightful!', 'Amazing work!', 'You got it!', 'Spectacular!', 'Brilliant!'],
    wrong:    ['Oh my! Try again!', 'Almost, sweetie!', 'Keep going!', "Don't give up!", 'You can do it!'],
    streak3:  ['Three in a row! Wonderful!'],
    streak5:  ['Five! Oh my, you are incredible!'],
    streak10: ['TEN IN A ROW! You are a math superstar!'],
    idle:     ['You can do it!', 'I believe in you!', 'Take your time!', "What's the answer?", 'You are so close!', 'Almost there!', 'Keep trying!'],
    levelUp:  ['You saved the kingdom! Well done!', 'A true princess of math!', 'What a superstar!'],
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
const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

function pick (arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickIndex (arr) {
  return Math.floor(Math.random() * arr.length)
}

/* ── Try to play a pre-recorded file, fall back to TTS ───────────── */
function playOrSpeak (characterId, type, index, fallbackText) {
  const src = `/voices/${characterId}/${type}/${index}.mp3`
  const audio = new Audio(src)

  audio.onerror = () => speakFallback(fallbackText, characterId)
  audio.play().catch(() => speakFallback(fallbackText, characterId))
}

function speakFallback (text, characterId) {
  if (!ttsSupported) return
  const cfg = TTS_CONFIG[characterId] ?? TTS_CONFIG[DEFAULT_CHAR]
  const utter = new SpeechSynthesisUtterance(text)
  utter.pitch  = cfg.pitch
  utter.rate   = cfg.rate
  utter.lang   = cfg.lang
  utter.volume = 0.95
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utter)
}

export function useCharacterVoice () {
  function sayCorrect (characterId, isMuted) {
    if (isMuted || Math.random() > 0.45) return
    const p = PHRASES[characterId] ?? PHRASES[DEFAULT_CHAR]
    const i = pickIndex(p.correct)
    playOrSpeak(characterId, 'correct', i, p.correct[i])
  }

  function sayWrong (characterId, isMuted) {
    if (isMuted || Math.random() > 0.65) return
    const p = PHRASES[characterId] ?? PHRASES[DEFAULT_CHAR]
    const i = pickIndex(p.wrong)
    playOrSpeak(characterId, 'wrong', i, p.wrong[i])
  }

  function sayStreakMilestone (n, characterId, isMuted) {
    const p    = PHRASES[characterId] ?? PHRASES[DEFAULT_CHAR]
    const type = n >= 10 ? 'streak10' : n >= 5 ? 'streak5' : 'streak3'
    const text = p[type][0]
    if (!isMuted) playOrSpeak(characterId, type, 0, text)
    return text
  }

  function sayIdle (characterId, isMuted) {
    const p    = PHRASES[characterId] ?? PHRASES[DEFAULT_CHAR]
    const i    = pickIndex(p.idle)
    const text = p.idle[i]
    if (!isMuted) playOrSpeak(characterId, 'idle', i, text)
    return text
  }

  function sayLevelUp (characterId, isMuted) {
    const p = PHRASES[characterId] ?? PHRASES[DEFAULT_CHAR]
    const i = pickIndex(p.levelUp)
    if (!isMuted) playOrSpeak(characterId, 'levelup', i, p.levelUp[i])
  }

  return { sayCorrect, sayWrong, sayStreakMilestone, sayIdle, sayLevelUp }
}
