import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, DollarSign, TrendingUp, BookOpen, ChartPie, LogOut, Menu, X, Bot } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/holdings', label: 'Carteira', icon: Wallet },
    { path: '/dividends', label: 'Proventos', icon: DollarSign },
    { path: '/analysis', label: 'Análise', icon: TrendingUp },
    { path: '/assistant', label: 'Assistente IA', icon: Bot },
    { path: '/documentation', label: 'Documentação', icon: BookOpen },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="mobile-menu-toggle" onClick={toggleMenu}>
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile menu */}
      {isMenuOpen && <div className="sidebar-overlay" onClick={toggleMenu} />}

      <aside className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">
            <ChartPie size={24} />
            <span>
              Investe<span className="brand-accent">IA</span>
            </span>
          </h2>
          {/* Close button inside sidebar for mobile */}
          <button className="mobile-close-btn" onClick={toggleMenu}>
            <X size={24} />
          </button>
        </div>
        <ul className="nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li
                key={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  navigate(item.path);
                  setIsMenuOpen(false);
                }}
              >
                <Icon size={20} />
                {item.label}
              </li>
            );
          })}
          {/* Mobile-only logout item inside the menu */}
          {/* <li className="nav-item mobile-only" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
            <LogOut size={20} />
            Sair
          </li> */}
        </ul>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
