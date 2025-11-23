// routes/userRoutes.js
import express from "express";
import geminiController from '../controllers/geminiController.js';
const router = express.Router();

router.post('/api/resources', geminiController.getGeminiResponse);

export default router;