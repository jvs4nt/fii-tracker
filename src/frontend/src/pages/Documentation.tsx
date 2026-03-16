import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { LayoutDashboard, TrendingUp, DollarSign, Wallet, BookOpen, Globe } from 'lucide-react';

const ptDoc = `
# FII Tracker 📈

Uma aplicação web completa para rastrear e gerenciar sua carteira de Fundos de Investimento Imobiliário (FIIs), monitorar proventos e obter recomendações inteligentes com base em dados em tempo real.

## 🚀 Funcionalidades

*   **Autenticação de Usuário**: Login e registro seguros usando JWT e bcrypt.
*   **Gerenciamento de Carteira (Carteira)**: Adicione, edite e remova FIIs do seu portfólio. Acompanhe a quantidade, preço médio e data da compra.
*   **Rastreamento de Proventos (Proventos)**: 
    *   Permite a entrada de dividendos, JCP e desdobramentos.
    *   Acompanha proventos pendentes vs. recebidos.
*   **Dashboard em Tempo Real**: Visualização da sua carteira por setor usando gráficos interativos, mostrando o total investido, valor atual e lucro/prejuízo.
*   **Análise Inteligente**: 
    *   Busca automaticamente cotações em tempo real e o P/VP na API.
    *   Fornece recomendações baseadas no P/VP atual.

## 🛠️ Tecnologias Utilizadas
*   **Frontend**: React, TypeScript, React Router, Vite, Recharts, Lucide.
*   **Backend**: Node.js, Express, Prisma ORM, SQLite, JWT.
`;

const enDoc = `
# FII Tracker 📈

A complete web application to track and manage your Brazilian Real Estate Investment Trusts (FII) portfolio, dividends, and get smart recommendations based on real-time data.

## 🚀 Features

*   **User Authentication**: Secure login and registration using JWT and bcrypt.
*   **Portfolio Management (Holdings)**: Add, edit, and remove FIIs from your portfolio. Tracks quantity, average price, and purchase date.
*   **Dividends Tracking**: 
    *   Allows manual entry of dividends, JCP, and stock splits.
    *   Tracks pending vs. received dividends.
*   **Real-time Dashboard**: Visual breakdown of your portfolio by sector using interactive charts, showing total invested, current value, and overall gain/loss.
*   **Smart Analysis**: 
    *   Automatically fetches real-time quotes and P/VP data.
    *   Provides "Buy", "Hold", or "Sell" recommendations based on the current P/VP ratio.

## 🛠️ Technologies Used
*   **Frontend**: React, TypeScript, React Router, Vite, Recharts, Lucide.
*   **Backend**: Node.js, Express, Prisma ORM, SQLite, JWT.
`;

export default function Documentation() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'PT' | 'EN'>('PT');

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">
            <BookOpen size={24} />
            FII Tracker
          </h2>
        </div>
        <ul className="nav-menu">
          <li className="nav-item" onClick={() => navigate('/dashboard')}>
            <LayoutDashboard size={20} />
            Dashboard
          </li>
          <li className="nav-item" onClick={() => navigate('/holdings')}>
            <Wallet size={20} />
            Carteira
          </li>
          <li className="nav-item" onClick={() => navigate('/dividends')}>
            <DollarSign size={20} />
            Proventos
          </li>
          <li className="nav-item" onClick={() => navigate('/analysis')}>
            <TrendingUp size={20} />
            Análise
          </li>
          <li className="nav-item active">
            <BookOpen size={20} />
            Documentação
          </li>
        </ul>
      </aside>

      <main className="main-content">
        <div className="header-actions">
          <div>
            <h1 className="page-title">{language === 'PT' ? 'Documentação' : 'Documentation'}</h1>
            <p className="page-subtitle">
              {language === 'PT' ? 'Sobre o sistema FII Tracker' : 'About the FII Tracker system'}
            </p>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={() => setLanguage(lang => lang === 'PT' ? 'EN' : 'PT')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Globe size={18} />
            {language === 'PT' ? 'Read in English' : 'Ler em Português'}
          </button>
        </div>

        <div className="card" style={{ marginTop: '2rem', padding: '2rem' }}>
          <div className="markdown-body" style={{ lineHeight: '1.6' }}>
            <ReactMarkdown>
              {language === 'PT' ? ptDoc : enDoc}
            </ReactMarkdown>
          </div>
        </div>
      </main>
    </div>
  );
}
