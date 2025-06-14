require('dotenv').config();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

module.exports = async () => {
  try {
    // Verificar si ya existe un admin
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('🛂 Admin ya existe:', existingAdmin.email);
      return existingAdmin;
    }

    // Crear nuevo admin
    const admin = await User.create({
      email: process.env.ADMIN_EMAIL,
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
      role: 'admin'
    });

    // Generar token JWT
    const token = jwt.sign(
      { userId: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Guardar token en archivo (solo para desarrollo)
    const tokenPath = path.join(__dirname, '..', 'admin_token.txt');
    fs.writeFileSync(tokenPath, `ADMIN_TOKEN=${token}`);
    
    console.log('👑 Admin creado:', admin.email);
    console.log('🔐 Token generado y guardado en admin_token.txt');
    console.log('⚠️ ATENCIÓN: Este archivo solo debe usarse en desarrollo');

    return { admin, token };
  } catch (error) {
    console.error('❌ Error al crear admin:', error.message);
    throw error;
  }
};