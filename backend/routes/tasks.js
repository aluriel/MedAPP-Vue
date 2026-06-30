const express = require('express');
const router = express.Router();
const db = require('../lib/supabase');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  const { sheetId } = req.query;
  const { data, error } = await db.from('tasks').select('*').eq('username', req.username).eq('sheet_id', sheetId).order('sort_order');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const row = {
    created_date: today,
    ...req.body,
    username: req.username,
    created_at: Date.now(),
  };
  const { data, error } = await db.from('tasks').insert(row).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.patch('/:id', async (req, res) => {
  const { data, error } = await db.from('tasks').update(req.body).eq('id', req.params.id).eq('username', req.username).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.delete('/:id', async (req, res) => {
  const { error } = await db.from('tasks').delete().eq('id', req.params.id).eq('username', req.username);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

module.exports = router;
