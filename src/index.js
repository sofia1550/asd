const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { engine } = require('express-handlebars');
const path = require('path');
const { readProductsFile, writeProductsFile } = require('./utils/utils');
const cartRoutes = require('../routes/carts');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const productsController = require('../controllers/productsController')(io);

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '../views'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  const products = readProductsFile();
  res.render('home', { title: 'Inicio', products });
});
app.get('/realtimeproducts', (req, res) => res.render('realTimeProducts'));

app.use('/api/products', require('../routes/products')(io));
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
