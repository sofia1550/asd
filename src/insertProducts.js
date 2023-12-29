require('dotenv').config();
const mongoose = require('mongoose');
const Product = require("./dao/models/products"); 

// Conexión a MongoDB utilizando la variable de entorno
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch(err => console.error('Error conectando a MongoDB Atlas:', err));

const products = [
    {
        title: "Producto 1",
        description: "Descripción del producto 1",
        code: "P0001",
        price: 1000, 
        status: true,
        stock: 10,
        category: "Categoría 1",
        thumbnails: ["url/to/image1.jpg", "url/to/image2.jpg"]
    },
    // ...otros productos
];

Product.insertMany(products)
    .then(() => console.log('Productos insertados'))
    .catch(err => console.error('Error insertando productos:', err))
    .finally(() => mongoose.disconnect());
