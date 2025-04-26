// Список администраторов
const admins = ['THE_RuTrA', 'Sir_pip'];

// Стартовые новости
const defaultPosts = [
  {
    title: "Новости 1",
    content: "Это первая новость на сайте. Содержимое новости.",
    image: "https://via.placeholder.com/600x300", // Пример изображения
    date: "2025-04-26 12:00"
  },
  {
    title: "Новости 2",
    content: "Это вторая новость. Текст второй новости.",
    image: "https://via.placeholder.com/600x300", // Пример изображения
    date: "2025-04-25 15:00"
  },
  {
    title: "Новости 3",
    content: "Третья новость с интересным контентом.",
    image: "https://via.placeholder.com/600x300", // Пример изображения
    date: "2025-04-24 10:30"
  }
];

// Загружаем начальные новости в localStorage, если их нет
if (!localStorage.getItem('posts')) {
  localStorage.setItem('posts', JSON.stringify(defaultPosts));
}

// Проверка, является ли пользователь администратором
function isAdmin(username) {
  return admins.includes(username);
}

// Проверка авторизации при загрузке страницы
window.onload = function() {
  const loggedInUser = localStorage.getItem('loggedInUser');
  const loggedInUserRole = localStorage.getItem('loggedInUserRole');
  const path = window.location.pathname.split('/').pop(); // Получаем только имя файла

  if (!loggedInUser && path !== 'login.html' && path !== 'register.html') {
    window.location.href = 'login.html';
    return;
  }

  if (loggedInUser && (path === 'login.html' || path === 'register.html')) {
    window.location.href = 'index.html';
    return;
  }

  if (loggedInUserRole === 'admin') {
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) adminPanel.style.display = 'block';
    const postCreationForm = document.getElementById('create-post-form');
    if (postCreationForm) postCreationForm.style.display = 'block';
  }

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
    localStorage.setItem('loggedInUserRole', isAdmin(username) ? 'admin' : 'user');

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

// Создание поста
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

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = function(e) {
        savePost(title, content, e.target.result);
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
    image,
    date: new Date().toLocaleString()
  };

  posts.push(newPost); // Добавляем новый пост в массив
  localStorage.setItem('posts', JSON.stringify(posts)); // Сохраняем обратно в localStorage

  document.getElementById('post-title').value = '';
  document.getElementById('post-content').value = '';
  document.getElementById('post-image').value = '';

  alert('Пост добавлен!');
  renderPosts();
}

// Отображение постов
function renderPosts() {
  const newsList = document.getElementById('news-list');
  if (!newsList) return;

  newsList.innerHTML = ''; // Очищаем перед рендером

  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  const loggedInUserRole = localStorage.getItem('loggedInUserRole');

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

  // Добавление обработчиков для кнопок удаления
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
    posts.splice(index, 1); // Удаляем новость по индексу
    localStorage.setItem('posts', JSON.stringify(posts)); // Сохраняем изменения в localStorage
    renderPosts(); // Перерисовываем список новостей
  }
}
