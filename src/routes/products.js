module.exports = function (io) {
    const express = require('express');
    const router = express.Router();
    const productsController = require('../dao/mongo/productsController')(io);

    // Obtiene todos los productos
    router.get('/', productsController.getAllProducts);

    // Obtiene un producto por ID
    router.get('/:pid', productsController.getProductById);

    // Crea un nuevo producto
    router.post('/', productsController.createProduct);

    // Actualiza un producto
    router.put('/:pid', productsController.updateProduct);

    // Elimina un producto
    router.delete('/:pid', async (req, res) => {
        await productsController.deleteProduct(req.params.pid, res);
    });

    return router;
};
