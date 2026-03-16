import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function Layout({ children, title, subtitle, actions }: LayoutProps) {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <div className="header-actions">
          <div>
            <h1 className="page-title">{title}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="actions-wrapper">{actions}</div>}
        </div>
        {children}
      </main>
    </div>
  );
}
