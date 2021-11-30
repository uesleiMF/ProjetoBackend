// importo o model para poder acessar os seus metodos do mongo.
const ProdutosModel = require('../models/produto');

// crio a classe do meu servico para poder acessar o seus metodos.
class produtosService {
  // ela vai buscar uma lista de musicas no banco de dados atraves do model(quem tem acesso as funcoes do banco).
  // find = busca uma lista de resultados de acordo com o filtro
  findAll = async () => await ProdutosModel.find();

  // buscar uma musica por id
  findById = async (id) => {
    return await ProdutosModel.findById(id)
  };

  // recebe um objeto e salva no banco de dados.
  create = async (produto) => {
    return await ProdutosModel.create(produto)  
  }

  // recebe um id e um objeto para ser atualizado no banco.
  edit = async (id, produto) => {
    return await ProdutosModel.updateOne({ _id: id}, produto)
  }

  // recebe umm id e exclui a musica do banco de acordo com esse id.
  delete = async (id) => {
    return await ProdutosModel.deleteOne({ _id: id})
  }

}

// exportar a minha classe para que o controller possa acessar os seus metodos.
module.exports = produtosService;