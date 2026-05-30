import { useEffect, useRef, useState } from 'react'
import './App.css'
import Hero from './components/Hero'
import Section1 from './components/Section1'

function App() {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = 1.0
    audio.playsInline = true
    audio.autoplay = true

    // Attempt autoplay immediately on load
    const playAudio = () => {
      audio.play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch(() => {
          console.log("Autoplay blocked. Soundtrack queued to start on first interaction.")
        })
    }

    playAudio()

    // Fallback trigger: play audio on first successful user interaction anywhere on the document
    const handleInteraction = () => {
      if (!audio.paused) return
      audio.play()
        .then(() => {
          setIsPlaying(true)
          document.removeEventListener('click', handleInteraction)
          document.removeEventListener('scroll', handleInteraction)
          document.removeEventListener('keydown', handleInteraction)
          document.removeEventListener('touchstart', handleInteraction)
          window.removeEventListener('scroll', handleInteraction)
        })
        .catch(err => {
          console.log("Playback attempt rejected, waiting for next interaction:", err)
        })
    }

    document.addEventListener('click', handleInteraction)
    document.addEventListener('scroll', handleInteraction)
    document.addEventListener('keydown', handleInteraction)
    document.addEventListener('touchstart', handleInteraction)
    window.addEventListener('scroll', handleInteraction)

    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('scroll', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
      window.removeEventListener('scroll', handleInteraction)
    }
  }, [isPlaying])

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
      setIsPlaying(true)
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src="/video/Videoobuchenie_-_Game_Of_Thrones_theme_Orchestra_cover_(mp3.pm).mp3"
        loop
        preload="auto"
        autoPlay
        playsInline
      />

      <Hero />
      <Section1 />

      {/* Floating Premium Sound Toggle Button */}
      <button 
        onClick={toggleMute}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 9999,
          background: 'rgba(10, 7, 5, 0.85)',
          border: '1px solid var(--gold, #c9a84c)',
          borderRadius: '50%',
          width: '46px',
          height: '46px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isPlaying 
            ? '0 0 15px rgba(201, 168, 76, 0.4), inset 0 0 8px rgba(201, 168, 76, 0.2)'
            : '0 4px 10px rgba(0, 0, 0, 0.5)',
          transition: 'all 0.3s ease',
          outline: 'none'
        }}
        aria-label="Toggle Soundtrack"
      >
        {isPlaying ? (
          /* Animated Audio Wave Indicator */
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '14px' }}>
            {[1, 2, 3, 4].map(bar => (
              <div 
                key={bar} 
                style={{
                  width: '2px',
                  background: 'var(--gold, #c9a84c)',
                  borderRadius: '1px',
                  height: '100%',
                  transformOrigin: 'bottom',
                  animation: `soundWave ${0.5 + bar * 0.15}s ease-in-out infinite alternate`
                }} 
              />
            ))}
          </div>
        ) : (
          /* Premium Muted Icon */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold, #c9a84c)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        )}
      </button>

      {/* CSS for soundWave animation */}
      <style>{`
        @keyframes soundWave {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </>
  )
}

export default App
