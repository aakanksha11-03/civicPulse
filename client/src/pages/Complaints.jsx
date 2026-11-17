import { useEffect, useState } from 'react'; import { Link, useNavigate, useParams } from 'react-router-dom'; import api, { err } from '../api'; import { useAuth } from '../auth.jsx';
const label = s => (s || '').replace('_', ' ');
export const Tag = ({ v, kind }) => <span className={`tag ${kind || ''} ${v}`}>{label(v)}</span>;
export function Dashboard() {
  const { user } = useAuth(), [list, setList] = useState([]), [q, setQ] = useState({ status: '', priority: '', overdue: '' });
  useEffect(() => { api.get('/complaints', { params: Object.fromEntries(Object.entries(q).filter(([, v]) => v)) }).then(r => setList(r.data)); }, [q]);
  const open = list.filter(c => !['resolved', 'verified'].includes(c.status)).length;
  return <div className="pad"><div className="row"><h1>{user.role === 'citizen' ? 'Your complaints' : user.role === 'officer' ? 'Assigned to you' : 'All complaints'}</h1>
    {user.role === 'citizen' && <Link className="btn" to="/new">Report an issue</Link>}</div>
    <p className="muted">{list.length} shown · {open} still open</p>
    <div className="filters"><select value={q.status} onChange={e => setQ({ ...q, status: e.target.value })}><option value="">Any status</option>
      {['submitted', 'assigned', 'accepted', 'rejected', 'in_progress', 'resolved', 'verified', 'escalated'].map(s => <option key={s} value={s}>{label(s)}</option>)}</select>
      <select value={q.priority} onChange={e => setQ({ ...q, priority: e.target.value })}><option value="">Any priority</option>{['urgent', 'high', 'medium', 'low'].map(s => <option key={s}>{s}</option>)}</select>
      <label className="inline"><input type="checkbox" checked={!!q.overdue} onChange={e => setQ({ ...q, overdue: e.target.checked ? '1' : '' })} />Overdue only</label></div>
    {list.length === 0 && <p className="empty">Nothing here yet.{user.role === 'citizen' && ' Report your first issue to get started.'}</p>}
    <div className="list">{list.map(c => <Link to={'/complaint/' + c._id} key={c._id} className="item">
      <div><strong>{c.title}</strong><div className="muted">{c.category} · {c.location?.address || 'No address'} · {new Date(c.createdAt).toLocaleDateString()}</div></div>
      <div className="tags">{c.duplicateOf && <Tag v="possible duplicate" />}<Tag v={c.priority} kind="p" /><Tag v={c.status} /></div></Link>)}</div></div>;
}
export function NewComplaint() {
  const nav = useNavigate(), [f, setF] = useState({ title: '', description: '', address: '', lat: '', lng: '', category: '' }), [files, setFiles] = useState([]), [cats, setCats] = useState([]), [error, setE] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => { api.get('/categories').then(r => setCats(r.data)); }, []);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const locate = () => navigator.geolocation?.getCurrentPosition(p => setF(x => ({ ...x, lat: p.coords.latitude.toFixed(6), lng: p.coords.longitude.toFixed(6) })), () => setE('Could not read your location. Enter coordinates or an address instead.'));
  const submit = async e => { e.preventDefault(); setBusy(true); const d = new FormData(); Object.entries(f).forEach(([k, v]) => v && d.append(k, v)); [...files].forEach(x => d.append('photos', x));
    try { const { data } = await api.post('/complaints', d); nav('/complaint/' + data._id); } catch (x) { setE(err(x)); setBusy(false); } };
  return <div className="card"><h1>Report an issue</h1>{error && <p className="alert err">{error}</p>}<form onSubmit={submit}>
    <label>What is the problem?<input required value={f.title} onChange={set('title')} placeholder="Deep pothole near the school gate" /></label>
    <label>Describe it<textarea required rows={4} value={f.description} onChange={set('description')} /></label>
    <label>Category <small>(leave on automatic and we will pick one)</small><select value={f.category} onChange={set('category')}><option value="">Automatic</option>{cats.map(c => <option key={c._id}>{c.name}</option>)}</select></label>
    <label>Address or landmark<input value={f.address} onChange={set('address')} /></label>
    <div className="grid2"><label>Latitude<input value={f.lat} onChange={set('lat')} /></label><label>Longitude<input value={f.lng} onChange={set('lng')} /></label></div>
    <button type="button" className="ghost" onClick={locate}>Use my current location</button>
    <label>Photos (up to 4)<input type="file" accept="image/*" multiple onChange={e => setFiles(e.target.files)} /></label>
    <button disabled={busy}>{busy ? 'Submitting…' : 'Submit complaint'}</button></form></div>;
}
const Gallery = ({ title, imgs }) => imgs?.length ? <><h3>{title}</h3><div className="gallery">{imgs.map(i => <a key={i} href={i} target="_blank"><img src={i} /></a>)}</div></> : null;
export function Detail() {
  const { id } = useParams(), { user } = useAuth(), [c, setC] = useState(null), [officers, setOff] = useState([]), [cats, setCats] = useState([]), [error, setE] = useState(''), [t, setT] = useState({ officer: '', priority: '', note: '', rating: 5, comment: '' });
  const load = () => api.get('/complaints/' + id).then(r => setC(r.data)).catch(x => setE(err(x)));
  useEffect(() => { load(); if (user.role === 'admin') { api.get('/users', { params: { role: 'officer' } }).then(r => setOff(r.data)); } }, [id]);
  const act = async (fn) => { try { setE(''); await fn(); setT(x => ({ ...x, note: '' })); load(); } catch (x) { setE(err(x)); } };
  const [files, setFiles] = useState([]);
  if (!c) return <div className="pad">{error || 'Loading…'}</div>;
  const put = (p, d) => act(() => api.put(`/complaints/${id}/${p}`, d));
  const upd = status => act(() => { const d = new FormData(); d.append('status', status); d.append('note', t.note); [...files].forEach(f => d.append('photos', f)); return api.put(`/complaints/${id}/status`, d); });
  const r = user.role, s = c.status;
  return <div className="pad detail"><div className="row"><h1>{c.title}</h1><div className="tags"><Tag v={c.priority} kind="p" /><Tag v={s} /></div></div>
    {error && <p className="alert err">{error}</p>}
    <p>{c.description}</p><p className="muted">{c.category} · {c.department || 'Not yet assigned to a department'} · {c.location?.address || 'No address'}
      {c.location?.lat && <> · <a target="_blank" href={`https://www.openstreetmap.org/?mlat=${c.location.lat}&mlon=${c.location.lng}#map=17/${c.location.lat}/${c.location.lng}`}>View on map</a></>}</p>
    <p className="muted">Reported by {c.citizen?.name} · Due {c.dueAt && new Date(c.dueAt).toLocaleString()}{c.officer && ` · Officer: ${c.officer.name}`}</p>
    {c.duplicateOf && <p className="alert warn">Possible duplicate of an earlier nearby report. <Link to={'/complaint/' + c.duplicateOf}>Open original</Link></p>}
    {c.duplicateCount > 0 && <p className="alert warn">{c.duplicateCount} similar report(s) merged here.</p>}
    {c.rejectionReason && <p className="alert err">Last rejection reason: {c.rejectionReason}</p>}
    <Gallery title="Photos from citizen" imgs={c.photos} /><Gallery title="Work progress" imgs={c.progressPhotos} />
    {c.resolutionNote && <><h3>Resolution note</h3><p>{c.resolutionNote}</p></>}
    {c.feedback?.rating && <p>Citizen feedback: {'★'.repeat(c.feedback.rating)} {c.feedback.comment}</p>}

    {r === 'admin' && !['resolved', 'verified'].includes(s) && <div className="panel"><h3>Assign to a department officer</h3><div className="grid2">
      <select value={t.officer} onChange={e => setT({ ...t, officer: e.target.value })}><option value="">Choose officer</option>{officers.map(o => <option key={o._id} value={o._id}>{o.name} ({o.department})</option>)}</select>
      <select value={t.priority} onChange={e => setT({ ...t, priority: e.target.value })}><option value="">Keep priority ({c.priority})</option>{['urgent', 'high', 'medium', 'low'].map(p => <option key={p}>{p}</option>)}</select></div>
      <button disabled={!t.officer} onClick={() => put('assign', { officer: t.officer, priority: t.priority })}>Assign complaint</button></div>}

    {r === 'officer' && s === 'assigned' && <div className="panel"><h3>Accept this assignment?</h3><button onClick={() => put('respond', { accept: true })}>Accept</button>
      <input placeholder="Reason for rejecting" value={t.note} onChange={e => setT({ ...t, note: e.target.value })} /><button className="danger" onClick={() => put('respond', { accept: false, reason: t.note })}>Reject with reason</button></div>}
    {r === 'officer' && ['accepted', 'in_progress'].includes(s) && <div className="panel"><h3>Update progress</h3><textarea placeholder="Progress or resolution note" value={t.note} onChange={e => setT({ ...t, note: e.target.value })} />
      <input type="file" multiple accept="image/*" onChange={e => setFiles(e.target.files)} />
      <button className="ghost" onClick={() => upd('in_progress')}>Mark in progress</button><button onClick={() => upd('resolved')}>Mark resolved</button></div>}

    {r === 'supervisor' && s === 'resolved' && <div className="panel"><h3>Verify completed work</h3><input placeholder="Note (needed if sending back)" value={t.note} onChange={e => setT({ ...t, note: e.target.value })} />
      <button onClick={() => put('verify', { approve: true })}>Verify work</button><button className="danger" onClick={() => put('verify', { approve: false, note: t.note })}>Send back</button></div>}
    {r === 'supervisor' && !['resolved', 'verified', 'escalated'].includes(s) && <div className="panel"><h3>Escalate</h3><input placeholder="Why is this being escalated?" value={t.note} onChange={e => setT({ ...t, note: e.target.value })} />
      <button className="danger" onClick={() => put('escalate', { note: t.note })}>Escalate as urgent</button></div>}

    {r === 'citizen' && s === 'verified' && !c.feedback?.rating && <div className="panel"><h3>How did we do?</h3><select value={t.rating} onChange={e => setT({ ...t, rating: e.target.value })}>{[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} star{n > 1 && 's'}</option>)}</select>
      <textarea placeholder="Comments (optional)" value={t.comment} onChange={e => setT({ ...t, comment: e.target.value })} /><button onClick={() => act(() => api.post(`/complaints/${id}/feedback`, { rating: t.rating, comment: t.comment }))}>Send feedback</button></div>}

    <h3>Timeline</h3><ol className="timeline">{[...c.history].reverse().map((h, i) => <li key={i}><Tag v={h.status} /> <span>{h.note}</span><small className="muted"> {h.by} · {new Date(h.at).toLocaleString()}</small></li>)}</ol></div>;
}
export function Notifications() {
  const [list, setL] = useState([]); useEffect(() => { api.get('/notifications').then(r => { setL(r.data); api.put('/notifications/read'); }); }, []);
  return <div className="pad"><h1>Alerts</h1>{list.length === 0 && <p className="empty">No alerts yet. Updates on your complaints appear here.</p>}
    <div className="list">{list.map(n => <Link key={n._id} to={n.complaint ? '/complaint/' + n.complaint : '#'} className={'item ' + (n.read ? '' : 'unread')}><span>{n.message}</span><small className="muted">{new Date(n.createdAt).toLocaleString()}</small></Link>)}</div></div>;
}
