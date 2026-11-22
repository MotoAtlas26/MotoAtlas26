import React from 'react'
import { NavLink } from 'react-router-dom'
import { MotoIcon, RouteIcon, SettingsIcon, HomeIcon } from '../shared/Icons'
import { MotoAtlas26Logo } from '../shared'

export const Sidebar = ({ isOpen = false, onClose }) => {
  const navItems = [
    { to: '/', icon: <HomeIcon size={28} />, label: 'Home' },
    { to: '/moto', icon: <MotoIcon size={28} />, label: 'Moto' },
    { to: '/tracks', icon: <RouteIcon size={28} />, label: 'Tracks' },
    { to: '/settings', icon: <SettingsIcon size={28} />, label: 'Configuración' },
  ]

  const handleNavClick = () => {
    if (onClose) onClose()
  }

  return (
    <aside
      id="sidebar-drawer"
      className={`sidebar ${isOpen ? 'open' : ''}`}
      role="navigation"
      aria-label="Menú principal MotoAtlas26"
    >
      <div className="sidebar-header">
        <NavLink to="/" end className="home-logo" onClick={handleNavClick}>
          <MotoAtlas26Logo size={40} horizontal={true} />
        </NavLink>
      </div>

      <nav className="nav">
        <ul className="sidebar-nav-list">
          {navItems.map((item, i) => (
            <li key={i} className="sidebar-nav-item">
              <NavLink to={item.to} end={item.to === '/'} onClick={handleNavClick}>
                {({ isActive }) => (
                  <div className={`sidebar-nav-link ${isActive ? 'active' : ''}`}>
                    {item.icon}
                    <span className="sidebar-nav-label">{item.label}</span>
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar