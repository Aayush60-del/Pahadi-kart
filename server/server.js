const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'PahadiKart API running' });
});

// Saare products
app.get('/products', async (req, res) => {
    const { data, error } = await supabase
        .from('products')
        .select('*');

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Category ke products
app.get('/products/:category', async (req, res) => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', req.params.category);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Product add karo
app.post('/products', async (req, res) => {
    const { name, price, rating, category, image } = req.body;
    const { data, error } = await supabase
        .from('products')
        .insert([{ name, price, rating, category, image }]);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Product added!', data });
});
app.put('/products/:id', async (req, res) => {
  const { name, price, rating, category, image } = req.body;

  const { data, error } = await supabase
    .from('products')
    .update({ name, price, rating, category, image })
    .eq('id', req.params.id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({
    message: 'Product Updated',
    data: data
  });
});
// Product delete karo
app.delete('/products/:id', async (req, res) => {
    const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Product deleted' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});