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
        notesList.innerHTML += `
          <li>
            <strong>${note.title}</strong> - ${note.content}
            <button onclick="deleteNote('${note._id}')">❌</button>
          </li>
        `;
    }

  //  fetch('http://localhost:3030/api/notes')
  // .then(res => {
  //   if (!res.ok) throw new Error("Failed to fetch notes");
  //   return res.json();
  // })
  // .then(notes => {
  //   notesList.innerHTML = '';
  //   for (const note of notes) {
  //     notesList.innerHTML += `
  //       <li>
  //         <strong>${note.title}</strong> - ${note.content}
  //         <button onclick="deleteNote('${note._id}')">❌</button>
  //       </li>
  //     `;
  //   }
  // })
  // .catch(err => {
  //   notesList.innerHTML = `<li style="color:red;">${err.message}</li>`;
  // });

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

// Delete note
async function deleteNote(id) {
  const res = await fetch(`http://localhost:3030/api/notes/${id}`, {
    method: 'DELETE'
  });

  if (res.ok) loadNotes();
}
