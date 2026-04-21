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
    const cardContainer = document.getElementById('cardContainer');
    const toast = document.getElementById('toast');
    let products = [];

    function getBadge(name) {
        const n = name.toLowerCase();
        if (n.includes('honey') || n.includes('organic') || n.includes('spice') || n.includes('tea')) return 'ORGANIC';
        if (n.includes('shawl') || n.includes('jacket') || n.includes('wool') || n.includes('pashmina')) return 'HANDWOVEN';
        if (n.includes('wood') || n.includes('craft') || n.includes('artifact') || n.includes('copper') || n.includes('vessel')) return 'HANDMADE';
        if (n.includes('candle') || n.includes('oil')) return 'NATURAL';
        return 'PAHADI';
    }

    function showCards(filteredProducts) {
        if (!cardContainer) return;
        
        cardContainer.innerHTML = '';
        if (!filteredProducts || filteredProducts.length === 0) {
            cardContainer.innerHTML = '<div class="no-products">No products found in this category</div>';
            return;
        }
        
        filteredProducts.forEach(function (product) {
            const badge = getBadge(product.name);
            cardContainer.innerHTML += `
                <div class="card">
                    <div class="show" style="background-image: url('../../${product.image || 'images/placeholder.jpg'}')"></div>
                    <button class="wishlist-btn">🤍</button>
                    <span class="card-badge ${badge}">${badge}</span>
                    <h2>${product.name || 'Unknown Product'}</h2>
                    <h2>${product.rating || '⭐ 4.5'}</h2>
                    <h2>${product.price || '₹0'}</h2>
                    <button class="add-cart-btn flex_">
                        <img src="../../images/Svg/cart.svg">
                        <h4>Add to cart</h4>
                    </button>
                </div>
            `;
        });
        attachCartButtons();
        attachWishlistButtons();
    }

    async function fetchProducts() {
        try {
            const { data, error } = await window.supabaseClient
                .from('products')
                .select('*');

            if (error) {
                console.log('Supabase Error:', error);
                if (cardContainer) {
                    cardContainer.innerHTML = '<div class="error-message">Failed to load products. Please try again later.</div>';
                }
                return;
            }

            products = data || [];
            
            // Filter by category based on page
            const pageCategory = window.location.pathname.includes('handicraft') ? 'handicraft' :
                              window.location.pathname.includes('organic') ? 'organic' :
                              window.location.pathname.includes('clothing') ? 'clothing' :
                              window.location.pathname.includes('home') ? 'home' : null;
            
            if (pageCategory) {
                const filtered = products.filter(p => p.category === pageCategory);
                showCards(filtered);
            } else {
                showCards(products);
            }
        } catch (err) {
            console.error('Fetch products error:', err);
            if (cardContainer) {
                cardContainer.innerHTML = '<div class="error-message">Failed to load products. Please check your connection.</div>';
            }
        }
    }

    function attachCartButtons() {
        const addToCartBtns = document.querySelectorAll('.add-cart-btn');
        addToCartBtns.forEach(function (button) {
            button.addEventListener('click', async function () {
                const card = button.closest('.card');
                if (!card) return;
                
                const nameElement = card.querySelectorAll('h2')[0];
                const priceElement = card.querySelectorAll('h2')[2];
                const imageElement = card.querySelector('.show');
                
                if (!nameElement || !priceElement || !imageElement) {
                    alert('Product information not found!');
                    return;
                }

                const name = nameElement.innerHTML;
                const price = priceElement.innerHTML;
                const image = imageElement.style.backgroundImage.slice(5, -2);

                try {
                    const { data: { session } } = await window.supabaseClient.auth.getSession();

                    if (!session) {
                        if (toast) {
                            toast.innerHTML = '⚠️ Please login to add items to cart!';
                            toast.style.backgroundColor = '#e53935';
                            toast.style.display = 'flex';
                            setTimeout(() => toast.style.display = 'none', 2000);
                        }
                        return;
                    }

                    const { data: existing } = await window.supabaseClient
                        .from('cart')
                        .select('*')
                        .eq('user_id', session.user.id)
                        .eq('name', name);

                    if (existing && existing.length > 0) {
                        await window.supabaseClient
                            .from('cart')
                            .update({ quantity: existing[0].quantity + 1 })
                            .eq('id', existing[0].id);
                    } else {
                        await window.supabaseClient
                            .from('cart')
                            .insert([{
                                user_id: session.user.id,
                                name: name,
                                price: price,
                                image: image,
                                quantity: 1
                            }]);
                    }

                    if (toast) {
                        toast.innerHTML = '✅ Added to cart!';
                        toast.style.backgroundColor = '#4caf50';
                        toast.style.display = 'flex';
                        setTimeout(() => toast.style.display = 'none', 2000);
                    }
                } catch (err) {
                    console.error('Add to cart error:', err);
                    if (toast) {
                        toast.innerHTML = '❌ Failed to add to cart!';
                        toast.style.backgroundColor = '#e53935';
                        toast.style.display = 'flex';
                        setTimeout(() => toast.style.display = 'none', 2000);
                    }
                }
            });
        });
    }

    function attachWishlistButtons() {
        const wishlistBtns = document.querySelectorAll('.wishlist-btn');
        wishlistBtns.forEach(function (btn) {
            const card = btn.closest('.card');
            if (!card) return;
            
            const nameElement = card.querySelector('h2');
            if (!nameElement) return;
            
            const productName = nameElement.innerHTML;

            const saved = JSON.parse(localStorage.getItem('wishlist')) || [];
            if (saved.includes(productName)) {
                btn.classList.add('liked');
                btn.innerHTML = '❤️';
            }

            btn.addEventListener('click', function () {
                let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
                if (btn.classList.contains('liked')) {
                    btn.classList.remove('liked');
                    btn.innerHTML = '🤍';
                    wishlist = wishlist.filter(item => item !== productName);
                } else {
                    btn.classList.add('liked');
                    btn.innerHTML = '❤️';
                    wishlist.push(productName);
                }
                localStorage.setItem('wishlist', JSON.stringify(wishlist));
            });
        });
    }

    fetchProducts();
}
