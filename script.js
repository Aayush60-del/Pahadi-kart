// Load configuration securely
const script = document.createElement('script');
script.src = 'config.js';
script.onload = function() {
    const { SUPABASE_URL, SUPABASE_KEY } = window.CONFIG;
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    initializeApp();
};
document.head.appendChild(script);

function initializeApp() {
    const cartBadge = document.getElementById('cartBadge');
    const toast = document.getElementById('toast');

    let cartCount = parseInt(localStorage.getItem('cartCount')) || 0;
    
    function updateCartBadge() {
        const mobileBadge = document.getElementById('cartBadge');
        const desktopBadge = document.getElementById('cartBadgeDesktop');
        
        if (mobileBadge) {
            mobileBadge.innerHTML = cartCount;
            mobileBadge.style.display = cartCount > 0 ? 'flex' : 'none';
        }
        if (desktopBadge) {
            desktopBadge.innerHTML = cartCount;
            desktopBadge.style.display = cartCount > 0 ? 'flex' : 'none';
        }
    }
    updateCartBadge();

    // Wishlist badge sync
    function updateWishlistBadge() {
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const count = wishlist.length;
        ['wishlistBadge', 'wishlistBadgeDesktop'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.innerHTML = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });
    }
    updateWishlistBadge();

    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileNav = document.getElementById('mobileNav');
    if (hamburgerBtn && mobileNav) {
        hamburgerBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('open');
            hamburgerBtn.classList.toggle('active');
        });
    }

    const fadeElements = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    });
    fadeElements.forEach(function (element) {
        observer.observe(element);
    });

    const loginModal = document.getElementById('loginModal');
    const overlay = document.getElementById('overlay');
    const modalClose = document.getElementById('modalClose');

    const allLoginBtns = document.querySelectorAll('.head_sec button, .mobile-nav button');
    allLoginBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (loginModal && overlay) {
                loginModal.classList.add('active');
                overlay.classList.add('active');
            }
        });
    });

    if (modalClose) {
        modalClose.addEventListener('click', function () {
            if (loginModal && overlay) {
                loginModal.classList.remove('active');
                overlay.classList.remove('active');
            }
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', function () {
            if (loginModal && overlay) {
                loginModal.classList.remove('active');
                overlay.classList.remove('active');
            }
        });
    }

    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', async function () {
            const emailInput = document.getElementById('emailInput');
            const passInput = document.getElementById('passInput');
            
            if (!emailInput || !passInput) {
                alert('Login form not found!');
                return;
            }

            const email = emailInput.value;
            const password = passInput.value;

            try {
                const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                if (error) {
                    alert('❌ ' + error.message);
                    return;
                }

                if (loginModal && overlay) {
                    loginModal.classList.remove('active');
                    overlay.classList.remove('active');
                }
                updateAuthUI(data.user);
                if (toast) {
                    toast.innerHTML = '✅ Login successful!';
                    toast.style.backgroundColor = '#4caf50';
                    toast.style.display = 'flex';
                    setTimeout(() => toast.style.display = 'none', 2000);
                }
            } catch (err) {
                console.error('Login error:', err);
                alert('❌ Login failed. Please try again.');
            }
        });
    }

    const signupLink = document.querySelector('.signup-link');
    if (signupLink) {
        signupLink.addEventListener('click', async function () {
            const emailInput = document.getElementById('emailInput');
            const passInput = document.getElementById('passInput');
            
            if (!emailInput || !passInput) {
                alert('Signup form not found!');
                return;
            }

            const email = emailInput.value;
            const password = passInput.value;

            if (!email || !password) {
                alert('Email aur password daalo!');
                return;
            }

            try {
                const { data, error } = await window.supabaseClient.auth.signUp({
                    email: email,
                    password: password
                });

                if (error) {
                    alert('❌ ' + error.message);
                    return;
                }

                if (loginModal && overlay) {
                    loginModal.classList.remove('active');
                    overlay.classList.remove('active');
                }
                if (toast) {
                    toast.innerHTML = '🎉 Account created!';
                    toast.style.backgroundColor = '#4caf50';
                    toast.style.display = 'flex';
                    setTimeout(() => toast.style.display = 'none', 2000);
                }
            } catch (err) {
                console.error('Signup error:', err);
                alert('❌ Signup failed. Please try again.');
            }
        });
    }

    function updateAuthUI(user) {
        const loginBtn = document.querySelector('.head_sec button');
        if (user && loginBtn) {
            loginBtn.innerHTML = `<img src="images/Svg/admin.svg"><h3>${user.email.split('@')[0]}</h3>`;
            loginBtn.onclick = async function () {
                try {
                    await window.supabaseClient.auth.signOut();
                    loginBtn.innerHTML = `<img src="images/Svg/admin.svg"><h3>Login</h3>`;
                    loginBtn.onclick = null;
                    if (toast) {
                        toast.innerHTML = '👋 Logged out!';
                        toast.style.backgroundColor = '#e53935';
                        toast.style.display = 'flex';
                        setTimeout(() => toast.style.display = 'none', 2000);
                    }
                } catch (err) {
                    console.error('Logout error:', err);
                }
            };
        }
    }

    // Check for existing session
    window.supabaseClient.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            updateAuthUI(session.user);
        }
    }).catch(err => {
        console.error('Session check error:', err);
    });

    let products = [];
    const cardContainer = document.getElementById('cardContainer');

    function getBadge(name) {
        const n = name.toLowerCase();
        if (n.includes('honey') || n.includes('organic') || n.includes('spice') || n.includes('tea') || n.includes('rhodo')) return ['organic', 'ORGANIC'];
        if (n.includes('shawl') || n.includes('wool') || n.includes('pashmina') || n.includes('jacket')) return ['handwoven', 'HANDWOVEN'];
        if (n.includes('candle') || n.includes('oil') || n.includes('soap')) return ['natural', 'NATURAL'];
        if (n.includes('wood') || n.includes('craft') || n.includes('artifact') || n.includes('copper') || n.includes('vessel') || n.includes('bowl')) return ['handmade', 'HANDMADE'];
        return ['pahadi', 'PAHADI'];
    }

    function showCards(filteredProducts) {
        if (!cardContainer) return;
        
        cardContainer.innerHTML = '';
        if (!filteredProducts || filteredProducts.length === 0) {
            cardContainer.innerHTML = '<div class="no-products">No products found</div>';
            return;
        }
        
        filteredProducts.forEach(function (product) {
            const [badgeClass, badgeLabel] = getBadge(product.name);
            cardContainer.innerHTML += `
                <div class="card">
                    <div class="show" style="background-image: url('${product.image || 'images/placeholder.jpg'}')"></div>
                    <button class="wishlist-btn">🤍</button>
                    <span class="card-badge ${badgeClass}">${badgeLabel}</span>
                    <h2>${product.name || 'Unknown Product'}</h2>
                    <h2>${product.rating || '⭐ 4.5'}</h2>
                    <h2>${product.price || '₹0'}</h2>
                    <button class="add-cart-btn flex_">
                        <img src="images/Svg/cart.svg">
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
            showCards(products);
        } catch (err) {
            console.error('Fetch products error:', err);
            if (cardContainer) {
                cardContainer.innerHTML = '<div class="error-message">Failed to load products. Please check your connection.</div>';
            }
        }
    }

    fetchProducts();

    function attachCartButtons() {
        const addToCartBtns = document.querySelectorAll('.add-cart-btn');
        addToCartBtns.forEach(function (button) {
            button.addEventListener('click', async function () {
                const card = button.closest('.card');
                if (!card) return;
                
                const nameElement = card.querySelectorAll('h2')[0];
                const ratingElement = card.querySelectorAll('h2')[1];
                const priceElement = card.querySelectorAll('h2')[2];
                const imageElement = card.querySelector('.show');
                
                if (!nameElement || !priceElement || !imageElement) {
                    alert('Product information not found!');
                    return;
                }

                const name = nameElement.innerHTML;
                const rating = ratingElement ? ratingElement.innerHTML : '⭐ 4.5';
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

                    // Check if already in cart
                    const { data: existing } = await window.supabaseClient
                        .from('cart')
                        .select('*')
                        .eq('user_id', session.user.id)
                        .eq('name', name);

                    if (existing && existing.length > 0) {
                        // Update quantity
                        await window.supabaseClient
                            .from('cart')
                            .update({ quantity: existing[0].quantity + 1 })
                            .eq('id', existing[0].id);
                    } else {
                        // Add new item
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

                    cartCount++;
                    updateCartBadge();
                    localStorage.setItem('cartCount', cartCount);
                    
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
                updateWishlistBadge();
            });
        });
    }

    const navFilters = document.querySelectorAll('.nav-filter');
    navFilters.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const category = link.dataset.category;
            if (!category || category === 'all') {
                showCards(products);
            } else {
                const filtered = products.filter(function (p) {
                    return p.category === category;
                });
                showCards(filtered);
            }
            if (mobileNav && hamburgerBtn) {
                mobileNav.classList.remove('open');
                hamburgerBtn.classList.remove('active');
            }
        });
    });

    const subscribeBtn = document.querySelector('.foot4-span button');
    const emailInput = document.getElementById('f4');
    if (subscribeBtn && emailInput) {
        subscribeBtn.addEventListener('click', function () {
            let mail = emailInput.value.trim();
            if (mail === "") {
                if (toast) {
                    toast.innerHTML = '❌ Email is empty!';
                    toast.style.backgroundColor = '#e53935';
                    toast.style.display = 'flex';
                    setTimeout(function () { toast.style.display = 'none'; }, 2000);
                }
                return;
            }
            if (!mail.includes('@')) {
                if (toast) {
                    toast.innerHTML = '❌ Invalid email!';
                    toast.style.backgroundColor = '#e53935';
                    toast.style.display = 'flex';
                    setTimeout(function () { toast.style.display = 'none'; }, 2000);
                }
                return;
            }
            if (toast) {
                toast.innerHTML = '🎉 Subscribed successfully!';
                toast.style.backgroundColor = '#4caf50';
                toast.style.display = 'flex';
            }
            emailInput.value = '';
            setTimeout(function () { 
                if (toast) toast.style.display = 'none'; 
            }, 2000);
        });
    }

    const exploreBtn = document.querySelector('.context button');
    if (exploreBtn && toast) {
        exploreBtn.addEventListener('click', function (e) {
            e.preventDefault();
            toast.style.backgroundColor = '#3e2723';
            toast.style.padding = '20px 30px';
            toast.style.borderRadius = '15px';
            toast.style.fontSize = '13px';
            toast.style.lineHeight = '1.8';
            toast.style.flexDirection = 'column';
            toast.style.textAlign = 'left';
            toast.style.maxWidth = '320px';
            toast.style.color = 'white';
            toast.innerHTML = `
                <b style="font-size:16px; margin-bottom:8px;">🏔️ Our Artisan Community</b>
                <span>✅ <b>500+</b> skilled craftspeople</span>
                <span>🏡 From remote Uttarakhand villages</span>
                <span>🎨 Preserving <b>200-year-old</b> crafts</span>
                <span>💰 Fair wages & sustainable income</span>
                <span>❤️ Every purchase = direct support</span>
            `;
            toast.style.display = 'flex';
            setTimeout(function () {
                if (toast) {
                    toast.style.display = 'none';
                    toast.style.backgroundColor = '#4caf50';
                    toast.innerHTML = '✅ Added to cart!';
                    toast.style.flexDirection = 'row';
                    toast.style.padding = '12px 25px';
                    toast.style.fontSize = '15px';
                    toast.style.maxWidth = 'none';
                    toast.style.textAlign = 'center';
                }
            }, 4000);
        });
    }

    const searchInput = document.querySelector(".src");
    if (searchInput) {
        searchInput.addEventListener('keyup', function () {
            let searchText = searchInput.value.toLowerCase().trim();
            if (searchText === "") {
                showCards(products);
                return;
            }
            const filtered = products.filter(function (product) {
                return product.name && product.name.toLowerCase().includes(searchText);
            });
            showCards(filtered);
        });
    }

    const viewAll = document.querySelector(".view_all");
    if (viewAll) {
        viewAll.addEventListener('click', function () {
            showCards(products);
            if (mobileNav && hamburgerBtn) {
                mobileNav.classList.remove('open');
                hamburgerBtn.classList.remove('active');
            }
        });
    }

    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(function (card) {
        let clickTimer = null;

        card.addEventListener('click', function () {
            clickTimer = setTimeout(function () {
                const category = card.dataset.category;
                if (!category || category === 'all') {
                    showCards(products);
                } else {
                    const filtered = products.filter(p => p.category === category);
                    showCards(filtered);
                }
                const cardContainer = document.getElementById('cardContainer');
                if (cardContainer) {
                    cardContainer.scrollIntoView({ behavior: 'smooth' });
                }
            }, 250);
        });

        card.addEventListener('dblclick', function () {
            clearTimeout(clickTimer);
            const category = card.dataset.category;
            if (category === 'handicraft') window.location.href = 'pages/handicraft/index.html';
            if (category === 'organic') window.location.href = 'pages/organic/index.html';
            if (category === 'clothing') window.location.href = 'pages/clothing/index.html';
            if (category === 'home') window.location.href = 'pages/home/index.html';
        });
    });

    const Shop = document.querySelector(".shop_now");
    const Expo = document.querySelector(".Explore");

    if (Shop) {
        Shop.addEventListener('click', function () {
            const cardContainer = document.getElementById('cardContainer');
            if (cardContainer) {
                cardContainer.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    if (Expo) {
        Expo.addEventListener('click', function () {
            const cardContainer = document.getElementById('cardContainer');
            if (cardContainer) {
                cardContainer.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    const logo = document.getElementById('logo');
    if (logo) {
        logo.addEventListener('click', () => {
            const boody = document.querySelector('.boody');
            if (boody) {
                boody.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', function () {
            if (window.scrollY > 300) {
                backToTop.style.display = 'block';
            } else {
                backToTop.style.display = 'none';
            }
        });
    }
}
