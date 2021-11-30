const ProdutosService = require('../services/produtos.service');

const produtosService = new ProdutosService;

exports.getAll = async (req,res) => {
    const produtos = await produtosService.findAll();
    res.send(produtos);
}

exports.getbyid = async (req,res) => {
    const produto = await produtosService.findById(req.params.id);
    res.send(produto);
}