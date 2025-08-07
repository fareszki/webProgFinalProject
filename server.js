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

// Get all or filtered tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const filter = {};

    // Filter by priority
    if (req.query.priority) {
      filter.priority = req.query.priority; // filter {priority: high}
    }

    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Filter by overdue
    if (req.query.overdue) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // strip time to 00:00:00
      filter.dueDate = {
        $lt: today,
      };
      filter.isCompleted = false;
    }
    
    // Filter by exact due date (YYYY-MM-DD)
    if (req.query.dueDate) {
      filter.dueDate = req.query.dueDate;
    }

    // Filter by date range (overrides dueDate if both provided)
    if (req.query.startDate && req.query.endDate) {
      filter.dueDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }
    const tasks = await Task.find(filter).sort({ dueDate: -1 });    
    
    res.json(tasks);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//get unique categories
app.get("/api/tasks/categories", async (req, res) => {
  try {
    const categories = await Task.distinct("category");
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

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
    const pinnedNotes = await Note.find({ pinned: true }).sort({ updatedAt: -1 });
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

//extra for presentation only : 


app.post('/api/loadTasksDemo', async (req, res) => {
  try {
    const result = await Task.insertMany([
      {
        "title": "Study JavaScript",
        "description": "Finish async/await lesson",
        "dueDate": "2025-08-07T00:00:00.000Z",
        "category": "Web Development",
        "priority": "High",
        "isCompleted": false
      },
      {
        "title": "Read MongoDB Docs",
        "description": "Indexing and aggregation chapters",
        "dueDate": "2025-08-07T00:00:00.000Z",
        "category": "Database",
        "priority": "Medium",
        "isCompleted": false
      },
      {
        "title": "Workout Session",
        "description": "Upper body strength training",
        "dueDate": "2025-08-07T00:00:00.000Z",
        "category": "Health",
        "priority": "Low",
        "isCompleted": false
      },
      {
        "title": "Team Meeting",
        "description": "Sprint planning discussion",
        "dueDate": "2025-08-07T00:00:00.000Z",
        "category": "Work",
        "priority": "High",
        "isCompleted": false
      },
      {
        "title": "Submit Project Proposal",
        "description": "Capstone idea and initial plan",
        "dueDate": "2025-08-12T00:00:00.000Z",
        "category": "University",
        "priority": "High",
        "isCompleted": false
      },
      {
        "title": "Buy Groceries",
        "description": "Get vegetables and fruits",
        "dueDate": "2025-08-13T00:00:00.000Z",
        "category": "Personal",
        "priority": "Medium",
        "isCompleted": false
      },
      {
        "title": "Dentist Appointment",
        "description": "Routine checkup and cleaning",
        "dueDate": "2025-08-14T00:00:00.000Z",
        "category": "Health",
        "priority": "Low",
        "isCompleted": false
      },
      {
        "title": "Submit Assignment",
        "description": "Web programming task submission",
        "dueDate": "2025-08-06T00:00:00.000Z",
        "category": "University",
        "priority": "High",
        "isCompleted": false
      },
      {
        "title": "Laundry Day",
        "description": "Wash and fold clothes",
        "dueDate": "2025-08-06T00:00:00.000Z",
        "category": "Chores",
        "priority": "Low",
        "isCompleted": false
      }
    ]);

    res.status(201).json({
      message: `${result.length} tasks inserted successfully`,
      tasks: result
    });
  } catch (err) {
    console.error("Error inserting tasks:", err);
    res.status(500).json({ error: "Failed to insert tasks" });
  }
});
app.post('/api/loadNotesDemo', async (req, res) => {
  try {
    const result = await Note.insertMany([
      {
        "title": "JavaScript Basics",
        "content": "Variables, functions, and loops are fundamental to JS. Remember the difference between var, let, and const.",
        "pinned": true
      },
      {
        "title": "MongoDB Aggregation",
        "content": "Aggregation pipelines allow for data transformation. Key stages include `$match`, `$group`, and `$sort`.",
        "pinned": false
      },
      {
        "title": "Operating Systems - Deadlocks",
        "content": "Deadlock occurs when processes wait indefinitely for resources. Four conditions: mutual exclusion, hold and wait, no preemption, circular wait.",
        "pinned": true
      },
      {
        "title": "Ethics in Technology",
        "content": "Discusses intellectual property, digital rights, and professional responsibilities. ACM code of ethics is a key reference.",
        "pinned": false
      },
      {
        "title": "Web Development Stack",
        "content": "The MEAN stack includes MongoDB, Express.js, Angular, and Node.js. Good for full-stack JavaScript development.",
        "pinned": true
      },
      {
        "title": "Networking Protocols",
        "content": "TCP is connection-oriented; UDP is faster but connectionless. Learn the OSI model layers: physical to application.",
        "pinned": false
      },
      {
        "title": "AI - Supervised vs Unsupervised Learning",
        "content": "Supervised learning uses labeled data. Unsupervised learning identifies hidden patterns without labels (e.g., clustering).",
        "pinned": false
      }
    ]
    );

    res.status(201).json({
      message: `${result.length} tasks inserted successfully`,
      tasks: result
    });
  } catch (err) {
    console.error("Error inserting tasks:", err);
    res.status(500).json({ error: "Failed to insert tasks" });
  }
});
  
