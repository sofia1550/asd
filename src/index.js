require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { engine } = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('./dao/models/products');
const Message = require('./dao/models/message');
const Cart = require('./dao/models/cart');
const authRoutes = require('./routes/auth');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const passport = require('./passportConfig');
const generateMockProducts = require('./mockData');
const errorHandler = require('./errorHandler');
const logger = require('./logger');
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info('Conectado a MongoDB Atlas'))
  .catch(err => logger.error('Error conectando a MongoDB Atlas:', err));

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(session({
  secret: 'mi secreto',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use(errorHandler);
app.use(passport.initialize());
app.use(passport.session());

app.engine('handlebars', engine({
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  }
}));
app.get('/register', (req, res) => {
  res.render('register');
});
app.get('/login', (req, res) => {
  res.render('login');
});
app.get('/mockingproducts', (req, res) => {
  const products = generateMockProducts();
  res.json(products);
});
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Importación de rutas
app.use('/products', require('./routes/products')(io));
app.use('/api/products', require('./routes/api/apiProducts')(io));
app.use('/api/carts', require('./routes/carts'));
app.use('/api/auth', authRoutes);

// Agrega un endpoint para probar el logging
app.get('/loggerTest', (req, res) => {
  logger.debug('Test de debug');
  logger.http('Test de http');
  logger.info('Test de info');
  logger.warn('Test de warning');
  logger.error('Test de error');
  res.send('Prueba de logger finalizada. Chequea los registros.');
});

// Rutas principales
app.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.render('home', { products });
  } catch (error) {
    logger.error('Error al obtener productos:', error); // Modificado para usar Winston
    res.status(500).send('Error al cargar la página');
  }
});
app.get('/', async (req, res) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
          logger.error('Error al verificar el token:', err); // Modificado para usar Winston
          return res.redirect('/login');
        }
        // Aquí, busca los datos del usuario con decoded.id y muestra la página con esos datos
      });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    logger.error('Error:', error); // Modificado para usar Winston
    res.status(500).send('Error al cargar la página');
  }
});
app.get('/cart', (req, res) => res.render('cart'));
app.get('/chat', (req, res) => res.render('chat'));
app.get('/realtimeproducts', (req, res) => res.render('realTimeProducts'));

app.get('/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const filterOptions = req.query.query ? { title: { $regex: req.query.query, $options: 'i' } } : {};
    const sortOptions = req.query.sort === 'desc' ? { price: -1 } : req.query.sort === 'asc' ? { price: 1 } : {};

    const products = await Product.find(filterOptions)
      .sort(sortOptions)
      .limit(limit)
      .skip((page - 1) * limit);

    const totalProducts = await Product.countDocuments(filterOptions);
    const totalPages = Math.ceil(totalProducts / limit);

    res.render('products', {
      products,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page + 1,
      prevPage: page - 1,
      lastPage: totalPages
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).send('Error al cargar la página');
  }
});

app.get('/cart/:cid', async (req, res) => {
  const cartId = req.params.cid;
  const cart = await Cart.findById(cartId).populate('products.product');
  if (!cart) return res.status(404).render('cart', { cart: null });
  res.render('cart', { cart: cart.products, cartId: cartId });
});

// Configuración del servidor y WebSockets
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => logger.info(`Servidor escuchando en el puerto ${PORT}`));

io.on('connection', async (socket) => {
  logger.info('Un cliente se ha conectado');

  try {
    const messages = await Message.find({}).sort({ timestamp: -1 }).limit(50);
    socket.emit('previousMessages', messages);
  } catch (error) {
    logger.error('Error al recuperar mensajes:', error); // Modificado para usar Winston
  }

  socket.on('newMessage', async (msg) => {
    if (msg.message.trim().length === 0) return;

    try {
      const newMessage = new Message(msg);
      await newMessage.save();
      io.emit('message', newMessage);
    } catch (error) {
      logger.error('Error al guardar el mensaje:', error); // Modificado para usar Winston
    }
  });
});