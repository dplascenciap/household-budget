import { useLocation, useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/',       icon: '🏠', label: 'Dashboard' },
  { path: '/weekly', icon: '📅', label: 'Weekly'    },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  // active: exact match for '/', prefix match for others
  function isActive(path) {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(item => (
        <button
          key={item.path}
          className={`bottom-nav-item${isActive(item.path) ? ' active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
