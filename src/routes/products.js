module.exports = function(io) {
    const express = require('express');
    const router = express.Router();
    const productsController = require('../dao/mongo/productsController')(io);

    router.get('/', productsController.getAllProducts);
    router.get('/:pid', productsController.getProductById);
    router.post('/', productsController.createProduct);
    router.put('/:pid', productsController.updateProduct);
    router.delete('/:pid', async (req, res) => {
        await productsController.deleteProduct(req.params.pid, res);
    });
    return router;
};