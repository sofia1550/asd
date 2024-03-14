const express = require('express');
const router = express.Router();
const productsController = require('../../dao/mongo/productsController');
const { authorize } = require('../../middleware/authorization');

module.exports = function (io) {
    router.get('/', productsController(io).getAllProducts);
    router.get('/:pid', productsController(io).getProductById);

    // Permitir que los administradores y los usuarios premium creen productos.
    router.post('/', authorize(['admin', 'premium']), productsController(io).createProduct);

    // Estas rutas requieren lógica adicional dentro de productsController para verificar la propiedad del producto
    // en caso de usuarios premium, y permitir estas acciones para administradores sin restricciones.
    router.put('/:pid', authorize(['admin', 'premium']), productsController(io).updateProduct);
    router.delete('/:pid', authorize(['admin', 'premium']), productsController(io).deleteProduct);

    return router;
};