import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './app/Layout'
import { MapPage } from './pages/MapPage'
import { LevelPage } from './pages/LevelPage'
import { ExamPage } from './pages/ExamPage'
import { VideosPage } from './pages/VideosPage'
import { ChatPage } from './pages/ChatPage'
import { BankPage } from './pages/BankPage'
import { NotesPage } from './pages/NotesPage'
import { TicketPage } from './pages/TicketPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<MapPage />} />
          <Route path="/level/:levelId" element={<LevelPage />} />
          <Route path="/ticket/:ticketId" element={<TicketPage />} />
          <Route path="/exam" element={<ExamPage />} />
          <Route path="/bank" element={<BankPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
