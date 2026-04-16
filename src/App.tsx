import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PlayerProvider } from './contexts/PlayerContext'
import { SoundProvider } from './contexts/SoundContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './components/ui/Toast'
import { Navbar } from './components/layout/Navbar'
import { Home } from './pages/Home'
import { Profile } from './pages/Profile'
import { Settings } from './pages/Settings'
import { ClassicGame } from './games/ClassicGame'
import { PowerGame } from './games/PowerGame'
import { BlitzGame } from './games/BlitzGame'
import { Connect5Game } from './games/Connect5Game'
import { ChaosGame } from './games/ChaosGame'

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy-950 text-white font-sans">
      <Navbar />
      <main>{children}</main>
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <PlayerProvider>
          <SoundProvider>
            <ToastProvider>
              <Routes>
                <Route path="/" element={<AppShell><Home /></AppShell>} />
                <Route path="/home" element={<Navigate to="/" replace />} />
                <Route path="/profile"    element={<AppShell><Profile /></AppShell>} />
                <Route path="/settings"   element={<AppShell><Settings /></AppShell>} />
                <Route path="/game/classic"  element={<AppShell><ClassicGame /></AppShell>} />
                <Route path="/game/power"    element={<AppShell><PowerGame /></AppShell>} />
                <Route path="/game/blitz"    element={<AppShell><BlitzGame /></AppShell>} />
                <Route path="/game/connect5" element={<AppShell><Connect5Game /></AppShell>} />
                <Route path="/game/chaos"    element={<AppShell><ChaosGame /></AppShell>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ToastProvider>
          </SoundProvider>
        </PlayerProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
