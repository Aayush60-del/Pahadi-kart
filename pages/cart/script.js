const SUPABASE_URL = 'https://bkbwsdjnlswppbezmvig.supabase.co';
const SUPABASE_KEY = 'sb_publishable_FF0gpAOw9R8Abcnex94cww_-7oDtq4q';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const toast = document.getElementById('toast');
const FREE_SHIPPING_THRESHOLD = 999; // Free shipping above ₹999
const SHIPPING_FEE = 150;
const MOUNTAIN_TAX_RATE = 0.026; // ~Mountain Sourcing Surcharge

// Promo codes
const PROMO_CODES = {
    'PAHADI10': { discount: 0.10, label: '10% Off' },
    'HILLS20': { discount: 0.20, label: '20% Off' },
    'ARTISAN5': { discount: 0.05, label: '5% Off' }
};
let activePromo = null;

function showToast(msg, color = '#4caf50') {
    toast.innerHTML = msg;
    toast.style.backgroundColor = color;
    toast.style.display = 'flex';
    setTimeout(() => toast.style.display = 'none', 2200);
}

// ---- FREE SHIPPING PROGRESS BAR ----
function updateShippingBar(subtotal) {
    const fill = document.getElementById('shippingFill');
    const msg  = document.getElementById('shippingMsg');
    const pct  = document.getElementById('shippingPct');
    const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
    const percent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

    fill.style.width = percent + '%';
    pct.textContent = percent + '% Complete';

    if (remaining <= 0) {
        msg.textContent = '🎉 You have FREE shipping!';
    } else {
        msg.textContent = `🚚 ₹${remaining} away from Free Shipping`;
    }
}

// ---- BADGE TYPE FOR CATEGORY ----
function getBadge(name) {
    const n = name.toLowerCase();
    if (n.includes('honey') || n.includes('organic') || n.includes('spice') || n.includes('tea')) return 'ORGANIC';
    if (n.includes('shawl') || n.includes('jacket') || n.includes('wool') || n.includes('pashmina')) return 'HANDWOVEN';
    if (n.includes('wood') || n.includes('craft') || n.includes('artifact') || n.includes('copper') || n.includes('vessel')) return 'HANDMADE';
    if (n.includes('candle') || n.includes('oil')) return 'NATURAL';
    return 'PAHADI';
}

async function fetchCart() {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session) {
        document.getElementById('cartItems').innerHTML = `
            <div class="empty-cart">
                <h2>⚠️ Please login to view your basket!</h2>
                <p>Sign in to see the items you've added.</p>
                <button onclick="window.location.href='../../index.html'">Go to Home</button>
            </div>
        `;
        return;
    }

    const { data, error } = await supabaseClient.from('cart').select('*').eq('user_id', session.user.id);

    if (error) { showToast('❌ ' + error.message, '#e53935'); return; }

    if (data.length === 0) {
        document.getElementById('cartItems').innerHTML = `
            <div class="empty-cart">
                <h2>🧺 Your basket is empty!</h2>
                <p>Explore our soulful collection of artisan products.</p>
                <button onclick="window.location.href='../../index.html'">🛍️ Start Shopping</button>
            </div>
        `;
        document.getElementById('promoSection').style.display = 'none';
        document.getElementById('artisanPromise').style.display = 'none';
        updateShippingBar(0);
        return;
    }

    let subtotal = 0;
    document.getElementById('cartItems').innerHTML = data.map(item => {
        const price = parseInt(item.price.toString().replace(/\D/g, ''));
        subtotal += price * item.quantity;
        const badge = getBadge(item.name);
        return `
            <div class="cart-item">
                <div class="item-image" style="background-image: url('../../${item.image}')"></div>
                <span class="item-badge">${badge}</span>
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p class="item-desc">Crafted by Himalayan artisans</p>
                    <p class="price">₹${price.toLocaleString('en-IN')}</p>
                    <div class="quantity-control">
                        <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="remove-btn" onclick="removeItem(${item.id})">✕ Remove</button>
                </div>
            </div>
        `;
    }).join('');

    // Show promo & promise sections
    document.getElementById('promoSection').style.display = 'block';
    document.getElementById('artisanPromise').style.display = 'block';

    // Update shipping bar
    updateShippingBar(subtotal);

    // Compute discount
    let discountAmt = 0;
    if (activePromo) discountAmt = Math.round(subtotal * activePromo.discount);

    const discountedSubtotal = subtotal - discountAmt;
    const shipping = discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const tax = Math.round(discountedSubtotal * MOUNTAIN_TAX_RATE);
    const total = discountedSubtotal + shipping + tax;

    document.getElementById('cartSummary').innerHTML = `
        <div class="summary-box">
            <h2>Order Summary</h2>
            <div class="summary-row">
                <span>Subtotal (${data.length} items)</span>
                <span>₹${subtotal.toLocaleString('en-IN')}</span>
            </div>
            ${discountAmt > 0 ? `<div class="summary-row discount"><span>Discount (${activePromo.label})</span><span>−₹${discountAmt.toLocaleString('en-IN')}</span></div>` : ''}
            <div class="summary-row">
                <span>Shipping Fee</span>
                <span>${shipping === 0 ? '<b style="color:#27ae60">FREE 🎉</b>' : '₹' + shipping}</span>
            </div>
            <div class="summary-row">
                <span>Mountain Sourcing Tax</span>
                <span>₹${tax.toLocaleString('en-IN')}</span>
            </div>
            <div class="summary-row total">
                <span>Total</span>
                <span>₹${total.toLocaleString('en-IN')}</span>
            </div>
            <button class="checkout-btn" onclick="showToast('🚧 Payment gateway coming soon!', '#8b5a2b')">🔒 Proceed to Checkout</button>
            <p class="secure-note">🔐 Secured with SSL Encryption</p>
        </div>
    `;
}

// ---- UPDATE / REMOVE ----
async function updateQuantity(id, newQty) {
    if (newQty < 1) { removeItem(id); return; }
    await supabaseClient.from('cart').update({ quantity: newQty }).eq('id', id);
    fetchCart();
}

async function removeItem(id) {
    await supabaseClient.from('cart').delete().eq('id', id);
    showToast('🗑️ Item removed from basket', '#e53935');
    fetchCart();
}

// ---- PROMO CODE ----
document.getElementById('applyPromoBtn').addEventListener('click', function () {
    const code = document.getElementById('promoInput').value.trim().toUpperCase();
    const msgEl = document.getElementById('promoMsg');

    if (PROMO_CODES[code]) {
        activePromo = { ...PROMO_CODES[code], code };
        msgEl.textContent = `✅ Code "${code}" applied — ${activePromo.label}!`;
        msgEl.classList.remove('error');
        fetchCart();
    } else {
        activePromo = null;
        msgEl.textContent = `❌ Invalid code. Try PAHADI10`;
        msgEl.classList.add('error');
        fetchCart();
    }
});

fetchCart();