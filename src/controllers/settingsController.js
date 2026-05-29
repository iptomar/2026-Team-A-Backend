const Settings = require('../models/Settings');

exports.getVisualSettings = async (req, res) => {
  try {
    const cor = await Settings.findOne({ key: 'corPrincipal' });
    const logo = await Settings.findOne({ key: 'logo' });
    
    res.json({
      corPrincipal: cor ? cor.value : '#282c34',
      logo: logo ? logo.value : null
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar definições.' });
  }
};

exports.updateVisualSettings = async (req, res) => {
  try {
    const { corPrincipal, logo } = req.body;
    
    if (corPrincipal) {
      await Settings.findOneAndUpdate(
        { key: 'corPrincipal' },
        { value: corPrincipal },
        { upsert: true }
      );
    }
    
    if (logo) {
      await Settings.findOneAndUpdate(
        { key: 'logo' },
        { value: logo },
        { upsert: true }
      );
    }
    
    res.json({ message: 'Definições guardadas com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao guardar definições.' });
  }
};
