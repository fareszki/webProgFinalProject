// dashboard.js

const API_BASE = 'http://localhost:3030';

const taskList = document.getElementById('taskList');
const pinnedNotes = document.getElementById('pinnedNotes');
const quoteText = document.getElementById('quoteText');
const upcomingList = document.getElementById('upcomingList');
const pomodoroTimer = document.getElementById('pomodoro-timer');

let pomoInterval;
let pomoTime = 25 * 60; // 25 minutes in seconds
let pomoRunning = false;

window.onload = () => {
  loadTasks();
  loadPinnedNotes();
  loadQuote();
  loadUpcoming();
};

// Load today's tasks
async function loadTasks() {

  try {
    const res = await fetch(`${API_BASE}/api/tasks`);
    const tasks = await res.json();

    taskList.innerHTML = '';
    const today = new Date().toISOString().split('T')[0];
    const todaysTasks = tasks.filter(task => task.dueDate && task.dueDate.startsWith(today));

    if (todaysTasks.length === 0) {
      taskList.innerHTML = '<p>No tasks for today 🎉</p>';
      return;
    }
    let html = ''
    for (const task of todaysTasks) {
      html += `
        <div class='task'><strong>${task.title}</strong> – ${task.description}<br>
        <small class="meta">Due: ${new Date(task.dueDate).toLocaleDateString()}</small><div>
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
    const res = await fetch(`${API_BASE}/api/notes`);
    const notes = await res.json();

    pinnedNotes.innerHTML = '';
    const pinned = notes.filter(n => n.isPinned).slice(0, 3);

    if (pinned.length === 0) {
      pinnedNotes.innerHTML = '<p>No pinned notes 📝</p>';
      return;
    }

    for (const note of pinned) {
      let pinnedHtml = '';
      for (const note of pinnedNotesList) {
        pinnedHtml += `
          <div class='note pinned'>
            <strong>${note.title}</strong><br>
            ${note.content.slice(0, 100)}...<br>
            <small class="meta">Updated: ${new Date(note.updatedAt).toLocaleDateString()}</small>
          </div>
        `;
      }
      pinnedNotes.innerHTML = pinnedHtml;
    }
  } catch (err) {
    console.error('Failed to load notes:', err);
    pinnedNotes.innerHTML = '<p style="color:red;">Error loading notes</p>';
  }
}

// Load quote of the day
// Load a random motivational quote
async function loadQuote() {
  fetch(`../quotes.json`)
  .then(response => {
    if (!response.ok) throw new Error("Failed to fetch quotes");
    return response.json();
  })
  .then(quotes => {
    let quote = quotes[parseInt(Math.random() * quotes.length)];
    console.log(quote);
    // data is an array of quote objects
    quoteText.innerHTML = `
      <p>“${quote.q}”<br><small>– ${quote.a}</small></p>
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

    // upcomingList.innerHTML = '';
    // const today = new Date();
    // const nextWeek = new Date();
    // nextWeek.setDate(today.getDate() + 7);

    // const upcoming = tasks.filter(task => {
    //   if (!task.dueDate) return false;
    //   const date = new Date(task.dueDate);
    //   return date >= today && date <= nextWeek;
    // }).slice(0, 5);

    if (upcoming.length === 0) {
      upcomingList.innerHTML = '<p>No upcoming deadlines 🎯</p>';
      return;
    }

    let upcomingHtml = '';
    for (const task of upcoming) {
      upcomingHtml += `
        <div class='task'><strong>${task.title}</strong> – ${task.description}<br>
        <small class="meta">Due: ${new Date(task.dueDate).toLocaleDateString()}</small></div>
      `;
    }
    upcomingList.innerHTML = upcomingHtml;
    
  } catch (err) {
    console.error('Failed to load upcoming tasks:', err);
    upcomingList.innerHTML = '<p style="color:red;">Error loading deadlines</p>';
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

updatePomodoroDisplay();
