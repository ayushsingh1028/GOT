import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Hero.css'

gsap.registerPlugin(ScrollTrigger)

// ─── Chapter data ────────────────────────────────────────────────────────────
const CHAPTERS = [
  {
    id: 'prologue',
    progress: [0, 0.12],
    title: 'The Ancient Chronicles',
    subtitle: 'A SONG OF ICE AND FIRE',
    body: 'In the beginning, there were only the words of the Maesters — secrets sealed within ancient tomes, waiting for a hand brave enough to open them.',
    sigil: '✦',
  },
  {
    id: 'winterfell',
    progress: [0.12, 0.30],
    title: 'The North Remembers',
    subtitle: 'HOUSE STARK — WINTERFELL',
    body: 'Winter is coming. Beyond the ancient walls, the cold whispers of the North carry stories older than the Wall itself.',
    sigil: '⚔',
  },
  {
    id: 'westeros',
    progress: [0.30, 0.52],
    title: 'The Seven Kingdoms',
    subtitle: 'THE REALM OF WESTEROS',
    body: 'From the Eyrie\'s clouded peaks to the red sands of Dorne — seven kingdoms, one throne, a thousand reasons to bleed.',
    sigil: '♜',
  },
  {
    id: 'kings-landing',
    progress: [0.52, 0.70],
    title: 'Where Crowns Are Won',
    subtitle: 'KING\'S LANDING — THE CAPITAL',
    body: 'The city that swallows kings whole. Gold and treachery perfume the air. Every smile here conceals a blade.',
    sigil: '👑',
  },
  {
    id: 'swords',
    progress: [0.70, 0.87],
    title: 'A Thousand Blades',
    subtitle: 'FORGED IN CONQUEST',
    body: 'One thousand swords, surrendered by enemies of Aegon the Conqueror. Melted. Reshaped. Made into something terrible and magnificent.',
    sigil: '⚒',
  },
  {
    id: 'throne',
    progress: [0.87, 1.0],
    title: 'The Iron Throne',
    subtitle: 'WHEN YOU PLAY THE GAME OF THRONES',
    body: 'You win — or you die.',
    sigil: '♔',
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

// ─── Component ───────────────────────────────────────────────────────────────
const Hero = () => {
  const videoRef = useRef(null)
  const overlayRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const bodyRef = useRef(null)
  const sigilRef = useRef(null)
  const vignetteRef = useRef(null)
  const chapterLabelRef = useRef(null)

  const [activeChapter, setActiveChapter] = useState(0)
  const [videoReady, setVideoReady] = useState(false)
  const [introComplete, setIntroComplete] = useState(false)

  // ─── Chapter transition ───────────────────────────────────────────────────
  const prevChapter = useRef(-1)
  const transitionChapter = (idx) => {
    if (prevChapter.current === idx) return
    prevChapter.current = idx
    setActiveChapter(idx)

    const ch = CHAPTERS[idx]
    const tl = gsap.timeline()

    // fade out old text
    tl.to([titleRef.current, subtitleRef.current, bodyRef.current, sigilRef.current], {
      y: -24, opacity: 0, duration: 0.35, ease: 'power2.in', stagger: 0.04,
    })
    // update DOM mid-fade via callback
      .call(() => {
        if (titleRef.current) titleRef.current.textContent = ch.title
        if (subtitleRef.current) subtitleRef.current.textContent = ch.subtitle
        if (bodyRef.current) bodyRef.current.textContent = ch.body
        if (sigilRef.current) sigilRef.current.textContent = ch.sigil
      })
    // fade in new text
      .fromTo(
        [sigilRef.current, subtitleRef.current, titleRef.current, bodyRef.current],
        { y: 32, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', stagger: 0.07 }
      )

    // chapter label
    if (chapterLabelRef.current) {
      gsap.fromTo(chapterLabelRef.current,
        { opacity: 0, x: 12 },
        { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
      )
      chapterLabelRef.current.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(CHAPTERS.length).padStart(2, '0')}`
    }
  }

  // ─── Setup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = true
    video.playsInline = true
    video.setAttribute('webkit-playsinline', '')
    video.setAttribute('playsinline', '')

    const playOnReady = () => {
      video.play().catch(() => {
        console.log('Autoplay blocked for background video; it will continue after interaction.')
      })
      setTimeout(() => setVideoReady(true), 1000)
    }

    video.addEventListener('loadedmetadata', playOnReady)
    if (video.readyState >= 1) playOnReady()

    // Initial chapter text
    const ch0 = CHAPTERS[0]
    if (titleRef.current) titleRef.current.textContent = ch0.title
    if (subtitleRef.current) subtitleRef.current.textContent = ch0.subtitle
    if (bodyRef.current) bodyRef.current.textContent = ch0.body
    if (sigilRef.current) sigilRef.current.textContent = ch0.sigil

    return () => video.removeEventListener('loadedmetadata', playOnReady)
  }, [])

  useEffect(() => {
    if (!videoReady) return

    const video = videoRef.current
    const duration = video.duration || 1

    // Update chapter based on video time
    const onVideoTimeUpdate = () => {
      const p = clamp(video.currentTime / duration, 0, 1)
      const idx = CHAPTERS.findIndex(c => p >= c.progress[0] && p < c.progress[1])
      transitionChapter(idx === -1 ? CHAPTERS.length - 1 : idx)

      // Vignette intensity based on video progress
      const vinInt = 0.55 + Math.sin(p * Math.PI) * 0.2
      if (vignetteRef.current) {
        vignetteRef.current.style.opacity = String(vinInt)
      }
    }

    // When video ends, mark intro as complete
    const onVideoEnd = () => {
      setIntroComplete(true)
    }

    video.addEventListener('timeupdate', onVideoTimeUpdate)
    video.addEventListener('ended', onVideoEnd)

    // Play video immediately
    video.play().catch(() => {
      console.log('Autoplay blocked; video will play on interaction.')
    })

    // Entrance animation for text
    gsap.fromTo(
      [sigilRef.current, subtitleRef.current, titleRef.current, bodyRef.current],
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', stagger: 0.1, delay: 0.3 }
    )

    return () => {
      video.removeEventListener('timeupdate', onVideoTimeUpdate)
      video.removeEventListener('ended', onVideoEnd)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoReady])

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Intro Overlay ── */}
      <div 
        className={`got-intro-overlay ${introComplete ? 'hidden' : ''}`}
        onClick={() => setIntroComplete(true)}
      >
        <div className="got-intro-content">
          <div className="got-intro-title">Game of Thrones</div>
          <div className="got-intro-subtitle">The Chronicles of Westeros</div>
          <div className="got-intro-message">
            <p>Watch the opening story unfold...</p>
            <p className="got-intro-sub-message">Then explore the realm.</p>
          </div>
          <div className="got-intro-loader">
            <div className="got-intro-dot"></div>
            <div className="got-intro-dot"></div>
            <div className="got-intro-dot"></div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--gold-dim)', marginTop: '48px', letterSpacing: '0.3em' }}>
            CLICK TO CONTINUE
          </div>
        </div>
      </div>

      {/* ── Hero Section ── */}
      <div className="got-hero-section">
        {/* Video */}
        <video
          ref={videoRef}
          className="got-video"
          src="/video/one.mp4"
          playsInline
          muted
          autoPlay
          preload="auto"
          webkit-playsinline
          playsinline
        />

        {/* Layers */}
        <div ref={vignetteRef} className="got-vignette" />
        <div ref={overlayRef} className="got-overlay" />
        <div className="got-grain" />

        {/* Nav */}
        <nav className="got-nav">
          <div className="got-nav-logo">Game of Thrones</div>
          <ul className="got-nav-links">
            {['The World', 'Characters', 'Houses', 'History'].map(l => (
              <li key={l}><a href="#0">{l}</a></li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="got-content">
          <span ref={sigilRef} className="got-sigil" />
          <div className="got-divider">
            <div className="got-divider-line" />
            <div className="got-divider-diamond" />
            <div className="got-divider-line right" />
          </div>
          <span ref={subtitleRef} className="got-subtitle" />
          <h1 ref={titleRef} className="got-title" />
          <p ref={bodyRef} className="got-body" />
        </div>

        {/* Right panel with chapter indicator */}
        <div className="got-right-panel">
          <div ref={chapterLabelRef} className="got-chapter-label">01 / 06</div>
          <div className="got-vert-line" />
          <div className="got-dots">
            {CHAPTERS.map((_, i) => (
              <div
                key={i}
                className={`got-dot ${i === activeChapter ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Hero
