const Product = require('../models/products');

module.exports = function (io) {
    const getAllProducts = async (req, res) => {
        try {
            const limit = parseInt(req.query.limit);
            const products = await Product.find({}).limit(limit);
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    const getProductById = async (req, res) => {
        try {
            const product = await Product.findById(req.params.pid);
            if (!product) return res.status(404).send('Producto no encontrado');
            res.json(product);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    const createProduct = async (req, res) => {
        try {
            const newProduct = new Product(req.body);
            // Aquí puedes añadir validaciones adicionales si lo necesitas
            await newProduct.save();
            io.emit('updateProductList', await Product.find({}));
            res.status(201).json(newProduct);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    const updateProduct = async (productId, updatedData) => {
        try {
            const product = await Product.findByIdAndUpdate(productId, updatedData, { new: true });
            if (!product) {
                io.emit('productError', 'Producto no encontrado');
                return;
            }
            io.emit('updateProductList', await Product.find({}));
        } catch (error) {
            io.emit('productError', error.message);
        }
    };

    const deleteProduct = async (productId) => {
        try {
            const product = await Product.findByIdAndDelete(productId);
            if (!product) {
                io.emit('productError', 'Producto no encontrado');
                return;
            }
            io.emit('updateProductList', await Product.find({}));
        } catch (error) {
            io.emit('productError', error.message);
        }
    };

    return {
        getAllProducts,
        getProductById,
        createProduct,
        updateProduct,
        deleteProduct
    };
};
