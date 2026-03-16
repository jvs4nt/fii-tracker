import { useCallback, useState } from 'react';
import { holdingsApi, fiiApi } from '../api';
import Layout from '../components/Layout';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import TickerInput from '../components/TickerInput';
import { useAsyncData } from '../hooks/useAsyncData';
import { useTickerSuggestions } from '../hooks/useTickerSuggestions';

interface Holding {
  id: string;
  ticker: string;
  quantity: number;
  avgPrice: number;
  purchaseDate: string;
  currentPrice?: number;
  pVP?: number;
  dy12m?: number;
  sector?: string;
}

export default function Holdings() {
  const [showModal, setShowModal] = useState(false);
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null);
  const [formData, setFormData] = useState({
    ticker: '',
    quantity: '',
    avgPrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions } = useTickerSuggestions(formData.ticker);

  const fetchHoldings = useCallback(async () => {
    const response = await fiiApi.getAnalysis();
    return response.data as Holding[];
  }, []);

  const {
    data: holdingsData,
    loading,
    error,
    reload: reloadHoldings,
  } = useAsyncData<Holding[]>(fetchHoldings);

  const holdings = holdingsData ?? [];

  const handleTickerChange = (ticker: string) => {
    setFormData((prev) => ({ ...prev, ticker }));
  };

  const selectSuggestion = (s: string) => {
    setFormData((prev) => ({ ...prev, ticker: s }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingHolding) {
        await holdingsApi.update(editingHolding.id, {
          ticker: formData.ticker,
          quantity: parseFloat(formData.quantity),
          avgPrice: parseFloat(formData.avgPrice),
          purchaseDate: formData.purchaseDate,
        });
      } else {
        await holdingsApi.create({
          ticker: formData.ticker,
          quantity: parseFloat(formData.quantity),
          avgPrice: parseFloat(formData.avgPrice),
          purchaseDate: formData.purchaseDate,
        });
      }

      setShowModal(false);
      setEditingHolding(null);
      setFormData({
        ticker: '',
        quantity: '',
        avgPrice: '',
        purchaseDate: new Date().toISOString().split('T')[0],
      });
      await reloadHoldings();
    } catch (error) {
      console.error('Erro ao salvar holding:', error);
    }
  };

  const handleEdit = (holding: Holding) => {
    setEditingHolding(holding);
    setFormData({
      ticker: holding.ticker,
      quantity: holding.quantity.toString(),
      avgPrice: holding.avgPrice.toString(),
      purchaseDate: new Date(holding.purchaseDate).toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta holding?')) {
      try {
        await holdingsApi.delete(id);
        await reloadHoldings();
      } catch (error) {
        console.error('Erro ao deletar:', error);
      }
    }
  };

  const openNewModal = () => {
    setEditingHolding(null);
    setFormData({
      ticker: '',
      quantity: '',
      avgPrice: '',
      purchaseDate: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
    setShowSuggestions(false);
  };

  return (
    <Layout 
      title="Minha Carteira" 
      subtitle="Gerencie seus fundos imobiliários"
      actions={
        <button className="btn btn-primary" onClick={openNewModal}>
          <Plus size={18} />
          Adicionar FII
        </button>
      }
    >
      {loading ? (
        <p>Carregando...</p>
      ) : error ? (
        <p>Nao foi possivel carregar a carteira.</p>
      ) : holdings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Plus size={64} style={{ opacity: 0.2 }} />
          </div>
          <h3 className="empty-state-title">Nenhum FII cadastrado</h3>
          <p className="empty-state-description">
            Comece adicionando seu primeiro fundo imobiliário
          </p>
          <button className="btn btn-primary" onClick={openNewModal}>
            <Plus size={18} />
            Adicionar FII
          </button>
        </div>
      ) : (
        <div className="holdings-grid">
          {holdings.map((holding) => (
            <div key={holding.id} className="holding-card">
              <div className="holding-header">
                <div>
                  <h3 className="holding-ticker">{holding.ticker}</h3>
                  <p className="holding-name">{holding.sector || 'Setor não disponível'}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(holding)}>
                    <Edit2 size={14} />
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(holding.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="holding-stats">
                <div className="stat-item">
                  <span className="stat-label">Quantidade</span>
                  <span className="stat-value">{holding.quantity} cotas</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Preço Médio</span>
                  <span className="stat-value">R$ {holding.avgPrice.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Cotação Atual</span>
                  <span className="stat-value">R$ {holding.currentPrice?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">P/VP</span>
                  <span className="stat-value">{holding.pVP?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">DY (12M)</span>
                  <span className="stat-value">{holding.dy12m?.toFixed(2) || 0}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Valor Atual</span>
                  <span className="stat-value">
                    R$ {(holding.quantity * (holding.currentPrice || holding.avgPrice)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              {editingHolding ? 'Editar FII' : 'Novo FII'}
            </h3>
            <form onSubmit={handleSubmit}>
              <TickerInput
                value={formData.ticker}
                onChange={handleTickerChange}
                onSelect={selectSuggestion}
                suggestions={suggestions}
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
              />
              <div className="form-group">
                <label className="form-label">Quantidade de Cotas</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="10"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Preço Médio (R$)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.avgPrice}
                  onChange={(e) => setFormData({ ...formData, avgPrice: e.target.value })}
                  placeholder="150.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Data da Compra</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setShowSuggestions(false);
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingHolding ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

