const products = [
    { name: "Woolen Jacket", price: "₹2199", rating: "⭐ 4.5", image: "../../woolen_jacket.webp" },
    { name: "Pahadi Kurti", price: "₹899", rating: "⭐ 4.7", image: "../../brand.png" },
    { name: "Woolen Shawl", price: "₹1499", rating: "⭐ 4.8", image: "../../pashmin_shawal.jpg" },
];

const cardContainer = document.getElementById('cardContainer');
const toast = document.getElementById('toast');
let cartCount = parseInt(localStorage.getItem('cartCount')) || 0;

function showCards(list) {
    cardContainer.innerHTML = '';
    document.getElementById('productCount').innerHTML = `Showing ${list.length} products`;
    list.forEach(function (product) {
        cardContainer.innerHTML += `
            <div class="card">
                <div class="show" style="background-image: url('${product.image}')"></div>
                <div class="card-info">
                    <h2>${product.name}</h2>
                    <p class="rating">${product.rating}</p>
                    <p class="price">${product.price}</p>
                </div>
                <button class="add-cart-btn">🛒 Add to cart</button>
            </div>
        `;
    });
    attachCartButtons();
}

showCards(products);

function attachCartButtons() {
    document.querySelectorAll('.add-cart-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            cartCount++;
            localStorage.setItem('cartCount', cartCount);
            toast.style.display = 'flex';
            setTimeout(() => toast.style.display = 'none', 2000);
        });
    });
}

document.getElementById('sortSelect').addEventListener('change', function () {
    let sorted = [...products];
    if (this.value === 'low') sorted.sort((a, b) => parseInt(a.price.replace(/\D/g, '')) - parseInt(b.price.replace(/\D/g, '')));
    if (this.value === 'high') sorted.sort((a, b) => parseInt(b.price.replace(/\D/g, '')) - parseInt(a.price.replace(/\D/g, '')));
    showCards(sorted);
});

document.querySelector('.src').addEventListener('keyup', function () {
    const text = this.value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(text));
    showCards(filtered);
});