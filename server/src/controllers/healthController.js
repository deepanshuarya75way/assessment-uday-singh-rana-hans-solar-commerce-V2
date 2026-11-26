import catchAsync from '../utils/catchAsync.js';
import prisma from '../config/prisma.js';

export const getHealth = catchAsync(async (_req, res) => {
  try {
    await prisma.$runCommandRaw({ ping: 1 });
  } catch {
    res.status(503).json({
      success: false,
      message: 'Database unavailable',
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'HANS Solar API is running',
  });
});
