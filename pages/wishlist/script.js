// Load configuration securely
const script = document.createElement('script');
script.src = '../../config.js';
script.onload = function() {
    const { SUPABASE_URL, SUPABASE_KEY } = window.CONFIG;
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    initializeApp();
};
document.head.appendChild(script);

function initializeApp() {
    const wishlistGrid = document.getElementById('wishlistGrid');
    const emptyState = document.getElementById('emptyState');
    const wishlistInfo = document.getElementById('wishlistInfo');
    const wishlistCount = document.getElementById('wishlistCount');
    const toast = document.getElementById('toast');
    const cartBadge = document.getElementById('cartBadge');

    // --- Cart count from localStorage ---
    let cartCount = parseInt(localStorage.getItem('cartCount')) || 0;
    if (cartBadge && cartCount > 0) {
        cartBadge.style.display = 'flex';
        cartBadge.innerHTML = cartCount;
    }

    function showToast(msg, color = '#4caf50') {
        if (!toast) return;
        toast.innerHTML = msg;
        toast.style.background = color;
        toast.style.display = 'block';
        setTimeout(() => toast.style.display = 'none', 2200);
    }

    // --- Load products from Supabase to get full details ---
    let allProducts = [];

    async function loadProducts() {
        try {
            const { data, error } = await window.supabaseClient.from('products').select('*');
            if (!error) allProducts = data;
        } catch (err) {
            console.error('Load products error:', err);
        }
    }

    // --- Render wishlist ---
    function renderWishlist() {
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

        if (wishlist.length === 0) {
            if (wishlistInfo) wishlistInfo.style.display = 'none';
            if (wishlistGrid) wishlistGrid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        if (wishlistInfo) wishlistInfo.style.display = 'flex';
        if (wishlistCount) wishlistCount.textContent = `${wishlist.length} item${wishlist.length > 1 ? 's' : ''} saved`;

        // Match wishlist names to products
        const wishedProducts = allProducts.filter(p => wishlist.includes(p.name));

        // If products not loaded yet, show name-only cards
        const items = wishedProducts.length > 0 ? wishedProducts : wishlist.map(name => ({ name, price: '—', rating: '—', image: '' }));

        if (wishlistGrid) {
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
    }

    // --- Remove item from wishlist ---
    window.removeFromWishlist = function(name) {
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
    };

    // --- Add single item to cart ---
    window.addToCartFromWishlist = async function(name, price, image, rating) {
        try {
            const { data: { session } } = await window.supabaseClient.auth.getSession();

            if (!session) {
                showToast('⚠️ Please login to add to cart!', '#e53935');
                return;
            }

            const { data: existing } = await window.supabaseClient
                .from('cart')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('name', name);

            if (existing && existing.length > 0) {
                await window.supabaseClient.from('cart').update({ quantity: existing[0].quantity + 1 }).eq('id', existing[0].id);
            } else {
                await window.supabaseClient.from('cart').insert([{ user_id: session.user.id, name, price, image, quantity: 1 }]);
            }

            cartCount++;
            if (cartBadge) {
                cartBadge.innerHTML = cartCount;
                cartBadge.style.display = 'flex';
            }
            localStorage.setItem('cartCount', cartCount);
            showToast('✅ Added to cart!', '#4caf50');
        } catch (err) {
            console.error('Add to cart error:', err);
            showToast('❌ Failed to add to cart', '#e53935');
        }
    };

    // --- Move ALL to cart ---
    const moveAllBtn = document.getElementById('moveAllBtn');
    if (moveAllBtn) {
        moveAllBtn.addEventListener('click', async function () {
            const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
            if (wishlist.length === 0) return;

            try {
                const { data: { session } } = await window.supabaseClient.auth.getSession();
                if (!session) {
                    showToast('⚠️ Please login first!', '#e53935');
                    return;
                }

                let added = 0;
                for (const name of wishlist) {
                    const product = allProducts.find(p => p.name === name);
                    if (!product) continue;

                    const { data: existing } = await window.supabaseClient.from('cart').select('*').eq('user_id', session.user.id).eq('name', name);
                    if (existing && existing.length > 0) {
                        await window.supabaseClient.from('cart').update({ quantity: existing[0].quantity + 1 }).eq('id', existing[0].id);
                    } else {
                        await window.supabaseClient.from('cart').insert([{ user_id: session.user.id, name: product.name, price: product.price, image: product.image, quantity: 1 }]);
                    }
                    added++;
                }

                cartCount += added;
                if (cartBadge) {
                    cartBadge.innerHTML = cartCount;
                    cartBadge.style.display = 'flex';
                }
                localStorage.setItem('cartCount', cartCount);
                showToast(`🛒 Moved ${added} item${added > 1 ? 's' : ''} to cart!`, '#4caf50');
            } catch (err) {
                console.error('Move all to cart error:', err);
                showToast('❌ Failed to move items to cart', '#e53935');
            }
        });
    }

    // --- Clear all ---
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            if (!confirm('Clear your entire wishlist?')) return;
            localStorage.setItem('wishlist', JSON.stringify([]));
            renderWishlist();
            showToast('🗑️ Wishlist cleared', '#888');
        });
    }

    // --- Init ---
    loadProducts().then(() => renderWishlist());
}
