import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Index } from './routes/Index.tsx'
import { ConfigProvider, theme } from 'antd'

// route-split everything except landing so first paint only ships the hero + collage -dechante
const Login = lazy(() => import('./routes/Login.tsx').then(m => ({ default: m.Login })))
const Register = lazy(() => import('./routes/Register.tsx').then(m => ({ default: m.Register })))
const VerifyEmail = lazy(() => import('./routes/VerifyEmail.tsx').then(m => ({ default: m.VerifyEmail })))
const ForgotPassword = lazy(() => import('./routes/ForgotPassword.tsx').then(m => ({ default: m.ForgotPassword })))
const ResetPassword = lazy(() => import('./routes/ResetPassword.tsx').then(m => ({ default: m.ResetPassword })))
const Editor = lazy(() => import('./routes/Editor.tsx'))
const Feed = lazy(() => import('./routes/Feed.tsx'))
const Search = lazy(() => import('./routes/Search.tsx'))
const SinglePost = lazy(() => import('./routes/SinglePost.tsx'))

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string

// DEV bypass so auth-guarded pages are reachable on localhost without logging in. stripped in prod builds -dechante
if (import.meta.env.DEV && !localStorage.getItem('token')) {
  localStorage.setItem('token', 'dev-bypass-token');
  localStorage.setItem('username', 'dev');
}

function RouteFallback() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text)' }}>
      <span style={{ opacity: 0.7, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' }}>Loading</span>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}></ConfigProvider>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />}></Route>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/register" element={<Register />}></Route>
            <Route path="/verify-email" element={<VerifyEmail />}></Route>
            <Route path="/forgot-password" element={<ForgotPassword />}></Route>
            <Route path="/reset-password" element={<ResetPassword />}></Route>
            <Route path="/feed" element={<Feed />}></Route>
            <Route path="/write" element={<Editor />}></Route>
            <Route path="/search" element={<Search />}></Route>
            <Route path="/post/:id" element={<SinglePost />}></Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
)
