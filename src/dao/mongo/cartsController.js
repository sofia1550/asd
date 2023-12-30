const Cart = require('../models/cart');
const Product = require('../models/products');

module.exports = {
    createCart: async (req, res) => {
        try {
            const newCart = new Cart({ products: [] });
            await newCart.save();
            res.status(201).json({ _id: newCart._id }); // Devuelve el ID del carrito
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

    removeProductFromCart: async (req, res) => {
        try {
            const cart = await Cart.findById(req.params.cid);
            if (!cart) return res.status(404).send('Carrito no encontrado');

            const productIndex = cart.products.findIndex(p => p.product.toString() === req.params.pid);
            if (productIndex !== -1) {
                cart.products.splice(productIndex, 1);
                await cart.save();
                res.send('Producto eliminado del carrito');
            } else {
                res.status(404).send('Producto no encontrado en el carrito');
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    checkoutCart: async (req, res) => {
        try {
            const cart = await Cart.findById(req.params.cid).populate('products.product');
            if (!cart) return res.status(404).send('Carrito no encontrado');

            // Aquí iría la lógica para procesar la compra, como reducir el stock, generar una orden, etc.

            // Vaciar el carrito
            cart.products = [];
            await cart.save();

            res.send('Compra realizada con éxito');
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    updateProductQuantityInCart: async (req, res) => {
        try {
            const cart = await Cart.findById(req.params.cid);
            if (!cart) return res.status(404).send('Carrito no encontrado');

            const { quantity } = req.body;
            const productIndex = cart.products.findIndex(p => p.product.toString() === req.params.pid);

            if (productIndex !== -1 && quantity > 0) {
                cart.products[productIndex].quantity = quantity;
                await cart.save();
                res.send('Cantidad actualizada');
            } else {
                res.status(404).send('Producto no encontrado en el carrito o cantidad inválida');
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    emptyCart: async (req, res) => {
        try {
            const cart = await Cart.findById(req.params.cid);
            if (!cart) return res.status(404).send('Carrito no encontrado');

            cart.products = [];
            await cart.save();
            res.send('Carrito vaciado con éxito');
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    addProductToCart: async (req, res) => {
        const { productId } = req.body;
        const cartId = req.params.cid;

        try {
            const cart = await Cart.findById(cartId);
            if (!cart) return res.status(404).send('Carrito no encontrado');

            const product = await Product.findById(productId);
            if (!product) return res.status(404).send('Producto no encontrado');


            // Verificar disponibilidad y estado del producto
            if (product.stock <= 0 || !product.status) {
                return res.status(400).send('Producto no disponible');
            }

            // Buscar si el producto ya está en el carrito
            const productIndex = cart.products.findIndex(p => p.product.toString() === productId);

            // Si el producto ya está en el carrito, aumentar cantidad
            // De lo contrario, agregar el nuevo producto al carrito
            if (productIndex !== -1) {
                cart.products[productIndex].quantity += 1;
            } else {
                cart.products.push({ product: productId, quantity: 1 });
            }

            await cart.save();
            res.json(cart);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

};
