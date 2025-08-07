const form = document.getElementById('noteForm');
const notesList = document.getElementById('notesList');
const errorText = document.getElementById('formError');
const titleInput = document.getElementById('titleInput');  
const contentInput = document.getElementById('contentInput');  

// Load notes
window.onload = loadNotes();

async function loadNotes ()  {
    const res = await fetch('http://localhost:3030/api/notes');
    const notes = await res.json();
    
    notesList.innerHTML = '';
    for (const note of notes) {
      const isPinned = note.pinned ? 'checked' : '';
        notesList.innerHTML += `
          <li class="note-card">
            <div class="note-header">
              <span>${note.title}</span>
              <div class="note-controls">
                <label class="pin-label">
                  📌
                  <input type="checkbox" onchange="pinnNote('${note._id}')" ${isPinned} />
                </label>
                <button class="delete-btn" onclick="deleteNote('${note._id}')">Delete</button>
              </div>
            </div>
            <div class="note-content">${note.content}</div>
          </li>`;
    }
};

// Add note
form.addEventListener('submit', async (e) => {
  e.preventDefault(); // for the page to not reload

  const title = document.getElementById('titleInput').value.trim();
  const content = document.getElementById('contentInput').value.trim();

  if (!title || !content) {
    errorText.textContent = "Please fill in both fields.";
    return;
  }

  const res = await fetch('http://localhost:3030/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content })
  });

  if (res.ok) {
    form.reset();
    errorText.textContent = '';
    loadNotes();
  } else {
    errorText.textContent = "Error creating note.";
  }
});

//pin note
async function pinnNote(id) {
  const res = await fetch(`http://localhost:3030/api/notes/${id}/pin`, {
    method: 'PATCH'
  });

  if(res.ok) loadNotes();
}

// Delete note
async function deleteNote(id) {
  const res = await fetch(`http://localhost:3030/api/notes/${id}`, {
    method: 'DELETE'
  });

  if (res.ok) loadNotes();
}

