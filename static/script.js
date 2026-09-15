
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
    document.getElementById("hero-desc").textContent = data.description;
    document.getElementById("hero-title").textContent = data.title;
    document.getElementById("hero-author").textContent = data.author;
    document.getElementById("hero-cover").src = data.cover_url;
    document.getElementById("hero-cover").alt = data.title;
  } catch (err) {
    console.error("Hero load error:", err);
  }
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
});

// ─── Модальное окно авторизации ────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
  var modal = document.getElementById('login-modal');
  var trigger = document.getElementById('login-trigger');
  var closeBtn = document.getElementById('modal-close');
  var form = document.getElementById('login-form');

  // Открытие
  trigger.addEventListener('click', function (e) {
    e.preventDefault();
    modal.classList.add('modal--open');
    document.body.style.overflow = 'hidden';
  });

  // Закрытие по крестику
  closeBtn.addEventListener('click', function () {
    modal.classList.remove('modal--open');
    document.body.style.overflow = '';
  });

  // Закрытие по клику на фон
  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      modal.classList.remove('modal--open');
      document.body.style.overflow = '';
    }
  });

  // Закрытие по Esc
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('modal--open')) {
      modal.classList.remove('modal--open');
      document.body.style.overflow = '';
    }
  });

  // Обработка отправки формы (заглушка)
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('login-email').value;
      var password = document.getElementById('login-password').value;
      console.log('Авторизация:', email, password);

      // Временная имитация успешного входа
      trigger.textContent = 'Кабинет';
      modal.classList.remove('modal--open');
      document.body.style.overflow = '';
    });
  }
});


// ─── Выпадающее меню профиля ───────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
  var userMenu = document.getElementById('user-menu');
  var dropdown = document.getElementById('dropdown');

  if (userMenu && dropdown) {
    userMenu.addEventListener('click', function (e) {
      e.preventDefault();
      dropdown.classList.toggle('dropdown-menu--open');
    });

    document.addEventListener('click', function (e) {
      if (!userMenu.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('dropdown-menu--open');
      }
    });
  }

  // ─── Управление количеством ──────────────────────────────────

  var quantityBtns = document.querySelectorAll('.btn--quantity');
  var cartTotal = document.getElementById('cart-total');

  quantityBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = btn.parentElement.querySelector('.cart__input');
      var value = parseInt(input.value) || 1;

      if (btn.dataset.action === 'plus') {
        value++;
      } else if (btn.dataset.action === 'minus') {
        if (value > 1) value--;
      }

      input.value = value;
      updateTotal();
    });
  });

  // ─── Выбрать все ─────────────────────────────────────────────

  var selectAll = document.getElementById('select-all');
  var itemCheckboxes = document.querySelectorAll('.cart__item .checkbox');

  if (selectAll) {
    selectAll.addEventListener('change', function () {
      itemCheckboxes.forEach(function (cb) {
        cb.checked = selectAll.checked;
      });
    });
  }

  // ─── Удалить выбранное ───────────────────────────────────────

  var removeBtn = document.getElementById('remove-selected');

  if (removeBtn) {
    removeBtn.addEventListener('click', function () {
      var checkedItems = document.querySelectorAll('.cart__item .checkbox:checked');

      checkedItems.forEach(function (cb) {
        var item = cb.closest('.cart__item');
        if (item) item.remove();
      });

      updateTotal();
    });
  }

  // ─── Пересчёт итоговой суммы ─────────────────────────────────

  function updateTotal() {
    var items = document.querySelectorAll('.cart__item');
    var total = 0;

    items.forEach(function (item) {
      var cb = item.querySelector('.checkbox');
      if (cb && cb.checked) {
        var priceText = item.querySelector('.cart__new-price').textContent;
        var price = parseInt(priceText.replace(/\D/g, ''));
        var qty = parseInt(item.querySelector('.cart__input').value) || 1;
        total += price * qty;
      }
    });

    if (cartTotal) {
      cartTotal.textContent = total.toLocaleString('ru-RU') + ' ₽';
    }
  }

  // Пересчёт при клике на чекбокс товара
  itemCheckboxes.forEach(function (cb) {
    cb.addEventListener('change', updateTotal);
  });
});