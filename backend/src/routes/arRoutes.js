// routes/arRoutes.js
const express = require('express');
const router = express.Router();
const ARModel = require('../models/ARModel');
const authenticate = require('../middlewares/auth');

// Crear modelo (protegido)
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, modelUrl } = req.body;
    const newModel = new ARModel({ name, modelUrl, createdBy: req.user.id });
    await newModel.save();
    res.status(201).json(newModel);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Listar modelos públicos
router.get('/', async (req, res) => {
  const models = await ARModel.find().populate('createdBy', 'email');
  res.json(models);
});

// Detalle de modelo
router.get('/:id', async (req, res) => {
  try {
    const model = await ARModel.findById(req.params.id);
    if (!model) return res.status(404).json({ error: "Modelo no encontrado" });
    res.json(model);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});