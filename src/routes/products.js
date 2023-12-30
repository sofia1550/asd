module.exports = function (io) {
    const express = require('express');
    const router = express.Router();
    const productsController = require('../dao/mongo/productsController')(io);

    router.get('/', productsController.getAllProducts);
    router.get('/:pid', productsController.getProductById);
    router.post('/', productsController.createProduct);
    router.put('/:pid', productsController.updateProduct);
    router.delete('/:pid', async (req, res) => {
        await productsController.deleteProduct(req.params.pid, res);
    });
    router.get('/create-cart', async (req, res) => {
        try {
            const newCart = new Cart({ products: [] });
            await newCart.save();
            res.json({ cartId: newCart._id });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    router.get('/cart', async (req, res) => {
        const cartId = req.query.cartId; // Obtén el ID del carrito desde el query string
        try {
            const cart = await Cart.findById(cartId).populate('products.product');
            if (!cart) return res.status(404).send('Carrito no encontrado');
            res.render('cart', { cart });
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
            res.status(500).send('Error al cargar la página');
        }
    });
    return router;
};
