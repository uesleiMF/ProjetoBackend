// Importar o express para configurar as rotas
const express = require("express");

// Importar o controller de produtos
const ProdutosController = require("../controllers/produtos.controller");
const ProdutosControllerFunc = require("../controllers/produtos.func.controller");

// Inicializar a classe do controller
const produtosController = new ProdutosController();

// Criar uma instância do router do Express
const router = express.Router();

// [GET] - Retornar a lista de produtos cadastrados no banco de dados
router.get("/", produtosController.getProdutos);

// [GET] - Listar produtos usando a versão funcional do controller
router.get("/listar", ProdutosControllerFunc.getAll);

// [GET] - Retornar um único produto pelo ID
router.get("/:id", produtosController.getProdutoById);

// [POST] - Cadastrar um novo produto no banco de dados
router.post("/add", produtosController.createProduto);

// [PUT] - Editar um produto já cadastrado pelo ID
router.put("/:id", produtosController.editProduto);

// [DELETE] - Excluir um produto pelo ID
router.delete("/:id", produtosController.deleteProduto);

// Exportar o módulo de rotas para ser usado no index.js
module.exports = router;
