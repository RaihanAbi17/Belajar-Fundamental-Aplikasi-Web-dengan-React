import React, { useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter, Routes, Route, Link, NavLink, Navigate, useNavigate, useParams,
  useSearchParams,
} from 'react-router-dom';
import { useLanguage } from './contexts/LanguageContext';
import { useTheme } from './contexts/ThemeContext';
import { useInput } from './hooks/useInput';
import { useNotes } from './hooks/useNotes';
import {
  addNote, archiveNote, deleteNote, getNote, login, register, unarchiveNote,
} from './utils/api';
import { showFormattedDate } from './utils';

function isAuthenticated() {
  return Boolean(localStorage.getItem('accessToken'));
}

function Profile() {
  const { t } = useLanguage();
  const name = localStorage.getItem('userName') || t('name');
  return (
    <div className="profile">
      <div className="profile-copy">
        <strong>{name}</strong>
        <span>{t('personalNotes')}</span>
      </div>
      <div className="avatar avatar-placeholder" aria-label={t('personalNotes')} role="img">
        
      </div>
    </div>
  );
}

function Header() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userEmail');
    navigate('/login', { replace: true });
  };

  return (
    <header className="site-header">
      <Link to="/" className="brand">
        <span className="brand-mark">✦</span>
        <span>{t('brandName')}<small>{t('brandSubtitle')}</small></span>
      </Link>
      <nav>
        <NavLink to="/" end>{t('notes')}</NavLink>
        <NavLink to="/archives">{t('archive')}</NavLink>
        <NavLink to="/notes/new">{t('write')} <b>＋</b></NavLink>
      </nav>
      <div className="header-actions">
        <button className="icon-btn" onClick={toggleTheme} title={`${t('theme')}: ${theme === 'light' ? t('dark') : t('light')}`} aria-label={t('theme')}>
          {theme === 'light' ? '☾' : '☀'}
        </button>
        <button className="language-btn" onClick={toggleLanguage} title={t('language')}>{language.toUpperCase()}</button>
        <button className="logout-btn" onClick={logout}>{t('logout')}</button>
        <Profile />
      </div>
    </header>
  );
}

function Footer() {
  const { t } = useLanguage();
  return <footer>© {new Date().getFullYear()} {t('createdBy')} Raihan Abi Nugroho</footer>;
}

function Loading() {
  const { t } = useLanguage();
  return <div className="loading" role="status"><span className="spinner" />{t('loading')}</div>;
}

function ErrorMessage({ message, onRetry }) {
  const { t, translateError } = useLanguage();
  return (
    <div className="error-box">
      <strong>{t('errorTitle')}</strong><p>{translateError(message)}</p>
      {onRetry && <button className="secondary-btn" onClick={onRetry}>{t('tryAgain')}</button>}
    </div>
  );
}

function NoteCard({ note, archived = false }) {
  const { t, language } = useLanguage();
  const excerpt = note.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 150);
  return (
    <article className="note-card">
      <div className="note-card-top">
        <span className="note-tag">{archived ? t('archivedTag') : t('noteTag')}</span>
        <span className="note-date">{showFormattedDate(note.createdAt, language)}</span>
      </div>
      <Link className="note-title" to={`/notes/${note.id}`}>{note.title}</Link>
      <p className="note-excerpt">{excerpt}{note.body.length > 150 ? '…' : ''}</p>
      <Link className="read-more" to={`/notes/${note.id}`}>{t('readNote')} <span>↗</span></Link>
    </article>
  );
}

