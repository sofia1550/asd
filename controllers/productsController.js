module.exports = function (io) {
    const fs = require('fs');
    const path = require('path');
    const productsFilePath = path.join(__dirname, '../data/products.json');

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
        io.emit('updateProductList', products); // Emitir evento
        res.status(201).send(newProduct);
    };

    const updateProduct = (req, res) => {
        const products = readProductsFile();
        const index = products.findIndex(p => p.id === parseInt(req.params.pid));
        if (index !== -1) {
            const updatedProduct = { ...products[index], ...req.body };
            if (!validateProductFields(updatedProduct)) {
                return res.status(400).send('Faltan campos requeridos o son inválidos');
            }
            products[index] = updatedProduct;
            writeProductsFile(products);
            io.emit('updateProductList', products); // Emitir evento al actualizar
            res.send(products[index]);
        } else {
            res.status(404).send('Producto no encontrado');
        }
    };

    const deleteProduct = (req, res) => {
        let products = readProductsFile();
        const filteredProducts = products.filter(p => p.id !== parseInt(req.params.pid));
        if (filteredProducts.length !== products.length) {
            writeProductsFile(filteredProducts);
            io.emit('updateProductList', filteredProducts); // Emitir evento
            res.send('Producto eliminado');
        } else {
            res.status(404).send('Producto no encontrado');
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
