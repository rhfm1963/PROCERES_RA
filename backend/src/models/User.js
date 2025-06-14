const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email no válido']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  score: {  // 👈 Nueva propiedad para puntuación
    type: Number,
    default: 0,
    min: 0
  },
  tokens: [{  // 👈 Array de tokens (para múltiples dispositivos)
    token: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  role: {
    type: String,
    enum: ['user', 'ar_creator', 'admin'],
    default: 'user'
  }
}, { timestamps: true });

// Método para generar JWT y guardar token
userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
  user.tokens = user.tokens.concat({ token }); // 👈 Almacena el token
  await user.save();
  
  return token;
};

// Hash de contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);