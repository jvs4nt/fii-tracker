import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import prismaClient from '../database';
import { fetchFiiData, fetchDividendsHistory, searchFiiTickers } from '../services/fiiService';

const router = Router();

router.use(authMiddleware);

// Search FII tickers
router.get('/search', async (req: AuthRequest, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.json([]);
    }
    const suggestions = await searchFiiTickers(q);
    return res.json(suggestions);
  } catch (error) {
    console.error('Search FII error:', error);
    return res.status(500).json({ error: 'Erro ao buscar sugestões' });
  }
});

// Get FII data from API
router.get('/quote/:ticker', async (req: AuthRequest, res) => {
  try {
    const { ticker } = req.params;
    const data = await fetchFiiData((ticker as string).toUpperCase());
    res.json(data);
  } catch (error) {
    console.error('Fetch FII quote error:', error);
    res.status(500).json({ error: 'Erro ao buscar cotação' });
  }
});

// Get dividend history
router.get('/dividends/:ticker', async (req: AuthRequest, res) => {
  try {
    const { ticker } = req.params;
    const dividends = await fetchDividendsHistory((ticker as string).toUpperCase());
    res.json(dividends);
  } catch (error) {
    console.error('Fetch dividends error:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico de dividendos' });
  }
});

// Get portfolio analysis
router.get('/analysis', async (req: AuthRequest, res) => {
  try {
    const holdings = await prismaClient.holding.findMany({
      where: { userId: req.userId },
    });

    const analysis = await Promise.all(
      holdings.map(async (holding) => {
        const fiiData = await fetchFiiData(holding.ticker);

        const currentValue = holding.quantity * (fiiData.currentPrice || holding.avgPrice);
        const investedValue = holding.quantity * holding.avgPrice;
        const gainLoss = currentValue - investedValue;
        const gainLossPercent = investedValue > 0 ? ((currentValue - investedValue) / investedValue) * 100 : 0;

        let recommendation = 'manter';
        if (fiiData.pVP) {
          if (fiiData.pVP < 0.95) recommendation = 'comprar';
          else if (fiiData.pVP > 1.05) recommendation = 'vender';
        }

        return {
          ...holding,
          ...fiiData,
          currentValue,
          investedValue,
          gainLoss,
          gainLossPercent,
          recommendation,
        };
      })
    );

    res.json(analysis);
  } catch (error) {
    console.error('Portfolio analysis error:', error);
    res.status(500).json({ error: 'Erro ao analisar carteira' });
  }
});

// Get dashboard summary
router.get('/dashboard', async (req: AuthRequest, res) => {
  try {
    const holdings = await prismaClient.holding.findMany({
      where: { userId: req.userId },
    });

    const dividends = await prismaClient.dividend.findMany({
      where: { userId: req.userId },
    });

    let totalInvested = 0;
    let totalCurrentValue = 0;
    let totalDividendsReceived = 0;

    const holdingsWithQuotes = await Promise.all(
      holdings.map(async (holding) => {
        const fiiData = await fetchFiiData(holding.ticker);
        const currentValue = holding.quantity * (fiiData.currentPrice || holding.avgPrice);

        totalInvested += holding.quantity * holding.avgPrice;
        totalCurrentValue += currentValue;
        
        const merged = { ...holding, ...fiiData, currentValue };
        console.log(`[Dashboard Debug] ${holding.ticker}: Sector=${merged.sector}`);
        return merged;
      })
    );

    totalDividendsReceived = dividends
      .filter(d => d.status === 'received')
      .reduce((sum, d) => sum + d.amount, 0);

    const pendingDividends = dividends
      .filter(d => d.status === 'pending')
      .map(d => ({
        ticker: d.ticker,
        amount: d.amount,
        exDate: d.exDate,
        payDate: d.payDate,
      }));

    res.json({
      totalInvested,
      totalCurrentValue,
      totalGainLoss: totalCurrentValue - totalInvested,
      totalGainLossPercent: totalInvested > 0 ? ((totalCurrentValue - totalInvested) / totalInvested) * 100 : 0,
      totalDividendsReceived,
      holdingsCount: holdings.length,
      holdings: holdingsWithQuotes,
      pendingDividends,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Erro ao buscar dashboard' });
  }
});

export default router;
