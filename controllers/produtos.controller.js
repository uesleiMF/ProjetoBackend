// importar o meu servico para poder acessar as funcoes que executam as querys do banco.
const ProdutosService = require('../services/produtos.service');
// inicializamos a classe do servico
const produtosService = new ProdutosService;

// crio uma classe para meu controle onde nela ira conter os meus métodos(funcoes)
class ProdutosController {
  // criar uma funcao com req e response para poder gerenciar o que deve ser feito
  // o que deve ser enviado como resposta ou o que ele recebe como requisicao
  getProdutos = async (req, res) => {
    // buscar os dados no meu banco de dados e retornar para o front.
    const produtos = await produtosService.findAll();
    // envio uma resposta para o client(front-end)
    res.send(produtos);
  }

 
  getProdutoById = async (req, res) => {
    // buscar o id que vem na requisicao via parmetro
    //const idParam = req.params.id;
    const produto = await produtosService.findById(req.params.id);
    res.send(produto);
  }

  // funcao que cadastra a musica recebida pelo front no banco de dados
  createProdut = async (req, res) => {
    // acesso o corpo da requisicao para pegar o objeto.
    // objeto para ser cadastrado no banco.
    const produto = req.body;
    if(!req.body){
      return;
    }
    await produtosService.create(produto)
    .then(() => {
      res.send({message: `Produto ${produto.titulo} Cadastrado com sucesso`})
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({error: `Erro no servidor: ${err}`})
    })
  }

  // atualiza uma musica de acordo com o id e objeto recebido para ser atualizado.
  editProdut = async (req, res) => {
    const idParam = req.params.id;
    // pegamos o objeto com os dados atualizado para atualizar no banco.
    const produtoEdit = req.body;
    await produtosService.edit(idParam, produtoEdit)
    .then(() => {
      res.send({message: `Produto Editado com sucesso`})
    })
    .catch( err => { 
      res.status(500).send({message: `Erro: ${err}`})
    })
  }

  // recebe um id via parametro e exclui uma musica de acordo com esse id
  deleteProdut = async (req, res) => {
    const idParam = req.params.id;
    await produtosService.delete(idParam)
    .then(() => {
      res.send({message: 'Produto excluido com sucesso'})
    })
    .catch(err => {
      res.status(500).send({error: `Error: ${err}`});
    })
  }
}

// Exportando essa classe criada para poder ser acessada de outros arquivos
module.exports = ProdutosController;