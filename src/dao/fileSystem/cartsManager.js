const Cart = require('../model/Cart');

async function createCart() {
    try {
        const newCart = new Cart({ products: [] });
        await newCart.save();
        return newCart;
    } catch (error) {
        console.error('Error creando el carrito:', error);
        throw error;
    }
}

async function getCartProducts(cartId) {
    try {
        const cart = await Cart.findById(cartId).populate('products.product');
        return cart ? cart.products : null;
    } catch (error) {
        console.error('Error obteniendo los productos del carrito:', error);
        throw error;
    }
}

async function addProductToCart(cartId, productId) {
    try {
        const cart = await Cart.findById(cartId);
        if (!cart) return null;

        const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
        if (productIndex !== -1) {
            cart.products[productIndex].quantity += 1;
        } else {
            cart.products.push({ product: productId, quantity: 1 });
        }

        await cart.save();
        return cart;
    } catch (error) {
        console.error('Error agregando producto al carrito:', error);
        throw error;
    }
}

module.exports = {
    createCart,
    getCartProducts,
    addProductToCart
};
