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
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Eliminar la notificación después de 3 segundos
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
document.addEventListener('DOMContentLoaded', async () => {
    if (!getCartId()) {
        try {
            const response = await fetch('/api/carts/', { method: 'POST' });
            if (response.ok) {
                const cart = await response.json();
                localStorage.setItem('cartId', cart._id);
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
        showNotification('Producto agregado al carrito');
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        showNotification('Error al agregar producto al carrito', 'error');
    }
}


async function removeFromCart(cartId, productId) {
    if (!productId) {
        console.error('ID del producto no proporcionado');
        return;
    }
    try {
        const response = await fetch(`/api/carts/${cartId}/products/${productId}`, { method: 'DELETE' });
        if (response.ok) {
            document.querySelector(`#cart_item_${productId}`).remove(); // Elimina el elemento del DOM
        } else {
            throw new Error('Error al eliminar producto del carrito');
        }
        console.log('Producto eliminado del carrito');
    } catch (error) {
        console.error('Error:', error);
    }
    showNotification('Producto eliminado del carrito');

}


// Función para actualizar la cantidad de un producto en el carrito
async function updateQuantity(cartId, productId, operation) {
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
        if (response.ok) {
            try {
                const updatedProduct = await response.json();
                document.querySelector(`#quantity_${productId}`).textContent = updatedProduct.quantity;
            } catch (error) {
                console.error('Error al parsear la respuesta JSON:', error);
            }
        } else {
            throw new Error('Error al actualizar la cantidad del producto');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}



// Función para realizar el checkout del carrito
async function checkoutCart(cartId) {
    if (!cartId) {
        console.error('No se proporcionó ID del carrito');
        return;
    }

    try {
        const response = await fetch(`/api/carts/${cartId}/checkout`, {
            method: 'POST'
        });
        if (response.ok) {
            const data = await response.json();
            if (data.cartCleared) {
                // Actualizar la interfaz de usuario
                const cartList = document.getElementById('cartList');
                cartList.innerHTML = '<p>Tu carrito está vacío.</p>';
                console.log(data.message);
                showNotification('Checkout realizado con éxito');

            }
        } else {
            showNotification('Error al realizar checkout', 'error');

            throw new Error('Error al realizar checkout');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


