const cloudinary = require('../config/cloudinaryConfig'); // Importando a configuração do Cloudinary
const ProdutosService = require('../services/produtos.service');
const produtosService = new ProdutosService(); // Inicializando a classe do serviço
const multer = require('multer');

// Configuração do Multer para armazenar arquivos temporariamente na memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Criar a classe de controle onde estarão os métodos
class ProdutosController {
  // Retorna todos os produtos cadastrados no banco de dados
  getProdutos = async (req, res) => {
    try {
      const produtos = await produtosService.findAll();
      res.status(200).json(produtos);
    } catch (error) {
      res.status(500).json({ error: `Erro ao buscar produtos: ${error.message}` });
    }
  };

  // Retorna um único produto pelo ID
  getProdutoById = async (req, res) => {
    try {
      const produto = await produtosService.findById(req.params.id);
      if (!produto) {
        return res.status(404).json({ error: "Produto não encontrado" });
      }
      res.status(200).json(produto);
    } catch (error) {
      res.status(500).json({ error: `Erro ao buscar produto: ${error.message}` });
    }
  };

  // Cadastra um novo produto com upload de imagem para o Cloudinary
  createProduto = async (req, res) => {
    try {
      const { titulo, descricao, prioridade, status, dataValidade } = req.body;
      const imagem = req.file; // A imagem recebida através do Multer

      // Validação de campos obrigatórios
      if (!titulo || !descricao || !prioridade || !status) {
        return res.status(400).json({ error: "Título, descrição, prioridade e status são obrigatórios" });
      }

      // Validação da data
      if (!Date.parse(dataValidade)) {
        return res.status(400).json({ error: "Data de validade inválida" });
      }

      // Validação e upload da imagem para o Cloudinary
      let imagemUrl = '';
      if (imagem) {
        const result = await cloudinary.uploader.upload(imagem.buffer, {
          folder: 'produtos', // Pasta para organizar as imagens no Cloudinary
        });
        imagemUrl = result.secure_url; // URL da imagem enviada ao Cloudinary
      }

      // Criar o novo produto no banco
      const novoProduto = await produtosService.create({
        titulo,
        descricao,
        prioridade,
        status,
        imagemUrl, // URL da imagem do Cloudinary
        dataValidade
      });

      res.status(201).json({ message: `Produto ${titulo} cadastrado com sucesso`, produto: novoProduto });
    } catch (error) {
      res.status(500).json({ error: `Erro ao cadastrar produto: ${error.message}` });
    }
  };

  // Atualiza um produto pelo ID (com a possibilidade de atualizar a imagem também)
  editProduto = async (req, res) => {
    try {
      const { id } = req.params;
      const produtoEditado = req.body;

      const produtoAtualizado = await produtosService.edit(id, produtoEditado);
      if (!produtoAtualizado.modifiedCount) {
        return res.status(404).json({ error: "Produto não encontrado ou não modificado" });
      }

      res.status(200).json({ message: "Produto atualizado com sucesso" });
    } catch (error) {
      res.status(500).json({ error: `Erro ao atualizar produto: ${error.message}` });
    }
  };

  // Exclui um produto pelo ID
  deleteProduto = async (req, res) => {
    try {
      const { id } = req.params;

      const resultado = await produtosService.delete(id);
      if (!resultado.deletedCount) {
        return res.status(404).json({ error: "Produto não encontrado" });
      }

      res.status(200).json({ message: "Produto excluído com sucesso" });
    } catch (error) {
      res.status(500).json({ error: `Erro ao excluir produto: ${error.message}` });
    }
  };
}

// Exportando a classe para ser usada em outros arquivos
module.exports = ProdutosController;
