const API = "/api";

function formatPrice(rub) {
  return rub.toLocaleString("ru-RU") + " р.";
}

function starsHTML(rating) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star${i <= rating ? " filled" : ""}">★</span>`;
  }
  return html;
}

function skeletonCards(container, count = 5) {
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const card = document.createElement("div");
    card.className = "skeleton-card";
    card.innerHTML = `
      <div class="skeleton-cover"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
    `;
    container.appendChild(card);
  }
}

// ─── Карточка книги ───────────────────────────────────────────

function bookCardHTML(book) {
  return `
    <div class="book-card" data-id="${book.id}">
      <div class="book-card__cover">
        <img src="${book.cover_url}" alt="${book.title}">
        <span class="book-card__discount">-${book.discount}%</span>
        <button class="book-card__fav" aria-label="В избранное">♥</button>
      </div>
      <div class="book-card__info">
        <p class="book-card__type">${book.cover_type}</p>
        <div class="book-card__prices">
          <span class="book-card__old-price">${formatPrice(book.old_price)}</span>
          <span class="book-card__new-price">${formatPrice(book.new_price)}</span>
        </div>
        <p class="book-card__title">${book.full_title}</p>
        <p class="book-card__author">${book.author}</p>
        <div class="book-card__rating">${starsHTML(book.rating)}</div>
        <button class="book-card__btn">${book.status}</button>
      </div>
    </div>
  `;
}

// ─── Загрузка секций ──────────────────────────────────────────

async function loadSection(endpoint, gridId, count = 5) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  skeletonCards(grid, count);

  try {
    const res = await fetch(`${API}${endpoint}`);
    const books = await res.json();
    grid.innerHTML = books.map(bookCardHTML).join("");
  } catch (err) {
    grid.innerHTML = `<p style="grid-column:1/-1;color:#999">Не удалось загрузить книги</p>`;
    console.error(err);
  }
}

// ─── Загрузка hero ────────────────────────────────────────────

async function loadHero() {
  try {
    const res = await fetch(`${API}/hero`);
    const data = await res.json();
    const desc = document.getElementById("hero-desc");
    const title = document.getElementById("hero-title");
    const author = document.getElementById("hero-author");
    const cover = document.getElementById("hero-cover");
    if (desc) desc.textContent = data.description;
    if (title) title.textContent = data.title;
    if (author) author.textContent = data.author;
    if (cover) { cover.src = data.cover_url; cover.alt = data.title; }
  } catch (err) {
    console.error("Hero load error:", err);
  }
}

// ─── Имя пользователя (localStorage) ───────────────────────────

function getUserName() {
  return localStorage.getItem("firebooks_user_name") || null;
}

function isLoggedIn() {
  return !!localStorage.getItem("firebooks_user_name");
}

function updateUserName() {
  var name = getUserName();
  if (!name) return;

  // На index.html: меняем «Войти» на имя пользователя
  var loginTrigger = document.getElementById("login-trigger");
  if (loginTrigger && loginTrigger.textContent.trim() === "Войти") {
    loginTrigger.innerHTML =
      '<span class="user-name">' + name + "</span>" +
      '<svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M1 1l5 5 5-5"/></svg>';
    loginTrigger.id = "user-menu";
    loginTrigger.href = "/profile";
    loginTrigger.classList.remove("nav__link--login");
    loginTrigger.classList.add("nav__link--user", "user-dropdown");
  }

  // Имя в шапке (все страницы)
  document.querySelectorAll(".user-name").forEach(function (el) {
    el.textContent = name;
  });

  // Имя в сайдбаре
  document.querySelectorAll(".sidebar__name").forEach(function (el) {
    el.textContent = name;
  });

  // Аватар в сайдбаре (первая буква)
  document.querySelectorAll(".sidebar__avatar").forEach(function (el) {
    el.textContent = name.charAt(0).toUpperCase();
  });

  // Имя в отзывах пользователя (заменяем «Елена»)
  document.querySelectorAll(".review-block__author").forEach(function (el) {
    if (el.textContent.trim() === "Елена") {
      el.textContent = name;
    }
  });
  document.querySelectorAll(".review-block__avatar").forEach(function (el) {
    if (el.textContent.trim() === "Е") {
      el.textContent = name.charAt(0).toUpperCase();
    }
  });
}

// ─── Делегирование событий (избранное) ─────────────────────────

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("book-card__fav")) {
    e.target.classList.toggle("active");
  }
});

// ─── Инициализация ────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  loadHero();
  loadSection("/books/new", "grid-new");
  loadSection("/books/bestsellers", "grid-bestsellers");
  loadSection("/books/upcoming", "grid-upcoming");
  updateUserName();
});

// ─── Модальные окна: вход и регистрация ────────────────────────

