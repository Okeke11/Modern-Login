// server.js
const bcrypt = require('bcryptjs');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware (Allows the frontend to talk to backend)
app.use(cors());
app.use(bodyParser.json());

// 1. Connect to MongoDB
// Note: If you don't have local Mongo, replace this string with your Atlas connection string
mongoose.connect('mongodb://localhost:27017/auth_demo')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ DB Connection Error:', err));

// 2. Create the User Blueprint (Schema)
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

// 3. Create the Routes (The API Endpoints)

app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Scramble the password 10 times (Salt)
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        
        await newUser.save();
        res.status(201).json({ message: 'User created successfully!' });
    } catch (error) {
        res.status(400).json({ error: 'Error creating user' });
    }
});

// UPDATE LOGIN ROUTE
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'User not found' });

        // Compare the typed password with the scrambled one in the DB
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (isMatch) {
            res.json({ message: 'Login Successful!', username: user.username });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Start the Server
app.listen(5000, () => {
    console.log('Server running on port 5000');
});