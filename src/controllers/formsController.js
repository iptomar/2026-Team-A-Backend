const Form = require('../models/Form');
const Submissao = require('../models/Submissao');

exports.listAll = async (req, res) => {
  try {
    const { userId, userRole } = req;
    let query = { estado: 'Publicado' };

    // Se for utilizador autenticado normal (aluno ou professor), filtramos a visibilidade
    if (userId && userRole !== 'admin' && userRole !== 'coordenador' && userRole !== 'diretor') {
      const user = await require('../models/User').findById(userId);

      if (userRole === 'aluno') {
        query.publicoAlvo = { $in: ['Todos', 'Alunos'] };
        if (user && user.curso) {
          query.$or = [
            { cursosDestinatarios: user.curso },
            { cursosDestinatarios: { $size: 0 } }
          ];
        }
      } else if (userRole === 'professor') {
        query.publicoAlvo = { $in: ['Todos', 'Docentes'] };
      }
    } else if (userRole === 'admin' || userRole === 'coordenador') {
      // Admin e Coordenador vêem todos os formulários estruturais
      delete query.estado;
    } else if (userRole === 'diretor') {
      // Diretor de curso vê formulários do seu próprio curso
      const user = await require('../models/User').findById(userId);
      if (user && user.curso) {
        query.$or = [
          { cursosDestinatarios: user.curso },
          { cursosDestinatarios: { $size: 0 } }
        ];
      }
    }

    const forms = await Form.find(query).sort({ criadoEm: -1 }).lean();

    // Estatísticas de submissão
    const enrichedForms = await Promise.all(forms.map(async (form) => {
      const totalSubmissoes = await Submissao.countDocuments({ formulario: form._id });
      const submissoesPendentes = await Submissao.countDocuments({
        formulario: form._id,
        estado: 'Pendente'
      });

      return {
        ...form,
        totalSubmissoes,
        submissoesPendentes
      };
    }));

    res.json(enrichedForms);
  } catch (err) {
    console.error('Erro ao listar formulários:', err);
    res.status(500).json({ error: 'Erro ao carregar formulários.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ error: 'Formulário não encontrado.' });
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar o formulário.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { titulo, descricao, categoria, estado, campos, corPrincipal, logo, codigoDocumento } = req.body;

    const newForm = await Form.create({
      titulo,
      descricao,
      categoria: categoria || 'Sem categoria',
      estado,
      campos,
      corPrincipal,
      logo,
      codigoDocumento,
      criadoPor: req.userId
    });

    res.status(201).json(newForm);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar o formulário.' });
  }
};

exports.clone = async (req, res) => {
  try {
    const formOriginal = await Form.findById(req.params.id);
    if (!formOriginal) {
      return res.status(404).json({ error: 'Formulário original não encontrado.' });
    }

    const novoForm = new Form({
      titulo: `${formOriginal.titulo} (Cópia)`,
      descricao: formOriginal.descricao,
      categoria: formOriginal.categoria || 'Sem categoria',
      estado: 'Rascunho',
      campos: formOriginal.campos,
      corPrincipal: formOriginal.corPrincipal,
      logo: formOriginal.logo,
      codigoDocumento: formOriginal.codigoDocumento,
      criadoPor: req.userId
    });

    await novoForm.save();
    res.status(201).json(novoForm);
  } catch (err) {
    console.error('Erro ao clonar formulário:', err);
    res.status(500).json({ error: 'Erro ao clonar o formulário.' });
  }
};

exports.update = async (req, res) => {
  try {
    const formAtual = await Form.findById(req.params.id);
    if (!formAtual) return res.status(404).json({ error: 'Formulário não encontrado.' });

    if (formAtual.estado === 'Publicado' || formAtual.estado === 'Arquivado') {
      return res.status(403).json({ error: 'Não é possível editar formulários publicados ou arquivados.' });
    }
    const { titulo, descricao, categoria, estado, campos, corPrincipal, logo, codigoDocumento } = req.body;

    const form = await Form.findByIdAndUpdate(
      req.params.id,
      { titulo, descricao, categoria: categoria || 'Sem categoria', estado, campos, corPrincipal, logo, codigoDocumento },
      { new: true }
    );

    if (!form) return res.status(404).json({ error: 'Formulário não encontrado.' });

    res.json(form);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar o formulário.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const submissoesPendentes = await Submissao.countDocuments({
      formulario: req.params.id,
      estado: 'Pendente'
    });

    if (submissoesPendentes > 0) {
      return res.status(400).json({
        error: `Não é possível apagar este formulário porque existem ${submissoesPendentes} pedido(s) pendente(s).`
      });
    }

    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) return res.status(404).json({ error: 'Formulário não encontrado.' });
    res.json({ message: 'Formulário eliminado com sucesso.' });
  } catch (err) {
    console.error('Erro ao eliminar formulário:', err);
    res.status(500).json({ error: 'Erro ao eliminar o formulário.' });
  }
};

exports.archive = async (req, res) => {
  try {
    const form = await Form.findByIdAndUpdate(
      req.params.id,
      { estado: 'Arquivado' },
      { new: true }
    );
    if (!form) return res.status(404).json({ error: 'Formulário não encontrado.' });
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao arquivar o formulário.' });
  }
};

exports.unpublish = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem reverter formulários para rascunho.' });
    }

    const form = await Form.findByIdAndUpdate(
      req.params.id,
      { estado: 'Rascunho' },
      { new: true }
    );

    if (!form) return res.status(404).json({ error: 'Formulário não encontrado.' });

    res.json(form);
  } catch (err) {
    console.error('Erro ao despublicar formulário:', err);
    res.status(500).json({ error: 'Erro ao reverter o formulário para rascunho.' });
  }
};

exports.publish = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem publicar formulários.' });
    }

    const form = await Form.findByIdAndUpdate(
      req.params.id,
      { estado: 'Publicado' },
      { new: true }
    );

    if (!form) return res.status(404).json({ error: 'Formulário não encontrado.' });

    res.json(form);
  } catch (err) {
    console.error('Erro ao publicar formulário:', err);
    res.status(500).json({ error: 'Erro ao publicar o formulário.' });
  }
};
