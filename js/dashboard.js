// dashboard.js
const API_BASE = 'http://localhost:3030';
const taskList = document.getElementById('taskList');
const pinnedNotes = document.getElementById('pinnedNotes');
const quoteText = document.getElementById('quoteText');
const upcomingList = document.getElementById('upcomingList');
const pomodoroTimer = document.getElementById('pomodoro-timer');
const overdueTasksList = document.getElementById('overdueList');

let pomoInterval;
let pomoTime = 25 * 60; // 25 minutes in seconds
let pomoRunning = false;

window.onload = () => {
  loadTasks();
  loadPinnedNotes();
  loadQuote();
  loadUpcoming();
  loadPastdueTasks();
};

// Load today's tasks
async function loadTasks() {

  try {
    const res = await fetch(`${API_BASE}/api/tasks`);
    const tasks = await res.json();

    taskList.innerHTML = '';
    const today = new Date().toISOString().split('T')[0];
    const todaysTasks = tasks.filter(task => task.dueDate && task.dueDate.startsWith(today));

    let completedTasksCount = todaysTasks.filter(task => task.isCompleted).length;
    updateProgressBar( completedTasksCount ,todaysTasks.length)


    if (todaysTasks.length === 0) {
      taskList.innerHTML = '<p>No tasks for today 🎉</p>';
      return;
    }
    let html = ''
    for (const task of todaysTasks) {
      const isChecked = task.isCompleted ? 'checked' : '';
      const completedClass = task.isCompleted ? 'completed' : '';
      html += `
        <div class = "task ${completedClass}" id="task-${task._id}" data-priority="${task.priority}"> 
        <div class ="task-content">
        <input type="checkbox" onchange="toggleTask('${task._id}')" ${isChecked} />
        <strong>${task.title}</strong> - ${task.description}
        <button onclick="deleteTask('${task._id}')">Delete</button>
        <br>
        <small>Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'} | Category: ${task.category} | Priority: ${task.priority}</small>
      </div>
    </div>
      `;
    }
    taskList.innerHTML = html;
  } catch (err) {
    console.error('Failed to load tasks:', err);
    taskList.innerHTML = '<p style="color:red;">Error loading tasks</p>';
  }
}

// Load pinned notes
async function loadPinnedNotes() {
  try {
    const res = await fetch(`${API_BASE}/api/notes/pinned`);
    const notes = await res.json();

    pinnedNotes.innerHTML = '';

    if (notes.length === 0) {
      pinnedNotes.innerHTML = '<p>No pinned notes 📝</p>';
      return;
    }

   
    let pinnedHtml = '';
    for (const note of notes) {
      let addDotes = note.content.length > 139? '...' : '';
      pinnedHtml += `
          <div class='note'>
            <div class="note-header">
              <strong>${note.title}</strong><br>
              ${note.content.slice(0, 140)}${addDotes}<br>
              <small class="smallDate">Created: ${new Date(note.createdAt).toLocaleDateString()}</small>
            </div>
              <div class ="button-container">
              <button class="delete-btn" style="padding: 7px" onclick="pinnNote('${note._id}')"><img src="../images/unpin.png" alt="unpin" width="40px"></button>
              </div>
          </div>
      `;
    }
    pinnedNotes.innerHTML = pinnedHtml;

  } catch (err) {
    console.error('Failed to load notes:', err);
    pinnedNotes.innerHTML = '<p style="color:red;">Error loading notes</p>';
  }
}

// Load quote of the day
// Load a random motivational quote
function loadQuote() {
  fetch('../json/quotes.json')
  .then(response => {
    if (!response.ok) throw new Error("Failed to fetch quotes");
    return response.json();
  })
  .then(quotes => {
    let quote = quotes[parseInt(Math.random() * quotes.length)];
    console.log(quote);
    // data is an array of quote objects
    quoteText.innerHTML = `
      <p>“${quote.q}”<br><small>-${quote.a}</small></p>
    `;
  })
  .catch(error => {
    console.error("Error:", error);
  });
}

