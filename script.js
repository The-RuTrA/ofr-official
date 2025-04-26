// Список администраторов
const admins = ['THE_RuTrA', 'Sir_pip'];  // Добавляем администраторов по логину

// Проверка, является ли пользователь администратором
function isAdmin(username) {
  return admins.includes(username);
}

// Проверка авторизации при загрузке страницы
window.onload = function() {
  const loggedInUser = localStorage.getItem('loggedInUser');
  const loggedInUserRole = localStorage.getItem('loggedInUserRole');
  const path = window.location.pathname.split('/').pop(); // Получаем только имя файла

  // Если пользователь не авторизован — редирект на login
  if (!loggedInUser && path !== 'login.html' && path !== 'register.html') {
    window.location.href = 'login.html';
  }

  // Если пользователь уже авторизован — не пускать на логин/регистрацию
  if (loggedInUser && (path === 'login.html' || path === 'register.html')) {
    window.location.href = 'index.html';
  }

  // Если админ — показать панель администратора
  if (loggedInUserRole === 'admin') {
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) adminPanel.style.display = 'block';

    const postCreationForm = document.getElementById('create-post-form');
    if (postCreationForm) postCreationForm.style.display = 'block';
  }

  // Отобразить посты (после загрузки страницы)
  renderPosts();
};

// Регистрация
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const passwordRepeat = document.getElementById('reg-password-repeat').value;

    if (password !== passwordRepeat) {
      alert('Пароли не совпадают!');
      return;
    }

    if (localStorage.getItem(username)) {
      alert('Пользователь уже существует!');
      return;
    }

    const user = { username, password };
    localStorage.setItem(username, JSON.stringify(user));

    localStorage.setItem('loggedInUser', username);
    localStorage.setItem('loggedInUserRole', 'user');

    alert('Регистрация успешна!');
    window.location.href = 'index.html';
  });
}

// Вход
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const storedUser = localStorage.getItem(username);
    if (!storedUser) {
      alert('Пользователь не найден!');
      return;
    }

    const user = JSON.parse(storedUser);

    if (user.password !== password) {
      alert('Неверный пароль!');
      return;
    }

    const isAdminUser = isAdmin(username);

    localStorage.setItem('loggedInUser', username);
    localStorage.setItem('loggedInUserRole', isAdminUser ? 'admin' : 'user');

    alert('Вход успешен!');
    window.location.href = 'index.html';
  });
}

// Выход
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('loggedInUserRole');
    window.location.href = 'login.html';
  });
}

// Удаление аккаунта
const deleteAccountBtn = document.getElementById('delete-account-btn');
if (deleteAccountBtn) {
  deleteAccountBtn.addEventListener('click', function() {
    const loggedInUser = localStorage.getItem('loggedInUser');

    if (confirm('Вы уверены, что хотите удалить свой аккаунт?')) {
      localStorage.removeItem(loggedInUser);
      localStorage.removeItem('loggedInUser');
      localStorage.removeItem('loggedInUserRole');
      alert('Аккаунт удален!');
      window.location.href = 'login.html';
    }
  });
}

// Создание поста с изображением
const createPostForm = document.getElementById('create-post-form');
if (createPostForm) {
  createPostForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const imageInput = document.getElementById('post-image');
    const imageFile = imageInput.files[0];

    if (!title || !content) {
      alert('Заполните все поля!');
      return;
    }

    // Читаем картинку как DataURL (чтобы сохранить в localStorage)
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = function(e) {
        savePost(title, content, e.target.result); // e.target.result — это base64 картинка
      };
      reader.readAsDataURL(imageFile);
    } else {
      savePost(title, content, null);
    }
  });
}

// Сохраняем пост
function savePost(title, content, image) {
  const posts = JSON.parse(localStorage.getItem('posts')) || [];

  const newPost = {
    title,
    content,
    image, // сохраняем base64 изображения или null
    date: new Date().toLocaleString()
  };

  posts.push(newPost);
  localStorage.setItem('posts', JSON.stringify(posts));

  // Очищаем форму
  document.getElementById('post-title').value = '';
  document.getElementById('post-content').value = '';
  document.getElementById('post-image').value = '';

  alert('Пост добавлен!');
  renderPosts();
}

// Отрисовка постов
function renderPosts() {
  const newsList = document.getElementById('news-list');
  if (!newsList) return;

  newsList.innerHTML = ''; // Очистка списка перед рендером

  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  const loggedInUserRole = localStorage.getItem('loggedInUserRole');

  // Перевернем массив, чтобы новые посты шли первыми
  posts.reverse().forEach((post, index) => {
    const postElement = document.createElement('div');
    postElement.classList.add('news-item');
    postElement.innerHTML = `
      <h3>${post.title}</h3>
      ${post.image ? `<img src="${post.image}" alt="Изображение" style="max-width: 100%; height: auto;">` : ''}
      <p>${post.content}</p>
      <small>Дата публикации: ${post.date}</small>
      ${loggedInUserRole === 'admin' ? `<button class="delete-btn" data-index="${index}">Удалить</button>` : ''}
    `;

    newsList.appendChild(postElement);
  });

  if (loggedInUserRole === 'admin') {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', function() {
        const index = this.getAttribute('data-index');
        deletePost(index);
      });
    });
  }
}

// Удаление поста
function deletePost(index) {
  const posts = JSON.parse(localStorage.getItem('posts')) || [];

  if (confirm('Вы уверены, что хотите удалить эту новость?')) {
    posts.splice(index, 1);
    localStorage.setItem('posts', JSON.stringify(posts));
    renderPosts(); // Перерисовать посты
  }
}
