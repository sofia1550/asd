const Cart = require('../models/cart');
const Product = require('../models/products');

module.exports = {
    createCart: async (req, res) => {
        try {
            const newCart = new Cart({ products: [] });
            await newCart.save();
            res.status(201).json(newCart);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getCartProducts: async (req, res) => {
        try {
            const cart = await Cart.findById(req.params.cid).populate('products.product');
            if (!cart) return res.status(404).send('Carrito no encontrado');
            res.json(cart.products);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    addProductToCart: async (req, res) => {
        try {
            const cart = await Cart.findById(req.params.cid);
            if (!cart) return res.status(404).send('Carrito no encontrado');

            const product = await Product.findById(req.params.pid);
            if (!product) return res.status(404).send('Producto no encontrado');

            // Verificar disponibilidad y estado del producto
            if (product.stock <= 0 || !product.status) {
                return res.status(400).send('Producto no disponible');
            }

            const productIndex = cart.products.findIndex(p => p.product.toString() === req.params.pid);
            if (productIndex !== -1) {
                cart.products[productIndex].quantity += 1;
            } else {
                cart.products.push({ product: req.params.pid, quantity: 1 });
            }

            await cart.save();
            res.json(cart);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};
