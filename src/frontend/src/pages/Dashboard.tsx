import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fiiApi } from '../api';
import { LayoutDashboard, TrendingUp, DollarSign, Wallet, BookOpen, ChartPie } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DashboardData {
  totalInvested: number;
  totalCurrentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  totalDividendsReceived: number;
  holdingsCount: number;
  holdings: Array<{
    ticker: string;
    currentValue: number;
    sector?: string;
  }>;
  pendingDividends: Array<{
    ticker: string;
    amount: number;
    exDate: string;
  }>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fiiApi.getDashboard();
      setData(response.data);
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="app-container">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">
              <ChartPie size={24} />
              FII Tracker
            </h2>
          </div>
          <ul className="nav-menu">
            <li className="nav-item active">
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
          </ul>
        </aside>
        <main className="main-content">
          <p>Carregando...</p>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="app-container">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">
              <ChartPie size={24} />
              FII Tracker
            </h2>
          </div>
          <ul className="nav-menu">
            <li className="nav-item active">
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
          </ul>
        </aside>
        <main className="main-content">
          <div className="header-actions">
            <div>
              <h1 className="page-title">Dashboard</h1>
              <p className="page-subtitle">Não foi possível carregar os dados ou ocorreu um erro.</p>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </main>
      </div>
    );
  }

  const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const sectorData = Object.entries(
    (data.holdings || []).reduce((acc, h) => {
      const sector = h.sector || 'Outros';
      acc[sector] = (acc[sector] || 0) + h.currentValue;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">
            <ChartPie size={24} />
            FII Tracker
          </h2>
        </div>
        <ul className="nav-menu">
          <li className="nav-item active">
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
          <li className="nav-item" onClick={() => navigate('/documentation')}>
            <BookOpen size={20} />
            Documentação
          </li>
        </ul>
      </aside>

      <main className="main-content">
        <div className="header-actions">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Visão geral da sua carteira</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Sair
          </button>
        </div>

        <div className="cards-grid">
          <div className="card">
            <h3 className="card-title">Total Investido</h3>
            <p className="card-value">R$ {data?.totalInvested.toFixed(2)}</p>
          </div>

          <div className="card">
            <h3 className="card-title">Valor Atual</h3>
            <p className="card-value">R$ {data?.totalCurrentValue.toFixed(2)}</p>
            <p className={`card-change ${data!.totalGainLoss >= 0 ? 'positive' : 'negative'}`}>
              {data!.totalGainLoss >= 0 ? '+' : ''}R$ {data!.totalGainLoss.toFixed(2)} ({data!.totalGainLossPercent.toFixed(2)}%)
            </p>
          </div>

          <div className="card">
            <h3 className="card-title">Proventos Recebidos</h3>
            <p className="card-value">R$ {data?.totalDividendsReceived.toFixed(2)}</p>
          </div>

          <div className="card">
            <h3 className="card-title">FIIs na Carteira</h3>
            <p className="card-value">{data?.holdingsCount}</p>
          </div>
        </div>

        <div className="chart-container">
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Distribuição por Setor</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sectorData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {sectorData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {data!.pendingDividends.length > 0 && (
          <div className="table-container">
            <h3 style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              Prótimos Proventos
            </h3>
            <table className="table">
              <thead>
                <tr>
                  <th>FII</th>
                  <th>Valor</th>
                  <th>Data Ex</th>
                </tr>
              </thead>
              <tbody>
                {data!.pendingDividends.map((div, index) => (
                  <tr key={index}>
                    <td>{div.ticker}</td>
                    <td>R$ {div.amount.toFixed(2)}</td>
                    <td>{new Date(div.exDate).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}


