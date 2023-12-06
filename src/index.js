const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { engine } = require('express-handlebars');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/carts');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.json());
app.use('/api/products', productRoutes(io));
app.use('/api/carts', cartRoutes);

app.get('/', (req, res) => res.render('home'));
app.get('/realtimeproducts', (req, res) => res.render('realTimeProducts'));

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

io.on('connection', (socket) => {
  console.log('Un cliente se ha conectado');
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});
