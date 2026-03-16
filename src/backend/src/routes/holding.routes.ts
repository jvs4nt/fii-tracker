import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import prismaClient from '../database';

const router = Router();

router.use(authMiddleware);

// Get all holdings
router.get('/', async (req: AuthRequest, res) => {
  try {
    const holdings = await prismaClient.holding.findMany({
      where: { userId: req.userId },
      include: {
        dividends: true,
      },
      orderBy: { purchaseDate: 'desc' },
    });

    return res.json(holdings);
  } catch (error) {
    console.error('Get holdings error:', error);
    return res.status(500).json({ error: 'Erro ao buscar holdings' });
  }
});

// Create holding
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { ticker, quantity, avgPrice, purchaseDate } = req.body;

    if (!ticker || !quantity || !avgPrice || !purchaseDate) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const holding = await prismaClient.holding.create({
      data: {
        userId: req.userId!,
        ticker: ticker.toUpperCase(),
        quantity: parseFloat(quantity),
        avgPrice: parseFloat(avgPrice),
        purchaseDate: new Date(purchaseDate),
      },
    });

    return res.json(holding);
  } catch (error) {
    console.error('Create holding error:', error);
    return res.status(500).json({ error: 'Erro ao criar holding' });
  }
});

// Update holding
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { ticker, quantity, avgPrice, purchaseDate } = req.body;

    const holding = await prismaClient.holding.findUnique({
      where: { id: id as string },
    });

    if (!holding) {
      return res.status(404).json({ error: 'Holding não encontrada' });
    }

    if (holding.userId !== req.userId) {
      return res.status(403).json({ error: 'Não autorizado' });
    }

    const updated = await prismaClient.holding.update({
      where: { id: id as string },
      data: {
        ticker: ticker?.toUpperCase(),
        quantity: quantity ? parseFloat(quantity) : undefined,
        avgPrice: avgPrice ? parseFloat(avgPrice) : undefined,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
      },
    });

    return res.json(updated);
  } catch (error) {
    console.error('Update holding error:', error);
    return res.status(500).json({ error: 'Erro ao atualizar holding' });
  }
});

// Delete holding
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const holding = await prismaClient.holding.findUnique({
      where: { id: id as string },
    });

    if (!holding) {
      return res.status(404).json({ error: 'Holding não encontrada' });
    }

    if (holding.userId !== req.userId) {
      return res.status(403).json({ error: 'Não autorizado' });
    }

    await prismaClient.holding.delete({
      where: { id: id as string },
    });

    return res.json({ message: 'Holding deletada com sucesso' });
  } catch (error) {
    console.error('Delete holding error:', error);
    return res.status(500).json({ error: 'Erro ao deletar holding' });
  }
});

export default router;
