const express = require('express');
const router = express.Router();
const db = require('../lib/supabase');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  const { date } = req.query;
  let q = db.from('completions').select('*').eq('username', req.username);
  if (date) q = q.eq('date', date);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  const { task_id, date } = req.body;
  const { data, error } = await db.from('completions').insert({ username: req.username, task_id, date }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.delete('/', async (req, res) => {
  const { task_id, date } = req.body;
  const { error } = await db.from('completions').delete().eq('username', req.username).eq('task_id', task_id).eq('date', date);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

module.exports = router;
