import express from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Validation schema
const withdrawSchema = z.object({
  amount: z.number().positive(),
});

// Create withdrawal request
router.post('/', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const { amount } = withdrawSchema.parse(req.body);
    const userId = req.user?.userId;

    // Check if user has sufficient balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create withdrawal record
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        amount,
        status: 'pending',
      },
    });

    // In a real application, this would integrate with a blockchain wallet
    // For now, we'll simulate a successful withdrawal after a delay
    setTimeout(async () => {
      try {
        // Update withdrawal status
        await prisma.withdrawal.update({
          where: { id: withdrawal.id },
          data: {
            status: 'completed',
            txHash: `0x${Math.random().toString(16).slice(2)}`, // Simulated transaction hash
          },
        });

        // Update user balance
        await prisma.user.update({
          where: { id: userId },
          data: {
            balance: {
              decrement: amount,
            },
          },
        });
      } catch (error) {
        console.error('Error processing withdrawal:', error);
      }
    }, 5000); // Simulate 5-second processing time

    res.status(201).json(withdrawal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Error creating withdrawal' });
  }
});

// Get user's withdrawals
router.get('/', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching withdrawals' });
  }
});

export default router; 