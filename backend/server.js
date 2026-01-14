// server.js (Node.js + Express)
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
app.use(cors());

app.use(bodyParser.json());

// Connect MongoDB (Storage layer)
mongoose.connect();

const Task = mongoose.model('Task', {title: String, description: String, dueDate: Date, priority: String, tag: String});
const FocusSession = mongoose.model('FocusSession', {start: Date, end: Date, duration: Number});

app.post('/api/tasks', async (req, res) => {
    const { title, description, dueDate, priority, tag } = req.body;
    const task = new Task({ title, description, dueDate, priority, tag });
    await task.save();
    res.status(201).json(task);
});

app.get('/api/tasks', async (req, res) => {
    const tasks = await Task.find();
    res.json(tasks);
});

app.post('/api/session', async (req, res) => {
    // FocusTimer session save
    const { start, end, duration } = req.body;
    const session = new FocusSession({ start, end, duration });
    await session.save();
    res.status(201).json(session);
});

// Add similar endpoints for wellness reminders

app.listen(5000, () => console.log('Backend running on port 5000'));
