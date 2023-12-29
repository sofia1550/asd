const fs = require('fs');
const path = require('path');
const cartsFilePath = path.join(__dirname, '../../data/carts.json');

function readCartsFile() {
    try {
        return JSON.parse(fs.readFileSync(cartsFilePath, 'utf8'));
    } catch (error) {
        console.error('Error leyendo el archivo de carritos:', error);
        return [];
    }
}

function writeCartsFile(data) {
    try {
        fs.writeFileSync(cartsFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error escribiendo en el archivo de carritos:', error);
    }
}

function createCart() {
    const carts = readCartsFile();
    const newCart = { id: generateNewId(carts), products: [] };
    carts.push(newCart);
    writeCartsFile(carts);
    return newCart;
}

function generateNewId(carts) {
    return carts.length > 0 ? Math.max(...carts.map(c => c.id)) + 1 : 1;
}

function getCartProducts(cartId) {
    const carts = readCartsFile();
    const cart = carts.find(c => c.id === parseInt(cartId));
    return cart ? cart.products : null;
}

function addProductToCart(cartId, productId) {
    const carts = readCartsFile();
    const cart = carts.find(c => c.id === parseInt(cartId));
    if (!cart) return null;

    const productIndex = cart.products.findIndex(p => p.product === productId);
    if (productIndex !== -1) {
        cart.products[productIndex].quantity += 1;
    } else {
        cart.products.push({ product: productId, quantity: 1 });
    }

    writeCartsFile(carts);
    return cart;
}

module.exports = {
    createCart,
    getCartProducts,
    addProductToCart
};
