// Main anime listing page
// Shows all anime with mood filter, search, and grid layout
// Uses useState for mood, search, filtered list
// Uses useEffect to fetch anime from API on load
// filterMood() maps moods to tags to filter anime list
"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Page() {
  const [anime, setAnime] = useState([]);
  const [mood, setMood] = useState("All");
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [showPopup, setShowPopup] = useState(false);    //random pop up new in main interface
  const [hotAnime, setHotAnime] = useState([]);
  

  useEffect(() => {
    setLoading(true);
    let url = `/api/anime`;
    if (query) url = `${url}?search=${query}`

    async function fetchAnime() {
      const res = await fetch(url);
      const data = await res.json();
      const alreadyShown = sessionStorage.getItem("popupShown");
        if (!alreadyShown) {
            const hot = data.filter(a => a.rating >= 8.5).sort(() => Math.random() - 0.5).slice(0, 3);
            setHotAnime(hot);
            setShowPopup(true);
            sessionStorage.setItem("popupShown", "true");
        }
      setAnime(data);
      setFiltered(data);
      setLoading(false);
    }
    fetchAnime();
  }, [query]);

  function filterMood(selectedMood) {
    setMood(selectedMood);

    const moodTags = {
    "Hype": [
        "Action", "Shonen", "Supernatural", "Mecha", "Hype", "Adventure", "Fantasy",
        "Battle", "Martial Arts", "Tournament", "Power Ups", "Epic Journey"
    ],
    "Happy": [
        "Comedy", "School", "Games", "Isekai", "Happy", "Romantic", "Adventure", "Brotherhood",
        "Slice of Life", "Friendship", "Club Life", "Lighthearted", "Idols"
    ],
    "Sad": [
        "Drama", "Historical", "Dark Fantasy", "Sad",
        "Tragedy", "Loss", "War", "Emotional", "Philosophical"
    ],
    "Competitive": [
        "Sports", "Games", "Mecha", "Competitive",
        "Teamwork", "Rivalry", "Tournament", "Strategy", "Training Arc"
    ],
    "Horror": [
        "Horror", "Supernatural", "Dark Fantasy", "Dark",
        "Psychological", "Thriller", "Demons", "Ghosts", "Curses"
    ],
    "Romance": [
        "Romance", "Romantic", "Drama", "School",
        "Shojo", "Love Triangle", "Slice of Life", "Heartwarming", "Forbidden Love"
    ],
    "Mystery": [
        "Detective", "Mystery", "Psychological", "Mindblown",
        "Crime", "Suspense", "Investigation", "Plot Twist", "Conspiracy"
    ],
    "Epic": [
        "Fantasy", "Sci-Fi", "Historical", "Action", "Epic",
        "Adventure", "Legendary", "Mythology", "Worldbuilding", "Heroic"
    ]
    };


    if (selectedMood === "All") {
        setFiltered(anime);
    } else {
        const tags = moodTags[selectedMood];

        setFiltered(anime.filter(item =>
        item.tags.some(tag => tags.includes(tag.tag_name))
        ));
    }
  }

  if (loading) return <div>Loading...</div>;

    return (
    <div>
        {/* Mood Section - Full Width */}
        <div className="mood-section">
        <h2>How are you feeling today?</h2>
        <div className="mood-buttons">
            <button className={`mood-btn ${mood === 'All' ? 'active' : ''}`} onClick={() => filterMood("All")}>🎬<span>All</span></button>
            <button className={`mood-btn ${mood === 'Hype' ? 'active' : ''}`} onClick={() => filterMood("Hype")}>💪<span>Hype</span></button>
            <button className={`mood-btn ${mood === 'Happy' ? 'active' : ''}`} onClick={() => filterMood("Happy")}>😄<span>Happy</span></button>
            <button className={`mood-btn ${mood === 'Sad' ? 'active' : ''}`} onClick={() => filterMood("Sad")}>😢<span>Sad</span></button>
            <button className={`mood-btn ${mood === 'Competitive' ? 'active' : ''}`} onClick={() => filterMood("Competitive")}>⚡<span>Competitive</span></button>
            <button className={`mood-btn ${mood === 'Horror' ? 'active' : ''}`} onClick={() => filterMood("Horror")}>😱<span>Horror</span></button>
            <button className={`mood-btn ${mood === 'Romance' ? 'active' : ''}`} onClick={() => filterMood("Romance")}>💘<span>Romance</span></button>
            <button className={`mood-btn ${mood === 'Mystery' ? 'active' : ''}`} onClick={() => filterMood("Mystery")}>🔍<span>Mystery</span></button>
            <button className={`mood-btn ${mood === 'Epic' ? 'active' : ''}`} onClick={() => filterMood("Epic")}>🔥<span>Epic</span></button>
        </div>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
        <input type='text' placeholder='Search Anime...' value={search} onChange={(e) => setSearch(e.target.value)}/>
        <button onClick={() => setQuery(search)}>🔎</button>
        <button onClick={() => { setSearch(""); setQuery(""); }}>Reset</button>
        </div>

        {/* Anime Grid */}
        <div className="anime-grid">
        {filtered.map((item) => (
            <div className="anime-card" key={item.id}>
            <img src={item.coverimage} alt={item.title}/>
            <div className="anime-card-body">
                <h2>{item.title}</h2>
                {item.rating >= 9 && <span>🔥 Hot</span>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '8px 0' }}>
        {item.tags.map((tag, index) => {
            // Map emojis to certain tag categories
            const emojiMap = {
            Action: "⚔️",
            Adventure: "🗺️",
            Fantasy: "🪄",
            Shonen: "💥",
            Comedy: "😂",
            Romance: "💘",
            School: "🏫",
            Isekai: "🌌",
            Sports: "🏆",
            Horror: "😱",
            Mystery: "🔍",
            SciFi: "🚀",
            Brotherhood: "🤝",
            Drama: "🎭",
            Dark: "🌑"
            };

            const emoji = emojiMap[tag.tag_name] || "🎬"; // default emoji

            return (
            <span key={index} style={{
                background: '#222',
                border: '1px solid #ffd700',
                borderRadius: '12px',
                padding: '4px 10px',
                fontSize: '0.8rem',
                color: '#ffd700',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'transform 0.2s ease',
                cursor: 'default'
            }}>
                <span>{emoji}</span> {tag.tag_name}
            </span>
            );
        })}
        </div>

                <p>{item.synopsis}</p>
                
                <Link href={`/anime/${item.id}`}>Read More</Link>
            </div>
            </div>
        ))}
        </div>
        {showPopup && (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.3s ease'
        }}>
            <div style={{
            background: '#1a1a1a',
            border: '2px solid #ff2d2d',
            borderRadius: 16,
            padding: 32,
            maxWidth: 600,
            width: '90%',
            position: 'relative',
            animation: 'slideUp 0.5s ease'
            }}>
            <button onClick={() => setShowPopup(false)} style={{
                position: 'absolute', top: 12, right: 12,
                background: 'transparent', color: 'white',
                fontSize: '1.5rem', border: 'none', cursor: 'pointer'
            }}>✕</button>
            
            <h2 style={{textAlign: 'center', color: '#ff2d2d', marginBottom: 4}}>🔥 What's Hot Today</h2>
            <p style={{textAlign: 'center', color: '#ffd700', marginBottom: 24, fontSize: '0.9rem'}}>Trending anime picked just for you</p>
            
            <div style={{display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap'}}>
                {hotAnime.map((item) => (
                <a href={`/anime/${item.id}`} key={item.id} 
                    onClick={() => setShowPopup(false)}
                    style={{textDecoration: 'none', textAlign: 'center', width: 150}}>
                    <img src={item.coverimage} style={{
                    width: 150, height: 200,
                    objectFit: 'cover',
                    borderRadius: 8,
                    border: '2px solid #ff2d2d',
                    transition: 'transform 0.2s'
                    }}/>
                    <p style={{color: '#ffd700', fontSize: '0.85rem', margin: '8px 0 2px', fontWeight: 'bold'}}>{item.title}</p>
                    <p style={{color: 'white', fontSize: '0.75rem'}}>⭐ {item.rating}</p>
                </a>
                ))}
            </div>

            <div style={{textAlign: 'center', marginTop: 24}}>
                <button onClick={() => setShowPopup(false)} style={{
                background: '#ff2d2d', color: 'white',
                border: 'none', padding: '10px 32px',
                borderRadius: 8, fontSize: '1rem', cursor: 'pointer'
                }}>Let's Go! 🎌</button>
            </div>
            </div>
        </div>
        )}
    </div>
    );
}