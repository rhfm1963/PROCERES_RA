// routes/arRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const ARModel = require(path.join(__dirname, '../models/ARModel'));
const { authenticate } = require('../middlewares/auth');

// Middleware para manejar errores de async/await
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Crear modelo (protegido)
router.post('/', 
  authenticate, 
  asyncHandler(async (req, res) => {
    const { name, modelUrl } = req.body;
    const newModel = new ARModel({ 
      name, 
      modelUrl, 
      createdBy: req.user.id 
    });
    await newModel.save();
    res.status(201).json(newModel);
  })
);

// Listar modelos públicos
router.get('/', 
  asyncHandler(async (req, res) => {
    const models = await ARModel.find().populate('createdBy', 'email');
    res.json(models);
  })
);

// Detalle de modelo
router.get('/:id', 
  asyncHandler(async (req, res) => {
    const model = await ARModel.findById(req.params.id);
    if (!model) {
      return res.status(404).json({ error: "Modelo no encontrado" });
    }
    res.json(model);
  })
);

module.exports = router;