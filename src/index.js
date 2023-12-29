require('dotenv').config(); 

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { engine } = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('./dao/models/products');
const Message = require('./dao/models/message'); 

// Conexión a MongoDB con la variable de entorno
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error conectando a MongoDB Atlas:', err));

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const handlebars = engine({
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
});

// Configuración de Handlebars y rutas estáticas
app.engine('handlebars', handlebars);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Importación de rutas
const cartRoutes = require('./routes/carts');
const productRoutes = require('./routes/products')(io);

// Rutas
app.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.render('home', { products });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).send('Error al cargar la página');
  }
});
app.get('/chat', (req, res) => {
  res.render('chat');
});
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

io.on('connection', async (socket) => {
  console.log('Un cliente se ha conectado');

  // Cargar mensajes anteriores
  try {
    const messages = await Message.find({}).sort({ timestamp: -1 }).limit(50);
    socket.emit('previousMessages', messages);
  } catch (error) {
    console.error('Error al recuperar mensajes:', error);
  }


  // Obtener y enviar la lista actualizada de productos desde MongoDB
  Product.find({}).then(products => {
    socket.emit('updateProductList', products);
  });

  socket.on('newMessage', async (msg) => {
    // Validar que el mensaje no esté vacío
    if (msg.message.trim().length === 0) return;

    try {
      const newMessage = new Message(msg);
      await newMessage.save();
      // Emitir el mensaje a todos los sockets
      io.emit('message', newMessage);
    } catch (error) {
      console.error('Error al guardar el mensaje:', error);
    }
  });

  // Emitir mensajes anteriores al nuevo cliente
  socket.on('connection', async () => {
    try {
      const messages = await Message.find({}).sort({ timestamp: -1 }).limit(50);
      socket.emit('previousMessages', messages);
    } catch (error) {
      console.error('Error al recuperar mensajes:', error);
    }
  });
});
