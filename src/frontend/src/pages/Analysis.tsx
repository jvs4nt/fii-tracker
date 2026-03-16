import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fiiApi } from '../api';
import Layout from '../components/Layout';
import { TrendingUp, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { useAsyncData } from '../hooks/useAsyncData';

interface AnalysisData {
  ticker: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pVP: number;
  dy12m: number;
  sector: string;
  currentValue: number;
  investedValue: number;
  gainLoss: number;
  gainLossPercent: number;
  recommendation: 'comprar' | 'manter' | 'vender';
}

export default function Analysis() {
  const navigate = useNavigate();
  const fetchAnalysis = useCallback(async () => {
    const response = await fiiApi.getAnalysis();
    return response.data as AnalysisData[];
  }, []);

  const {
    data: analysisData,
    loading,
    error,
    reload: reloadAnalysis,
  } = useAsyncData<AnalysisData[]>(fetchAnalysis);

  const analysis = analysisData ?? [];

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'comprar':
        return <ThumbsUp size={16} />;
      case 'vender':
        return <ThumbsDown size={16} />;
      default:
        return <Minus size={16} />;
    }
  };

  const getRecommendationClass = (rec: string) => {
    switch (rec) {
      case 'comprar':
        return 'recommendation-buy';
      case 'vender':
        return 'recommendation-sell';
      default:
        return 'recommendation-hold';
    }
  };

  const getRecommendationText = (rec: string) => {
    switch (rec) {
      case 'comprar':
        return 'Comprar';
      case 'vender':
        return 'Vender';
      default:
        return 'Manter';
    }
  };

  const buyRecommendations = useMemo(
    () => analysis.filter((a) => a.recommendation === 'comprar'),
    [analysis]
  );
  const holdRecommendations = useMemo(
    () => analysis.filter((a) => a.recommendation === 'manter'),
    [analysis]
  );
  const sellRecommendations = useMemo(
    () => analysis.filter((a) => a.recommendation === 'vender'),
    [analysis]
  );

  return (
    <Layout 
      title="Análise da Carteira" 
      subtitle="Recomendações baseadas em indicadores"
      actions={
        <button className="btn btn-secondary" onClick={() => void reloadAnalysis()}>
          Atualizar
        </button>
      }
    >
      {loading ? (
        <p>Carregando...</p>
      ) : error ? (
        <p>Nao foi possivel carregar a analise.</p>
      ) : analysis.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <TrendingUp size={64} />
          </div>
          <h3 className="empty-state-title">Nenhum FII para analisar</h3>
          <p className="empty-state-description">
            Adicione FIIs a sua carteira para ver a analise
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/holdings')}>
            Adicionar FII
          </button>
        </div>
      ) : (
        <>
          <div className="cards-grid" style={{ marginBottom: '2rem' }}>
            <div className="card">
              <h3 className="card-title">Oportunidades de Compra</h3>
              <p className="card-value" style={{ color: 'var(--primary)' }}>
                {buyRecommendations.length}
              </p>
            </div>

            <div className="card">
              <h3 className="card-title">Para Manter</h3>
              <p className="card-value" style={{ color: 'var(--warning)' }}>
                {holdRecommendations.length}
              </p>
            </div>

            <div className="card">
              <h3 className="card-title">Sobreprecados</h3>
              <p className="card-value" style={{ color: 'var(--danger)' }}>
                {sellRecommendations.length}
              </p>
            </div>
          </div>

          <div className="holdings-grid">
            {analysis.map((item) => (
              <div key={item.ticker} className="holding-card">
                <div className="holding-header">
                  <div>
                    <h3 className="holding-ticker">{item.ticker}</h3>
                    <p className="holding-name">{item.sector || 'Setor nao disponivel'}</p>
                  </div>
                  <span
                    className={`recommendation-badge ${getRecommendationClass(item.recommendation)}`}
                  >
                    {getRecommendationIcon(item.recommendation)}
                    {getRecommendationText(item.recommendation)}
                  </span>
                </div>

                <div className="holding-stats">
                  <div className="stat-item">
                    <span className="stat-label">P/VP</span>
                    <span className="stat-value">
                      {item.pVP?.toFixed(2)}
                      {item.pVP && item.pVP < 1 ? ' (Desconto)' : item.pVP && item.pVP > 1 ? ' (Agio)' : ''}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">DY (12M)</span>
                    <span className="stat-value">{item.dy12m?.toFixed(2)}%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Cotacao</span>
                    <span className="stat-value">R$ {item.currentPrice?.toFixed(2)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">P. Medio</span>
                    <span className="stat-value">R$ {item.avgPrice.toFixed(2)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Valor Atual</span>
                    <span className="stat-value">R$ {item.currentValue.toFixed(2)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Gain/Loss</span>
                    <span className={`stat-value ${item.gainLoss >= 0 ? 'positive' : 'negative'}`}
                          style={{ color: item.gainLoss >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
                      {item.gainLossPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="recommendation">
                  <p className="recommendation-label">Indicacao baseada no P/VP</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {item.pVP && item.pVP < 0.95 && 'FII esta com desconto em relacao ao valor patrimonial.'}
                    {item.pVP && item.pVP >= 0.95 && item.pVP <= 1.05 && 'FII esta proximo do valor patrimonial.'}
                    {item.pVP && item.pVP > 1.05 && 'FII esta sobreprecado em relacao ao valor patrimonial.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
}
