const Submissao = require('../models/Submissao');
const User = require('../models/User');
const Form = require('../models/Form');

exports.create = async (req, res) => {
  try {
    const { formularioId, respostas } = req.body;

    // Procura o formulário para extrair as regras de validação
    const form = await Form.findById(formularioId);
    if (!form) return res.status(404).json({ error: 'Formulário não encontrado.' });

    // Validação de segurança no lado do servidor
    for (const campo of form.campos) {
      const valor = respostas[campo._id.toString()] || '';

      if (valor.trim() !== '') {
        // Validação de limites numéricos
        if (campo.tipo === 'Número') {
          const numVal = Number(valor);
          if (campo.minNumero !== undefined && numVal < campo.minNumero) {
            return res.status(400).json({ error: `O valor do campo "${campo.etiqueta}" deve ser no mínimo ${campo.minNumero}.` });
          }
          if (campo.maxNumero !== undefined && numVal > campo.maxNumero) {
            return res.status(400).json({ error: `O valor do campo "${campo.etiqueta}" deve ser no máximo ${campo.maxNumero}.` });
          }
        }
        // Validação de comprimento máximo de caracteres
        if (['Texto Curto', 'Texto Longo', 'Nome', 'Email'].includes(campo.tipo) && campo.maxCaracteres) {
          if (valor.length > campo.maxCaracteres) {
            return res.status(400).json({ error: `O campo "${campo.etiqueta}" excede o limite máximo de ${campo.maxCaracteres} caracteres.` });
          }
        }
      }
    }

    const { tituloFormulario } = req.body;
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
    const user = await User.findById(req.userId);
    let query = {};

    // Se for diretor de curso, restringe aos utilizadores ou formulários do seu curso
    if (req.userRole === 'diretor' && user && user.curso) {
      const usersDoMesmoCurso = await User.find({ curso: user.curso }).select('_id');
      const userIds = usersDoMesmoCurso.map(u => u._id);

      const formsDoCurso = await Form.find({ cursosDestinatarios: user.curso }).select('_id');
      const formIds = formsDoCurso.map(f => f._id);

      query = {
        $or: [
          { professor: { $in: userIds } },
          { formulario: { $in: formIds } }
        ]
      };
    } else if (req.userRole !== 'admin' && req.userRole !== 'coordenador') {
      return res.status(403).json({ error: 'Acesso negado. Perfil de coordenação incorreto.' });
    }

    const pedidos = await Submissao.find(query)
      .populate('professor', 'email curso')
      .populate('formulario')
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
    const user = await User.findById(req.userId);
    let query = {};

    if (req.userRole === 'diretor' && user && user.curso) {
      const usersDoMesmoCurso = await User.find({ curso: user.curso }).select('_id');
      const userIds = usersDoMesmoCurso.map(u => u._id);

      const formsDoCurso = await Form.find({ cursosDestinatarios: user.curso }).select('_id');
      const formIds = formsDoCurso.map(f => f._id);

      query = {
        $or: [
          { professor: { $in: userIds } },
          { formulario: { $in: formIds } }
        ]
      };
    } else if (req.userRole !== 'admin' && req.userRole !== 'coordenador') {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    const total = await Submissao.countDocuments(query);
    const pendentes = await Submissao.countDocuments({ ...query, estado: 'Pendente' });
    const aprovados = await Submissao.countDocuments({ ...query, estado: 'Aprovado' });
    const rejeitados = await Submissao.countDocuments({ ...query, estado: 'Rejeitado' });

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
    const { estado, justificacao } = req.body;

    if (!['Aprovado', 'Rejeitado', 'Pendente'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido.' });
    }

    if (estado === 'Rejeitado' && (!justificacao || !justificacao.trim())) {
      return res.status(400).json({ error: 'A justificação é obrigatória para rejeitar um pedido.' });
    }

    // Se for diretor de curso, valida se o pedido pertence a um docente/aluno do curso ou a um formulário do curso
    if (req.userRole === 'diretor') {
      const user = await User.findById(req.userId);
      const submissaoObj = await Submissao.findById(req.params.id)
        .populate('professor')
        .populate('formulario');

      if (!submissaoObj) {
        return res.status(404).json({ error: 'Pedido não encontrado.' });
      }

      const professorDoMesmoCurso = submissaoObj.professor?.curso === user?.curso;
      const formularioDoMesmoCurso = submissaoObj.formulario?.cursosDestinatarios?.includes(user?.curso);

      if (!professorDoMesmoCurso && !formularioDoMesmoCurso) {
        return res.status(403).json({ error: 'Acesso negado. Apenas pode decidir sobre pedidos do seu próprio curso.' });
      }
    } else if (req.userRole !== 'admin' && req.userRole !== 'coordenador') {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    const submissao = await Submissao.findByIdAndUpdate(
      req.params.id,
      {
        estado,
        justificacao: estado === 'Rejeitado' ? justificacao.trim() : ''
      },
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