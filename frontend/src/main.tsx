import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route } from 'react-router'
import { Routes } from 'react-router'
import { Login } from './routes/Login.tsx'
import { Register } from './routes/Register.tsx'
import { Index } from './routes/Index.tsx'
import { VerifyEmail } from './routes/VerifyEmail.tsx'
import Feed from './pages/Feed.tsx'
import Editor from './pages/Editor.tsx'
//import { Feed } from './routes/Feed.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
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
  </StrictMode>,
)