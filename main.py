from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path

app = FastAPI(title="FIREBOOKS")

BASE_DIR = Path(__file__).parent
STATIC_DIR = BASE_DIR / "static"
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


class Book(BaseModel):
    id: int
    title: str
    author: str
    cover_type: str
    old_price: int
    new_price: int
    discount: int
    full_title: str
    rating: int
    cover_url: str
    status: str


class HeroBook(BaseModel):
    title: str
    author: str
    description: str
    cover_url: str


HERO_BOOK = HeroBook(
    title="Четвёртое крыло",
    author="Ребекка Яррос",
    description=(
        "#1 САМЫХ ПРОДАВАЕМЫХ КНИГ AMAZON! "
        "МГНОВЕННЫЙ БЕСТСЕЛЛЕР NEW YORK TIMES!"
    ),
    cover_url="/static/img/0194612e-c1aa-77ef-b35f-892218e71e36.png",
)


def _book(idx: int) -> Book:
    return Book(
        id=idx,
        title="Без сожалений",
        author="Таша Мисник",
        cover_type="Мягкая обложка",
        old_price=1379,
        new_price=1109,
        discount=20,
        full_title="Без сожалений (с цветным обрезом)",
        rating=5,
        cover_url="/static/img/019fd5f3-e95e-7be2-9ad3-73e4752605c8.jpg",
        status="Предзаказ",
    )


BOOKS_NEW = [_book(i) for i in range(1, 6)]
BOOKS_BESTSELLERS = [_book(i) for i in range(6, 11)]
BOOKS_UPCOMING = [_book(i) for i in range(11, 16)]

# ─── Железное пламя — полные данные ─────────────────────────────

from fastapi.responses import JSONResponse

IRON_FLAME = {
    "id": 101,
    "title": "Железное пламя",
    "full_title": "Железное пламя",
    "author": "Ребекка Яррос",
    "cover_type": "Твердый переплет",
    "old_price": 1687,
    "new_price": 1312,
    "discount": 22,
    "rating": 5,
    "status": "В наличии",
    "cover_url": "/static/img/0194612f-6f3e-76f8-b9d9-53b27e4c50b3.png",
    "publisher": "Кислород",
    "year": "2024",
    "pages": "912",
    "isbn": "978-5-353-10858-0",
    "reviews_count": 47,
    "description": "Никто не ожидал, что Вайолет Сорренгейл выживет в Военной академии Басгиат, включая саму Вайолет. Но как драконы устанавливают собственные законы, так и Вайолет устанавливает свои правила. Тем более что у нее есть определенные преимущества — ум, железная воля, преданные друзья и любовь Ксейдена Риорсона. Однако одной решимости выжить становится мало. Ведь Вайолет знает столько тайн, что голова кругом! И даже драконьего огня может оказаться недостаточно, чтобы спалить всех ее врагов. Что ж, добро пожаловать в революцию!",
    "reviews": [
        {"author": "Мария", "rating": 5, "text": "Прочитала за три дня, не могла оторваться. Вторая часть цикла «Эмпирей» оказалась ещё мощнее первой. Отношения Вайолет и Ксейдена, политические интриги, драконы — всё на высоте."},
        {"author": "Анастасия", "rating": 5, "text": "Книга потрясающая! Читается на одном дыхании. Ждала продолжения после «Четвёртого крыла». Сюжет стал ещё напряжённее, ставки выше, а эмоции — сильнее. Концовка просто снесла крышу. Теперь мучаюсь в ожидании третьей части."},
        {"author": "Дмитрий", "rating": 4, "text": "Хорошее продолжение, но местами затянуто. 900 страниц — это много, некоторые сцены можно было сократить. Но в целом сюжет держит, драконы и боевые сцены отлично прописаны. Рекомендую фанатам жанра."}
    ]
}

# Все книги для поиска (существующие + Железное пламя)
ALL_BOOKS_FOR_SEARCH = []
for lst in [BOOKS_NEW, BOOKS_BESTSELLERS, BOOKS_UPCOMING]:
    for b in lst:
        ALL_BOOKS_FOR_SEARCH.append({
            "id": b.id,
            "title": b.title,
            "full_title": b.full_title,
            "author": b.author,
            "cover_url": b.cover_url,
            "new_price": b.new_price,
            "rating": b.rating,
        })
ALL_BOOKS_FOR_SEARCH.append(IRON_FLAME)

# Полные данные по книгам (для страницы книги)
BOOK_DETAILS = {101: IRON_FLAME}


# --- Поиск ---

@app.get("/api/search")
async def api_search(q: str = ""):
    q_lower = q.lower().strip()
    if not q_lower:
        return []

    query_words = q_lower.split()

    results = []
    for book in ALL_BOOKS_FOR_SEARCH:
        combined = " ".join([
            str(book.get("title", "")),
            str(book.get("full_title", "")),
            str(book.get("author", "")),
        ]).lower()

        all_match = True
        for qw in query_words:
            if qw in combined:
                continue

            stem = qw[:5] if len(qw) > 5 else qw
            combined_words = combined.split()
            found = False
            for cw in combined_words:
                cw_stem = cw[:5] if len(cw) > 5 else cw
                if stem == cw_stem or qw in cw or cw in qw:
                    found = True
                    break
            if not found:
                all_match = False
                break

        if all_match:
            results.append(book)

    return results


# --- Страница одной книги ---

@app.get("/book")
async def book_page():
    return FileResponse(STATIC_DIR / "book.html")


@app.get("/api/books/{book_id}")
async def api_book_detail(book_id: int):
    if book_id in BOOK_DETAILS:
        return BOOK_DETAILS[book_id]
    return JSONResponse({"detail": "Книга не найдена"}, status_code=404)


# --- API ---

@app.get("/api/hero")
async def get_hero():
    return HERO_BOOK

@app.get("/api/books/new")
async def get_new():
    return BOOKS_NEW

@app.get("/api/books/bestsellers")
async def get_bestsellers():
    return BOOKS_BESTSELLERS

@app.get("/api/books/upcoming")
async def get_upcoming():
    return BOOKS_UPCOMING


# --- Страницы ---

@app.get("/")
async def index():
    return FileResponse(STATIC_DIR / "index.html")

@app.get("/cart")
async def cart():
    return FileResponse(STATIC_DIR / "cart.html")

@app.get("/recommend")
async def recommend():
    return FileResponse(STATIC_DIR / "recommend.html")

@app.get("/my-books")
async def my_books():
    return FileResponse(STATIC_DIR / "library.html")

@app.get("/bookmarks")
async def bookmarks():
    return FileResponse(STATIC_DIR / "bookmarks.html")

@app.get("/my-reviews")
async def my_reviews():
    return FileResponse(STATIC_DIR / "my-reviews.html")

@app.get("/orders")
async def orders():
    return FileResponse(STATIC_DIR / "orders.html")

@app.get("/profile")
async def profile():
    return FileResponse(STATIC_DIR / "profile.html")

@app.get("/checkout")
async def checkout():
    return FileResponse(STATIC_DIR / "checkout.html")
