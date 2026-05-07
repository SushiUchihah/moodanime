// Anime detail page - shows full info for one anime
// Fetches anime, reactions, and comments on load
// onDelete() - deletes this anime
// onPostComment() - posts comment as logged in user
// onGiveReaction() - gives reaction as logged in user
// onFavorite() - adds/updates anime in user's watchlist

"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Page() {
  const { id } = useParams();                           //to get id from url
  const router = useRouter();                           //direct the user to next page after action
  const [anime, setAnime] = useState(null);             // Stores the anime data from API
  const [currentUser, setCurrentUser] = useState(null); // Stores the logged in user
  const [loading, setLoading] = useState(true);         // Shows loading while fetching data
  const [deleting, setDeleting] = useState(false);      // Disables delete button while deleting->prevent multiple delete requests
  const [error, setError] = useState("");               // Shows error message if something fails
  const [comment, setComment] = useState("");           //Stores comments from comment box
  const [reactions, setReaction] = useState("");        // Stores current reaction state
  const [favStatus, setFavStatus] = useState("");       //Stores Current favorite status
  const reactionEmoji = {
        "like": "👍",
        "love": "❤️",
        "dislike": "👎",
        "hate": "😤"
    }                                                    // Maps reaction type strings to emoji for display
  // ============================================================
  // PART 2: FUNCTIONS
  // ============================================================

  // useEffect - runs when page first loads or when id changes
  // Fetches anime data, reactions, and comments all at once
  // Also reads sessionStorage to get the logged in user
  useEffect(() => {
  async function fetchAnime() {
    const stored = sessionStorage.getItem("user");
        if (stored) setCurrentUser(JSON.parse(stored));
    const res = await fetch(`/api/anime/${id}`);            // Fetches anime data
    const data = await res.json();
    
    const reaRes = await fetch(`/api/reactions/${id}`);     // Fetches anime reactions
    const reaData = await reaRes.json();

    const commentsRes = await fetch(`/api/comments/${id}`); // Fetches comments
    const commentsData = await commentsRes.json();

    setAnime({ ...data, reactions: reaData, comments: commentsData }); // Merge anime + reactions + comments
    setLoading(false);

   }
    fetchAnime();
  }, [id]);

    // onDelete - called when Delete button is clicked
    // Asks for confirmation first, then sends DELETE request to API
   // Redirects to /anime list after successful deletion
  async function onDelete() {
    if (!confirm("Delete this anime? This cannot be undone.")) return;
    setDeleting(true); setError("");
    try {
      const res = await fetch(`/api/anime/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || "Delete failed");

      router.push('/anime');
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  }

    // onPostComment - called when Post button is clicked
  // Reads logged in user from sessionStorage
  // Sends POST request to comments API with comment text and user id
  // Updates the comments list immediately without refreshing
  async function onPostComment() {
    try {
      console.log("user from storage:", sessionStorage.getItem("user"));
      const user = JSON.parse(sessionStorage.getItem("user"));
      const res = await fetch(`/api/comments/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_text: comment, user_id: user?.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Comment failed");

      // Update local state with new comment
      setAnime(prev => ({
        ...prev,
        comments: [...(prev.comments || []), data]
      }));
      setComment("");
    } catch (e) {
      setError(e.message);
    }
  }

  // onGiveReaction - called when emoji reaction button is clicked
  // reaction_type parameter is "like", "love", "dislike", or "hate"
  // Sends POST to reactions API with user id and reaction type
  // Updates reaction counts immediately without refreshing
  async function onGiveReaction(reaction_type) {
    try {
        const user = JSON.parse(sessionStorage.getItem("user") || "null");
        const res = await fetch(`/api/reactions/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anime_id: id, reaction_type: reaction_type, user_id: user?.id || 1 })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Reaction failed");

        // Replace reactions with updated counts
        setAnime(prev => ({
        ...prev,
        reactions: data
        }));
        setReaction("");

    } catch (e) {
        setError(e.message);
    }
  }

  async function onResetReaction() {
      const user = JSON.parse(sessionStorage.getItem("user"));
      const res = await fetch(`/api/reactions/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user?.id })
      });
      const data = await res.json();
      setAnime(prev => ({ ...prev, reactions: data }));
    }

  // onFavorite - called when Watching/Completed/Plan to Watch/Paused button is clicked
  // status parameter is "watching", "completed", "plan_to_watch", or "dropped"
  // Sends POST to favorites API to save or update this anime in user's watchlist
  // Highlights the selected button using favStatus state
  async function onFavorite(status) {
    const user = JSON.parse(sessionStorage.getItem("user"));
    console.log("Sending:", { anime_id: Number(id), user_id: user?.id, status });
    const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anime_id: Number(id), user_id: user?.id || 1, status })
    });
    const data = await res.json();
    console.log("Response:", data);
    setFavStatus(status);               // Updates button highlight to show selected status
    }

  if (loading) return <div>Loading...</div>;
  if (!anime) return <div>Not found</div>;

  // Sort characters by role priority
