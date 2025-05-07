import express from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Validation schemas
const createTradeSchema = z.object({
  pair: z.string(),
  type: z.enum(['long', 'short']),
  amount: z.number().positive(),
  leverage: z.number().positive(),
});

// Place new trade
router.post('/', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const { pair, type, amount, leverage } = createTradeSchema.parse(req.body);
    const userId = req.user?.userId;

    // Get current price (this would come from a price feed in production)
    const currentPrice = 50000; // Example price

    // Calculate required margin
    const requiredMargin = amount / leverage;

    // Check if user has sufficient balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.balance < requiredMargin) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create trade
    const trade = await prisma.trade.create({
      data: {
        userId,
        pair,
        type,
        entryPrice: currentPrice,
        amount,
        leverage,
        status: 'open',
      },
    });

    // Update user balance
    await prisma.user.update({
      where: { id: userId },
      data: {
        balance: {
          decrement: requiredMargin,
        },
      },
    });

    res.status(201).json(trade);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Error creating trade' });
  }
});

// Get user's trades
router.get('/', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const trades = await prisma.trade.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching trades' });
  }
});

// Close trade
router.post('/:id/close', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const trade = await prisma.trade.findFirst({
      where: { id, userId },
    });

    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    if (trade.status !== 'open') {
      return res.status(400).json({ error: 'Trade is not open' });
    }

    // Get current price (this would come from a price feed in production)
    const currentPrice = 51000; // Example price

    // Calculate PnL
    const pnl = trade.type === 'long'
      ? (currentPrice - trade.entryPrice) * trade.amount
      : (trade.entryPrice - currentPrice) * trade.amount;

    // Update trade
    const updatedTrade = await prisma.trade.update({
      where: { id },
      data: {
        status: 'closed',
        exitPrice: currentPrice,
        pnl,
      },
    });

    // Update user balance
    await prisma.user.update({
      where: { id: userId },
      data: {
        balance: {
          increment: trade.amount / trade.leverage + pnl,
        },
      },
    });

    res.json(updatedTrade);
  } catch (error) {
    res.status(500).json({ error: 'Error closing trade' });
  }
});

export default router; 