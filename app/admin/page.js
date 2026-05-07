"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminPage() {
  const router = useRouter();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin
    const user = JSON.parse(sessionStorage.getItem("user") || "null");
    if (!user || user.is_admin !== 1) {
      router.push('/anime'); // redirect non-admins away
      return;
    }

    // Fetch all unapproved anime
    fetch('/api/admin/pending')
      .then(res => res.json())
      .then(data => { setPending(data); setLoading(false); });
  }, []);

  async function onApprove(id) {
    await fetch(`/api/admin/approve/${id}`, { method: 'PUT' });
    setPending(prev => prev.filter(a => a.id !== id));
  }

  async function onReject(id) {
    await fetch(`/api/admin/reject/${id}`, { method: 'PUT' });
    setPending(prev => prev.filter(a => a.id !== id));
  }

  if (loading) return <div>Loading...</div>;

return (
  <div>
    <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, borderBottom: '2px solid #ff2d2d', paddingBottom: 16}}>
      <h1 style={{margin: 0}}>⚙️ Admin — Pending Approvals</h1>
      <span style={{background: '#ff2d2d', color: 'white', borderRadius: 20, padding: '2px 12px', fontSize: '0.9rem'}}>{pending.length} pending</span>
    </div>

    {pending.length === 0 && (
      <div style={{textAlign: 'center', padding: 48}}>
        <p style={{fontSize: '3rem'}}>✅</p>
        <p style={{color: '#ffd700', fontSize: '1.2rem'}}>All caught up! No pending anime.</p>
      </div>
    )}

    {pending.map((anime) => (
      <div key={anime.id} style={{
        display: 'flex', gap: 16, alignItems: 'center',
        background: '#1a1a1a', padding: 16, borderRadius: 12,
        margin: '12px 0', border: '1px solid #333',
        transition: 'border-color 0.2s'
      }}>
        <img src={anime.coverimage} width={80} height={110}
          style={{borderRadius: 8, objectFit: 'cover', border: '2px solid #ff2d2d', flexShrink: 0}}/>
        <div style={{flex: 1}}>
          <h2 style={{margin: '0 0 4px'}}>{anime.title}</h2>
          <p style={{color: '#aaa', fontSize: '0.85rem', margin: '0 0 8px'}}>{anime.synopsis}</p>
          <div style={{display: 'flex', gap: 12}}>
            <span style={{color: '#ffd700', fontSize: '0.8rem'}}>⭐ {anime.rating}</span>
            <span style={{color: '#ff2d2d', fontSize: '0.8rem', background: '#2a1a1a', padding: '2px 8px', borderRadius: 4}}>⏳ Pending</span>
          </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <button onClick={() => onApprove(anime.id)} style={{
            background: '#22c55e', color: 'white', border: 'none',
            padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
            fontWeight: 'bold', fontSize: '0.9rem'
          }}>✅ Approve</button>
          <button onClick={() => onReject(anime.id)} style={{
            background: 'transparent', color: '#ff2d2d',
            border: '1px solid #ff2d2d', padding: '10px 20px',
            borderRadius: 8, cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem'
          }}>❌ Reject</button>
        </div>
      </div>
    ))}

    <Link href="/anime" style={{display: 'inline-block', marginTop: 24, color: '#aaa'}}>← Back to Browse</Link>
  </div>
);}