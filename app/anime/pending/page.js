export default function Page() {
  return (
    <div style={{textAlign: 'center', marginTop: 80}}>
      <h1>⏳ Submitted!</h1>
      <p style={{color: '#ffd700', marginTop: 16}}>Your anime is waiting for admin approval.</p>
      <a href="/anime" style={{color: '#ff2d2d', marginTop: 24, display: 'block'}}>← Back to Browse</a>
    </div>
  );
}