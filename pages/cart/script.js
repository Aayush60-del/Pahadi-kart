const SUPABASE_URL = 'https://bkbwsdjnlswppbezmvig.supabase.co';
const SUPABASE_KEY = 'sb_publishable_FF0gpAOw9R8Abcnex94cww_-7oDtq4q';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const toast = document.getElementById('toast');

function showToast(msg, color = '#4caf50') {
    toast.innerHTML = msg;
    toast.style.backgroundColor = color;
    toast.style.display = 'flex';
    setTimeout(() => toast.style.display = 'none', 2000);
}

async function fetchCart() {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session) {
        document.getElementById('cartItems').innerHTML = `
            <div class="empty-cart">
                <h2>⚠️ Please login to view your cart!</h2>
                <button onclick="window.location.href='../../index.html'">Go to Home</button>
            </div>
        `;
        return;
    }

    const { data, error } = await supabaseClient
        .from('cart')
        .select('*')
        .eq('user_id', session.user.id);

    if (error) { showToast('❌ ' + error.message, '#e53935'); return; }

    if (data.length === 0) {
        document.getElementById('cartItems').innerHTML = `
            <div class="empty-cart">
                <h2>🛒 Cart is empty!</h2>
                <button onclick="window.location.href='../../index.html'">Shop Now</button>
            </div>
        `;
        return;
    }

    let total = 0;
    document.getElementById('cartItems').innerHTML = data.map(item => {
        const price = parseInt(item.price.replace(/\D/g, ''));
        total += price * item.quantity;
        return `
            <div class="cart-item">
                <div class="item-image" style="background-image: url('../../${item.image}')"></div>
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p class="price">${item.price}</p>
                    <div class="quantity-control">
                        <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <button class="remove-btn" onclick="removeItem(${item.id})">🗑️</button>
            </div>
        `;
    }).join('');

    document.getElementById('cartSummary').innerHTML = `
        <div class="summary-box">
            <h2>Order Summary</h2>
            <div class="summary-row">
                <span>Total Items:</span>
                <span>${data.length}</span>
            </div>
            <div class="summary-row">
                <span>Total Amount:</span>
                <span>₹${total}</span>
            </div>
            <button class="checkout-btn">Proceed to Checkout 🚀</button>
        </div>
    `;
}

async function updateQuantity(id, newQty) {
    if (newQty < 1) {
        removeItem(id);
        return;
    }
    await supabaseClient.from('cart').update({ quantity: newQty }).eq('id', id);
    fetchCart();
}

async function removeItem(id) {
    await supabaseClient.from('cart').delete().eq('id', id);
    showToast('🗑️ Item removed!', '#e53935');
    fetchCart();
}

fetchCart();