"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [animeImages, setAnimeImages] = useState([]);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    // Fetch real anime covers
    fetch('/api/anime')
      .then(res => res.json())
      .then(data => setAnimeImages(data.slice(0, 6).map(a => a.coverimage)));
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;600&display=swap');

        .landing {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: #0a0a0a;
        }

        .bg-grid {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255,45,45,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,45,45,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .floating-img {
          position: absolute;
          border-radius: 12px;
          border: 2px solid rgba(255,45,45,0.3);
          opacity: 0.15;
          animation: floatUp 8s infinite linear;
          object-fit: cover;
        }

        @keyframes floatUp {
          0% { transform: translateY(100vh) rotate(-5deg); opacity: 0; }
          10% { opacity: 0.15; }
          90% { opacity: 0.15; }
          100% { transform: translateY(-100vh) rotate(5deg); opacity: 0; }
        }

        .hero {
          position: relative;
          text-align: center;
          z-index: 10;
          opacity: ${visible ? 1 : 0};
          transform: ${visible ? 'translateY(0)' : 'translateY(30px)'};
          transition: all 1s ease;
        }

        .logo-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(5rem, 15vw, 12rem);
          line-height: 0.9;
          background: linear-gradient(135deg, #ff2d2d 0%, #ffd700 50%, #ff2d2d 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 3s linear infinite;
          letter-spacing: 4px;
        }

        @keyframes shine {
          to { background-position: 200% center; }
        }

        .tagline {
          font-family: 'Rajdhani', sans-serif;
          font-size: 1.4rem;
          color: rgba(255,255,255,0.6);
          letter-spacing: 6px;
          text-transform: uppercase;
          margin: 16px 0 48px;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; color: #ffd700; }
        }

        .cta-btn {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.5rem;
          letter-spacing: 4px;
          padding: 16px 48px;
          background: transparent;
          border: 2px solid #ff2d2d;
          color: white;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }

        .cta-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: #ff2d2d;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          z-index: -1;
        }

        .cta-btn:hover::before { transform: translateX(0); }
        .cta-btn:hover { color: white; border-color: #ff2d2d; }

        .mood-pills {
          display: flex;
          gap: 12px;
          margin-top: 32px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .pill {
          font-family: 'Rajdhani', sans-serif;
          padding: 6px 16px;
          border: 1px solid rgba(255,215,0,0.3);
          border-radius: 20px;
          color: rgba(255,215,0,0.6);
          font-size: 0.9rem;
          letter-spacing: 2px;
          animation: pillFloat 3s ease-in-out infinite;
        }

        .pill:nth-child(2) { animation-delay: 0.3s; }
        .pill:nth-child(3) { animation-delay: 0.6s; }
        .pill:nth-child(4) { animation-delay: 0.9s; }
        .pill:nth-child(5) { animation-delay: 1.2s; }

        @keyframes pillFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); border-color: rgba(255,45,45,0.6); color: rgba(255,45,45,0.8); }
        }
      `}</style>

      <div className="landing">
        <div className="bg-grid" />

        {animeImages.map((src, i) => (
          <img
            key={i}
            src={src}
            className="floating-img"
            width={120}
            height={170}
            style={{
              left: `${10 + i * 15}%`,
              animationDelay: `${i * 1.3}s`,
              animationDuration: `${7 + i}s`
            }}
          />
        ))}

        <div className="hero">
          <div className="logo-text">MOOD<br/>ANIME</div>
          <p className="tagline">Find anime that matches your soul</p>
          <button className="cta-btn" onClick={() => router.push('/anime')}>
            FIND YOUR ANIME →
          </button>
          <div className="mood-pills">
            {['💪 HYPE', '😄 HAPPY', '😢 SAD', '⚡ COMPETITIVE', '🎬 ALL'].map(m => (
              <div key={m} className="pill">{m}</div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}