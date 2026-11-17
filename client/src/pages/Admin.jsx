import { useEffect, useState } from 'react'; import api, { err } from '../api'; import { useAuth } from '../auth.jsx';
const Bars = ({ data }) => { const max = Math.max(1, ...Object.values(data || {})); return <div>{Object.entries(data || {}).map(([k, v]) => <div className="bar" key={k}><span>{k.replace('_', ' ')}</span><i style={{ width: (v / max) * 100 + '%' }} /><b>{v}</b></div>)}</div>; };
export function Admin() {
  const { user } = useAuth(), isAdmin = user.role === 'admin', [stats, setS] = useState(null), [users, setU] = useState([]), [cats, setC] = useState([]), [error, setE] = useState('');
  const [nu, setNu] = useState({ name: '', email: '', role: 'officer', department: '', password: '' }), [nc, setNc] = useState({ name: '', department: '', keywords: '' });
  const load = () => { api.get('/stats').then(r => setS(r.data)); api.get('/categories').then(r => setC(r.data)); api.get('/users').then(r => setU(r.data)); };
  useEffect(load, []); const run = fn => async () => { try { setE(''); await fn(); load(); } catch (x) { setE(err(x)); } };
  if (!stats) return <div className="pad">Loading…</div>;
  return <div className="pad"><h1>{isAdmin ? 'Management and reports' : 'Department performance'}</h1>{error && <p className="alert err">{error}</p>}
    <div className="kpis"><div><b>{stats.total}</b>Total</div><div><b>{stats.resolved}</b>Resolved</div><div><b>{stats.total - stats.resolved}</b>Open</div><div className="late"><b>{stats.overdue}</b>Overdue</div></div>
    <div className="grid3"><div className="card"><h3>By status</h3><Bars data={stats.byStatus} /></div><div className="card"><h3>By category</h3><Bars data={stats.byCategory} /></div><div className="card"><h3>By priority</h3><Bars data={stats.byPriority} /></div></div>
    <div className="card"><h3>Departments</h3><table><thead><tr><th>Department</th><th>Total</th><th>Resolved</th><th>Overdue</th><th>Avg hours to resolve</th><th>Avg rating</th></tr></thead>
      <tbody>{Object.entries(stats.departments).map(([d, x]) => <tr key={d}><td>{d}</td><td>{x.total}</td><td>{x.resolved}</td><td>{x.overdue}</td><td>{x.avgHours}</td><td>{x.avgRating || '–'}</td></tr>)}</tbody></table></div>
    <div className="card"><h3>Officer performance</h3><table><thead><tr><th>Officer</th><th>Department</th><th>Assigned</th><th>Resolved</th></tr></thead>
      <tbody>{stats.officers.map(o => <tr key={o.name}><td>{o.name}</td><td>{o.department}</td><td>{o.assigned}</td><td>{o.resolved}</td></tr>)}</tbody></table></div>
    {isAdmin && <><div className="card"><h3>Citizens and staff</h3><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th /></tr></thead>
      <tbody>{users.map(u => <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u.department}</td><td>{u._id !== user._id && <button className="link" onClick={run(() => api.delete('/users/' + u._id))}>Remove</button>}</td></tr>)}</tbody></table>
      <h4>Add staff member</h4><div className="grid3"><input placeholder="Name" value={nu.name} onChange={e => setNu({ ...nu, name: e.target.value })} /><input placeholder="Email" value={nu.email} onChange={e => setNu({ ...nu, email: e.target.value })} />
        <input placeholder="Password (default Staff@123)" value={nu.password} onChange={e => setNu({ ...nu, password: e.target.value })} /><select value={nu.role} onChange={e => setNu({ ...nu, role: e.target.value })}><option>officer</option><option>supervisor</option><option>admin</option></select>
        <input placeholder="Department" value={nu.department} onChange={e => setNu({ ...nu, department: e.target.value })} /><button onClick={run(() => api.post('/users', nu))}>Add staff</button></div></div>
      <div className="card"><h3>Complaint categories</h3><table><thead><tr><th>Category</th><th>Department</th><th>Keywords for auto-classification</th><th /></tr></thead>
        <tbody>{cats.map(c => <tr key={c._id}><td>{c.name}</td><td>{c.department}</td><td>{c.keywords.join(', ')}</td><td><button className="link" onClick={run(() => api.delete('/categories/' + c._id))}>Delete</button></td></tr>)}</tbody></table>
        <div className="grid3"><input placeholder="Category name" value={nc.name} onChange={e => setNc({ ...nc, name: e.target.value })} /><input placeholder="Department" value={nc.department} onChange={e => setNc({ ...nc, department: e.target.value })} />
          <input placeholder="Keywords, comma separated" value={nc.keywords} onChange={e => setNc({ ...nc, keywords: e.target.value })} /></div><button onClick={run(() => api.post('/categories', nc))}>Add category</button></div></>}</div>;
}
