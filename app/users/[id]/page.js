"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);   // profile being viewed
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null); // logged-in user

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch(`/api/users/${id}`);
      const data = await res.json();
      setUser(data);
      setLoading(false);
    }

    fetchUser();

    const stored = sessionStorage.getItem("user");
    if (stored) setCurrentUser(JSON.parse(stored));
  }, [id]);

  async function onDelete() {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    setDeleting(true); setError("");
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || "Delete failed");

      router.push('/users');
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  }
  async function onDeleteFavorite(anime_id) {
    const user = JSON.parse(sessionStorage.getItem("user"));
    await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anime_id, user_id: user?.id })
    });
    setUser(prev => ({
        ...prev,
        favorites: prev.favorites.filter(f => f.anime_id !== anime_id)
    }));
    }


  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not found</div>;
    return (
    <div className="profile-page">
        {/* Hero section */}
        <div className="profile-hero">
        <img src={user.profileimage} alt={user.username}/>
        <div className="detail-info">
            <h1>{user.username}</h1>
            <div style={{marginTop: 16, display: 'flex', gap: 8}}>
              {(currentUser?.is_admin === 1 || currentUser?.id === user.id) && (
              <Link href={`/users/${id}/edit`} style={{padding: '8px 20px', border: '1px solid #ffd700', borderRadius: 6, color: '#ffd700'}}>✏️ Edit</Link>
                )}
              {(currentUser?.is_admin === 1 || currentUser?.id === user.id) && (
              <button onClick={onDelete} disabled={deleting} style={{padding: '8px 20px', background: '#ff2d2d', borderRadius: 6, border: 'none', color: 'white'}}>{deleting ? "Deleting..." : "🗑️ Delete"}</button>
                )}
            <Link href='/users' style={{padding: '8px 20px', border: '1px solid #555', borderRadius: 6, color: '#aaa'}}>← Back</Link>
            </div>
        </div>
        </div>

        {/* Anime List - OUTSIDE hero */}
        <h3>My Anime List</h3>
        <div className="anime-list-grid">
        {user.favorites && user.favorites.map((fav, i) => (
        <div key={i} style={{background: '#1a1a1a', borderRadius: 12, border: '1px solid #333', overflow: 'hidden', transition: 'transform 0.2s'}}
        onMouseEnter={e => e.currentTarget.style.transform='translateY(-4px)'}
        onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
        <img src={fav.coverimage} style={{width: '100%', height: 200, objectFit: 'cover'}}/>
        <div style={{padding: 10}}>
            <a href={`/anime/${fav.anime_id}`} style={{color: '#ffd700', fontWeight: 'bold', fontSize: '0.9rem'}}>{fav.title}</a>
            <p style={{color: '#aaa', fontSize: '0.8rem', marginTop: 4}}>
            {fav.status === 'plan_to_watch' ? '📌 Plan to Watch' : 
            fav.status === 'watching' ? '👁️ Watching' :
            fav.status === 'completed' ? '✅ Completed' : '⏸️ Paused'}
            </p>
            {currentUser?.id === user.id && (
              <button onClick={() => onDeleteFavorite(fav.anime_id)} style={{marginTop: 8, background: 'transparent', border: '1px solid #ff2d2d', borderRadius: 6, padding: '4px 8px', color: '#ff2d2d', cursor: 'pointer', width: '100%'}}>🗑️ Remove</button>
            )}
        </div>
        </div>
        ))}
        </div>

        {error && <div style={{color: 'crimson', marginTop: 8}}>{error}</div>}
    </div>
    );}
