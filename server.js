const express = require('express');
// const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg'); // Replace sqlite3 import with pg
const cors = require('cors');
const path = require('path');
const mime = require('mime');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;

// Replace this with your PostgreSQL connection string

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

function initializeDatabase() {
  pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      email TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
      return;
    }
    console.log('Users table created or already exists');
  });
}

initializeDatabase();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

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
  const email = req.body.email;

  pool.query('INSERT INTO users (name, age, email) VALUES ($1, $2, $3) RETURNING id', [name, age, email], (err, result) => {
    if (err) {
      console.log(err.message);
      res.status(500).json({ message: `Failed to insert record. ${err.message}` });
      return;
    }
    console.log(`A row has been inserted with id ${result.rows[0].id}`);

    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      secure: true,
      port: 465,
      auth: {
        user: "cw_pet_proj@zohomail.com",
        pass: "ann66886688",
      },
    });

    const mailOptions = {
      from: 'cw_pet_proj@zohomail.com', 
      to: email, // Use the submitted email as the recipient
      subject: 'Data Submission',
      text: `Name: ${name}\nAge: ${age}\nEmail: ${email}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email.' });
      } else {
        console.log('Email sent:', info.response);
        res.status(200).json({ message: `${name} is ${age} years old` });
      }
    });
  });
});


app.get('/searchAge/:name', (req, res) => {
  const name = req.params.name;

  pool.query('SELECT age FROM users WHERE name = $1', [name], (err, result) => {
    if (err) {
      console.log(err.message);
      res.status(500).json({ message: 'Failed to retrieve record.' });
      return;
    }
    if (result.rowCount === 0) {
      console.log(`No record found for ${name}`);
      res.status(404).json({ message: `No record found for ${name}` });
      return;
    }
    console.log(`${name} is ${result.rows[0].age} years old`);
    res.status(200).json({ message: `${name} is ${result.rows[0].age} years old` });
  });
});

app.post('/clearData', (req, res) => {
  pool.query('DELETE FROM users', (err) => {
    if (err) {
      console.log(err.message);
      res.status(500).json({ message: 'Failed to clear records.' });
      return;
    }
    console.log('All rows have been deleted');

    res.status(200).json({ message: 'All records have been deleted.' });
  });
});

// Listen for incoming requests
app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});