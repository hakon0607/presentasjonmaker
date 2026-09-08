import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Editor from './pages/Editor'
import Viewer from './pages/Viewer'
import Landing from './pages/Landing'
import Guide from './pages/Guide'
import Profile from './pages/Profile'
import CopyDeck from './pages/CopyDeck'
import Pricing from './pages/Pricing'
import Admin from './pages/Admin'
import NoTokensModal from './components/NoTokensModal'
import UpgradeModal from './components/UpgradeModal'

function Protected({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="screen-center"><div className="spinner" /></div>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <div className="version-star" aria-hidden="true">★ v112</div>
      <NoTokensModal />
      <UpgradeModal />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mine" element={<Protected><Home /></Protected>} />
        <Route path="/profil" element={<Protected><Profile /></Protected>} />
        <Route path="/kopi/:id" element={<Protected><CopyDeck /></Protected>} />
        <Route path="/priser" element={<Pricing />} />
        <Route path="/admin" element={<Protected><Admin /></Protected>} />
        <Route path="/p/:id" element={<Protected><Editor /></Protected>} />
        <Route path="/v/:id" element={<Viewer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
