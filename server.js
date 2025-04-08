const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Workflow = require('./models/Workflow');

const app = express();
const PORT = 3001;

// ✅ Replace this with your actual cluster name and password
const MONGO_URI = 'mongodb+srv://workflowuser:MyApp1234@cluster0.3roeg1u.mongodb.net/workflowDB?retryWrites=true&w=majority';

// ✅ Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Register user
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'User already registered.' });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    console.log("📝 New user registered:", email);
    res.status(200).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// ✅ Login user
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful!' });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// ✅ Submit workflow
app.post('/submit-workflow', async (req, res) => {
  const { email, entry } = req.body;

  if (!email || !entry) {
    return res.status(400).json({ message: 'Missing email or entry' });
  }

  try {
    const newEntry = new Workflow({ email, entry });
    await newEntry.save();

    console.log(`📥 Saved to MongoDB for ${email}: ${entry}`);
    res.status(200).json({ message: 'Workflow submitted and saved!' });
  } catch (error) {
    console.error('❌ Error saving workflow:', error);
    res.status(500).json({ message: 'Error saving workflow' });
  }
});

// ✅ Get user workflows
app.get('/get-workflows', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'Missing email' });
  }

  try {
    const workflows = await Workflow.find({ email }).sort({ timestamp: -1 });
    res.status(200).json({
      workflows: workflows.map(wf => `${new Date(wf.timestamp).toLocaleTimeString()} - ${wf.entry}`)
    });
  } catch (error) {
    console.error('❌ Error fetching workflows:', error);
    res.status(500).json({ message: 'Failed to retrieve workflows' });
  }
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
