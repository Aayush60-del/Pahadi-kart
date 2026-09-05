import { useMemo, useState } from 'react'
import mountainImage from '../../images/Jpg/back.jpg'
import shawlImage from '../../images/Jpg/pashmin_shawal.jpg'
import honeyImage from '../../images/Web/honey.webp'
import craftImage from '../../images/Web/wooden_craft.webp'
import bowlImage from '../../images/Web/bowl.webp'
import candleImage from '../../images/Web/candel.webp'
import jacketImage from '../../images/Web/woolen_jacket.webp'
import boatImage from '../../images/Web/Boat.webp'
import artisanImage from '../../images/Jpg/old_man.jpg'
import './App.css'

const products = [
  { id: 1, name: 'Kumaoni Pashmina Shawl', category: 'Handwoven', price: 2490, image: shawlImage, tone: '#e4d2bf', rating: '4.9' },
  { id: 2, name: 'Wild Forest Honey', category: 'From the hills', price: 680, image: honeyImage, tone: '#f3d27a', rating: '4.8' },
  { id: 3, name: 'Carved Cedar Keepsake', category: 'Handcrafted', price: 1290, image: craftImage, tone: '#d9b582', rating: '4.9' },
  { id: 4, name: 'Himalayan Stoneware Bowl', category: 'Artisan home', price: 990, image: bowlImage, tone: '#d7d1c3', rating: '4.7' },
  { id: 5, name: 'Beeswax Scented Candle', category: 'Hand-poured', price: 540, image: candleImage, tone: '#e8c697', rating: '4.8' },
  { id: 6, name: 'Woollen Mountain Jacket', category: 'Handwoven', price: 3290, image: jacketImage, tone: '#c9beb5', rating: '4.9' },
  { id: 7, name: 'Pinewood Serving Boat', category: 'Handcrafted', price: 1150, image: boatImage, tone: '#caa27d', rating: '4.7' },
]

