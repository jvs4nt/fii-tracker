import { useCallback, useMemo } from 'react';
import { fiiApi } from '../api';
import Layout from '../components/Layout';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useAsyncData } from '../hooks/useAsyncData';

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
  const fetchDashboard = useCallback(async () => {
    const response = await fiiApi.getDashboard();
    return response.data as unknown as DashboardData;
  }, []);

  const { data, loading, error } = useAsyncData<DashboardData>(fetchDashboard);

  const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const sectorData = useMemo(
    () =>
      Object.entries(
        (data?.holdings || []).reduce((acc, h) => {
          const sector = h.sector || 'Outros';
          acc[sector] = (acc[sector] || 0) + h.currentValue;
          return acc;
        }, {} as Record<string, number>)
      ).map(([name, value]) => ({ name, value })),
    [data?.holdings]
  );

  if (loading) {
    return (
      <Layout title="Dashboard" subtitle="Carregando...">
        <p>Carregando dados...</p>
      </Layout>
    );
  }

  if (!data || error) {
    return (
      <Layout title="Dashboard" subtitle="Não foi possível carregar os dados ou ocorreu um erro.">
        <p>Tente novamente mais tarde.</p>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" subtitle="Visão geral da sua carteira">
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
            Próximos Proventos
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
    </Layout>
  );
}
