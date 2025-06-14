const express = require('express');
const router = express.Router();
const Procer = require('../models/Procer');
const { authenticate, checkRole } = require('../middlewares/auth');

// Listar todos los próceres
router.get('/', async (req, res) => {
  try {
    const proceres = await Procer.find();
    res.json(proceres);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Detalle de un prócer
router.get('/:id', async (req, res) => {
  try {
    const procer = await Procer.findById(req.params.id);
        if (!procer) return res.status(404).json({ error: "Prócer no encontrado" });
        res.json(procer);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });