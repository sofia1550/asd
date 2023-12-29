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

function deleteProduct(productId) {
    let products = readProductsFile();
    const filteredProducts = products.filter(p => p.id !== parseInt(productId));
    if (filteredProducts.length !== products.length) {
        writeProductsFile(filteredProducts);
        return true;
    }
    return false;
}

module.exports = {
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct
};
