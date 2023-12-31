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
// Conexión a MongoDB con la variable de entorno
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error conectando a MongoDB Atlas:', err));

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuración de Handlebars y rutas estáticas
const handlebars = engine({
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
});
app.use(express.static(path.join(__dirname, 'public')));

app.engine('handlebars', handlebars);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Importación de rutas
const cartRoutes = require('./routes/carts');
const productRoutes = require('./routes/products')(io);
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);

// Rutas principales
app.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.render('home', { products });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).send('Error al cargar la página');
  }
});
app.get('/cart', (req, res) => res.render('cart'));

app.get('/chat', (req, res) => res.render('chat'));
app.get('/realtimeproducts', (req, res) => res.render('realTimeProducts'));
app.get('/products', async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 3; // Cambiado de 10 a 3

      // Crear objeto de filtros basado en el query, si existe
      const filterOptions = req.query.query ? { title: { $regex: req.query.query, $options: 'i' } } : {};

      // Opciones de ordenamiento
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

app.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product');
    if (!cart) return res.status(404).send('Carrito no encontrado');
    res.render('cart', { cart });
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).send('Error al cargar la página');
  }
});

const PORT = 8080;
server.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));

io.on('connection', async (socket) => {
  console.log('Un cliente se ha conectado');

  try {
    const messages = await Message.find({}).sort({ timestamp: -1 }).limit(50);
    socket.emit('previousMessages', messages);
  } catch (error) {
    console.error('Error al recuperar mensajes:', error);
  }

  socket.on('newMessage', async (msg) => {
    if (msg.message.trim().length === 0) return;

    try {
      const newMessage = new Message(msg);
      await newMessage.save();
      io.emit('message', newMessage);
    } catch (error) {
      console.error('Error al guardar el mensaje:', error);
    }
  });
});
