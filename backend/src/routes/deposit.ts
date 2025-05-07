import express from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Validation schema
const depositSchema = z.object({
  amount: z.number().positive(),
});

// Create deposit request
router.post('/', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const { amount } = depositSchema.parse(req.body);
    const userId = req.user?.userId;

    // Create deposit record
    const deposit = await prisma.deposit.create({
      data: {
        userId,
        amount,
        status: 'pending',
      },
    });

    // In a real application, this would integrate with a blockchain wallet
    // For now, we'll simulate a successful deposit after a delay
    setTimeout(async () => {
      try {
        // Update deposit status
        await prisma.deposit.update({
          where: { id: deposit.id },
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
              increment: amount,
            },
          },
        });
      } catch (error) {
        console.error('Error processing deposit:', error);
      }
    }, 5000); // Simulate 5-second processing time

    res.status(201).json(deposit);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Error creating deposit' });
  }
});

// Get user's deposits
router.get('/', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const deposits = await prisma.deposit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(deposits);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching deposits' });
  }
});

export default router; 