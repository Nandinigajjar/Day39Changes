const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost/mentor_student_assignment', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const Mentor = require('./models/mentor');
const Student = require('./models/student');

app.use(bodyParser.json());

app.post('/mentor', async (req, res) => {
  try {
    const mentor = new Mentor(req.body);
    await mentor.save();
    res.status(201).json(mentor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create Student
app.post('/student', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Assign a student to Mentor
app.post('/assign/:mentorId/student/:studentId', async (req, res) => {
  try {
    const { mentorId, studentId } = req.params;
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) throw new Error('Mentor not found');
    
    const student = await Student.findByIdAndUpdate(studentId, { mentor: mentorId }, { new: true });
    if (!student) throw new Error('Student not found');
    
    res.json({ mentor, student });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all students for a particular mentor
app.get('/mentor/:mentorId/students', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const students = await Student.find({ mentor: mentorId });
    res.json(students);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get the previously assigned mentor for a particular student
app.get('/student/:studentId/mentor', async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);
    if (!student) throw new Error('Student not found');
    
    const mentor = await Mentor.findById(student.mentor);
    res.json(mentor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
