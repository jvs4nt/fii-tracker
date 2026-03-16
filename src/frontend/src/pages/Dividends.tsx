import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dividendsApi } from '../api';
import { DollarSign, Plus, Trash2, CheckCircle, LayoutDashboard, Wallet, TrendingUp, BookOpen } from 'lucide-react';

interface Dividend {
  id: string;
  ticker: string;
  amount: number;
  type: string;
  exDate: string;
  payDate: string | null;
  status: 'pending' | 'received';
}

export default function Dividends() {
  const navigate = useNavigate();
  const [dividends, setDividends] = useState<Dividend[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    ticker: '',
    amount: '',
    type: 'dividendo',
    exDate: new Date().toISOString().split('T')[0],
    payDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchDividends();
  }, []);

  const fetchDividends = async () => {
    try {
      const response = await dividendsApi.getAll();
      setDividends(response.data);
    } catch (error) {
      console.error('Erro ao buscar dividendos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await dividendsApi.create({
        ticker: formData.ticker,
        amount: parseFloat(formData.amount),
        type: formData.type,
        exDate: formData.exDate,
        payDate: formData.payDate,
      });

      setShowModal(false);
      setFormData({
        ticker: '',
        amount: '',
        type: 'dividendo',
        exDate: new Date().toISOString().split('T')[0],
        payDate: new Date().toISOString().split('T')[0],
      });
      fetchDividends();
    } catch (error) {
      console.error('Erro ao criar dividendo:', error);
    }
  };

  const handleMarkReceived = async (id: string) => {
    try {
      await dividendsApi.markReceived(id);
      fetchDividends();
    } catch (error) {
      console.error('Erro ao marcar como recebido:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este dividendo?')) {
      try {
        await dividendsApi.delete(id);
        fetchDividends();
      } catch (error) {
        console.error('Erro ao deletar:', error);
      }
    }
  };

  const openNewModal = () => {
    setFormData({
      ticker: '',
      amount: '',
      type: 'dividendo',
      exDate: new Date().toISOString().split('T')[0],
      payDate: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const pendingDividends = dividends.filter(d => d.status === 'pending');
  const receivedDividends = dividends.filter(d => d.status === 'received');

  const totalReceived = receivedDividends.reduce((sum, d) => sum + d.amount, 0);
  const totalPending = pendingDividends.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">
            <DollarSign size={24} />
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
          <li className="nav-item active">
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
            <h1 className="page-title">Proventos</h1>
            <p className="page-subtitle">Histórico e calendário de dividendos</p>
          </div>
          <button className="btn btn-primary" onClick={openNewModal}>
            <Plus size={18} />
            Adicionar Manualmente
          </button>
        </div>

        <div className="cards-grid">
          <div className="card">
            <h3 className="card-title">Total Recebido</h3>
            <p className="card-value">R$ {totalReceived.toFixed(2)}</p>
          </div>

          <div className="card">
            <h3 className="card-title">Total Pendente</h3>
            <p className="card-value">R$ {totalPending.toFixed(2)}</p>
          </div>

          <div className="card">
            <h3 className="card-title">Proventos Recebidos</h3>
            <p className="card-value">{receivedDividends.length}</p>
          </div>

          <div className="card">
            <h3 className="card-title">Proventos Pendentes</h3>
            <p className="card-value">{pendingDividends.length}</p>
          </div>
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : pendingDividends.length === 0 && receivedDividends.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <DollarSign size={64} />
            </div>
            <h3 className="empty-state-title">Nenhum provento cadastrado</h3>
            <p className="empty-state-description">
              Adicione proventos manualmente ou eles serão sincronizados automaticamente
            </p>
            <button className="btn btn-primary" onClick={openNewModal}>
              <Plus size={18} />
              Adicionar Provento
            </button>
          </div>
        ) : (
          <>
            {pendingDividends.length > 0 && (
              <div className="table-container" style={{ marginBottom: '2rem' }}>
                <h3 style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                  Proventos Pendentes
                </h3>
                <table className="table">
                  <thead>
                    <tr>
                      <th>FII</th>
                      <th>Tipo</th>
                      <th>Valor</th>
                      <th>Data Ex</th>
                      <th>Data Pagamento</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDividends.map((div) => (
                      <tr key={div.id}>
                        <td>{div.ticker}</td>
                        <td>
                          <span className="badge badge-info">{div.type}</span>
                        </td>
                        <td>R$ {div.amount.toFixed(2)}</td>
                        <td>{new Date(div.exDate).toLocaleDateString('pt-BR')}</td>
                        <td>
                          {div.payDate ? new Date(div.payDate).toLocaleDateString('pt-BR') : 'N/A'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleMarkReceived(div.id)}
                            >
                              <CheckCircle size={14} />
                              Recebido
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(div.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {receivedDividends.length > 0 && (
              <div className="table-container">
                <h3 style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                  Histórico de Proventos
                </h3>
                <table className="table">
                  <thead>
                    <tr>
                      <th>FII</th>
                      <th>Tipo</th>
                      <th>Valor</th>
                      <th>Data Ex</th>
                      <th>Data Pagamento</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receivedDividends.map((div) => (
                      <tr key={div.id}>
                        <td>{div.ticker}</td>
                        <td>
                          <span className="badge badge-success">{div.type}</span>
                        </td>
                        <td>R$ {div.amount.toFixed(2)}</td>
                        <td>{new Date(div.exDate).toLocaleDateString('pt-BR')}</td>
                        <td>
                          {div.payDate ? new Date(div.payDate).toLocaleDateString('pt-BR') : 'N/A'}
                        </td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(div.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Adicionar Provento</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Ticker do FII</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.ticker}
                  onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                  placeholder="HGLG11"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Valor (R$)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.85"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select
                  className="form-input"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="dividendo">Dividendo</option>
                  <option value="jcp">JCP</option>
                  <option value="desdobramento">Desdobramento</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Data Ex</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.exDate}
                  onChange={(e) => setFormData({ ...formData, exDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Data de Pagamento</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.payDate}
                  onChange={(e) => setFormData({ ...formData, payDate: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


