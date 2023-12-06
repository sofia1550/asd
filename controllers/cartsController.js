const fs = require('fs');
const path = require('path');
const cartsFilePath = path.join(__dirname, '../data/carts.json');
const productsFilePath = path.join(__dirname, '../data/products.json');

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

function readProductsFile() {
    try {
        return JSON.parse(fs.readFileSync(productsFilePath, 'utf8'));
    } catch (error) {
        console.error('Error leyendo el archivo de productos:', error);
        return [];
    }
}

function generateNewId(carts) {
    return carts.length > 0 ? Math.max(...carts.map(c => c.id)) + 1 : 1;
}

function productExists(productId) {
    const products = readProductsFile();
    return products.some(product => product.id === productId);
}

module.exports = {
    createCart: (req, res) => {
        const carts = readCartsFile();
        const newCart = {
            id: generateNewId(carts),
            products: []
        };
        carts.push(newCart);
        writeCartsFile(carts);
        res.status(201).send(newCart);
    },
    getCartProducts: (req, res) => {
        const carts = readCartsFile();
        const cart = carts.find(c => c.id === parseInt(req.params.cid));
        cart ? res.json(cart.products) : res.status(404).send('Carrito no encontrado');
    },
    addProductToCart: (req, res) => {
        const carts = readCartsFile();
        const cart = carts.find(c => c.id === parseInt(req.params.cid));
        const productId = parseInt(req.params.pid);

        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }

        if (!productExists(productId)) {
            return res.status(404).send('Producto no encontrado');
        }

        const productIndex = cart.products.findIndex(p => p.product === productId);
        if (productIndex !== -1) {
            cart.products[productIndex].quantity += 1;
        } else {
            cart.products.push({ product: productId, quantity: 1 });
        }

        writeCartsFile(carts);
        res.send(cart);
    }
};
