const SUPABASE_URL = 'https://bkbwsdjnlswppbezmvig.supabase.co';
const SUPABASE_KEY = 'sb_publishable_FF0gpAOw9R8Abcnex94cww_-7oDtq4q';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const wishlistGrid = document.getElementById('wishlistGrid');
const emptyState = document.getElementById('emptyState');
const wishlistInfo = document.getElementById('wishlistInfo');
const wishlistCount = document.getElementById('wishlistCount');
const toast = document.getElementById('toast');
const cartBadge = document.getElementById('cartBadge');

// --- Cart count from localStorage ---
let cartCount = parseInt(localStorage.getItem('cartCount')) || 0;
if (cartCount > 0) {
    cartBadge.style.display = 'flex';
    cartBadge.innerHTML = cartCount;
}

function showToast(msg, color = '#4caf50') {
    toast.innerHTML = msg;
    toast.style.background = color;
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 2200);
}

// --- Load products from Supabase to get full details ---
let allProducts = [];

async function loadProducts() {
    const { data, error } = await supabaseClient.from('products').select('*');
    if (!error) allProducts = data;
}

// --- Render wishlist ---
function renderWishlist() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    if (wishlist.length === 0) {
        wishlistInfo.style.display = 'none';
        wishlistGrid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    wishlistInfo.style.display = 'flex';
    wishlistCount.textContent = `${wishlist.length} item${wishlist.length > 1 ? 's' : ''} saved`;

    // Match wishlist names to products
    const wishedProducts = allProducts.filter(p => wishlist.includes(p.name));

    // If products not loaded yet, show name-only cards
    const items = wishedProducts.length > 0 ? wishedProducts : wishlist.map(name => ({ name, price: '—', rating: '—', image: '' }));

    wishlistGrid.innerHTML = '';
    items.forEach(product => {
        wishlistGrid.innerHTML += `
            <div class="card" id="card-${CSS.escape(product.name)}">
                <div class="show" style="background-image: url('${product.image}')"></div>
                <button class="remove-wish-btn" onclick="removeFromWishlist('${product.name.replace(/'/g, "\\'")}')">❤️</button>
                <div class="card-info">
                    <h2>${product.name}</h2>
                    <div class="rating">⭐ ${product.rating || '—'}</div>
                    <div class="price">₹${product.price || '—'}</div>
                </div>
                <button class="add-cart-btn" onclick="addToCartFromWishlist('${product.name.replace(/'/g, "\\'")}', '${product.price}', '${product.image}', '${product.rating || ''}')">
                    <img src="../../images/Svg/cart.svg">
                    <span>Add to Cart</span>
                </button>
            </div>
        `;
    });
}

// --- Remove item from wishlist ---
function removeFromWishlist(name) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    wishlist = wishlist.filter(item => item !== name);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));

    // Animate card removal
    const card = document.getElementById(`card-${CSS.escape(name)}`);
    if (card) {
        card.style.transition = 'all 0.4s ease';
        card.style.transform = 'scale(0)';
        card.style.opacity = '0';
        setTimeout(() => renderWishlist(), 400);
    }

    showToast('💔 Removed from wishlist', '#e53935');
}

// --- Add single item to cart ---
async function addToCartFromWishlist(name, price, image, rating) {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session) {
        showToast('⚠️ Please login to add to cart!', '#e53935');
        return;
    }

    const { data: existing } = await supabaseClient
        .from('cart')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('name', name);

    if (existing && existing.length > 0) {
        await supabaseClient.from('cart').update({ quantity: existing[0].quantity + 1 }).eq('id', existing[0].id);
    } else {
        await supabaseClient.from('cart').insert([{ user_id: session.user.id, name, price, image, quantity: 1 }]);
    }

    cartCount++;
    cartBadge.innerHTML = cartCount;
    cartBadge.style.display = 'flex';
    localStorage.setItem('cartCount', cartCount);
    showToast('✅ Added to cart!', '#4caf50');
}

// --- Move ALL to cart ---
document.getElementById('moveAllBtn').addEventListener('click', async function () {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    if (wishlist.length === 0) return;

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        showToast('⚠️ Please login first!', '#e53935');
        return;
    }

    let added = 0;
    for (const name of wishlist) {
        const product = allProducts.find(p => p.name === name);
        if (!product) continue;

        const { data: existing } = await supabaseClient.from('cart').select('*').eq('user_id', session.user.id).eq('name', name);
        if (existing && existing.length > 0) {
            await supabaseClient.from('cart').update({ quantity: existing[0].quantity + 1 }).eq('id', existing[0].id);
        } else {
            await supabaseClient.from('cart').insert([{ user_id: session.user.id, name: product.name, price: product.price, image: product.image, quantity: 1 }]);
        }
        added++;
    }

    cartCount += added;
    cartBadge.innerHTML = cartCount;
    cartBadge.style.display = 'flex';
    localStorage.setItem('cartCount', cartCount);
    showToast(`🛒 Moved ${added} item${added > 1 ? 's' : ''} to cart!`, '#4caf50');
});

// --- Clear all ---
document.getElementById('clearBtn').addEventListener('click', function () {
    if (!confirm('Clear your entire wishlist?')) return;
    localStorage.setItem('wishlist', JSON.stringify([]));
    renderWishlist();
    showToast('🗑️ Wishlist cleared', '#888');
});

// --- Init ---
loadProducts().then(() => renderWishlist());
