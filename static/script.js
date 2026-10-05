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

// ─── Загрузка секций с подгрузкой ─────────────────────────────

const sectionState = {};

async function loadSection(endpoint, gridId, count = 5) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  skeletonCards(grid, count);

  try {
    const res = await fetch(`${API}${endpoint}`);
    const books = await res.json();

    sectionState[gridId] = { books: books, shown: count, step: count };

    grid.innerHTML = books.slice(0, count).map(bookCardHTML).join("");

    if (books.length > count) {
      addViewAllButton(gridId);
    }
  } catch (err) {
    grid.innerHTML = `<p style="grid-column:1/-1;color:#999">Не удалось загрузить книги</p>`;
    console.error(err);
  }
}

function addViewAllButton(gridId) {
  if (document.getElementById("viewall-" + gridId)) return;

  var grid = document.getElementById(gridId);
  if (!grid) return;

  var wrapper = grid.parentElement;
  var btn = document.createElement("button");
  btn.id = "viewall-" + gridId;
  btn.className = "view-all-btn";
  btn.textContent = "Смотреть все";
  btn.addEventListener("click", function () {
    loadMore(gridId);
  });
  wrapper.appendChild(btn);
}

function loadMore(gridId) {
  var state = sectionState[gridId];
  if (!state) return;

  var grid = document.getElementById(gridId);
  if (!grid) return;

  var newShown = state.shown + state.step;
  state.shown = newShown;

  var newBooks = state.books.slice(state.shown - state.step, newShown);
  grid.insertAdjacentHTML("beforeend", newBooks.map(bookCardHTML).join(""));

  if (newShown >= state.books.length) {
    var btn = document.getElementById("viewall-" + gridId);
    if (btn) btn.style.display = "none";
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

function getUserSurname() {
  return localStorage.getItem("firebooks_user_surname") || null;
}

function getUserPhone() {
  return localStorage.getItem("firebooks_user_phone") || null;
}

function getUserEmail() {
  return localStorage.getItem("firebooks_user_email") || null;
}

function isLoggedIn() {
  return !!localStorage.getItem("firebooks_user_name");
}

function updateUserName() {
  var name = getUserName();
  if (!name) return;

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

  document.querySelectorAll(".user-name").forEach(function (el) {
    el.textContent = name;
  });

  document.querySelectorAll(".sidebar__name").forEach(function (el) {
    el.textContent = name;
  });

  document.querySelectorAll(".sidebar__avatar").forEach(function (el) {
    el.textContent = name.charAt(0).toUpperCase();
  });

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

  var profileName = document.getElementById("profile-name");
  var profileSurnameItem = document.getElementById("profile-surname-item");
  var profileSurname = document.getElementById("profile-surname");
  var profilePhone = document.getElementById("profile-phone");
  var profileEmail = document.getElementById("profile-email");

  if (profileName) profileName.textContent = name;

  var surname = getUserSurname();
  if (surname && profileSurnameItem) {
    profileSurnameItem.style.display = "";
    profileSurname.textContent = surname;
  } else if (profileSurnameItem) {
    profileSurnameItem.style.display = "none";
  }

  if (profilePhone) {
    var phone = getUserPhone();
    profilePhone.textContent = phone || "—";
  }

  if (profileEmail) {
    var email = getUserEmail();
    profileEmail.textContent = email || "—";
  }
}

// ─── Делегирование событий (избранное + купить + клик по карточке) ──

document.addEventListener("click", (e) => {
  // Избранное
  if (e.target.classList.contains("book-card__fav")) {
    e.target.classList.toggle("active");
  }

  // Кнопка «Купить»
  if (e.target.classList.contains("book-card__btn")) {
    var card = e.target.closest(".book-card");
    if (!card) return;

    var cover = card.querySelector(".book-card__cover img");
    var title = card.querySelector(".book-card__title");
    var author = card.querySelector(".book-card__author");
    var newPrice = card.querySelector(".book-card__new-price");

    var item = {
      cover: cover ? cover.src : "",
      title: title ? title.textContent : "",
      author: author ? author.textContent : "",
      price: newPrice ? newPrice.textContent : "0",
      priceText: newPrice ? newPrice.textContent : "0"
    };

    var items = JSON.parse(localStorage.getItem("firebooks_checkout") || "[]");
    items.push(item);
    localStorage.setItem("firebooks_checkout", JSON.stringify(items));

    window.location.href = "/checkout";
    return;
  }

  // Клик по карточке → страница книги
  if (e.target.closest(".book-card") &&
      !e.target.classList.contains("book-card__fav") &&
      !e.target.classList.contains("book-card__btn")) {
    var card = e.target.closest(".book-card");
    if (card && card.dataset.id) {
      window.location.href = "/book?id=" + card.dataset.id;
    }
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

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("login-email").value;

      var savedName = localStorage.getItem("firebooks_user_name");
      var name = savedName || email.split("@")[0];

      localStorage.setItem("firebooks_user_name", name);
      localStorage.setItem("firebooks_user_email", email);

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

  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("reg-name").value;
      var surname = document.getElementById("reg-surname").value;
      var phone = document.getElementById("reg-phone").value;
      var email = document.getElementById("reg-email").value;

      localStorage.setItem("firebooks_user_name", name);
      localStorage.setItem("firebooks_user_email", email);
      localStorage.setItem("firebooks_user_phone", phone);
      if (surname) {
        localStorage.setItem("firebooks_user_surname", surname);
      } else {
        localStorage.removeItem("firebooks_user_surname");
      }

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

// ─── Звёзды оценки, «Читать больше», закладки, модалка отзыва ──

function initToggleButtons() {
  var toggleBtns = document.querySelectorAll(".review-block__toggle");

  toggleBtns.forEach(function (btn) {
    var text = btn.previousElementSibling;

    if (text && text.classList.contains("review-block__text--clamped")) {
      if (text.scrollHeight <= text.offsetHeight) {
        btn.style.display = "none";
      } else {
        btn.style.display = "";
      }
    }

    btn.addEventListener("click", function () {
      if (text.classList.contains("review-block__text--clamped")) {
        text.classList.remove("review-block__text--clamped");
        btn.textContent = "Свернуть";
      } else {
        text.classList.add("review-block__text--clamped");
        btn.textContent = "Читать больше";
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  var promptStars = document.querySelectorAll(".review-prompt__stars");

  promptStars.forEach(function (container) {
    var stars = container.querySelectorAll(".review-star");
    var selectedValue = 0;

    stars.forEach(function (star) {
      star.addEventListener("mouseenter", function () {
        var value = parseInt(star.dataset.value);
        stars.forEach(function (s) {
          s.classList.toggle("filled", parseInt(s.dataset.value) <= value);
        });
      });

      star.addEventListener("click", function () {
        selectedValue = parseInt(star.dataset.value);
        stars.forEach(function (s) {
          s.classList.toggle("filled", parseInt(s.dataset.value) <= selectedValue);
        });
      });
    });

    container.addEventListener("mouseleave", function () {
      stars.forEach(function (s) {
        s.classList.toggle("filled", parseInt(s.dataset.value) <= selectedValue);
      });
    });
  });

  // ── «Читать больше» / «Свернуть» (выносим в общую функцию) ──
  initToggleButtons();

  // ── Удаление из закладок по клику на сердечко ──

  var favBtns = document.querySelectorAll(".book-card__fav");

  favBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("active")) {
        var card = btn.closest(".cabinet__card");
        if (card) {
          card.style.transition = "opacity 0.3s, transform 0.3s";
          card.style.opacity = "0";
          card.style.transform = "scale(0.95)";
          setTimeout(function () {
            card.remove();
          }, 300);
        }
      } else {
        btn.classList.add("active");
      }
    });
  });

  // ── Модалка отзыва ──

  var reviewModal = document.getElementById("review-modal");
  var reviewClose = document.getElementById("review-close");
  var reviewForm = document.getElementById("review-form");
  var reviewSuccess = document.getElementById("review-success");
  var writeReviewBtns = document.querySelectorAll(".review-prompt__btn");
  var selectedRating = 0;

  writeReviewBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".cabinet__card");

      var cover = card.querySelector(".book-card__cover img");
      var title = card.querySelector(".book-card__title");
      var author = card.querySelector(".book-card__author");

      var promptStarsEl = card.querySelectorAll(".review-prompt__stars .review-star");
      var existingRating = 0;
      promptStarsEl.forEach(function (s) {
        if (s.classList.contains("filled")) existingRating++;
      });
      selectedRating = existingRating;

      document.getElementById("review-modal-cover").src = cover.src;
      document.getElementById("review-modal-cover").alt = title.textContent;
      document.getElementById("review-modal-title").textContent = title.textContent;
      document.getElementById("review-modal-author").textContent = author.textContent;

      var modalStars = document.querySelectorAll(".review-modal__stars .review-star");
      modalStars.forEach(function (star) {
        star.classList.toggle("filled", parseInt(star.dataset.value) <= selectedRating);
      });

      if (reviewForm) reviewForm.style.display = "";
      if (reviewSuccess) reviewSuccess.style.display = "none";
      if (reviewForm) reviewForm.reset();

      reviewModal.classList.add("modal--open");
      document.body.style.overflow = "hidden";
    });
  });

  var modalStars = document.querySelectorAll(".review-modal__stars .review-star");

  modalStars.forEach(function (star) {
    star.addEventListener("mouseenter", function () {
      var value = parseInt(star.dataset.value);
      modalStars.forEach(function (s) {
        s.classList.toggle("filled", parseInt(s.dataset.value) <= value);
      });
    });

    star.addEventListener("click", function () {
      selectedRating = parseInt(star.dataset.value);
      modalStars.forEach(function (s) {
        s.classList.toggle("filled", parseInt(s.dataset.value) <= selectedRating);
      });
    });
  });

  var modalStarsContainer = document.querySelector(".review-modal__stars");
  if (modalStarsContainer) {
    modalStarsContainer.addEventListener("mouseleave", function () {
      modalStars.forEach(function (s) {
        s.classList.toggle("filled", parseInt(s.dataset.value) <= selectedRating);
      });
    });
  }

  if (reviewClose) {
    reviewClose.addEventListener("click", function () {
      reviewModal.classList.remove("modal--open");
      document.body.style.overflow = "";
    });
  }

  if (reviewModal) {
    reviewModal.addEventListener("click", function (e) {
      if (e.target === reviewModal) {
        reviewModal.classList.remove("modal--open");
        document.body.style.overflow = "";
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && reviewModal && reviewModal.classList.contains("modal--open")) {
      reviewModal.classList.remove("modal--open");
      document.body.style.overflow = "";
    }
  });

  if (reviewForm) {
    reviewForm.addEventListener("submit", function (e) {
      e.preventDefault();
      reviewForm.style.display = "none";
      reviewSuccess.style.display = "block";

      setTimeout(function () {
        reviewModal.classList.remove("modal--open");
        document.body.style.overflow = "";
        setTimeout(function () {
          reviewForm.style.display = "";
          reviewSuccess.style.display = "none";
          reviewForm.reset();
        }, 300);
      }, 2500);
    });
  }
});

