import { NavLink, Route, Routes } from 'react-router-dom'
import './App.css'
import ExamModePage from './pages/ExamModePage'
import HomePage from './pages/HomePage'
import LevelPage from './pages/LevelPage'
import LevelsPage from './pages/LevelsPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <div className="app">
      <header className="appHeader">
        <div className="container headerRow">
          <div className="brand">
            <div className="brandTitle">KG Quest</div>
            <div className="brandSubtitle">Подготовка к экзамену по компьютерной графике</div>
          </div>
          <nav className="nav">
            <NavLink to="/" end>
              Главная
            </NavLink>
            <NavLink to="/levels">Уровни</NavLink>
            <NavLink to="/exam">Экзамен</NavLink>
            <NavLink to="/settings">Настройки</NavLink>
          </nav>
        </div>
      </header>

      <main className="appMain">
        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/levels" element={<LevelsPage />} />
            <Route path="/levels/:levelId" element={<LevelPage />} />
            <Route path="/exam" element={<ExamModePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </div>
      </main>

      <footer className="appFooter">
        <div className="container footerRow">
          <div>Сделано для быстрой подготовки (5 часов).</div>
          <div className="muted">
            Подсказка: сначала «Практика», потом «Квиз».
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
