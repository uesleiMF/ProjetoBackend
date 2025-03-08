const mongoose = require('mongoose');

// Criar e inicializar o Schema do Produto
const produtoSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  prioridade: { 
    type: String, 
    required: true, 
    enum: ["Ruim", "Bom", "Ótimo"] // Restringe os valores possíveis
  },
  status: { 
    type: String, 
    required: true, 
    enum: ["Tipo1", "Tipo2", "Fora do Tipo"] 
  },
  imagemUrl: { type: String }, // Nome mais descritivo para "capa"
  dataValidade: { type: Date }, // Melhor que "prazo"
  dataCriacao: { type: Date, default: Date.now }
});

// Criar e inicializar o model baseado no schema
const ProdutoModel = mongoose.model('Produto', produtoSchema);

module.exports = ProdutoModel;


