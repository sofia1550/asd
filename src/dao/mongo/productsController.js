const Product = require('../models/products');

module.exports = function (io) {
    const getAllProducts = async (req, res) => {
        try {
            const { limit = 10, page = 1, sort = '', query = '' } = req.query;
            const options = {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                sort: { price: sort === 'desc' ? -1 : 1 }
            };

            let filter = {};
            if (query) {
                filter = { title: { $regex: query, $options: 'i' } };
            }

            const result = await Product.paginate(filter, options);
            res.json({
                status: 'success',
                payload: result.docs,
                totalPages: result.totalPages,
                prevPage: result.prevPage,
                nextPage: result.nextPage,
                page: result.page,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage,
                prevLink: result.prevPage ? `/api/products?page=${result.prevPage}` : null,
                nextLink: result.nextPage ? `/api/products?page=${result.nextPage}` : null
            });
        } catch (error) {
            res.status(500).json({ status: 'error', error: error.message });
        }
    };
    const getProductDetail = async (req, res) => {
        try {
            const product = await Product.findById(req.params.pid);
            if (!product) return res.status(404).send('Producto no encontrado');
            res.render('productDetail', { product });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    const renderProductsPage = async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 3; 

            const options = {
                page,
                limit,
                sort: { createdAt: -1 } 
            };

            const result = await Product.paginate({}, options);

            res.render('products', {
                products: result.docs,
                currentPage: result.page,
                totalPages: result.totalPages,
                hasNextPage: result.hasNextPage,
                hasPrevPage: result.hasPrevPage,
                nextPage: result.nextPage,
                prevPage: result.prevPage,
                lastPage: result.totalPages
            });
        } catch (error) {
            res.status(500).send('Error al cargar la página');
        }
    };


    const renderProductDetailPage = async (req, res) => {
        try {
            const product = await Product.findById(req.params.pid);
            res.render('productDetail', { product });
        } catch (error) {
            res.status(500).send('Error al cargar la página');
        }
    };
    const getProductById = async (req, res) => {
        try {
            const product = await Product.findById(req.params.pid);
            if (!product) return res.status(404).send('Producto no encontrado');
            res.json(product);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    const createProduct = async (req, res) => {
        try {
            const newProduct = new Product(req.body);
            // Aquí puedes añadir validaciones adicionales si lo necesitas
            await newProduct.save();
            io.emit('updateProductList', await Product.find({}));
            res.status(201).json(newProduct);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    const updateProduct = async (productId, updatedData) => {
        try {
            const product = await Product.findByIdAndUpdate(productId, updatedData, { new: true });
            if (!product) {
                io.emit('productError', 'Producto no encontrado');
                return;
            }
            io.emit('updateProductList', await Product.find({}));
        } catch (error) {
            io.emit('productError', error.message);
        }
    };

    const deleteProduct = async (productId, res) => {
        try {
            const product = await Product.findByIdAndDelete(productId);
            if (!product) {
                io.emit('productError', 'Producto no encontrado');
                return res.status(404).send('Producto no encontrado');
            }
            io.emit('updateProductList', await Product.find({}));
            res.send('Producto eliminado con éxito');
        } catch (error) {
            io.emit('productError', error.message);
            res.status(500).json({ error: error.message });
        }
    };

    return {
        getProductDetail,
        getAllProducts,
        getProductById,
        createProduct,
        updateProduct,
        deleteProduct,
        renderProductDetailPage,
        renderProductsPage,
    };
};
