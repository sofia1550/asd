const express = require('express');
const router = express.Router();
const cartsController = require('../dao/mongo/cartsController');

router.post('/', cartsController.createCart);
router.get('/:cid', cartsController.getCartProducts);
router.post('/:cid/product/:pid', cartsController.addProductToCart);
router.post('/:cid/checkout', cartsController.checkoutCart);
router.delete('/api/carts/:cid/products/:pid', cartsController.removeProductFromCart);
router.put('/api/carts/:cid/products/:pid', cartsController.updateProductQuantityInCart);
router.delete('/api/carts/:cid', cartsController.emptyCart);


module.exports = router;
