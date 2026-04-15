import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route } from 'react-router'
import { Routes } from 'react-router'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Login } from './routes/Login.tsx'
import { Register } from './routes/Register.tsx'
import { Index } from './routes/Index.tsx'
import { VerifyEmail } from './routes/VerifyEmail.tsx'
import Feed from './pages/Feed.tsx'
import Editor from './pages/Editor.tsx'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/register" element={<Register />}></Route>
          <Route path="/verify-email" element={<VerifyEmail />}></Route>
          <Route path="/feed" element={<Feed />}></Route>
          <Route path="/write" element={<Editor />}></Route>
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
)
