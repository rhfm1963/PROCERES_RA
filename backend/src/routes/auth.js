router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = await user.generateAuthToken(); // 👈 Usa el método del modelo
    res.json({ token, score: user.score }); // 👈 Devuelve puntuación
  } catch (error) {
        res.status(500).json({ error: 'Error al iniciar sesión' });
      }
    });