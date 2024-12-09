const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');

// App configuration
const app = express();
const PORT = 3000;
const SECRET_KEY = 'dggehhywynhgwuhjwjiiej';

// Middleware
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(bodyParser.json());

// Database connection
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Qwerty1234+',
    database: 'p29'
};

// Verify JWT token
function tokenRequired(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ message: 'Token is missing!' });
    }

    try {
        jwt.verify(token, SECRET_KEY);
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(403).json({ message: 'Token is expired!' });
        } else {
            return res.status(403).json({ message: 'Invalid token!' });
        }
    }
}

// Routes
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE username = ? AND password = ?',
            [username, password]
        );
        connection.end();

        if (rows.length > 0) {
            const token = jwt.sign({ user: username }, SECRET_KEY, { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).json({ message: 'Invalid credentials!' });
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ message: 'Internal Server Error!' });
    }
});

app.get('/dashboard', (req, res) => {
    const summary = {
        text: (
            "Generative AI refers to a class of algorithms that can generate new content such as images, music, and text. "
            + "This innovative technology has been particularly revolutionary in recent years, with remarkable advances made in "
            + "areas like natural language processing and computer vision. Models like OpenAI's GPT and DALL·E can now generate "
            + "human-like text or create photorealistic images from text prompts. This opens up possibilities in various sectors "
            + "such as entertainment, healthcare, and education. For instance, AI is already being used to generate new artwork in "
            + "the gaming industry, and in healthcare, it can assist in the creation of novel molecules for drug development. "
            + "However, with all these exciting advancements, generative AI also poses significant ethical challenges, such as "
            + "concerns about misinformation, deepfakes, and intellectual property. As this technology continues to evolve, it "
            + "will be important to navigate these issues carefully and responsibly."
        ),
        source: 'https://www.techtarget.com/searchenterpriseai/definition/generative-AI'
    };
    const tech_stack = {
        frontend: 'Angular',
        backend: 'Node.js (Express)',
        database: 'MySQL',
        authentication: 'JWT',
        infrastructure: 'NGINX to serve frontend, Express API for backend, MySQL for database'
    };

    res.json({ summary, tech_stack });
});

app.get('/chart_data', (req, res) => {
    const data = [
        { year: 2020, value: 30 },
        { year: 2021, value: 40 },
        { year: 2022, value: 50 },
        { year: 2023, value: 70 },
    ];

    res.json({ data });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
