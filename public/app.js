const API_BASE = '/api/v1';

const messageBox = document.getElementById('message');
const authSection = document.getElementById('authSection');
const dashboardSection = document.getElementById('dashboardSection');
const userMeta = document.getElementById('userMeta');
const taskList = document.getElementById('taskList');

const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const taskForm = document.getElementById('taskForm');
const logoutBtn = document.getElementById('logoutBtn');
const loadMineBtn = document.getElementById('loadMineBtn');
const loadAllBtn = document.getElementById('loadAllBtn');

let authToken = sessionStorage.getItem('jwtToken') || '';
let currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');

const showMessage = (type, text) => {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
};

const clearMessage = () => {
  messageBox.textContent = '';
  messageBox.className = 'message hidden';
};

const formatError = (errorPayload, fallback = 'Request failed') => {
  if (!errorPayload) return fallback;

  if (Array.isArray(errorPayload.errors) && errorPayload.errors.length > 0) {
    return errorPayload.errors.map((item) => item.message).join(', ');
  }

  return errorPayload.message || fallback;
};

const saveAuth = (token, user) => {
  authToken = token;
  currentUser = user;
  sessionStorage.setItem('jwtToken', token);
  sessionStorage.setItem('currentUser', JSON.stringify(user));
};

const clearAuth = () => {
  authToken = '';
  currentUser = null;
  sessionStorage.removeItem('jwtToken');
  sessionStorage.removeItem('currentUser');
};

const setUiState = () => {
  const loggedIn = Boolean(authToken && currentUser);
  authSection.classList.toggle('hidden', loggedIn);
  dashboardSection.classList.toggle('hidden', !loggedIn);

  if (!loggedIn) {
    userMeta.textContent = '';
    taskList.innerHTML = '';
    return;
  }

  userMeta.textContent = `Logged in as ${currentUser.name} (${currentUser.role})`;
};

const request = async (path, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
      setUiState();
    }

    throw body;
  }

  return body;
};

const renderTasks = (tasks) => {
  if (!tasks.length) {
    taskList.innerHTML = '<li class="task-item">No tasks found.</li>';
    return;
  }

  taskList.innerHTML = tasks.map((task) => `
    <li class="task-item">
      <div>
        <strong>${task.title}</strong>
        <div>${task.description || ''}</div>
      </div>
      <div class="task-meta">
        Status: <strong>${task.status}</strong> | Task #${task.id} | Owner #${task.userId}
      </div>
      <div class="task-actions">
        <button class="secondary" data-action="toggle-status" data-id="${task.id}" data-status="${task.status}">
          Toggle Status
        </button>
        <button class="secondary" data-action="edit" data-id="${task.id}" data-title="${task.title}" data-description="${task.description || ''}">
          Edit
        </button>
        <button class="danger" data-action="delete" data-id="${task.id}">
          Delete
        </button>
      </div>
    </li>
  `).join('');
};

const loadTasks = async (loadAll = false) => {
  clearMessage();
  try {
    const tasks = await request(loadAll ? '/tasks/all' : '/tasks');
    renderTasks(tasks);
    showMessage('success', `Loaded ${tasks.length} task(s).`);
  } catch (errorPayload) {
    showMessage('error', formatError(errorPayload, 'Failed to load tasks'));
  }
};

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearMessage();
  const formData = new FormData(registerForm);

  const payload = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password')
  };

  try {
    await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    registerForm.reset();
    showMessage('success', 'Registration successful. You can now log in.');
  } catch (errorPayload) {
    showMessage('error', formatError(errorPayload, 'Registration failed'));
  }
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearMessage();
  const formData = new FormData(loginForm);

  const payload = {
    email: formData.get('email'),
    password: formData.get('password')
  };

  try {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    saveAuth(data.token, data.user);
    loginForm.reset();
    setUiState();
    showMessage('success', 'Login successful.');
    await loadTasks(false);
  } catch (errorPayload) {
    showMessage('error', formatError(errorPayload, 'Login failed'));
  }
});

taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearMessage();
  const formData = new FormData(taskForm);

  const payload = {
    title: formData.get('title'),
    description: formData.get('description'),
    status: formData.get('status')
  };

  try {
    await request('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    taskForm.reset();
    showMessage('success', 'Task created successfully.');
    await loadTasks(false);
  } catch (errorPayload) {
    showMessage('error', formatError(errorPayload, 'Task creation failed'));
  }
});

logoutBtn.addEventListener('click', () => {
  clearAuth();
  clearMessage();
  setUiState();
});

loadMineBtn.addEventListener('click', async () => {
  await loadTasks(false);
});

loadAllBtn.addEventListener('click', async () => {
  await loadTasks(true);
});

taskList.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const action = button.dataset.action;
  const taskId = button.dataset.id;

  clearMessage();

  try {
    if (action === 'toggle-status') {
      const nextStatus = button.dataset.status === 'PENDING' ? 'COMPLETED' : 'PENDING';
      await request(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });
      showMessage('success', 'Task status updated.');
      await loadTasks(false);
      return;
    }

    if (action === 'edit') {
      const nextTitle = window.prompt('New title', button.dataset.title || '');
      if (!nextTitle) return;

      const nextDescription = window.prompt('New description', button.dataset.description || '') || '';

      await request(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: nextTitle,
          description: nextDescription
        })
      });
      showMessage('success', 'Task updated successfully.');
      await loadTasks(false);
      return;
    }

    if (action === 'delete') {
      const confirmed = window.confirm('Delete this task?');
      if (!confirmed) return;

      await request(`/tasks/${taskId}`, {
        method: 'DELETE'
      });
      showMessage('success', 'Task deleted successfully.');
      await loadTasks(false);
    }
  } catch (errorPayload) {
    showMessage('error', formatError(errorPayload, 'Task operation failed'));
  }
});

setUiState();
if (authToken && currentUser) {
  loadTasks(false);
}
