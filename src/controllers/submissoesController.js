const Submissao = require('../models/Submissao');
const User = require('../models/User');
const Form = require('../models/Form');

exports.create = async (req, res) => {
  try {
    const { formularioId, tituloFormulario, respostas } = req.body;
    
    const novaSubmissao = await Submissao.create({
      formulario: formularioId,
      professor: req.userId,
      tituloFormulario,
      respostas,
      estado: 'Pendente'
    });

    res.status(201).json(novaSubmissao);
  } catch (error) {
    console.error('Erro ao criar submissão:', error);
    res.status(500).json({ error: 'Erro ao guardar a submissão.' });
  }
};

exports.listMySubmissions = async (req, res) => {
  try {
    const pedidos = await Submissao.find({ professor: req.userId })
      .sort({ dataSubmissao: -1 });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao procurar os seus pedidos.' });
  }
};

exports.listAll = async (req, res) => {
  try {
    const pedidos = await Submissao.find()
      .populate('professor', 'email')
      .sort({ dataSubmissao: 1 });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao procurar todos os pedidos.',
      details: error.message 
    });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await Submissao.countDocuments();
    const pendentes = await Submissao.countDocuments({ estado: 'Pendente' });
    const aprovados = await Submissao.countDocuments({ estado: 'Aprovado' });
    const rejeitados = await Submissao.countDocuments({ estado: 'Rejeitado' });

    const taxaAprovacao = total > 0 ? ((aprovados / (aprovados + rejeitados || 1)) * 100).toFixed(1) : 0;

    res.json({
      total,
      pendentes,
      aprovados,
      rejeitados,
      taxaAprovacao: parseFloat(taxaAprovacao)
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar estatísticas.' });
  }
};

exports.getOccupancy = async (req, res) => {
  try {
    const submissoes = await Submissao.find({ estado: { $ne: 'Rejeitado' } })
      .populate('formulario')
      .lean();

    const ocupacao = [];

    submissoes.forEach(sub => {
      if (!sub.formulario || !sub.formulario.campos) return;

      const campoSala = sub.formulario.campos.find(c => 
        c.etiqueta.toLowerCase().includes('sala') || c.etiqueta.toLowerCase().includes('room')
      );
      const campoData = sub.formulario.campos.find(c => c.tipo === 'Data');
      
      const campoInicio = sub.formulario.campos.find(c => 
        c.etiqueta.toLowerCase().includes('início') || c.etiqueta.toLowerCase().includes('inicio') || c.etiqueta.toLowerCase().includes('entrada')
      );
      const campoFim = sub.formulario.campos.find(c => 
        c.etiqueta.toLowerCase().includes('fim') || c.etiqueta.toLowerCase().includes('saída') || c.etiqueta.toLowerCase().includes('saida')
      );

      if (campoSala && campoData) {
        const salaId = campoSala._id?.toString();
        const dataId = campoData._id?.toString();
        const inicioId = campoInicio?._id?.toString();
        const fimId = campoFim?._id?.toString();

        const salaValue = sub.respostas[salaId];
        const dataValue = sub.respostas[dataId];
        const inicioValue = inicioId ? sub.respostas[inicioId] : null;
        const fimValue = fimId ? sub.respostas[fimId] : null;

        if (salaValue && dataValue) {
          ocupacao.push({
            sala: salaValue,
            data: dataValue,
            inicio: inicioValue,
            fim: fimValue,
            pedidoId: sub._id
          });
        }
      }
    });

    res.json(ocupacao);
  } catch (error) {
    console.error('Erro ao obter ocupação:', error);
    res.status(500).json({ error: 'Erro ao processar ocupação das salas.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const submissao = await Submissao.findById(req.params.id)
      .populate('formulario')
      .populate('professor', 'email')
      .lean();
    
    if (!submissao) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }
    
    res.json(submissao);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar detalhes do pedido.' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { estado } = req.body;
    
    if (!['Aprovado', 'Rejeitado', 'Pendente'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido.' });
    }

    const submissao = await Submissao.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    ).populate('formulario').populate('professor', 'email');

    if (!submissao) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    res.json(submissao);
  } catch (error) {
    console.error('Erro ao atualizar estado:', error);
    res.status(500).json({ error: 'Erro ao atualizar o estado do pedido.' });
  }
};