function Listing({ archived = false }) {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('keyword') || '';
  const { notes, loading, error, reload } = useNotes(archived, true);
  const filtered = useMemo(() => notes.filter((note) => note.title.toLowerCase().includes(query.toLowerCase())), [notes, query]);

  return (
    <main className="page">
      <section className="welcome">
        <div>
          <span className="eyebrow">{archived ? t('archiveRoom') : t('myNotes')}</span>
          <h1>{archived ? t('archiveHeadline') : t('notesHeadline')}</h1>
          <p>{archived ? t('archiveDescription') : t('notesDescription')}</p>
        </div>
        <div className="welcome-art" aria-hidden="true"><span>✧</span><i>✦</i><b>✳</b></div>
      </section>
      <div className="list-heading">
        <div><h2>{archived ? t('archivedNotes') : t('allNotes')}</h2><span>{filtered.length} {t('count')}</span></div>
        <label className="search"><span>⌕</span><input aria-label={t('search')} placeholder={t('search')} value={query} onChange={(event) => setSearchParams(event.target.value ? { keyword: event.target.value } : {})} /></label>
      </div>
      {loading ? <Loading /> : error ? <ErrorMessage message={error} onRetry={reload} /> : filtered.length > 0 ? (
        <div className="notes-grid">{filtered.map((note) => <NoteCard key={note.id} note={note} archived={archived} />)}</div>
      ) : (
        <div className="empty"><div>✧</div><h3>{query ? t('notFoundSearch') : archived ? t('emptyArchive') : t('empty')}</h3><p>{query ? t('tryAnotherKeyword') : t('startWriting')}</p>{!archived && <Link className="primary-btn" to="/notes/new">＋ {t('newNote')}</Link>}</div>
      )}
    </main>
  );
}

function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getNote(id).then((response) => { if (active) setNote(response.data); }).catch((err) => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <main className="page"><Loading /></main>;
  if (error) return <main className="page"><ErrorMessage message={error} /></main>;
  if (!note) return <main className="page not-found"><h1>{t('notFound')}</h1><Link to="/">{t('back')}</Link></main>;

  const handleArchive = async () => {
    setBusy(true);
    try {
      if (note.archived) { await unarchiveNote(id); navigate('/archives'); }
      else { await archiveNote(id); navigate('/'); }
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('deleteConfirm'))) return;
    setBusy(true);
    try { await deleteNote(id); navigate(note.archived ? '/archives' : '/'); } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <main className="page detail-wrap">
      <Link className="back-link" to={note.archived ? '/archives' : '/'}>← {t('back')}</Link>
      <article className="detail-card">
        <div className="detail-meta"><span className="note-tag">{note.archived ? t('archiveTag') : t('privateNote')}</span><span>{showFormattedDate(note.createdAt, language)}</span></div>
        <h1>{note.title}</h1>
        <div className="detail-body">{note.body.split('\n').map((line, index) => <p key={index}>{line || '\u00a0'}</p>)}</div>
        {error && <ErrorMessage message={error} />}
        <div className="detail-actions">
          <button className="secondary-btn" onClick={handleArchive} disabled={busy}>{busy ? t('processing') : note.archived ? `↶ ${t('unarchive')}` : `↗ ${t('archive')}`}</button>
          <button className="danger-btn" onClick={handleDelete} disabled={busy}>⌫ {t('remove')}</button>
        </div>
      </article>
    </main>
  );
}

