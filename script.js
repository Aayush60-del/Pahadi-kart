let cartCount = 0;
const cartBadge = document.getElementById('cartBadge');
const toast = document.getElementById('toast');


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


const products = [
    { name: "Pashmina Shawl", price: "₹1299", rating: "⭐ 4.8", category: "handicraft", image: "pashmin_shawal.jpg" },
    { name: "Organic Honey", price: "₹499", rating: "⭐ 4.6", category: "organic", image: "honey.webp" },
    { name: "Wooden Craft", price: "₹899", rating: "⭐ 4.7", category: "handicraft", image: "wooden_craft.webp" },
    { name: "Woolen Jacket", price: "₹2199", rating: "⭐ 4.5", category: "clothing", image: "woolen_jacket.webp" },
    { name: "Handmade Candles", price: "₹349", rating: "⭐ 4.9", category: "organic", image: "candel.webp" },
];


const cardContainer = document.getElementById('cardContainer');

function showCards(filteredProducts) {
    cardContainer.innerHTML = '';

    filteredProducts.forEach(function (product) {
        cardContainer.innerHTML += `
            <div class="card">
                <div class="show" style="background-image: url('${product.image}')"></div>
                <button class="wishlist-btn">🤍</button>
                <h2>${product.name}</h2>
                <h2>${product.rating}</h2>
                <h2>${product.price}</h2>
                <button class="add-cart-btn flex_">
                    <img src="cart.svg">
                    <h4>Add to cart</h4>
                </button>
            </div>
        `;
    });

    attachCartButtons();
    attachWishlistButtons();
}


showCards(products);


function attachCartButtons() {
    const addToCartBtns = document.querySelectorAll('.add-cart-btn');
    addToCartBtns.forEach(function (button) {
        button.addEventListener('click', function () {
            cartCount = cartCount + 1;
            cartBadge.innerHTML = cartCount;
            cartBadge.style.display = 'flex';
            toast.innerHTML = '✅ Added to cart!';
            toast.style.backgroundColor = '#4caf50';
            toast.style.display = 'flex';
            setTimeout(function () { toast.style.display = 'none'; }, 2000);
        });
    });
}


function attachWishlistButtons() {
    const wishlistBtns = document.querySelectorAll('.wishlist-btn');
    wishlistBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (btn.classList.contains('liked')) {
                btn.classList.remove('liked');
                btn.innerHTML = '🤍';
            } else {
                btn.classList.add('liked');
                btn.innerHTML = '❤️';
            }
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

    if (mail == "") {
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

searchInput.addEventListener('keyup', async function() {
    let searchText = searchInput.value.toLowerCase().trim();
    
    if (searchText === "") {
        showCards(products);
        return;
    }

    const filtered = products.filter(function(product) {
        return product.name.toLowerCase().includes(searchText);
    });

    showCards(filtered);
});