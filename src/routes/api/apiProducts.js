const express = require('express');
const router = express.Router();
const productsController = require('../../dao/mongo/productsController');
const { authorize } = require('../../middleware/authorization'); 

module.exports = function (io) {
    router.get('/', productsController(io).getAllProducts);
    router.get('/:pid', productsController(io).getProductById);
    router.post('/', authorize(['admin']), productsController(io).createProduct);
    router.put('/:pid', authorize(['admin']), productsController(io).updateProduct);
    router.delete('/:pid', authorize(['admin']), productsController(io).deleteProduct);

    return router;
};