document.addEventListener("DOMContentLoaded", function () {
  var loginModal = document.getElementById("login-modal");
  var registerModal = document.getElementById("register-modal");
  var loginTrigger = document.getElementById("login-trigger");
  var loginClose = document.getElementById("modal-close");
  var registerClose = document.getElementById("register-close");
  var loginForm = document.getElementById("login-form");
  var registerForm = document.getElementById("register-form");
  var registerLink = document.querySelector(".modal__register-link");
  var loginLink = document.querySelector(".modal__login-link");

  // ── Открытие / закрытие ──

  if (loginTrigger) {
    loginTrigger.addEventListener("click", function (e) {
      e.preventDefault();
      if (loginModal) {
        loginModal.classList.add("modal--open");
        document.body.style.overflow = "hidden";
      }
    });
  }

  if (loginClose) {
    loginClose.addEventListener("click", function () {
      loginModal.classList.remove("modal--open");
      document.body.style.overflow = "";
    });
  }

  if (loginModal) {
    loginModal.addEventListener("click", function (e) {
      if (e.target === loginModal) {
        loginModal.classList.remove("modal--open");
        document.body.style.overflow = "";
      }
    });
  }

  if (registerClose) {
    registerClose.addEventListener("click", function () {
      registerModal.classList.remove("modal--open");
      document.body.style.overflow = "";
    });
  }

  if (registerModal) {
    registerModal.addEventListener("click", function (e) {
      if (e.target === registerModal) {
        registerModal.classList.remove("modal--open");
        document.body.style.overflow = "";
      }
    });
  }

  // ── Переключение между модалками ──

  if (registerLink) {
    registerLink.addEventListener("click", function (e) {
      e.preventDefault();
      loginModal.classList.remove("modal--open");
      registerModal.classList.add("modal--open");
    });
  }

  if (loginLink) {
    loginLink.addEventListener("click", function (e) {
      e.preventDefault();
      registerModal.classList.remove("modal--open");
      loginModal.classList.add("modal--open");
    });
  }

  // ── Закрытие по Esc ──

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (loginModal && loginModal.classList.contains("modal--open")) {
        loginModal.classList.remove("modal--open");
        document.body.style.overflow = "";
      }
      if (registerModal && registerModal.classList.contains("modal--open")) {
        registerModal.classList.remove("modal--open");
        document.body.style.overflow = "";
      }
    }
  });

  // ── Обработка входа ──

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("login-email").value;

      // Ищем сохранённое имя, иначе берём часть email до @
      var savedName = localStorage.getItem("firebooks_user_name");
      var name = savedName || email.split("@")[0];

      localStorage.setItem("firebooks_user_name", name);
      localStorage.setItem("firebooks_user_email", email);

      // Меняем кнопку «Войти» на имя
      if (loginTrigger) {
        loginTrigger.innerHTML =
          '<span class="user-name">' + name + "</span>" +
          '<svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="2">' +
          '<path d="M1 1l5 5 5-5"/></svg>';
        loginTrigger.id = "user-menu";
        loginTrigger.href = "/profile";
        loginTrigger.classList.remove("nav__link--login");
        loginTrigger.classList.add("nav__link--user", "user-dropdown");
      }

      updateUserName();

      loginModal.classList.remove("modal--open");
      document.body.style.overflow = "";
    });
  }

  // ── Обработка регистрации ──

  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("reg-name").value;
      var email = document.getElementById("reg-email").value;

      localStorage.setItem("firebooks_user_name", name);
      localStorage.setItem("firebooks_user_email", email);

      // Меняем кнопку «Войти» на имя
      if (loginTrigger) {
        loginTrigger.innerHTML =
          '<span class="user-name">' + name + "</span>" +
          '<svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="2">' +
          '<path d="M1 1l5 5 5-5"/></svg>';
        loginTrigger.id = "user-menu";
        loginTrigger.href = "/profile";
        loginTrigger.classList.remove("nav__link--login");
        loginTrigger.classList.add("nav__link--user", "user-dropdown");
      }

      updateUserName();

      registerModal.classList.remove("modal--open");
      document.body.style.overflow = "";
    });
  }
});

// ─── Выпадающее меню профиля ───────────────────────────────────

document.addEventListener("DOMContentLoaded", function () {
  var userMenu = document.getElementById("user-menu");
  var dropdown = document.getElementById("dropdown");

  if (userMenu && dropdown) {
    userMenu.addEventListener("click", function (e) {
      e.preventDefault();
      dropdown.classList.toggle("dropdown-menu--open");
    });

    document.addEventListener("click", function (e) {
      if (!userMenu.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove("dropdown-menu--open");
      }
    });
  }

  // ─── Управление количеством ──────────────────────────────────

  var quantityBtns = document.querySelectorAll(".btn--quantity");
  var cartTotal = document.getElementById("cart-total");

  quantityBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var input = btn.parentElement.querySelector(".cart__input");
      var value = parseInt(input.value) || 1;

      if (btn.dataset.action === "plus") {
        value++;
      } else if (btn.dataset.action === "minus") {
        if (value > 1) value--;
      }

      input.value = value;
      updateTotal();
    });
  });

  // ─── Выбрать все ─────────────────────────────────────────────

  var selectAll = document.getElementById("select-all");
  var itemCheckboxes = document.querySelectorAll(".cart__item .checkbox");

  if (selectAll) {
    selectAll.addEventListener("change", function () {
      itemCheckboxes.forEach(function (cb) {
        cb.checked = selectAll.checked;
      });
    });
  }

  // ─── Удалить выбранное ───────────────────────────────────────

  var removeBtn = document.getElementById("remove-selected");

  if (removeBtn) {
    removeBtn.addEventListener("click", function () {
      var checkedItems = document.querySelectorAll(".cart__item .checkbox:checked");

      checkedItems.forEach(function (cb) {
        var item = cb.closest(".cart__item");
        if (item) item.remove();
      });

      updateTotal();
    });
  }

  // ─── Пересчёт итоговой суммы ─────────────────────────────────

  function updateTotal() {
    var items = document.querySelectorAll(".cart__item");
    var total = 0;

    items.forEach(function (item) {
      var cb = item.querySelector(".checkbox");
      if (cb && cb.checked) {
        var priceText = item.querySelector(".cart__new-price").textContent;
        var price = parseInt(priceText.replace(/\D/g, ""));
        var qty = parseInt(item.querySelector(".cart__input").value) || 1;
        total += price * qty;
      }
    });

    if (cartTotal) {
      cartTotal.textContent = total.toLocaleString("ru-RU") + " ₽";
    }
  }

  if (itemCheckboxes.length) {
    itemCheckboxes.forEach(function (cb) {
      cb.addEventListener("change", updateTotal);
    });
  }
});

