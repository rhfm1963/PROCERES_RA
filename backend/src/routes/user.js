const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const User = require('../models/User');

// Actualizar puntuación (ej: al completar un quiz)
router.patch('/score', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.score += req.body.points; // 👈 Suma puntos
    await user.save();
    res.json({ score: user.score });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;