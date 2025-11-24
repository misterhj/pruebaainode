// routes/userRoutes.js
import express from "express";
import geminiController from '../controllers/geminiController.js';
const router = express.Router();

router.get("/", function (req, res) {
  res.render("index"); 
});

router.post('/api/resources', geminiController.getGeminiResponse);

export default router;