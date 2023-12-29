require('dotenv').config(); // Esta línea carga las variables de entorno del archivo .env

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { engine } = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');

// Conexión a MongoDB utilizando la variable de entorno
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error conectando a MongoDB Atlas:', err));

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuración de Handlebars y rutas estáticas
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Importación de rutas
const cartRoutes = require('./routes/carts');
const productRoutes = require('./routes/products')(io);

// Rutas
app.get('/', (req, res) => res.render('home'));
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);


const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

io.on('connection', (socket) => {
  console.log('Un cliente se ha conectado');

  const products = readProductsFile();
  socket.emit('updateProductList', products);

  socket.on('addProduct', (newProductData) => {
    const products = readProductsFile();
    const newProduct = {
      id: productsController.generateNewId(products),
      ...newProductData
    };
    products.push(newProduct);
    writeProductsFile(products);
    io.emit('updateProductList', products);
  });
  socket.on('editProduct', (productId, updatedData) => {
    productsController.updateProduct(productId, updatedData);
  });

  socket.on('deleteProduct', (productId) => {
    productsController.deleteProduct(productId);
  });
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});