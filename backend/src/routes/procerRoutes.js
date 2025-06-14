const express = require('express');
const router = express.Router();
const Procer = require('../models/Procer');
const authMiddleware = require('../middlewares/auth');

// Obtener todos los próceres (público)
router.get('/', async (req, res) => {
  try {
    const proceres = await Procer.find();
    res.json(proceres);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtener un prócer específico (público)
router.get('/:id', async (req, res) => {
  try {
    const procer = await Procer.findById(req.params.id);
    if (!procer) return res.status(404).json({ message: 'Prócer no encontrado' });
    res.json(procer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Crear nuevo prócer (requiere admin)
router.post('/', 
  authMiddleware.authenticate, 
  authMiddleware.checkRole(['admin']),
  async (req, res) => {
    const procer = new Procer(req.body);
    try {
      const nuevoProcer = await procer.save();
      res.status(201).json(nuevoProcer);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
});

// Actualizar prócer (requiere admin)
router.put('/:id', 
  authMiddleware.authenticate, 
  authMiddleware.checkRole(['admin']),
  async (req, res) => {
    try {
      const procer = await Procer.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        { new: true }
      );
      if (!procer) return res.status(404).json({ message: 'Prócer no encontrado' });
      res.json(procer);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
});

// Eliminar prócer (requiere admin)
router.delete('/:id', 
  authMiddleware.authenticate, 
  authMiddleware.checkRole(['admin']),
  async (req, res) => {
    try {
      const procer = await Procer.findByIdAndDelete(req.params.id);
      if (!procer) return res.status(404).json({ message: 'Prócer no encontrado' });
      res.json({ message: 'Prócer eliminado correctamente' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});

module.exports = router;