const Icon = ({ name, size = 20, stroke = 1.8 }) => {
  const paths = {
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    heart: <path d="M20.8 5.9a5.5 5.5 0 0 0-7.8 0L12 7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.3 1-1a5.5 5.5 0 0 0 0-7.8Z" />,
    bag: <><path d="M5 8.5h14l1 13H4l1-13Z" /><path d="M8.5 9V6a3.5 3.5 0 0 1 7 0v3" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M4.7 21a7.3 7.3 0 0 1 14.6 0" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    star: <path d="m12 3 2.75 5.57L21 9.48l-4.5 4.38 1.06 6.18L12 17.15l-5.56 2.89 1.06-6.18L3 9.48l6.25-.91L12 3Z" />,
    leaf: <><path d="M20.5 3.5C11 4 5 8.8 5.1 16.4c.1 2.5 1.5 4.1 3.3 4.1 7.6.1 12.4-5.9 12.1-17Z" /><path d="M4 21c3.1-5.1 7.7-8.9 13.8-11.5" /></>,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>, minus: <path d="M5 12h14" />, close: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>, check: <path d="m5 12 4.2 4.2L19 6.5" />,
  }
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function App() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [favorites, setFavorites] = useState([])
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const filteredProducts = useMemo(() => products.filter((product) => (activeCategory === 'All' || product.category === activeCategory) && product.name.toLowerCase().includes(query.toLowerCase())), [activeCategory, query])
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const showNotice = (message) => { setNotice(message); window.setTimeout(() => setNotice(''), 2400) }
  const toggleFavorite = (id) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const addToCart = (product) => { setCart((current) => { const existing = current.find((item) => item.id === product.id); return existing ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }] }); showNotice(`${product.name} added to your bag`) }
  const updateQuantity = (id, delta) => setCart((current) => current.flatMap((item) => item.id === id ? (item.quantity + delta > 0 ? [{ ...item, quantity: item.quantity + delta }] : []) : [item]))

  return <div className="app-shell">
    <div className="shipping-strip"><span>Complimentary shipping on orders above ₹1,499</span><span className="strip-dot" /><span>Made slowly in the Himalayas</span></div>
    <header className="site-header"><a className="brand" href="#top" aria-label="PahadiKart home"><span className="brand-mark"><Icon name="leaf" size={18} /></span><span>Pahadi<span>Kart</span></span></a><nav className="desktop-nav" aria-label="Main navigation"><a href="#shop">Shop</a><a href="#story">Our story</a><a href="#journal">Journal</a></nav><label className="search-box"><Icon name="search" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the mountains" aria-label="Search products" /></label><div className="header-actions"><button className="icon-button" aria-label="Account"><Icon name="user" size={20} /></button><button className="icon-button" aria-label="Saved products"><Icon name="heart" size={20} /><span className={favorites.length ? 'count-dot visible' : 'count-dot'}>{favorites.length}</span></button><button className="bag-button" onClick={() => setCartOpen(true)} aria-label="Open bag"><Icon name="bag" size={20} /><span>Bag</span>{cartCount > 0 && <b>{cartCount}</b>}</button></div></header>
    <main id="top">
      <section className="hero-section"><div className="hero-copy"><p className="eyebrow"><span />Rooted in the Himalayas</p><h1>Objects with a<br /><em>mountain soul.</em></h1><p className="hero-description">Thoughtfully sourced goods that carry the care, craft and quiet beauty of the hills into your everyday.</p><a className="primary-button" href="#shop">Explore the collection <Icon name="arrow" size={18} /></a><div className="hero-trust"><div className="avatars"><span>AK</span><span>RS</span><span>NB</span></div><p><strong>4.9 / 5 from 1,200+ customers</strong><br />Loved from the foothills to your home</p></div></div><div className="hero-art"><img src={mountainImage} alt="Himalayan mountains at sunrise" /><div className="sun-glow" /><div className="hero-note"><span><Icon name="leaf" size={18} /></span><p>From <strong>small hill communities</strong><br />to your everyday rituals.</p></div><div className="vertical-label">UTTARAKHAND · INDIA</div></div></section>
      <section className="category-rail" aria-label="Shop by category">{['All','Handwoven','From the hills','Handcrafted','Artisan home'].map((category) => <button key={category} onClick={() => setActiveCategory(category)} className={activeCategory === category ? 'active' : ''}>{category === 'All' ? 'Everything' : category}</button>)}</section>
      <section className="shop-section" id="shop"><div className="section-heading"><div><p className="eyebrow"><span />The essentials</p><h2>Made for the way<br />you <em>live.</em></h2></div><a href="#shop" className="text-link">View all pieces <Icon name="arrow" size={17} /></a></div><div className="products-grid">{filteredProducts.map((product) => <article className="product-card" key={product.id}><div className="product-image" style={{ backgroundColor: product.tone }}><img src={product.image} alt={product.name} /><button className={favorites.includes(product.id) ? 'save-button saved' : 'save-button'} onClick={() => toggleFavorite(product.id)} aria-label={`Save ${product.name}`}><Icon name="heart" size={18} /></button><span className="product-tag">{product.category}</span><button className="quick-add" onClick={() => addToCart(product)}>Add to bag <Icon name="plus" size={17} /></button></div><div className="product-meta"><div><h3>{product.name}</h3><p><Icon name="star" size={13} stroke={2.3} /> {product.rating}</p></div><strong>₹{product.price.toLocaleString('en-IN')}</strong></div></article>)}</div>{!filteredProducts.length && <div className="empty-state"><Icon name="search" size={30} /><h3>No pieces found</h3><button onClick={() => { setQuery(''); setActiveCategory('All') }}>Clear filters</button></div>}</section>
      <section className="story-section" id="story"><div className="story-image"><img src={artisanImage} alt="Local artisan at work" /><div className="story-stamp">crafted<br />with care <span>✦</span></div></div><div className="story-copy"><p className="eyebrow"><span />Why PahadiKart</p><h2>The best things<br />take the <em>scenic route.</em></h2><p>We work directly with the makers, growers and families who know these hills by heart. Every order keeps traditional skill in motion and brings you closer to where your things come from.</p><div className="story-points"><div><span>01</span><p><strong>Made in small batches</strong>Thoughtful goods, never factory-made.</p></div><div><span>02</span><p><strong>Fair to every hand</strong>More of your purchase goes to the maker.</p></div></div><a className="outline-button" href="#journal">Meet the makers <Icon name="arrow" size={18} /></a></div></section>
      <section className="newsletter" id="journal"><div><p className="eyebrow"><span />A note from the hills</p><h2>Good things,<br /><em>occasionally.</em></h2></div><div><p>New collections, makers’ stories and a little mountain air, delivered at an unhurried pace.</p><form onSubmit={(event) => { event.preventDefault(); showNotice('You’re on the list — welcome to the hills.') }}><input type="email" required placeholder="Your email address" aria-label="Email address" /><button type="submit" aria-label="Subscribe"><Icon name="arrow" size={20} /></button></form></div></section>
    </main>
    <footer><a className="brand" href="#top"><span className="brand-mark"><Icon name="leaf" size={18} /></span><span>Pahadi<span>Kart</span></span></a><p>Thoughtful goods from the Indian Himalayas.</p><span>© 2026 PahadiKart</span></footer>
    {notice && <div className="toast"><Icon name="check" size={18} />{notice}</div>}
    {cartOpen && <><button className="drawer-scrim" onClick={() => setCartOpen(false)} aria-label="Close bag" /><aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping bag"><div className="cart-head"><div><p className="eyebrow"><span />Your selections</p><h2>Shopping bag <small>({cartCount})</small></h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close bag"><Icon name="close" /></button></div>{cart.length ? <><div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><img src={item.image} alt="" /><div><h3>{item.name}</h3><p>{item.category}</p><strong>₹{item.price.toLocaleString('en-IN')}</strong></div><div className="quantity"><button onClick={() => updateQuantity(item.id, -1)} aria-label="Remove one"><Icon name="minus" size={14} /></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.id, 1)} aria-label="Add one"><Icon name="plus" size={14} /></button></div></div>)}</div><div className="cart-footer"><p><span>Subtotal</span><strong>₹{cartTotal.toLocaleString('en-IN')}</strong></p><small>Shipping and taxes calculated at checkout.</small><button className="primary-button checkout" onClick={() => showNotice('Checkout is ready to connect to your payment flow.')}>Checkout securely <Icon name="arrow" size={18} /></button></div></> : <div className="empty-cart"><Icon name="bag" size={35} /><h3>Your bag is waiting</h3><p>Find something made with care.</p><button className="outline-button" onClick={() => setCartOpen(false)}>Explore pieces</button></div>}</aside></>}
  </div>
}
export default App
