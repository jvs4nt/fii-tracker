import axios from 'axios';
import * as cheerio from 'cheerio';

const BRAPI_API_BASE = 'https://brapi.dev/api/quote';

export interface FiiData {
  ticker: string;
  name: string;
  currentPrice: number;
  pVP: number;
  dy12m: number;
  sector: string;
  lastDividend: number;
  lastDividendDate: Date | null;
  nextDividendDate: Date | null;
}

export async function fetchFiiData(ticker: string): Promise<Partial<FiiData>> {
  try {
    // Try Brapi.dev first
    try {
      const response = await axios.get(`${BRAPI_API_BASE}/${ticker}.SA?token=nnTscN4CwEZ2SDnx1AW8PB&modules=summaryProfile`);
      const quote = response.data.results?.[0];

      if (quote) {
        return {
          ticker,
          currentPrice: quote.regularMarketPrice || 0,
          name: quote.longName || ticker,
          sector: quote.summaryProfile?.industry || quote.segment || 'Unknown',
          dy12m: quote.dividendYield || 0,
        };
      }
    } catch (brapiError) {
      console.log(`Brapi failed for ${ticker}, trying fallback...`);
    }

    // Fallback: mock data for development
    return generateMockFiiData(ticker);
  } catch (error) {
    console.error(`Error fetching FII data for ${ticker}:`, error);
    return generateMockFiiData(ticker);
  }
}

function generateMockFiiData(ticker: string): Partial<FiiData> {
  // Mock data based on known FIIs
  const mockData: Record<string, Partial<FiiData>> = {
    HGLG11: { currentPrice: 165.0, pVP: 0.98, dy12m: 10.5, sector: 'Logística', name: 'CSHG Logística' },
    MXRF11: { currentPrice: 10.5, pVP: 1.02, dy12m: 12.8, sector: 'Papel', name: 'Maxi Renda' },
    KNRI11: { currentPrice: 155.0, pVP: 0.95, dy12m: 9.2, sector: 'Shopping', name: 'Kinea Renda' },
    XPML11: { currentPrice: 28.0, pVP: 0.92, dy12m: 11.0, sector: 'Shopping', name: 'XP Malls' },
    VGIR11: { currentPrice: 9.8, pVP: 1.05, dy12m: 10.2, sector: 'Lajes', name: 'Vinci Giron' },
    VISC11: { currentPrice: 130.0, pVP: 0.89, dy12m: 9.8, sector: 'Shopping', name: 'Vinci Shopping' },
    HGRE11: { currentPrice: 145.0, pVP: 1.08, dy12m: 8.5, sector: 'Logística', name: 'CSHG Real Estate' },
    CPTS11: { currentPrice: 8.5, pVP: 0.94, dy12m: 13.5, sector: 'Papel', name: 'Capitânia' },
    TGAR11: { currentPrice: 105.0, pVP: 0.96, dy12m: 10.0, sector: 'Logística', name: 'TG Real' },
    RBRP11: { currentPrice: 55.0, pVP: 0.85, dy12m: 14.2, sector: 'Papel', name: 'RBR Properties' },
    BTLG11: { currentPrice: 115.0, pVP: 0.97, dy12m: 10.8, sector: 'Logística', name: 'BTG Logística' },
    BCFF11: { currentPrice: 280.0, pVP: 1.01, dy12m: 9.5, sector: 'Lajes', name: 'BC Fund' },
    GGRC11: { currentPrice: 38.0, pVP: 0.93, dy12m: 11.5, sector: 'Logística', name: 'Gafisa' },
    IRDM11: { currentPrice: 75.0, pVP: 0.88, dy12m: 12.0, sector: 'Papel', name: 'IRed' },
    RVBI11: { currentPrice: 80.0, pVP: 0.91, dy12m: 11.8, sector: 'Shopping', name: 'Vinci Renda' },
  };

  return mockData[ticker] || {
    currentPrice: 10 + Math.random() * 200,
    pVP: 0.85 + Math.random() * 0.3,
    dy12m: 8 + Math.random() * 6,
    sector: ['Logística', 'Shopping', 'Papel', 'Lajes'][Math.floor(Math.random() * 4)],
    name: ticker,
  };
}

export async function fetchDividendsHistory(ticker: string): Promise<Array<{
  amount: number;
  type: string;
  exDate: Date;
  payDate: Date;
}>> {
  try {
    // Try scraping from Status Invest
    try {
      const response = await axios.get(`https://statusinvest.com.br/fundos-de-investimentos/${ticker.toLowerCase()}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });

      const $ = cheerio.load(response.data);
      const dividends: Array<{ amount: number; type: string; exDate: Date; payDate: Date }> = [];

      // Parse dividend history from the page
      $('.table-row').each((_i, elem) => {
        const cols = $(elem).find('div');
        if (cols.length >= 4) {
          const amount = parseFloat($(cols[1]).text().replace(',', '.'));
          const type = $(cols[2]).text().trim();
          const exDate = new Date($(cols[0]).text().split('/').reverse().join('-'));
          const payDate = new Date($(cols[3]).text().split('/').reverse().join('-'));

          if (!isNaN(amount) && !isNaN(exDate.getTime())) {
            dividends.push({ amount, type, exDate, payDate });
          }
        }
      });

      if (dividends.length > 0) {
        return dividends;
      }
    } catch (scrapeError) {
      console.log(`Scraping failed for ${ticker}, using mock data...`);
    }

    // Mock dividend history
    return generateMockDividends(ticker);
  } catch (error) {
    console.error(`Error fetching dividends for ${ticker}:`, error);
    return generateMockDividends(ticker);
  }
}

function generateMockDividends(ticker: string): Array<{
  amount: number;
  type: string;
  exDate: Date;
  payDate: Date;
}> {
  const dividends: Array<{ amount: number; type: string; exDate: Date; payDate: Date }> = [];
  const baseAmount = ticker === 'MXRF11' ? 0.08 : ticker === 'HGLG11' ? 1.5 : 0.5 + Math.random() * 1.5;

  for (let i = 0; i < 12; i++) {
    const exDate = new Date();
    exDate.setMonth(exDate.getMonth() - i * 2);
    exDate.setDate(15);

    const payDate = new Date(exDate);
    payDate.setDate(payDate.getDate() + 10);

    dividends.push({
      amount: baseAmount * (0.9 + Math.random() * 0.2),
      type: Math.random() > 0.1 ? 'dividendo' : 'jcp',
      exDate,
      payDate,
    });
  }

  return dividends;
}
