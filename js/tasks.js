const form = document.getElementById('taskForm');
const tasksList = document.getElementById('tasksList');
const errorText = document.getElementById('formError');

const titleInput = document.getElementById('titleInput');
const descriptionInput = document.getElementById('descriptionInput');
const dueDateInput = document.getElementById('dueDateInput');
const categoryInput = document.getElementById('categoryInput');
const priorityInput = document.getElementById('priorityInput');

// Load tasks
window.onload = loadTasks;

async function loadTasks() {
  const res = await fetch('http://localhost:3030/api/tasks');
  const tasks = await res.json();

  tasksList.innerHTML = '';

  for (const task of tasks) {
    const isChecked = task.isCompleted ? 'checked' : '';
    const completedClass = task.isCompleted ? 'completed' : '';

    tasksList.innerHTML += `
    <div class = "task ${completedClass}" id="task-${task._id}" data-priority="${task.priority}"> 
      <div class ="task-content">
        <input type="checkbox" onchange="toggleTask('${task._id}')" ${isChecked} />
        <strong>${task.title}</strong> - ${task.description}
        <button onclick="deleteTask('${task._id}')">delete</button>
        <br>
        <small>Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'} | Category: ${task.category} | Priority: ${task.priority}</small>
      </div>
    </div>
    `;
  }
}

// Add task
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const dueDate = dueDateInput.value;
  const category = categoryInput.value.trim();
  const priority = priorityInput.value;

  if (!title || !description || !category || !priority) {
    errorText.textContent = "Please fill in all required fields.";
    return;
  }

  const res = await fetch('http://localhost:3030/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, dueDate, category, priority })
  });

  
  if (res.ok) {
    form.reset();
    errorText.textContent = '';
    loadTasks();
  } else {
    errorText.textContent = "Error creating task.";
  }
});

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
  if (res.ok) loadTasks();
}



