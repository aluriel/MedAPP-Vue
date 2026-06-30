require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/sheets',      require('./routes/sheets'));
app.use('/tasks',       require('./routes/tasks'));
app.use('/completions', require('./routes/completions'));

app.listen(PORT, () => console.log(`Backend on http://localhost:${PORT}`));
