const fs = require('fs');
const path = require('path');
const productsFilePath = path.join(__dirname, '../../data/products.json');

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

function createProduct(productData) {
    const products = readProductsFile();
    const newProduct = { id: generateNewId(products), ...productData };
    products.push(newProduct);
    writeProductsFile(products);
    return newProduct;
}

function generateNewId(products) {
    return products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
}

function getProductById(productId) {
    const products = readProductsFile();
    return products.find(p => p.id === parseInt(productId));
}

function updateProduct(productId, updatedData) {
    const products = readProductsFile();
    const index = products.findIndex(p => p.id === parseInt(productId));
    if (index !== -1) {
        products[index] = { ...products[index], ...updatedData };
        writeProductsFile(products);
        return products[index];
    }
    return null;
}
const getAllProducts = async (req, res) => {
    try {
        const { category, limit = 10 } = req.query;
        const query = category ? { category } : {};
        const products = await Product.find(query).limit(parseInt(limit));
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

function deleteProduct(productId) {
    let products = readProductsFile();
    const filteredProducts = products.filter(p => p.id !== parseInt(productId));
    if (filteredProducts.length !== products.length) {
        writeProductsFile(filteredProducts);
        return true;
    }
    return false;
}
const createProduct = async (req, res) => {
    try {
        const { title, description, code, price, stock, category, thumbnails } = req.body;
        if (price < 0 || stock < 0) {
            return res.status(400).send('Precio o stock inválido.');
        }
        const newProduct = new Product({ title, description, code, price, stock, category, thumbnails });
        await newProduct.save();
        io.emit('updateProductList', await Product.find({}));
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct,
    getAllProducts,
    createProduct, 
};
