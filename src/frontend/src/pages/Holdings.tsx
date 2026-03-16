import { useState, useEffect } from 'react';
import { holdingsApi, fiiApi } from '../api';
import Layout from '../components/Layout';
import { Plus, Edit2, Trash2 } from 'lucide-react';

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
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null);
  const [formData, setFormData] = useState({
    ticker: '',
    quantity: '',
    avgPrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchHoldings();
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fiiApi.search(query);
      setSuggestions(response.data);
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
    }
  };

  const handleTickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setFormData({ ...formData, ticker: val });
    fetchSuggestions(val);
    setShowSuggestions(true);
  };

  const selectSuggestion = (s: string) => {
    setFormData({ ...formData, ticker: s });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const fetchHoldings = async () => {
    try {
      const response = await holdingsApi.getAll();
      const holdingsData = response.data;

      // Fetch current data for each holding
      const holdingsWithQuotes = await Promise.all(
        holdingsData.map(async (h: Holding) => {
          try {
            const quote = await fiiApi.getQuote(h.ticker);
            return { ...h, ...quote.data };
          } catch {
            return h;
          }
        })
      );

      setHoldings(holdingsWithQuotes);
    } catch (error) {
      console.error('Erro ao buscar holdings:', error);
    } finally {
      setLoading(false);
    }
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
      fetchHoldings();
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
        fetchHoldings();
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
              <div className="form-group">
                <label className="form-label">Ticker</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.ticker}
                  onChange={handleTickerChange}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="HGLG11"
                  autoComplete="off"
                  required
                />
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="suggestions-dropdown">
                    {suggestions.map((s) => (
                      <li key={s} onClick={() => selectSuggestion(s)} className="suggestion-item">
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
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

