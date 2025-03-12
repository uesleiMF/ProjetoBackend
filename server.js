require('dotenv').config();
var express = require("express");
var app = express();
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var multer = require('multer');
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require("mongoose");
var fs = require('fs');
const User = require('./models/user.js');

const Product = require('./models/product.js');  // If the file is in the 'models' folder



mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("MongoDB conectado com sucesso!");
}).catch(err => {
  console.error("Erro ao conectar ao MongoDB:", err);
});

var dir = './uploads';
var upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      callback(null, './uploads');
    },
    filename: function (req, file, callback) { 
      callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); 
    }
  }),
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      return callback(null, false);
    }
    callback(null, true);
  }
});

app.use(cors());
app.use(express.static('uploads'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Middleware de autenticação
app.use("/", (req, res, next) => {
  try {
    if (req.path === "/login" || req.path === "/register" || req.path === "/") {
      next();
    } else {
      jwt.verify(req.headers.token, process.env.JWT_SECRET, function (err, decoded) {
        if (decoded && decoded.user) {
          req.user = decoded;
          next();
        } else {
          return res.status(401).json({ errorMessage: 'User unauthorized!', status: false });
        }
      });
    }
  } catch (e) {
    res.status(400).json({ errorMessage: 'Something went wrong!', status: false });
  }
});

// Rota principal
app.get("/", (req, res) => {
  res.status(200).json({ status: true, title: 'APIs' });
});

/* Login */
app.post("/login", (req, res) => {
  try {
    if (req.body.username && req.body.password) {
      user.findOne({ username: req.body.username }, (err, data) => {
        if (data && bcrypt.compareSync(req.body.password, data.password)) {
          checkUserAndGenerateToken(data, res);
        } else {
          res.status(400).json({ errorMessage: 'Username or password is incorrect!', status: false });
        }
      });
    } else {
      res.status(400).json({ errorMessage: 'Add proper parameter first!', status: false });
    }
  } catch (e) {
    res.status(400).json({ errorMessage: 'Something went wrong!', status: false });
  }
});

/* Registro */
app.post("/register", (req, res) => {
  try {
    if (req.body.username && req.body.password) {
      user.findOne({ username: req.body.username }, (err, data) => {
        if (!data) {
          let User = new user({
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, 10)
          });
          User.save((err, data) => {
            if (err) {
              res.status(400).json({ errorMessage: err, status: false });
            } else {
              res.status(200).json({ status: true, title: 'Registered Successfully.' });
            }
          });
        } else {
          res.status(400).json({ errorMessage: `Username ${req.body.username} already exists!`, status: false });
        }
      });
    } else {
      res.status(400).json({ errorMessage: 'Add proper parameter first!', status: false });
    }
  } catch (e) {
    res.status(400).json({ errorMessage: 'Something went wrong!', status: false });
  }
});

function checkUserAndGenerateToken(data, res) {
  jwt.sign({ user: data.username, id: data._id }, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
    if (err) {
      res.status(400).json({ status: false, errorMessage: err });
    } else {
      res.json({ message: 'Login Successfully.', token, status: true });
    }
  });
}

/* Adicionar Produto */
app.post("/add-product", upload.any(), (req, res) => {
  try {
    if (req.files && req.body.name && req.body.desc && req.body.price && req.body.discount) {
      let new_product = new product({
        name: req.body.name,
        desc: req.body.desc,
        price: req.body.price,
        image: req.files[0].filename,
        discount: req.body.discount,
        user_id: req.user.id
      });

      new_product.save((err, data) => {
        if (err) res.status(400).json({ errorMessage: err, status: false });
        else res.status(200).json({ status: true, title: 'Product Added successfully.' });
      });
    } else {
      res.status(400).json({ errorMessage: 'Add proper parameter first!', status: false });
    }
  } catch (e) {
    res.status(400).json({ errorMessage: 'Something went wrong!', status: false });
  }
});

/* Deletar Produto */
app.post("/delete-product", (req, res) => {
  try {
    if (req.body.id) {
      product.findByIdAndDelete(req.body.id, (err, data) => {
        if (data) {
          res.status(200).json({ status: true, title: 'Product deleted.' });
        } else {
          res.status(400).json({ errorMessage: err, status: false });
        }
      });
    } else {
      res.status(400).json({ errorMessage: 'Add proper parameter first!', status: false });
    }
  } catch (e) {
    res.status(400).json({ errorMessage: 'Something went wrong!', status: false });
  }
});

/* Buscar produtos com paginação */
app.get("/get-product", (req, res) => {
  try {
    let query = { is_delete: false, user_id: req.user.id };
    if (req.query.search) query.name = { $regex: req.query.search, $options: "i" };

    let perPage = 5, page = req.query.page || 1;
    product.find(query)
      .skip((perPage * page) - perPage).limit(perPage)
      .then(data => {
        product.countDocuments(query).then(count => {
          res.status(200).json({ status: true, title: 'Product retrieved.', products: data, total: count, pages: Math.ceil(count / perPage) });
        });
      }).catch(err => res.status(400).json({ errorMessage: err.message || err, status: false }));
  } catch (e) {
    res.status(400).json({ errorMessage: 'Something went wrong!', status: false });
  }
});

// Inicializando o servidor
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
