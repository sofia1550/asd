const express = require('express');
const router = express.Router();
const productsController = require('../../dao/mongo/productsController');

module.exports = function (io) {
    router.get('/', productsController(io).getAllProducts);
    router.get('/:pid', productsController(io).getProductById);
    router.post('/', productsController(io).createProduct);
    router.put('/:pid', productsController(io).updateProduct);
    router.delete('/:pid', productsController(io).deleteProduct);

    return router;
};
