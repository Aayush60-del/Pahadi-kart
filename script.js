const SUPABASE_URL = 'https://bkbwsdjnlswppbezmvig.supabase.co';
const SUPABASE_KEY = 'sb_publishable_FF0gpAOw9R8Abcnex94cww_-7oDtq4q';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const cartBadge = document.getElementById('cartBadge');
const toast = document.getElementById('toast');

let cartCount = parseInt(localStorage.getItem('cartCount')) || 0;
cartBadge.innerHTML = cartCount;
if (cartCount > 0) cartBadge.style.display = 'flex';

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
hamburgerBtn.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
    hamburgerBtn.classList.toggle('active');
});

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
        loginModal.classList.add('active');
        overlay.classList.add('active');
    });
});

modalClose.addEventListener('click', function () {
    loginModal.classList.remove('active');
    overlay.classList.remove('active');
});
overlay.addEventListener('click', function () {
    loginModal.classList.remove('active');
    overlay.classList.remove('active');
});

document.getElementById('loginBtn').addEventListener('click', async function () {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passInput').value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert('❌ ' + error.message);
        return;
    }

    loginModal.classList.remove('active');
    overlay.classList.remove('active');
    updateAuthUI(data.user);
    toast.innerHTML = '✅ Login successful!';
    toast.style.backgroundColor = '#4caf50';
    toast.style.display = 'flex';
    setTimeout(() => toast.style.display = 'none', 2000);
});

document.querySelector('.signup-link').addEventListener('click', async function () {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passInput').value;

    if (!email || !password) {
        alert('Email aur password daalo!');
        return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password
    });

    if (error) {
        alert('❌ ' + error.message);
        return;
    }

    loginModal.classList.remove('active');
    overlay.classList.remove('active');
    toast.innerHTML = '🎉 Account created!';
    toast.style.backgroundColor = '#4caf50';
    toast.style.display = 'flex';
    setTimeout(() => toast.style.display = 'none', 2000);
});

function updateAuthUI(user) {
    const loginBtn = document.querySelector('.head_sec button');
    if (user) {
        loginBtn.innerHTML = `<img src="images/Svg/admin.svg"><h3>${user.email.split('@')[0]}</h3>`;
        loginBtn.onclick = async function () {
            await supabaseClient.auth.signOut();
            loginBtn.innerHTML = `<img src="images/Svg/admin.svg"><h3>Login</h3>`;
            loginBtn.onclick = null;
            toast.innerHTML = '👋 Logged out!';
            toast.style.backgroundColor = '#e53935';
            toast.style.display = 'flex';
            setTimeout(() => toast.style.display = 'none', 2000);
        };
    }
}

