from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import secrets
import string
import os

from database import init_db, get_db, Paste, SiteStats
from models import PasteCreate, PasteResponse, PasteCreateResponse
from admin import setup_admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Pasty API", version="1.0.0", lifespan=lifespan)

default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_env:
    allowed_origins = default_origins + [
        origin.strip() for origin in allowed_origins_env.split(",")
    ]
else:
    allowed_origins = default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_admin(app)


def generate_id(length: int = 8) -> str:
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


def generate_unique_id(length: int = 8, db: Session = Depends(get_db)) -> str:
    id = generate_id(length)
    while db.query(Paste).filter(Paste.id == id).first():
        id = generate_id(length)
    return id
    

def generate_secret_key() -> str:
    return secrets.token_urlsafe(32)

@app.get("/67")
def get67(db: Session = Depends(get_db)):
    secret_key = generate_secret_key()
    db_paste = Paste(
        id=generate_unique_id(8, db),
        title="67",
        content="67",
        expires_at=None,
        secret_key=secret_key,
    )
    db.add(db_paste)
    db.commit()
    db.refresh(db_paste)

    return {
        "flag": "flag{nice_work_you_found_it}",
        "message": "dm https://www.linkedin.com/in/henry-zhang-umich/ for 67 cents \
        make sure to include the secret key in your message",
        "secret_key": db_paste.secret_key,
    }

@app.post("/api/pastes", response_model=PasteCreateResponse)
def create_paste(paste: PasteCreate, db: Session = Depends(get_db)):
    paste_id = generate_unique_id(8, db)
    expires_at = None
    if paste.expires_in:
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=paste.expires_in)

    db_paste = Paste(
        id=paste_id,
        title=paste.title,
        content=paste.content,
        language=paste.language,
        expires_at=expires_at,
        secret_key=generate_secret_key(),
    )

    db.add(db_paste)
    db.commit()
    db.refresh(db_paste)

    return db_paste


@app.get("/api/pastes/{paste_id}", response_model=PasteResponse)
def get_paste(paste_id: str, db: Session = Depends(get_db)):
    paste = db.query(Paste).filter(Paste.id == paste_id).first()

    if not paste:
        raise HTTPException(status_code=404, detail="Paste not found")

    # Check expiration
    if paste.expires_at and paste.expires_at < datetime.now(timezone.utc):
        db.delete(paste)
        db.commit()
        raise HTTPException(status_code=404, detail="Paste not found")

    # Increment views
    paste.views += 1
    db.commit()
    db.refresh(paste)

    return paste


@app.delete("/api/pastes/{paste_id}")
def delete_paste(paste_id: str, secret_key: str, db: Session = Depends(get_db)):
    """Delete a paste."""
    paste = db.query(Paste).filter(Paste.id == paste_id).first()

    if not paste:
        raise HTTPException(status_code=404, detail="Paste not found")

    if paste.secret_key != secret_key:
        raise HTTPException(status_code=403, detail="Invalid secret key")

    db.delete(paste)
    db.commit()

    return {"message": "Paste deleted"}


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}


@app.get("/api/stats/visits")
def get_visit_count(db: Session = Depends(get_db)):
    """Get the total site visit count and paste count."""
    stats = db.query(SiteStats).filter(SiteStats.id == 1).first()
    if not stats:
        stats = SiteStats(id=1, visit_count=0)
        db.add(stats)
        db.commit()
        db.refresh(stats)
    
    paste_count = db.query(Paste).count()
    return {"visit_count": stats.visit_count, "paste_count": paste_count}


@app.post("/api/stats/visits")
def increment_visit_count(db: Session = Depends(get_db)):
    """Increment and return the site visit count and total paste count."""
    stats = db.query(SiteStats).filter(SiteStats.id == 1).first()
    if not stats:
        stats = SiteStats(id=1, visit_count=1)
        db.add(stats)
    else:
        stats.visit_count += 1
    db.commit()
    db.refresh(stats)
    
    paste_count = db.query(Paste).count()
    return {"visit_count": stats.visit_count, "paste_count": paste_count}