const sortedCharacters = anime.characters ? [...anime.characters].sort((a, b) => {
  const order = { 'Main(Protagonist)': 0, 'Main': 1, 'Side': 2, 'Supporting': 3, 'Villain': 4 };
  return (order[a.role] ?? 5) - (order[b.role] ?? 5);
}) : [];
  
  // ============================================================
  // PART 3: RETURN - displays the UI
  // ============================================================
  return (
    <div>
        <div className="detail-hero">
        <img src={anime.coverimage} alt={anime.title}/>
        <div className="detail-info">
            <h1>{anime.title}</h1>
            <p>⭐ {anime.rating}</p>
            <div style={{margin: '12px 0'}}>
              {currentUser ? (
                <div>
                  <p style={{color: '#ffd700', marginBottom: 8}}>Add to List:</p>
                  <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                    <button onClick={() => onFavorite("watching")} style={{background: favStatus === 'watching' ? '#ffd700' : '#1a1a1a', color: favStatus === 'watching' ? '#000' : 'white'}}>👁️ Watching</button>
                    <button onClick={() => onFavorite("completed")} style={{background: favStatus === 'completed' ? '#ffd700' : '#1a1a1a', color: favStatus === 'completed' ? '#000' : 'white'}}>✅ Completed</button>
                    <button onClick={() => onFavorite("plan_to_watch")} style={{background: favStatus === 'plan_to_watch' ? '#ffd700' : '#1a1a1a', color: favStatus === 'plan_to_watch' ? '#000' : 'white'}}>📌 Plan to Watch</button>
                    <button onClick={() => onFavorite("dropped")} style={{background: favStatus === 'dropped' ? '#ffd700' : '#1a1a1a', color: favStatus === 'dropped' ? '#000' : 'white'}}>⏸️ Paused</button>
                  </div>
                </div>
              ) : (
                <p style={{color: '#ffd700'}}>🔒 <a href="/login">Login</a> or <a href="/register">Register</a> to add to list</p>
              )}
            </div>
            <p>{anime.synopsis}</p>
            {anime.trailer && <a href={anime.trailer} target="_blank">▶ Watch Trailer</a>}
            <div style={{marginTop: 16, display: 'flex', gap: 8}}>
            {currentUser?.is_admin === 1 && (
            <Link href={`/anime/${id}/edit`} style={{
                padding: '8px 20px',
                border: '1px solid #ffd700',
                borderRadius: 6,
                color: '#ffd700'
            }}>✏️ Edit</Link>)}
            {currentUser?.is_admin === 1 && (
            <button onClick={onDelete} disabled={deleting} style={{
                padding: '8px 20px',
                background: '#ff2d2d',
                borderRadius: 6,
                border: 'none',
                color: 'white'
            }}>{deleting ? "Deleting..." : "🗑️ Delete"}</button>)}
            <Link href='/anime' style={{
                padding: '8px 20px',
                border: '1px solid #555',
                borderRadius: 6,
                color: '#aaa'
            }}>← Back</Link>
            </div>
        </div>
        </div>

        <h3>Tags</h3>
        <ul className="tag-list">
        {anime.tags && anime.tags.map((tag, index) => (
            <li key={index} className="tag-pill">{tag.tag_name}</li>
        ))}
        </ul>

        <h3>Characters</h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        {sortedCharacters.map((character, index) => (
            <div key={index} style={{
            position: 'relative',
            borderRadius: 12,
            overflow: 'hidden',
            minHeight: 100,
            border: '1px solid #333'
            }}>
            {/* Faded background image */}
            {character.image && (
                <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${character.image})`,
                backgroundSize: '200px',
                backgroundPosition: 'right center',
                opacity: 0.2,
                filter: 'blur(2px)'
                }}/>
            )}
            {/* Content on top */}
            <div style={{
                position: 'relative', zIndex: 1,
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 16
            }}>
                {character.image && (
                <img src={character.image} width={60} height={80}
                    style={{borderRadius: 8, border: '2px solid #ff2d2d', objectFit: 'cover', flexShrink: 0}}/>
                )}
                <div>
                <strong style={{color: '#ffd700', fontSize: '1.1rem'}}>{character.name}</strong>
                <span style={{color: '#ff2d2d', marginLeft: 8, fontSize: '0.85rem'}}>— {character.role}</span>
                <p style={{color: 'rgba(255,255,255,0.8)', margin: '4px 0 0', fontSize: '0.9rem'}}>{character.description}</p>
                </div>
            </div>
            </div>
        ))}
        </div>

        <h3>Reactions</h3>
        <div style={{marginBottom: 8}}>
        {anime.reactions && anime.reactions.map((r, index) => (
            <span key={index} style={{marginRight: 12}}>{reactionEmoji[r.reaction_type]} x {r.count}</span>
        ))}
        </div>
        {currentUser ? (
          <div>
            <button onClick={() => onGiveReaction("like")}>👍</button>
            <button onClick={() => onGiveReaction("love")}>❤️</button>
            <button onClick={() => onGiveReaction("dislike")}>👎</button>
            <button onClick={() => onGiveReaction("hate")}>😤</button>
            <button onClick={onResetReaction} style={{background: 'transparent', border: '1px solid #555', color: '#aaa', padding: '4px 12px', borderRadius: 6}}>↩️ Reset</button>
          </div>
        ) : (
          <p style={{color: '#ffd700'}}>🔒 <a href="/login">Login</a> or <a href="/register">Register</a> to react</p>
        )}

        <h3>Comments</h3>
        {anime.comments && anime.comments.map((c, index) => (
          <div key={index} style={{background: '#1a1a1a', padding: 10, borderRadius: 8, margin: '8px 0', display: 'flex', gap: 12, alignItems: 'center'}}>
            <img src={c.profileimage} width={35} height={35} style={{borderRadius: '50%', border: '2px solid #ff2d2d'}}/>
            <div>
              <strong style={{color: '#ffd700'}}>{c.username}</strong>
              <p>{c.comment_text}</p>
            </div>
          </div>
        ))}

        {currentUser ? (
          <div style={{display: 'flex', gap: 8, marginTop: 12}}>
            <input type="text" placeholder="Comment..." value={comment} onChange={(e) => setComment(e.target.value)}/>
            <button onClick={onPostComment}>Post</button>
          </div>
        ) : (
          <p style={{color: '#ffd700'}}>🔒 <a href="/login">Login</a> or <a href="/register">Register</a> to comment</p>
        )}

        {error && <div style={{color: 'crimson', marginTop: 8}}>{error}</div>}
    </div>
  );
}
