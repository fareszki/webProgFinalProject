const form = document.getElementById('taskForm');
const tasksList = document.getElementById('tasksList');
const errorText = document.getElementById('formError');

const titleInput = document.getElementById('titleInput');
const descriptionInput = document.getElementById('descriptionInput');
const dueDateInput = document.getElementById('dueDateInput');
const categoryInput = document.getElementById('categoryInput');
const priorityInput = document.getElementById('priorityInput');

//filter
const filterBtn = document.getElementById("filterBtn")
const clear = document.getElementById("clearBtn")
const categoryFilter = document.getElementById("filterCategory");
const priorityFilter = document.getElementById("filterPriority");
const overdueFilter = document.getElementById("filterOverdue");
const dueDateFilter = document.getElementById("filterDueDate");
const startDateFilter = document.getElementById("startDate");
const endDateFilter = document.getElementById("endDate");

const categorySelect = document.getElementById("filterCategory");

const totalTasks = document.getElementById('total-count');
const filteredTasks = document.getElementById('filtered-count');
const completedTasks = document.getElementById('completed-count');
const uncompletedTasks = document.getElementById('uncompleted-count');
const overdueTasks = document.getElementById('overdue-count');

// Load tasks
window.onload = () => {
  loadTasks();
  loadCategories();
}

async function loadTasks(filteredTasks = null) {
  let tasks;
  if(!filteredTasks) {
    const res = await fetch('http://localhost:3030/api/tasks');
    tasks = await res.json();
  } else {
    tasks = filteredTasks;
  }

  loadStatus(tasks);

  tasksList.innerHTML = '';

  for (const task of tasks) {
    const isChecked = task.isCompleted ? 'checked' : '';
    const completedClass = task.isCompleted ? 'completed' : '';

    tasksList.innerHTML += `
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
    loadCategories();
  } else {
    errorText.textContent = "Error creating task.";
  }
});

// Filter Task
filterBtn.addEventListener('click', (e) => {
  e.preventDefault();
  filterTasks()
});

async function filterTasks() {
  const category = categoryFilter.value
  const priority = priorityFilter.value
  const dueDate = dueDateFilter.value
  const overdue = overdueFilter.checked
  const startDate = startDateFilter.value
  const endDate = endDateFilter.value

  //query url
  let queryString = '';
  
  
  // let queryObject = {category,priority,overdue,dueDate,startDate,endDate}
  // for (const key in queryObject) {
  //   if (queryObject[key]) {
  //     queryString += `&${key}=${encodeURIComponent(queryObject[key])}`
  //   }
  // }
  // queryString = queryString.slice(1);

  const params = [];
  
  if (category) params.push(`category=${encodeURIComponent(category)}`);
  if (priority) params.push(`priority=${encodeURIComponent(priority)}`);
  if (overdue) params.push(`overdue=true`);
  if (dueDate) params.push(`dueDate=${encodeURIComponent(dueDate)}`);
  if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
  if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);

  queryString += params.join('&');
  console.log(queryString);

  try {
    const res = await fetch(`http://localhost:3030/api/tasks?${queryString}`)
    const filteredTasks = await res.json()
    if (filteredTasks && filteredTasks.length === 0) {
      document.getElementById("tasksList").innerHTML = `
      <p style="text-align: center; color: white; font-weight: bold; margin-top: 30px;font-size:xx-large">
      No tasks available!
      </p>
      `;
  } else {
    console.log(`http://localhost:3030/api/tasks?${queryString}`); //! check
    loadTasks(filteredTasks);
  }
  } catch (error) {
    console.log("Error fetching filtered tasks!", error);    
  }
}

//get categories
async function loadCategories() {
  try {
    const res = await fetch("http://localhost:3030/api/tasks/categories");
    const categories = await res.json();

    categorySelect.innerHTML = `<option value="">All Categories</option>`;

    categories.forEach((cat) => {
      categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

clear.addEventListener('click', async (e) => {
  e.preventDefault();

  //clear inputs
  document.getElementById("filterCategory").value = '';
  document.getElementById("filterPriority").value = '';
  document.getElementById("filterDueDate").value = '';
  document.getElementById("startDate").value = '';
  document.getElementById("endDate").value = '';

  loadTasks();
})

// Delete task
  async function deleteTask(id) {
  const res = await fetch(`http://localhost:3030/api/tasks/${id}`, {
    method: 'DELETE'
  });

  if (res.ok) { 
    loadTasks(); 
    loadCategories();
  }
}

// Toggle completed
  async function toggleTask(id) {
  const res = await fetch(`http://localhost:3030/api/tasks/${id}`, {
    method: 'PATCH'
  });
  if (res.ok) filterTasks();
}

  async function loadStatus(filteredTasksArr = null){
    let totalCount, filteredCount 
    let completedCount = 0; 
    let uncompletedCount = 0;
    let overdueCount = 0;
    const res = await fetch('http://localhost:3030/api/tasks');
    allTasks = await res.json();

    totalCount = allTasks.length;

    if (!filteredTasksArr) {
      filteredTasksArr = allTasks
    }
     
    filteredCount = filteredTasksArr.length;

    completedCount = filteredTasksArr.filter(task => task.isCompleted).length;
    uncompletedCount = filteredCount - completedCount;
    overdueCount = filteredTasksArr.filter(task => new Date(task.dueDate) < new Date() && !task.isCompleted).length;

    console.log(totalCount, filteredCount,completedCount, uncompletedCount, overdueCount);

    totalTasks.innerHTML = totalCount;
    filteredTasks.innerHTML = filteredCount; 
    completedTasks.innerHTML = completedCount;
    uncompletedTasks.innerHTML = uncompletedCount;
    overdueTasks.innerHTML = overdueCount;
  }

