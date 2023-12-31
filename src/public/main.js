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
    const cartId = getCartId();
    if (!cartId) {
        console.error('No hay un carrito disponible');
        return;
    }

    try {
        const response = await fetch(`/api/carts/${cartId}/add-to-cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId })
        });
        if (!response.ok) {
            throw new Error('Error al agregar producto al carrito');
        }
        // Actualiza la interfaz o notifica al usuario
        console.log('Producto agregado al carrito');
    } catch (error) {
        console.error('Error:', error);
    }
    redirectToCart();

}

// Función para actualizar la cantidad de un producto en el carrito
async function updateQuantity(cartId, productId, quantity) {
    try {
        const response = await fetch(`/api/carts/${cartId}/update-quantity`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity })
        });
        if (!response.ok) {
            throw new Error('Error al actualizar la cantidad del producto');
        }
        // Actualiza la interfaz o notifica al usuario
        console.log('Cantidad actualizada');
    } catch (error) {
        console.error('Error:', error);
    }
}

// Función para eliminar un producto del carrito
async function removeFromCart(cartId, productId) {
    try {
        const response = await fetch(`/api/carts/${cartId}/remove-from-cart/${productId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Error al eliminar producto del carrito');
        }
        // Actualiza la interfaz o notifica al usuario
        console.log('Producto eliminado del carrito');
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