// Load upcoming deadlines (next 7 days)
async function loadUpcoming() {
  try {
    upcomingList.innerHTML = ''
    const res = await fetch(`${API_BASE}/api/tasks/upcomingTasks`);
    const upcoming = await res.json();

    if (upcoming.length === 0) {
      upcomingList.innerHTML = '<p>No upcoming deadlines 🎯</p>';
      return;
    }

    let upcomingHtml = '';
    for (const task of upcoming) {
      const isChecked = task.isCompleted ? 'checked' : '';
      const completedClass = task.isCompleted ? 'completed' : '';
      upcomingHtml += `
        <div class='task task-content ${completedClass}' data-priority="${task.priority}">
        <strong>${task.title}</strong> - ${task.description}<br>
        <small>Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'} | Category: ${task.category} | Priority: ${task.priority}</small>        </div>
      `;
    }
    upcomingList.innerHTML = upcomingHtml;
    
  } catch (err) {
    console.error('Failed to load upcoming tasks:', err);
    upcomingList.innerHTML = '<p style="color:red;">Error loading deadlines</p>';
  }
}

// Delete task
async function deleteTask(id) {
  const res = await fetch(`http://localhost:3030/api/tasks/${id}`, {
    method: 'DELETE'
  });

  if (res.ok) loadTasks();
}

// Toggle completed
  async function toggleTask(id) {
  const res = await fetch(`http://localhost:3030/api/tasks/${id}`, {
    method: 'PATCH'
  });
  if (res.ok){ 
    loadTasks();
    loadPastdueTasks();
  }
}

// Pomodoro Timer Controls
function updatePomodoroDisplay() {
  const minutes = String(Math.floor(pomoTime / 60)).padStart(2, '0');
  const seconds = String(pomoTime % 60).padStart(2, '0');
  pomodoroTimer.textContent = `${minutes}:${seconds}`;
}

function startPomodoro() {
  if (pomoRunning) return;
  pomoRunning = true;
  pomoInterval = setInterval(() => {
    if (pomoTime > 0) {
      pomoTime--;
      updatePomodoroDisplay();
    } else {
      clearInterval(pomoInterval);
      pomoRunning = false;
      alert('Pomodoro session completed! Take a break 🎉');
    }
  }, 1000);
}

function pausePomodoro() {
  clearInterval(pomoInterval);
  pomoRunning = false;
}

function resetPomodoro() {
  clearInterval(pomoInterval);
  pomoTime = 25 * 60;
  pomoRunning = false;
  updatePomodoroDisplay();
}

async function pinnNote(id) {
  const res = await fetch(`http://localhost:3030/api/notes/${id}/pin`, {
    method: 'PATCH'
  });

  if(res.ok) loadPinnedNotes();
}

async function loadPastdueTasks() {
  try {
    const res = await fetch(`${API_BASE}/api/tasks`);
    const tasks = await res.json();

    overdueTasksList.innerHTML = '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overdueTasks = tasks.filter(task => {
      const taskDueDate = new Date(task.dueDate);
      taskDueDate.setHours(0, 0, 0, 0);
      return taskDueDate < today && !task.isCompleted;
    });

    if (overdueTasks.length === 0) {
      overdueTasksList.innerHTML = '<p>No tasks for today </p>';
      return;
    }
    let html = ''
    for (const task of overdueTasks) {
      const isChecked = task.isCompleted ? 'checked' : '';
      const completedClass = task.isCompleted ? 'completed' : '';
      html += `
        <div class = "task ${completedClass}" id="task-${task._id}" data-priority="${task.priority}"> 
        <div class ="task-content">
        <strong>${task.title}</strong> - ${task.description}
        <button style="margin-left:-20px" onclick="toggleTask('${task._id}')">Complete</button>
        <br>
        <small>Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'} | Category: ${task.category} | Priority: ${task.priority}</small>
      </div>
    </div>
      `;
    }
    overdueTasksList.innerHTML = html;
  } catch (err) {
    console.error('Failed to load tasks:', err);
    overdueTasksList.innerHTML = '<p style="color:red;">Error loading tasks</p>';
  }
}
function updateProgressBar(completed, total) {
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');

  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  progressBar.style.width = percent + '%';
  progressText.textContent = percent + '%';
}


updatePomodoroDisplay();
