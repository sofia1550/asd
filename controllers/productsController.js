module.exports = function (io) {
    const fs = require('fs');
    const path = require('path');
    const productsFilePath = path.join(__dirname, '../src/data/products.json');

    function readProductsFile() {
        try {
            return JSON.parse(fs.readFileSync(productsFilePath, 'utf8'));
        } catch (error) {
            console.error('Error leyendo el archivo de productos:', error);
            return [];
        }
    }

    function writeProductsFile(data) {
        try {
            fs.writeFileSync(productsFilePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error escribiendo en el archivo de productos:', error);
        }
    }

    function generateNewId(products) {
        return products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    }

    function validateProductFields(product) {
        const requiredFields = ['title', 'description', 'code', 'price', 'status', 'stock', 'category'];
        return requiredFields.every(field => product.hasOwnProperty(field));
    }

    const getAllProducts = (req, res) => {
        const products = readProductsFile();
        const limit = parseInt(req.query.limit);
        res.json(limit ? products.slice(0, limit) : products);
    };

    const getProductById = (req, res) => {
        const products = readProductsFile();
        const product = products.find(p => p.id === parseInt(req.params.pid));
        product ? res.json(product) : res.status(404).send('Producto no encontrado');
    };

    const createProduct = (req, res) => {
        const products = readProductsFile();
        const newProduct = {
            id: generateNewId(products),
            ...req.body
        };
        if (!validateProductFields(newProduct)) {
            return res.status(400).send('Faltan campos requeridos o son inválidos');
        }
        products.push(newProduct);
        writeProductsFile(products);
        io.emit('updateProductList', products); 
        res.status(201).send(newProduct);
    };


    const updateProduct = (productId, updatedData) => {
        const products = readProductsFile();
        const index = products.findIndex(p => p.id === parseInt(productId));
        if (index !== -1) {
            products[index] = { ...products[index], ...updatedData };
            writeProductsFile(products);
            io.emit('updateProductList', products);
        } else {
            io.emit('productError', 'Producto no encontrado');
        }
    };


    // En productsController.js

    const deleteProduct = (productId) => {
        let products = readProductsFile();
        const filteredProducts = products.filter(p => p.id !== parseInt(productId));
        if (filteredProducts.length !== products.length) {
            writeProductsFile(filteredProducts);
            io.emit('updateProductList', filteredProducts);
        } else {
            io.emit('productError', 'Producto no encontrado');
        }
    };

    return {
        getAllProducts,
        getProductById,
        createProduct,
        updateProduct,
        deleteProduct,
        generateNewId
    };
};
