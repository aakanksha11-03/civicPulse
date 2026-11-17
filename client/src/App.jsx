import { Routes, Route, Navigate, Link, NavLink, useNavigate } from 'react-router-dom'; import { useEffect, useState } from 'react';
import { useAuth } from './auth.jsx'; import api from './api';
import { Login, Register, Forgot, Reset, Verify, Profile } from './pages/AuthPages.jsx';
import { Dashboard, NewComplaint, Detail, Notifications } from './pages/Complaints.jsx';
import { Admin } from './pages/Admin.jsx';

function Guard({ children, roles }) {
  const { user, ready } = useAuth(); if (!ready) return <p className="pad">Loading…</p>;
  if (!user) return <Navigate to="/login" />; if (roles && !roles.includes(user.role)) return <Navigate to="/" />; return children;
}
function Nav() {
  const { user, logout } = useAuth(), nav = useNavigate(), [n, setN] = useState(0);
  useEffect(() => { if (user) api.get('/notifications').then(r => setN(r.data.filter(x => !x.read).length)).catch(() => {}); }, [user, location.pathname]);
  return <header className="nav"><Link to="/" className="brand"><span className="dot" />CivicPulse</Link>
    <nav>{user ? <>
      <NavLink to="/">Complaints</NavLink>
      {user.role === 'citizen' && <NavLink to="/new">Report an issue</NavLink>}
      {['admin', 'supervisor'].includes(user.role) && <NavLink to="/admin">{user.role === 'admin' ? 'Manage' : 'Reports'}</NavLink>}
      <NavLink to="/notifications">Alerts{n > 0 && <b className="badge">{n}</b>}</NavLink>
      <NavLink to="/profile">{user.name}</NavLink>
      <button className="link" onClick={() => { logout(); nav('/login'); }}>Log out</button></> : <>
      <NavLink to="/login">Log in</NavLink><NavLink to="/register">Create account</NavLink></>}</nav></header>;
}
export default function App() {
  return <><Nav /><main><Routes>
    <Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /><Route path="/forgot" element={<Forgot />} />
    <Route path="/reset/:token" element={<Reset />} /><Route path="/verify/:token" element={<Verify />} />
    <Route path="/" element={<Guard><Dashboard /></Guard>} /><Route path="/new" element={<Guard roles={['citizen']}><NewComplaint /></Guard>} />
    <Route path="/complaint/:id" element={<Guard><Detail /></Guard>} /><Route path="/notifications" element={<Guard><Notifications /></Guard>} />
    <Route path="/profile" element={<Guard><Profile /></Guard>} /><Route path="/admin" element={<Guard roles={['admin', 'supervisor']}><Admin /></Guard>} />
  </Routes></main></>;
}
