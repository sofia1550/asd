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
module.exports = { readProductsFile, writeProductsFile  };
