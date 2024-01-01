// Función para agregar un producto al carrito
function getCartId() {
    return localStorage.getItem('cartId');
}
function redirectToCart() {
    const cartId = getCartId();
    if (cartId) {
        window.location.href = `/cart/${cartId}`;
    } else {
        console.error('No hay un carrito disponible');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!getCartId()) {
        try {
            const response = await fetch('/api/carts/', { method: 'POST' });
            if (response.ok) {
                const cart = await response.json();
                localStorage.setItem('cartId', cart._id); // Asegúrate de que el ID del carrito se esté devolviendo correctamente desde el servidor
            } else {
                console.error('No se pudo crear un carrito');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
});
async function addToCart(productId) {
    let cartId = getCartId(); // Obtener el ID del carrito desde localStorage

    // Crear un nuevo carrito si no existe uno
    if (!cartId) {
        try {
            const response = await fetch('/api/carts/', { method: 'POST' });
            if (response.ok) {
                const cart = await response.json();
                localStorage.setItem('cartId', cart._id); // Almacena el nuevo ID del carrito en localStorage
                cartId = cart._id; // Actualiza la variable cartId con el nuevo ID del carrito
            } else {
                console.error('No se pudo crear un carrito');
                return;
            }
        } catch (error) {
            console.error('Error al crear un nuevo carrito:', error);
            return;
        }
    }

    // Añadir el producto al carrito
    try {
        const response = await fetch(`/api/carts/${cartId}/add-to-cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId })
        });
        if (!response.ok) {
            throw new Error('Error al agregar producto al carrito');
        }
        console.log('Producto agregado al carrito');
        redirectToCart(); // Redirige al carrito después de agregar el producto
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
    }
}


async function removeFromCart(cartId, productId) {
    if (!productId) {
        console.error('ID del producto no proporcionado');
        return;
    }
    try {
        const response = await fetch(`/api/carts/${cartId}/products/${productId}`, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error('Error al eliminar producto del carrito');
        }
        console.log('Producto eliminado del carrito');
    } catch (error) {
        console.error('Error:', error);
    }
}


// Función para actualizar la cantidad de un producto en el carrito
// Función para actualizar la cantidad de un producto en el carrito
async function updateQuantity(cartId, productId, operation) {
    console.log('Cart ID:', cartId, 'Product ID:', productId, 'Operation:', operation);

    if (!productId) {
        console.error('ID del producto no proporcionado');
        return;
    }
    try {
        let endpoint = operation === 'increment' ? 'increment' : 'decrement';
        const response = await fetch(`/api/carts/${cartId}/products/${productId}/${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error('Error al actualizar la cantidad del producto');
        }
        console.log('Cantidad actualizada');
    } catch (error) {
        console.error('Error:', error);
    }
}


// Función para realizar el checkout del carrito
async function checkoutCart(cartId) {
    try {
        const response = await fetch(`/api/carts/${cartId}/checkout`, {
            method: 'POST'
        });
        if (!response.ok) {
            throw new Error('Error al realizar checkout');
        }
        // Actualiza la interfaz o notifica al usuario
        console.log('Checkout completado');
    } catch (error) {
        console.error('Error:', error);
    }
}
