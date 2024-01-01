const express = require('express');
const router = express.Router();
const productsController = require('../dao/mongo/productsController');

module.exports = function (io) {
    router.get('/', productsController(io).renderProductsPage);
    router.get('/:pid/detail', productsController(io).renderProductDetailPage);

    return router;
};