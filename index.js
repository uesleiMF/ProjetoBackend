if(process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}


// Importar as dependências
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');



const app = express();
const Conn = require('./conn/conn');

// Middlewares
app.use(express.json()); // Permite JSON no corpo das requisições
app.use(cors()); // Habilita CORS para evitar erros de requisição externa

// Tipos de imagens permitidos
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

// Configuração do armazenamento para uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Diretório onde as imagens serão salvas
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`); // Nome único para cada imagem
  }
});

// Configuração do Multer com verificação de tipo de arquivo
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Tipo de arquivo inválido. Apenas imagens são permitidas.'));
    }
    cb(null, true);
  }
});

// Importar o controlador de produtos
const ProdutosController = require('./controllers/produtos.controller');
const produtosController = new ProdutosController();

// Rota para upload de imagens
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    const { titulo, descricao, prioridade, status, dataValidade } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const novoProduto = {
      titulo,
      descricao,
      prioridade,
      status,
      dataValidade,
      imagemUrl: `/uploads/${file.filename}` // Caminho do arquivo salvo
    };

    console.log('Produto recebido:', novoProduto);
    res.status(201).json({ message: 'Produto cadastrado com sucesso!', produto: novoProduto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Roteamento de produtos
app.get('/produtos', produtosController.getProdutos);
app.get('/produtos/:id', produtosController.getProdutoById);
app.post('/produtos', produtosController.createProduto);
app.put('/produtos/:id', produtosController.editProduto);
app.delete('/produtos/:id', produtosController.deleteProduto);



// Conexão com o banco de dados
const db_url = process.env.DB_URL;
const db_user = process.env.DB_USER;
const db_pass = process.env.DB_PASS;
const db_data = process.env.DB_DATA;
Conn(db_url, db_user, db_pass, db_data);

// Inicialização do servidor
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`O servidor está rodando na porta ${port}`);
});
