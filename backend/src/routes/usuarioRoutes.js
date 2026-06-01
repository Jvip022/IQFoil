const express = require('express');
const router = express.Router();

router.get('/perfil', (req, res) => {
  res.json({ message: 'Perfil de usuario (implementar)' });
});

module.exports = router;
