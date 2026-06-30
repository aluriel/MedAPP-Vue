const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const db = require('../lib/supabase');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  const { data, error } = await db.from('sheets').select('*').eq('username', req.username).order('sort_order');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  const { name, sort_order } = req.body;
  const row = {
    id: crypto.randomUUID(),
    username: req.username,
    name,
    sort_order,
    created_at: Date.now(),
  };
  const { data, error } = await db.from('sheets').insert(row).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.patch('/:id', async (req, res) => {
  const { name } = req.body;
  const { data, error } = await db.from('sheets').update({ name }).eq('id', req.params.id).eq('username', req.username).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.delete('/:id', async (req, res) => {
  const { error } = await db.from('sheets').delete().eq('id', req.params.id).eq('username', req.username);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

module.exports = router;