function NewNote() {
  const { t } = useLanguage();
  const [title, onTitleChange, setTitle] = useInput('');
  const [body, onBodyChange, setBody] = useInput('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

  const save = async (event) => {
    event.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSaving(true); setError('');
    try { await addNote({ title: title.trim(), body: body.trim() }); setTitle(''); setBody(''); navigate('/'); }
    catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <main className="page editor-page">
      <Link className="back-link" to="/">← {t('back')}</Link>
      <form onSubmit={save} className="editor-card">
        <span className="eyebrow">{t('newNoteEyebrow')}</span>
        <h1>{t('newNoteTitle')}</h1>
        <input className="title-input" value={title} onChange={onTitleChange} placeholder={t('titlePlaceholder')} aria-label={t('titlePlaceholder')} required maxLength={100} />
        <div className="editor-toolbar"><span>✦</span> {t('writeFreely')} <span className="toolbar-hint">{wordCount} {t('words')}</span></div>
        <textarea className="body-input" value={body} onChange={onBodyChange} placeholder={t('bodyPlaceholder')} aria-label={t('bodyPlaceholder')} required />
        {error && <ErrorMessage message={error} />}
        <div className="editor-bottom"><span>{wordCount} {t('words')}</span><button className="primary-btn" type="submit" disabled={saving || !title.trim() || !body.trim()}>{saving ? t('saving') : `${t('save')} ↗`}</button></div>
      </form>
    </main>
  );
}

function AuthLayout({ children }) {
  const { t } = useLanguage();
  return <main className="auth-page"><div className="auth-brand"><span className="brand-mark">✦</span><div><strong>{t('brandName')}</strong><small>{t('brandSubtitle')}</small></div></div>{children}</main>;
}

function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, onEmailChange] = useInput('');
  const [password, onPasswordChange] = useInput('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError('');
    try {
      const response = await login({ email, password });
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('userEmail', email);
      const savedNames = JSON.parse(localStorage.getItem('registeredUserNames') || '{}');
      localStorage.setItem('userName', savedNames[email.trim().toLowerCase()] || email.split('@')[0]);
      navigate('/', { replace: true });
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return <AuthLayout><form className="auth-card" onSubmit={submit}><span className="eyebrow">{t('authentication')}</span><h1>{t('loginTitle')}</h1><p>{t('loginDescription')}</p>{error && <ErrorMessage message={error} />}<label>{t('email')}<input type="email" value={email} onChange={onEmailChange} required /></label><label>{t('password')}<input type="password" value={password} onChange={onPasswordChange} required /></label><button className="primary-btn auth-submit" disabled={loading}>{loading ? t('processing') : t('login')}</button><div className="auth-switch">{t('noAccount')} <Link to="/register">{t('register')}</Link></div></form></AuthLayout>;
}

function Register() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [name, onNameChange] = useInput('');
  const [email, onEmailChange] = useInput('');
  const [password, onPasswordChange] = useInput('');
  const [confirm, onConfirmChange] = useInput('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (password !== confirm) { setError(t('passwordMismatch')); return; }
    setLoading(true); setError('');
    try {
      await register({ name, email, password });
      const savedNames = JSON.parse(localStorage.getItem('registeredUserNames') || '{}');
      savedNames[email.trim().toLowerCase()] = name.trim();
      localStorage.setItem('registeredUserNames', JSON.stringify(savedNames));
      localStorage.setItem('userName', name.trim());
      navigate('/login', { replace: true });
    }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return <AuthLayout><form className="auth-card" onSubmit={submit}><span className="eyebrow">{t('createAccountEyebrow')}</span><h1>{t('registerTitle')}</h1><p>{t('registerDescription')}</p>{error && <ErrorMessage message={error} />}<label>{t('name')}<input value={name} onChange={onNameChange} required /></label><label>{t('email')}<input type="email" value={email} onChange={onEmailChange} required /></label><label>{t('password')}<input type="password" value={password} onChange={onPasswordChange} minLength={6} required /></label><label>{t('confirmPassword')}<input type="password" value={confirm} onChange={onConfirmChange} required /></label><button className="primary-btn auth-submit" disabled={loading}>{loading ? t('processing') : t('createAccount')}</button><div className="auth-switch">{t('haveAccount')} <Link to="/login">{t('login')}</Link></div></form></AuthLayout>;
}

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  return isAuthenticated() ? <Navigate to="/" replace /> : children;
}

function NotFound() {
  const { t } = useLanguage();
  return <main className="page not-found"><span className="eyebrow">404</span><h1>{t('pageNotFound')}</h1><p>{t('notFound')}</p><Link className="primary-btn" to="/">{t('back')}</Link></main>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="*" element={<ProtectedRoute><div className="app-container"><Header /><Routes><Route path="/" element={<Listing />} /><Route path="/archives" element={<Listing archived />} /><Route path="/notes/new" element={<NewNote />} /><Route path="/notes/:id" element={<Detail />} /><Route path="*" element={<NotFound />} /></Routes><Footer /></div></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
