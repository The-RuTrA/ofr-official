// Список администраторов
const admins = ['THE_RuTrA', 'Sir_pip'];

function isAdmin(username) {
  return admins.includes(username);
}

window.onload = function() {
  const loggedInUser = localStorage.getItem('loggedInUser');
  const loggedInUserRole = localStorage.getItem('loggedInUserRole');
  const path = window.location.pathname.split('/').pop();

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
  registerForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const passwordRepeat = document.getElementById('reg-password-repeat').value;

    if (password !== passwordRepeat) {
      alert('Пароли не совпадают!');
      return;
    }

    const userDoc = await db.collection('users').doc(username).get();
    if (userDoc.exists) {
      alert('Пользователь уже существует!');
      return;
    }

    await db.collection('users').doc(username).set({ username, password });
    localStorage.setItem('loggedInUser', username);
    localStorage.setItem('loggedInUserRole', isAdmin(username) ? 'admin' : 'user');

    alert('Регистрация успешна!');
    window.location.href = 'index.html';
  });
}

// Вход
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const userDoc = await db.collection('users').doc(username).get();
    if (!userDoc.exists) {
      alert('Пользователь не найден!');
      return;
    }

    const user = userDoc.data();
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
  deleteAccountBtn.addEventListener('click', async function() {
    const loggedInUser = localStorage.getItem('loggedInUser');

    if (confirm('Вы уверены, что хотите удалить свой аккаунт?')) {
      await db.collection('users').doc(loggedInUser).delete();
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
  db.collection('posts').add({
    title: title,
    content: content,
    image: image,
    date: new Date().toLocaleString()
  }).then(() => {
    alert('Пост добавлен!');
    renderPosts();
    document.getElementById('post-title').value = '';
    document.getElementById('post-content').value = '';
    document.getElementById('post-image').value = '';
  }).catch((error) => {
    console.error('Ошибка сохранения поста: ', error);
  });
}

// Отображение постов
function renderPosts() {
  const newsList = document.getElementById('news-list');
  if (!newsList) return;

  newsList.innerHTML = '';

  db.collection('posts').orderBy('date', 'desc').get()
    .then(snapshot => {
      const loggedInUserRole = localStorage.getItem('loggedInUserRole');
      snapshot.forEach(doc => {
        const post = doc.data();
        const postElement = document.createElement('div');
        postElement.classList.add('news-item');
        postElement.innerHTML = `
          <h3>${post.title}</h3>
          ${post.image ? `<img src="${post.image}" alt="Изображение" style="max-width: 100%; height: auto;">` : ''}
          <p>${post.content}</p>
          <small>Дата публикации: ${post.date}</small>
          ${loggedInUserRole === 'admin' ? `<button class="delete-btn" data-id="${doc.id}">Удалить</button>` : ''}
        `;
        newsList.appendChild(postElement);
      });

      if (loggedInUserRole === 'admin') {
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
          button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            deletePost(id);
          });
        });
      }
    });
}

// Удаление поста
function deletePost(id) {
  if (confirm('Вы уверены, что хотите удалить эту новость?')) {
    db.collection('posts').doc(id).delete()
      .then(() => {
        renderPosts();
      }).catch(error => {
        console.error('Ошибка удаления поста: ', error);
      });
  }
}
