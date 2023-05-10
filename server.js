const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const mime = require('mime');

const app = express();
const port = process.env.PORT || 3000;

function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
      return;
    }
    console.log('Users table created or already exists');
  });
}


// Connect to the database
const db = new sqlite3.Database('database.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});

initializeDatabase();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Add the following lines to serve the bundle.js file
app.use(express.static(path.join(__dirname, 'public')));
app.get('/bundle.js', (req, res) => {
  const filePath = __dirname + '/public/bundle.js';
  const mimeType = mime.getType(filePath);

  res.setHeader('Content-Type', mimeType);
  res.sendFile(filePath);
});

app.post('/submitData', (req, res) => {
  const name = req.body.name;
  const age = req.body.age;

  db.run('INSERT INTO users (name, age) VALUES (?, ?)', [name, age], function(err) {
    if (err) {
      console.log(err.message);
      res.status(500).json({ message: `Failed to insert record. ${err.message}` });
      return;
    }
    console.log(`A row has been inserted with rowid ${this.lastID}`);

    res.status(200).json({ message: `${name} is ${age} years old` });
  });
});

app.get('/searchAge/:name', (req, res) => {
  const name = req.params.name;

  db.get('SELECT age FROM users WHERE name = ?', [name], function(err, row) {
    if (err) {
      console.log(err.message);
      res.status(500).json({ message: 'Failed to retrieve record.' });
      return;
    }
    if (!row) {
      console.log(`No record found for ${name}`);
      res.status(404).json({ message: `No record found for ${name}` });
      return;
    }
    console.log(`${name} is ${row.age} years old`);
    res.status(200).json({ message: `${name} is ${row.age} years old` });
  });
});

app.post('/clearData', (req, res) => {
  db.run('DELETE FROM users', function(err) {
    if (err) {
      console.log(err.message);
      res.status(500).json({ message: 'Failed to clear records.' });
      return;
    }
    console.log(`All rows have been deleted`);

    res.status(200).json({ message: 'All records have been deleted.' });
  });
});

// Listen for incoming requests
app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
