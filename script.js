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
    const toast = document.getElementById('toast');
    let products = [];
    let currentUser = null;

    // Initialize UI
    function initializeUI() {
        updateCartBadge();
        updateWishlistBadge();
        setupEventListeners();
        fetchProducts();
        checkExistingSession();
    }

    // Update cart badge from localStorage and Supabase
    async function updateCartBadge() {
        try {
            const { data: { session } } = await window.supabaseClient.auth.getSession();
            
            if (session) {
                // Get actual cart count from Supabase
                const { data: cartItems, error } = await window.supabaseClient
                    .from('cart')
                    .select('quantity')
                    .eq('user_id', session.user.id);
                
                if (!error && cartItems) {
                    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
                    setCartBadgeUI(cartCount);
                    localStorage.setItem('cartCount', cartCount);
                }
            } else {
                // Use localStorage count for non-logged in users
                const cartCount = parseInt(localStorage.getItem('cartCount')) || 0;
                setCartBadgeUI(cartCount);
            }
        } catch (err) {
            console.error('Cart badge update error:', err);
            // Fallback to localStorage
            const cartCount = parseInt(localStorage.getItem('cartCount')) || 0;
            setCartBadgeUI(cartCount);
        }
    }

    function setCartBadgeUI(count) {
        const mobileBadge = document.getElementById('cartBadge');
        const desktopBadge = document.getElementById('cartBadgeDesktop');
        
        if (mobileBadge) {
            mobileBadge.innerHTML = count;
            mobileBadge.style.display = count > 0 ? 'flex' : 'none';
        }
        if (desktopBadge) {
            desktopBadge.innerHTML = count;
            desktopBadge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    // Update wishlist badge
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

    // Setup all event listeners
    function setupEventListeners() {
        // Mobile navigation
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const mobileNav = document.getElementById('mobileNav');
        if (hamburgerBtn && mobileNav) {
            hamburgerBtn.addEventListener('click', () => {
                mobileNav.classList.toggle('open');
                hamburgerBtn.classList.toggle('active');
            });
        }

        // Login modal
        setupLoginModal();

        // Category filters
        setupCategoryFilters();

        // Search functionality
        setupSearch();

        // Subscribe button
        setupSubscribe();

        // Navigation buttons
        setupNavigation();

        // Scroll animations
        setupScrollAnimations();
    }

    // Login modal setup
    function setupLoginModal() {
        const loginModal = document.getElementById('loginModal');
        const overlay = document.getElementById('overlay');
        const modalClose = document.getElementById('modalClose');

        // Open login modal
        const allLoginBtns = document.querySelectorAll('.head_sec button, .mobile-nav button');
        allLoginBtns.forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                // Skip if this is the logout button
                if (btn.textContent.includes('Login') === false && btn.querySelector('h3')?.textContent !== 'Login') {
                    return;
                }
                
                if (loginModal && overlay) {
                    loginModal.classList.add('active');
                    overlay.classList.add('active');
                }
            });
        });

        // Close modal
        if (modalClose) {
            modalClose.addEventListener('click', function () {
                closeModal();
            });
        }
        
        if (overlay) {
            overlay.addEventListener('click', function () {
                closeModal();
            });
        }

        // Login functionality
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', handleLogin);
        }

        // Signup functionality
        const signupLink = document.querySelector('.signup-link');
        if (signupLink) {
            signupLink.addEventListener('click', handleSignup);
        }
    }

    function closeModal() {
        const loginModal = document.getElementById('loginModal');
        const overlay = document.getElementById('overlay');
        if (loginModal && overlay) {
            loginModal.classList.remove('active');
            overlay.classList.remove('active');
        }
    }

    async function handleLogin() {
        const emailInput = document.getElementById('emailInput');
        const passInput = document.getElementById('passInput');
        
        if (!emailInput || !passInput) {
            showToast('Login form not found!', '#e53935');
            return;
        }

        const email = emailInput.value.trim();
        const password = passInput.value;

        if (!email || !password) {
            showToast('Please enter email and password', '#e53935');
            return;
        }

        try {
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                showToast('Login failed: ' + error.message, '#e53935');
                return;
            }

            currentUser = data.user;
            closeModal();
            updateAuthUI(data.user);
            updateCartBadge(); // Refresh cart count after login
            showToast('Login successful!', '#4caf50');
            
            // Clear form
            emailInput.value = '';
            passInput.value = '';
            
        } catch (err) {
            console.error('Login error:', err);
            showToast('Login failed. Please try again.', '#e53935');
        }
    }

    async function handleSignup() {
        const emailInput = document.getElementById('emailInput');
        const passInput = document.getElementById('passInput');
        
        if (!emailInput || !passInput) {
            showToast('Signup form not found!', '#e53935');
            return;
        }

        const email = emailInput.value.trim();
        const password = passInput.value;

        if (!email || !password) {
            showToast('Please enter email and password', '#e53935');
            return;
        }

        try {
            const { data, error } = await window.supabaseClient.auth.signUp({
                email: email,
                password: password
            });

            if (error) {
                showToast('Signup failed: ' + error.message, '#e53935');
                return;
            }

            closeModal();
            showToast('Account created! Please check your email to verify.', '#4caf50');
            
            // Clear form
            emailInput.value = '';
            passInput.value = '';
            
        } catch (err) {
            console.error('Signup error:', err);
            showToast('Signup failed. Please try again.', '#e53935');
        }
    }

    function updateAuthUI(user) {
        const loginBtns = document.querySelectorAll('.head_sec button, .mobile-nav button');
        
        if (user && loginBtns) {
            loginBtns.forEach(btn => {
                const h3 = btn.querySelector('h3');
                if (h3) {
                    h3.textContent = user.email.split('@')[0];
                    btn.onclick = async function () {
                        await handleLogout();
                    };
                }
            });
        }
    }

    async function handleLogout() {
        try {
            await window.supabaseClient.auth.signOut();
            currentUser = null;
            
            // Reset login buttons
            const loginBtns = document.querySelectorAll('.head_sec button, .mobile-nav button');
            loginBtns.forEach(btn => {
                const h3 = btn.querySelector('h3');
                if (h3) {
                    h3.textContent = 'Login';
                    btn.onclick = null;
                }
            });
            
            updateCartBadge(); // Refresh cart count
            showToast('Logged out successfully!', '#e53935');
        } catch (err) {
            console.error('Logout error:', err);
            showToast('Logout failed', '#e53935');
        }
    }

    // Check existing session
    async function checkExistingSession() {
        try {
            const { data: { session } } = await window.supabaseClient.auth.getSession();
            if (session) {
                currentUser = session.user;
                updateAuthUI(session.user);
                updateCartBadge();
            }
        } catch (err) {
            console.error('Session check error:', err);
        }
    }

    // Fetch products
    async function fetchProducts() {
        const cardContainer = document.getElementById('cardContainer');
        if (!cardContainer) return;

        try {
            // Show loading state
            cardContainer.innerHTML = '<div class="loading">Loading products...</div>';
            
            const { data, error } = await window.supabaseClient
                .from('products')
                .select('*');

            if (error) {
                console.error('Supabase Error:', error);
                cardContainer.innerHTML = '<div class="error">Failed to load products. Please try again later.</div>';
                return;
            }

            products = data || [];
            showCards(products);
            
        } catch (err) {
            console.error('Fetch products error:', err);
            cardContainer.innerHTML = '<div class="error">Failed to load products. Please check your connection.</div>';
        }
    }

    // Get product badge
    function getBadge(name) {
        const n = name.toLowerCase();
        if (n.includes('honey') || n.includes('organic') || n.includes('spice') || n.includes('tea') || n.includes('rhodo')) return ['organic', 'ORGANIC'];
        if (n.includes('shawl') || n.includes('wool') || n.includes('pashmina') || n.includes('jacket')) return ['handwoven', 'HANDWOVEN'];
        if (n.includes('candle') || n.includes('oil') || n.includes('soap')) return ['natural', 'NATURAL'];
        if (n.includes('wood') || n.includes('craft') || n.includes('artifact') || n.includes('copper') || n.includes('vessel') || n.includes('bowl')) return ['handmade', 'HANDMADE'];
        return ['pahadi', 'PAHADI'];
    }

    // Show products
    function showCards(filteredProducts) {
        const cardContainer = document.getElementById('cardContainer');
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
                    <button class="wishlist-btn" data-name="${product.name}"></button>
                    <span class="card-badge ${badgeClass}">${badgeLabel}</span>
                    <h2>${product.name || 'Unknown Product'}</h2>
                    <h2>${product.rating || '4.5'} stars</h2>
                    <h2>${product.price || 'Price not available'}</h2>
                    <button class="add-cart-btn" data-name="${product.name}" data-price="${product.price || '0'}" data-image="${product.image || ''}">
                        <img src="images/Svg/cart.svg">
                        <h4>Add to cart</h4>
                    </button>
                </div>
            `;
        });
        
        attachCartButtons();
        attachWishlistButtons();
    }

    // Attach cart buttons
    function attachCartButtons() {
        const addToCartBtns = document.querySelectorAll('.add-cart-btn');
        addToCartBtns.forEach(function (button) {
            button.addEventListener('click', async function () {
                const name = this.dataset.name;
                const price = this.dataset.price;
                const image = this.dataset.image;

                try {
                    const { data: { session } } = await window.supabaseClient.auth.getSession();

                    if (!session) {
                        showToast('Please login to add items to cart!', '#e53935');
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

                    updateCartBadge(); // Update badge from Supabase
                    showToast('Added to cart!', '#4caf50');
                    
                } catch (err) {
                    console.error('Add to cart error:', err);
                    showToast('Failed to add to cart', '#e53935');
                }
            });
        });
    }

    // Attach wishlist buttons
    function attachWishlistButtons() {
        const wishlistBtns = document.querySelectorAll('.wishlist-btn');
        wishlistBtns.forEach(function (btn) {
            const productName = btn.dataset.name;
            const saved = JSON.parse(localStorage.getItem('wishlist')) || [];
            
            if (saved.includes(productName)) {
                btn.classList.add('liked');
                btn.innerHTML = 'Heart';
            } else {
                btn.innerHTML = 'Heart';
            }

            btn.addEventListener('click', function () {
                let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
                if (btn.classList.contains('liked')) {
                    btn.classList.remove('liked');
                    wishlist = wishlist.filter(item => item !== productName);
                    showToast('Removed from wishlist', '#e53935');
                } else {
                    btn.classList.add('liked');
                    wishlist.push(productName);
                    showToast('Added to wishlist', '#4caf50');
                }
                localStorage.setItem('wishlist', JSON.stringify(wishlist));
                updateWishlistBadge();
            });
        });
    }

    // Category filters
    function setupCategoryFilters() {
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
                // Close mobile nav
                const mobileNav = document.getElementById('mobileNav');
                const hamburgerBtn = document.getElementById('hamburgerBtn');
                if (mobileNav && hamburgerBtn) {
                    mobileNav.classList.remove('open');
                    hamburgerBtn.classList.remove('active');
                }
            });
        });

        // Category cards
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(function (card) {
            card.addEventListener('click', function () {
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
            });
        });
    }

    // Search functionality
    function setupSearch() {
        const searchInput = document.querySelector('.src');
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
    }

    // Subscribe functionality
    function setupSubscribe() {
        const subscribeBtn = document.querySelector('.subscribeBtn');
        const emailInput = document.getElementById('f4');
        if (subscribeBtn && emailInput) {
            subscribeBtn.addEventListener('click', function () {
                let mail = emailInput.value.trim();
                if (mail === "") {
                    showToast('Email is empty!', '#e53935');
                    return;
                }
                if (!mail.includes('@')) {
                    showToast('Invalid email!', '#e53935');
                    return;
                }
                showToast('Subscribed successfully!', '#4caf50');
                emailInput.value = '';
            });
        }
    }

    // Navigation buttons
    function setupNavigation() {
        const viewAll = document.querySelector('.view_all');
        if (viewAll) {
            viewAll.addEventListener('click', function () {
                showCards(products);
                const cardContainer = document.getElementById('cardContainer');
                if (cardContainer) {
                    cardContainer.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        const Shop = document.querySelector('.shop_now');
        const Expo = document.querySelector('.Explore');

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
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Back to top button
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

    // Scroll animations
    function setupScrollAnimations() {
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
    }

    // Toast notification
    function showToast(message, color = '#4caf50') {
        if (!toast) return;
        toast.innerHTML = message;
        toast.style.backgroundColor = color;
        toast.style.display = 'flex';
        setTimeout(() => toast.style.display = 'none', 3000);
    }

    // Initialize everything
    initializeUI();
}
