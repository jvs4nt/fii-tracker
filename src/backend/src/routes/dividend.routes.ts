import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import prismaClient from '../database';

const router = Router();

router.use(authMiddleware);

// Get all dividends
router.get('/', async (req: AuthRequest, res) => {
  try {
    const dividends = await prismaClient.dividend.findMany({
      where: { userId: req.userId },
      orderBy: { exDate: 'desc' },
    });

    return res.json(dividends);
  } catch (error) {
    console.error('Get dividends error:', error);
    return res.status(500).json({ error: 'Erro ao buscar dividendos' });
  }
});

// Mark dividend as received
router.put('/:id/receive', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const dividend = await prismaClient.dividend.findUnique({
      where: { id: id as string },
    });

    if (!dividend) {
      return res.status(404).json({ error: 'Dividendo não encontrado' });
    }

    if (dividend.userId !== req.userId) {
      return res.status(403).json({ error: 'Não autorizado' });
    }

    const updated = await prismaClient.dividend.update({
      where: { id: id as string },
      data: { status: 'received' },
    });

    return res.json(updated);
  } catch (error) {
    console.error('Update dividend error:', error);
    return res.status(500).json({ error: 'Erro ao atualizar dividendo' });
  }
});

// Create dividend manually
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { ticker, amount, type, exDate, payDate } = req.body;

    if (!ticker || !amount || !exDate) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const dividend = await prismaClient.dividend.create({
      data: {
        userId: req.userId!,
        ticker: ticker.toUpperCase(),
        amount: parseFloat(amount),
        type: type || 'dividendo',
        exDate: new Date(exDate),
        payDate: payDate ? new Date(payDate) : null,
        status: 'pending',
      },
    });

    return res.json(dividend);
  } catch (error) {
    console.error('Create dividend error:', error);
    return res.status(500).json({ error: 'Erro ao criar dividendo' });
  }
});

// Delete dividend
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const dividend = await prismaClient.dividend.findUnique({
      where: { id: id as string },
    });

    if (!dividend) {
      return res.status(404).json({ error: 'Dividendo não encontrado' });
    }

    if (dividend.userId !== req.userId) {
      return res.status(403).json({ error: 'Não autorizado' });
    }

    await prismaClient.dividend.delete({
      where: { id: id as string },
    });

    return res.json({ message: 'Dividendo deletado com sucesso' });
  } catch (error) {
    console.error('Delete dividend error:', error);
    return res.status(500).json({ error: 'Erro ao deletar dividendo' });
  }
});

export default router;
