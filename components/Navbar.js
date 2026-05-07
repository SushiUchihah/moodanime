// Global navbar shown on every page
// Reads sessionStorage to check if user is logged in
// Shows Login/Register if not logged in
// Shows profile picture, username, Logout button if logged in
// onLogout() clears sessionStorage and redirects to login
"use client"
import { useState, useEffect } from 'react'
import { useRouter } from "next/navigation";
import Link from 'next/link'

export default function Navbar() {
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    function checkUser() {
      const stored = sessionStorage.getItem("user");
      setCurrentUser(stored ? JSON.parse(stored) : null);
    }
    checkUser();
    window.addEventListener('focus', checkUser);
    window.addEventListener('userLogin', checkUser);
    return () => {
      window.removeEventListener('focus', checkUser);
      window.removeEventListener('userLogin', checkUser);
    };
  }, []);

  function onLogout() {
    sessionStorage.removeItem("user");
    setCurrentUser(null);
    router.push("/login");
  }

  return (
    <nav>
      <Link href="/">🎌 MoodAnime</Link>
      <Link href="/anime">Browse</Link>
      {currentUser && (
        <Link href="/anime/new">+ Add Anime</Link>
      )}
      {currentUser && (
        <Link href="/users">Mooders</Link>
      )}
      {currentUser?.is_admin === 1 && (
        <Link href="/admin">⚙️ Admin</Link>
      )}
      <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12}}>
        {currentUser ? (
          <>
            <img src={currentUser.profileimage || "/default-avatar.png"} width={35} height={35} style={{borderRadius: '50%', border: '2px solid #ff2d2d'}} alt="profile"/>
            <Link href={`/users/${currentUser.id}`}>{currentUser.username}</Link>
            <button onClick={onLogout} style={{padding: '4px 12px'}}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}