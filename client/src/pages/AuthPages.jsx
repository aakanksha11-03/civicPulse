import { useState, useEffect } from 'react'; import { Link, useNavigate, useParams } from 'react-router-dom'; import api, { err } from '../api'; import { useAuth } from '../auth.jsx';
const useForm = init => { const [v, setV] = useState(init); return [v, k => e => setV({ ...v, [k]: e.target.value }), setV]; };
function Card({ title, children, msg, error }) { return <div className="card narrow"><h1>{title}</h1>{error && <p className="alert err">{error}</p>}{msg && <p className="alert ok">{msg}</p>}{children}</div>; }
export function Login() {
  const [f, set] = useForm({ email: '', password: '' }), [error, setE] = useState(''), { login } = useAuth(), nav = useNavigate();
  const go = async e => { e.preventDefault(); try { await login(f.email, f.password); nav('/'); } catch (x) { setE(err(x)); } };
  return <Card title="Log in" error={error}><form onSubmit={go}><label>Email<input type="email" required value={f.email} onChange={set('email')} /></label>
    <label>Password<input type="password" required value={f.password} onChange={set('password')} /></label><button>Log in</button></form>
    <p><Link to="/forgot">Forgot your password?</Link> · <Link to="/register">Create an account</Link></p>
    <details><summary>Demo accounts (password: Password@123)</summary><small>citizen@ · admin@ · supervisor@ · works@ · power@ · water@ · sanitation@ civicpulse.test</small></details></Card>;
}
export function Register() {
  const [f, set] = useForm({ name: '', email: '', phone: '', password: '' }), [error, setE] = useState(''), [msg, setM] = useState('');
  const go = async e => { e.preventDefault(); setE(''); try { setM((await api.post('/auth/register', f)).data.message); } catch (x) { setE(err(x)); } };
  return <Card title="Create your account" error={error} msg={msg}><form onSubmit={go}>
    <label>Full name<input required value={f.name} onChange={set('name')} /></label><label>Email<input type="email" required value={f.email} onChange={set('email')} /></label>
    <label>Phone<input value={f.phone} onChange={set('phone')} /></label><label>Password (6+ characters)<input type="password" minLength={6} required value={f.password} onChange={set('password')} /></label>
    <button>Create account</button></form><p>Already registered? <Link to="/login">Log in</Link></p></Card>;
}
export function Forgot() {
  const [email, setEmail] = useState(''), [msg, setM] = useState('');
  return <Card title="Reset your password" msg={msg}><form onSubmit={async e => { e.preventDefault(); setM((await api.post('/auth/forgot', { email })).data.message); }}>
    <label>Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></label><button>Send reset link</button></form></Card>;
}
export function Reset() {
  const { token } = useParams(), [password, setP] = useState(''), [msg, setM] = useState(''), [error, setE] = useState('');
  return <Card title="Choose a new password" msg={msg} error={error}><form onSubmit={async e => { e.preventDefault(); try { setM((await api.post('/auth/reset/' + token, { password })).data.message); } catch (x) { setE(err(x)); } }}>
    <label>New password<input type="password" minLength={6} required value={password} onChange={e => setP(e.target.value)} /></label><button>Save password</button></form></Card>;
}
export function Verify() {
  const { token } = useParams(), [msg, setM] = useState('Verifying…'), [error, setE] = useState('');
  useEffect(() => { api.get('/auth/verify/' + token).then(r => setM(r.data.message)).catch(x => { setM(''); setE(err(x)); }); }, []);
  return <Card title="Email verification" msg={msg} error={error}><Link to="/login">Go to log in</Link></Card>;
}
export function Profile() {
  const { user, setUser } = useAuth(), [f, set] = useForm({ name: user.name, phone: user.phone || '', password: '' }), [msg, setM] = useState('');
  return <Card title="Your profile" msg={msg}><p>{user.email} · {user.role}{user.department && ` · ${user.department}`}</p>
    <form onSubmit={async e => { e.preventDefault(); const { data } = await api.put('/auth/me', f); setUser(data); setM('Profile saved'); }}>
      <label>Name<input value={f.name} onChange={set('name')} /></label><label>Phone<input value={f.phone} onChange={set('phone')} /></label>
      <label>New password (leave blank to keep)<input type="password" value={f.password} onChange={set('password')} /></label><button>Save changes</button></form></Card>;
}
