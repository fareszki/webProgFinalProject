const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3030;

//middleware
app.use(cors()) ;
app.use(express.json());
app.use(express.urlencoded({extended:false})); //check if I need it 

//starting the server
app.listen(PORT, () => console.log("server is running"));

//connect to mongoDB
mongoose.connect('mongodb://127.0.0.1:27017/studybuddy')
.then(() => console.log('mongo connected'))
.catch((err) => console.log('mongodb connection error', err));

//task schema
const taskSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    dueDate: {
        type: Date //opitonal 
    },
    category: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      required: true
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  }, { timestamps: true });

//mongo model
const Task = mongoose.model('Task', taskSchema);

//Routes 
//get all tasks
app.get("/api/tasks", async (req,res) => {
    const tasks = await Task.find({});
    res.json(tasks);
})
// //get today tasks
// app.get('/api/tasks/today', async (req, res) => {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   const tomorrow = new Date(today);
//   tomorrow.setDate(today.getDate() + 1);

//   try {
//     const tasks = await Task.find({
//       dueDate: { $gte: today, $lt: tomorrow }
//     });
//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ msg: 'Error fetching today\'s tasks' });
//   }
// });

//get upcoming tasks
app.get("/api/tasks/upcomingTasks", async(req,res) => {
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);

  const upcomingTasks = await Task.find({
    dueDate: {
      $gte: now,
      $lte: nextWeek
    }
  });

  res.json(upcomingTasks);
})
//create new task
app.post("/api/tasks", async(req,res) => {
    const body = req.body;
    if (!body || !body.title || !body.description || !body.category || !body.priority) {
        return res.status(400).json({msg: "Missing requried fields"});
    }

    const newTask = await Task.create({
        title: body.title, 
        description: body.description,
        dueDate: body.dueDate,
        category: body.category,
        priority: body.priority,
        isCompleted: body.isCompleted,
    })

    console.log("New Task Created: ", newTask);
    return res.status(201).json({msg: "success"})
})
//check-uncheck task 
app.patch('/api/tasks/:id', async (req, res) => {
    const task = await Task.findById(req.params.id);
    task.isCompleted = !task.isCompleted;
    await task.save();
    res.json(task);
});
//delete task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
      await Task.findByIdAndDelete(req.params.id);
      res.status(200).json({ msg: "Task deleted successfully" });
    } catch (err) {
      res.status(500).json({ msg: "Something went wrong" });
    }
  });

//Notes Schema
const noteSchema = new mongoose.Schema({
    title: String,
    content: String, 
    pinned: { 
      type: Boolean, 
      default: false 
    }
  }, { timestamps: true });
  
const Note = mongoose.model('Note', noteSchema);

//get all notes
app.get("/api/notes", async (req, res) => {
    const notes = await Note.find({}).sort({ createdAt: -1 });
    res.json(notes);
});
//get recent notes
app.get('/api/notes/recent', async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 }).limit(5);
    res.json(notes);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching recent notes' });
  }
});

//get pinnned notes
app.get('/api/notes/pinned', async (req, res) => {
  try {
    const pinnedNotes = await Note.find({ pinned: true }).sort({ updatedAt: -1 }).limit(5);
    res.json(pinnedNotes);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch pinned notes." });
  }
});

//add notes
app.post("/api/notes", async (req, res) => {
    const body = req.body;

    if (!body || !body.title || !body.content) {
        return res.status(400).json({ msg: "Missing required fields" });
    }

    const newNote = await Note.create({
        title: body.title,
        content: body.content
    });

    console.log("New Note Created:", newNote);
    return res.status(201).json({ msg: "success" });
});

//pin note
app.patch('/api/notes/:id/pin', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ msg: "Note not found" });

    note.pinned = !note.pinned;
    await note.save();
    res.json({ msg: "Pin status updated", note });
  } catch (err) {
    res.status(500).json({ msg: "Error updating pin status" });
  }
});

app.delete("/api/notes/:id", async (req, res) => {
    const noteID = req.params.id;
    try {
      await Note.findByIdAndDelete(noteID);
      console.log("message deleted");
      res.json({ msg: "Note deleted successfully" });
    } catch (err) {
      res.status(500).json({ msg: "Error deleting note" });
    }
});