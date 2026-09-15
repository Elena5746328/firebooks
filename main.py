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
    """Возвращает книгу-карточку."""
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



@app.get("/")
async def index():
    return FileResponse(STATIC_DIR / "index.html")

@app.get("/cart")
async def cart():
    return FileResponse(STATIC_DIR / "cart.html")