supabaseClient.auth.getSession().then(({ data: { session } }) => {
    if (session) {
        updateAuthUI(session.user);
    }
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
    cardContainer.innerHTML = '';
    filteredProducts.forEach(function (product) {
        const [badgeClass, badgeLabel] = getBadge(product.name);
        cardContainer.innerHTML += `
            <div class="card">
                <div class="show" style="background-image: url('${product.image}')"></div>
                <button class="wishlist-btn">🤍</button>
                <span class="card-badge ${badgeClass}">${badgeLabel}</span>
                <h2>${product.name}</h2>
                <h2>${product.rating}</h2>
                <h2>${product.price}</h2>
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
    const { data, error } = await supabaseClient
        .from('products')
        .select('*');

    if (error) {
        console.log('Supabase Error:', error);
        return;
    }

    products = data;
    showCards(products);
}

fetchProducts();

function attachCartButtons() {
    const addToCartBtns = document.querySelectorAll('.add-cart-btn');
    addToCartBtns.forEach(function (button) {
        button.addEventListener('click', async function () {
            const card = button.closest('.card');
            const name = card.querySelectorAll('h2')[0].innerHTML;
            const rating = card.querySelectorAll('h2')[1].innerHTML;
            const price = card.querySelectorAll('h2')[2].innerHTML;
            const image = card.querySelector('.show').style.backgroundImage.slice(5, -2);

            const { data: { session } } = await supabaseClient.auth.getSession();

            if (!session) {
                toast.innerHTML = '⚠️ Please login !';
                toast.style.backgroundColor = '#e53935';
                toast.style.display = 'flex';
                setTimeout(() => toast.style.display = 'none', 2000);
                return;
            }

            // Check karo already cart mein hai ya nahi
            const { data: existing } = await supabaseClient
                .from('cart')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('name', name);

            if (existing && existing.length > 0) {
                // Quantity badhao
                await supabaseClient
                    .from('cart')
                    .update({ quantity: existing[0].quantity + 1 })
                    .eq('id', existing[0].id);
            } else {
                await supabaseClient
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
            cartBadge.innerHTML = cartCount;
            cartBadge.style.display = 'flex';
            localStorage.setItem('cartCount', cartCount);
            toast.innerHTML = '✅ Added to cart!';
            toast.style.backgroundColor = '#4caf50';
            toast.style.display = 'flex';
            setTimeout(() => toast.style.display = 'none', 2000);
        });
    });
}

function attachWishlistButtons() {
    const wishlistBtns = document.querySelectorAll('.wishlist-btn');
    wishlistBtns.forEach(function (btn) {
        const productName = btn.closest('.card').querySelector('h2').innerHTML;

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
        mobileNav.classList.remove('open');
        hamburgerBtn.classList.remove('active');
    });
});

const subscribeBtn = document.querySelector('.foot4-span button');
const emailInput = document.getElementById('f4');
subscribeBtn.addEventListener('click', function () {
    let mail = emailInput.value.trim();
    if (mail === "") {
        toast.innerHTML = '❌ Email is empty!';
        toast.style.backgroundColor = '#e53935';
        toast.style.display = 'flex';
        setTimeout(function () { toast.style.display = 'none'; }, 2000);
        return;
    }
    if (!mail.includes('@')) {
        toast.innerHTML = '❌ Invalid email!';
        toast.style.backgroundColor = '#e53935';
        toast.style.display = 'flex';
        setTimeout(function () { toast.style.display = 'none'; }, 2000);
        return;
    }
    toast.innerHTML = '🎉 Subscribed successfully!';
    toast.style.backgroundColor = '#4caf50';
    toast.style.display = 'flex';
    emailInput.value = '';
    setTimeout(function () { toast.style.display = 'none'; }, 2000);
});

const exploreBtn = document.querySelector('.context button');
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
        toast.style.display = 'none';
        toast.style.backgroundColor = '#4caf50';
        toast.innerHTML = '✅ Added to cart!';
        toast.style.flexDirection = 'row';
        toast.style.padding = '12px 25px';
        toast.style.fontSize = '15px';
        toast.style.maxWidth = 'none';
        toast.style.textAlign = 'center';
    }, 4000);
});

const searchInput = document.querySelector(".src");
searchInput.addEventListener('keyup', function () {
    let searchText = searchInput.value.toLowerCase().trim();
    if (searchText === "") {
        showCards(products);
        return;
    }
    const filtered = products.filter(function (product) {
        return product.name.toLowerCase().includes(searchText);
    });
    showCards(filtered);
});

const viewAll = document.querySelector(".view_all");
if (viewAll) {
    viewAll.addEventListener('click', function () {
        showCards(products);
        mobileNav.classList.remove('open');
        hamburgerBtn.classList.remove('active');
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
            document.getElementById('cardContainer').scrollIntoView({ behavior: 'smooth' });
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
        document.getElementById('cardContainer').scrollIntoView({ behavior: 'smooth' });
    });
}

if (Expo) {
    Expo.addEventListener('click', function () {
        document.getElementById('cardContainer').scrollIntoView({ behavior: 'smooth' });
    });
}

const logo = document.getElementById('logo');
if (logo) {
    logo.addEventListener('click', () => {
        document.querySelector('.boody').scrollIntoView({ behavior: 'smooth' });
    });
}

document.getElementById('backToTop').addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('scroll', function () {
    const btn = document.getElementById('backToTop');
    if (window.scrollY > 300) {
        btn.style.display = 'block';
    } else {
        btn.style.display = 'none';
    }
});