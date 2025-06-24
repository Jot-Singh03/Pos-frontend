import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Check MongoDB connection
    const isConnected = mongoose.connection.readyState === 1;
    
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        error: 'Database connection is not ready'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

export default router; 