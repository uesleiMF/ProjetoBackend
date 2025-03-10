// Importar as dependências
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const dotenv = require('dotenv');
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Inicializar o Express
const app = express();

// Configuração do middleware
app.use(express.json()); // Permite JSON no corpo das requisições
app.use(cors()); // Habilita CORS para evitar erros de requisição externa
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve as imagens na pasta 'uploads'

// Configuração do Multer para upload de arquivos
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Diretório onde as imagens serão salvas
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`); // Nome único para cada imagem
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Tipo de arquivo inválido. Apenas imagens são permitidas.'));
    }
    cb(null, true);
  }
});
const cloudinary = require('cloudinary').v2;


// Configuração do Cloudinary usando a variável de ambiente CLOUDINARY_URL
cloudinary.config({
  url: process.env.CLOUDINARY_URL,
});

// Roteamento e controladores
class ProdutosController {
  // Função para obter todos os produtos
  getProdutos(req, res) {
    // Exemplo de produto
    const produtos = [
      { 
        _id: 1,
        titulo: 'Produto 1',
        descricao: 'Descrição do produto 1',
        imagemUrl: '/uploads/1632512367195.jpg'
      },
      // Outros produtos...
    ];
    res.json(produtos);
  }
  
  // Outros métodos de CRUD (ex: create, update, delete) podem ser adicionados aqui
}

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

// Rota para obter produtos
app.get('/produtos', produtosController.getProdutos);

// Conexão com o banco de dados
const db_url = process.env.DB_URL;
const db_user = process.env.DB_USER;
const db_pass = process.env.DB_PASS;
const db_data = process.env.DB_DATA;
const Conn = require('./conn/conn');
Conn(db_url, db_user, db_pass, db_data);

// Inicialização do servidor
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`O servidor está rodando na porta ${port}`);
});
