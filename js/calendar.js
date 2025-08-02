// Display-only calendar view (no interactions)

window.onload = async () => {
    generateCalendarDays();
    await loadTasks();
  };
  
  function generateCalendarDays() {
    const calendarBody = document.getElementById('calendarBody');
    calendarBody.innerHTML = '';
  
    const totalDays = 29;
    let currentDay = 1;
  
    for (let row = 0; row < 5; row++) {
      const tr = document.createElement('tr');
  
      for (let col = 0; col < 7; col++) {
        const td = document.createElement('td');
  
        if (currentDay <= totalDays) {
          td.innerHTML = `
            <span class="day-number">${currentDay}</span>
            <ul id="day${currentDay}"></ul>
          `;
          currentDay++;
        }
  
        tr.appendChild(td);
      }
  
      calendarBody.appendChild(tr);
    }
  }
  
  async function loadTasks() {
    const res = await fetch('http://localhost:3030/api/tasks');
    const tasks = await res.json();
  
    for (const task of tasks) {
      if (!task.dueDate) continue;
  
      const date = new Date(task.dueDate);
      const day = date.getDate();
  
      if (day >= 1 && day <= 29) {
        const dayBox = document.getElementById('day' + day);
        if (dayBox) {
          dayBox.innerHTML += `<li style="background-color: #ddd;">📌 ${task.title}</li>`;
        }
      }
    }
  }
  