const express = require('express');
const router = express.Router();
const cartsController = require('../dao/mongo/cartsController');

// Crea un nuevo carrito
router.post('/', cartsController.createCart); // Cambia '/create-cart' a '/'

// Obtiene los productos de un carrito específico
router.get('/:cid', cartsController.getCartProducts);

// Agrega un producto a un carrito específico
router.post('/:cid/add-to-cart', cartsController.addProductToCart);

// Realiza el checkout del carrito
router.post('/:cid/checkout', cartsController.checkoutCart);

// Elimina un producto del carrito
router.delete('/:cid/products/:pid', cartsController.removeProductFromCart);

// Actualiza la cantidad de un producto en el carrito
// Actualiza la cantidad de un producto en el carrito
router.put('/:cid/products/:pid/increment', cartsController.incrementProductQuantityInCart);
router.put('/:cid/products/:pid/decrement', cartsController.decrementProductQuantityInCart);

// Vacia el carrito
router.delete('/:cid', cartsController.emptyCart);

module.exports = router;