// ─── Выпадающее меню профиля + корзина ─────────────────────────

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

  // ─── Оформить заказ из корзины ───────────────────────────────

  var checkoutBtn = document.getElementById("cart-checkout");

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      var items = [];
      var cartItems = document.querySelectorAll(".cart__item");

      cartItems.forEach(function (item) {
        var cb = item.querySelector(".checkbox");
        if (!cb || cb.checked) {
          var cover = item.querySelector("img");
          var title = item.querySelector(".cart__title");
          var author = item.querySelector(".cart__author");
          var price = item.querySelector(".cart__new-price");

          items.push({
            cover: cover ? cover.src : "",
            title: title ? title.textContent : "",
            author: author ? author.textContent : "",
            price: price ? price.textContent : "0",
            priceText: price ? price.textContent : "0"
          });
        }
      });

      if (items.length === 0) {
        alert("Выберите товары для оформления");
        return;
      }

      localStorage.setItem("firebooks_checkout", JSON.stringify(items));
      window.location.href = "/checkout";
    });
  }
});

// ─── Автоподсказки в поиске ───────────────────────────────────

document.addEventListener("DOMContentLoaded", function () {
  var searchInput = document.querySelector(".search__input");
  if (!searchInput) return;

  var suggestBox = document.createElement("div");
  suggestBox.className = "search-suggest";
  suggestBox.style.display = "none";
  searchInput.parentElement.style.position = "relative";
  searchInput.parentElement.appendChild(suggestBox);

  var searchTimer = null;

  searchInput.addEventListener("input", function () {
    var query = searchInput.value.trim();
    clearTimeout(searchTimer);

    if (query.length < 2) {
      suggestBox.style.display = "none";
      return;
    }

    searchTimer = setTimeout(function () {
      fetch("/api/search?q=" + encodeURIComponent(query))
        .then(function (res) { return res.json(); })
        .then(function (books) {
          if (books.length === 0) {
            suggestBox.innerHTML = '<div class="search-suggest__empty">Ничего не найдено</div>';
            suggestBox.style.display = "block";
            return;
          }

          suggestBox.innerHTML = books.slice(0, 5).map(function (book) {
            return '<div class="search-suggest__item" data-id="' + book.id + '">' +
              '<img src="' + book.cover_url + '" class="search-suggest__cover" alt="">' +
              '<div class="search-suggest__info">' +
                '<p class="search-suggest__title">' + (book.title || book.full_title) + '</p>' +
                '<p class="search-suggest__author">' + book.author + '</p>' +
                '<p class="search-suggest__price">' + formatPrice(book.new_price) + '</p>' +
              '</div>' +
            '</div>';
          }).join("");
          suggestBox.style.display = "block";
        })
        .catch(function () {
          suggestBox.style.display = "none";
        });
    }, 300);
  });

  // Клик по подсказке → переход на страницу книги
  suggestBox.addEventListener("click", function (e) {
    var item = e.target.closest(".search-suggest__item");
    if (item && item.dataset.id) {
      window.location.href = "/book?id=" + item.dataset.id;
    }
  });

  // Скрыть подсказки при клике вне поиска
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".search")) {
      suggestBox.style.display = "none";
    }
  });

  // Показать снова при фокусе
  searchInput.addEventListener("focus", function () {
    if (searchInput.value.trim().length >= 2 && suggestBox.innerHTML) {
      suggestBox.style.display = "block";
    }
  });
});

function initToggleButtons() {
  var toggleBtns = document.querySelectorAll(".review-block__toggle");

  toggleBtns.forEach(function (btn) {
    var text = btn.previousElementSibling;

    if (text && text.classList.contains("clamped")) {
      if (text.scrollHeight <= text.offsetHeight) {
        btn.style.display = "none";
      } else {
        btn.style.display = "";
      }
    }

    btn.addEventListener("click", function () {
      if (text.classList.contains("clamped")) {
        text.classList.remove("clamped");
        btn.textContent = "Свернуть";
      } else {
        text.classList.add("clamped");
        btn.textContent = "Читать больше";
      }
    });
  });
}

// Вызываем после загрузки DOM
document.addEventListener("DOMContentLoaded", function () {
  // Находим описание книги и добавляем класс clamped, если оно длинное
  var descText = document.getElementById("book-desc-text");
  if (descText) {
    descText.classList.add("clamped");
  }

  initToggleButtons();
});
