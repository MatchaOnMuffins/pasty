from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import string

from database import init_db, get_db, Paste
from models import PasteCreate, PasteResponse, PasteListItem

app = FastAPI(title="Pasty API", version="1.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


def generate_id(length: int = 8) -> str:
    """Generate a URL-safe random ID."""
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


@app.post("/api/pastes", response_model=PasteResponse)
def create_paste(paste: PasteCreate, db: Session = Depends(get_db)):
    """Create a new paste."""
    paste_id = generate_id()

    # Ensure unique ID
    while db.query(Paste).filter(Paste.id == paste_id).first():
        paste_id = generate_id()

    expires_at = None
    if paste.expires_in:
        expires_at = datetime.utcnow() + timedelta(minutes=paste.expires_in)

    db_paste = Paste(
        id=paste_id,
        title=paste.title,
        content=paste.content,
        language=paste.language,
        expires_at=expires_at,
    )

    db.add(db_paste)
    db.commit()
    db.refresh(db_paste)

    return db_paste


@app.get("/api/pastes/{paste_id}", response_model=PasteResponse)
def get_paste(paste_id: str, db: Session = Depends(get_db)):
    """Get a paste by ID."""
    paste = db.query(Paste).filter(Paste.id == paste_id).first()

    if not paste:
        raise HTTPException(status_code=404, detail="Paste not found")

    # Check expiration
    if paste.expires_at and paste.expires_at < datetime.utcnow():
        db.delete(paste)
        db.commit()
        raise HTTPException(status_code=404, detail="Paste has expired")

    # Increment views
    paste.views += 1
    db.commit()
    db.refresh(paste)

    return paste


@app.get("/api/pastes", response_model=list[PasteListItem])
def list_pastes(limit: int = 20, db: Session = Depends(get_db)):
    """List recent pastes."""
    # Clean up expired pastes
    db.query(Paste).filter(
        Paste.expires_at.isnot(None), Paste.expires_at < datetime.utcnow()
    ).delete()
    db.commit()

    pastes = db.query(Paste).order_by(Paste.created_at.desc()).limit(limit).all()
    return pastes


@app.delete("/api/pastes/{paste_id}")
def delete_paste(paste_id: str, db: Session = Depends(get_db)):
    """Delete a paste."""
    paste = db.query(Paste).filter(Paste.id == paste_id).first()

    if not paste:
        raise HTTPException(status_code=404, detail="Paste not found")

    db.delete(paste)
    db.commit()

    return {"message": "Paste deleted"}


@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

