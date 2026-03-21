const SUPABASE_URL = 'https://bkbwsdjnlswppbezmvig.supabase.co';
const SUPABASE_KEY = 'sb_publishable_FF0gpAOw9R8Abcnex94cww_-7oDtq4q';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const cardContainer = document.getElementById('cardContainer');
const toast = document.getElementById('toast');
let cartCount = parseInt(localStorage.getItem('cartCount')) || 0;

async function fetchProducts() {
    const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('category', 'handicraft');

    if (error) { console.log('Error:', error); return; }
    showCards(data);
}

fetchProducts();

function showCards(list) {
    cardContainer.innerHTML = '';
    document.getElementById('productCount').innerHTML = `Showing ${list.length} products`;
    list.forEach(function (product) {
        cardContainer.innerHTML += `
            <div class="card">
                <div class="show" style="background-image: url('../../${product.image}')"></div>
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
    fetchProducts();
});

document.querySelector('.src').addEventListener('keyup', async function () {
    const text = this.value.toLowerCase();
    const { data } = await supabaseClient
        .from('products')
        .select('*')
        .eq('category', 'handicraft')
        .ilike('name', `%${text}%`);
    showCards(data || []);
});