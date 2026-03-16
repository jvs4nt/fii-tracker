import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import {
  AssistantRateLimitError,
  chatWithPortfolioAssistant,
  type AssistantHistoryItem,
} from '../services/aiService';

const router = Router();

router.use(authMiddleware);

router.post('/chat', async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const { message, history } = req.body as {
      message?: string;
      history?: AssistantHistoryItem[];
    };

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensagem obrigatória' });
    }

    const result = await chatWithPortfolioAssistant(
      req.userId,
      message,
      Array.isArray(history) ? history : []
    );

    return res.json(result);
  } catch (error) {
    if (error instanceof AssistantRateLimitError) {
      return res.status(429).json({ error: error.message });
    }

    if (error instanceof Error) {
      console.error('AI chat error:', error.message);
    } else {
      console.error('AI chat error:', error);
    }

    return res.status(500).json({ error: 'Erro ao consultar assistente IA' });
  }
});

export default router;
