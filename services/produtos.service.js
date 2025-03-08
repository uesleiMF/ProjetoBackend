const ProdutoModel = require('../models/produto.model');

class ProdutosService {
  // Retorna todos os produtos cadastrados no banco de dados
  async findAll() {
    return ProdutoModel.find();
  }

  // Retorna um produto pelo ID
  async findById(id) {
    return ProdutoModel.findById(id);
  }

  // Cria um novo produto
  async create(produtoData) {
    const produto = new ProdutoModel(produtoData);
    return produto.save();
  }

  // Atualiza um produto pelo ID
  async edit(id, produtoData) {
    return ProdutoModel.updateOne({ _id: id }, produtoData);
  }

  // Exclui um produto pelo ID
  async delete(id) {
    return ProdutoModel.deleteOne({ _id: id });
  }
}

module.exports = ProdutosService;
