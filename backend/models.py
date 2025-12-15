from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PasteCreate(BaseModel):
    title: Optional[str] = None
    content: str
    language: str = "plaintext"
    expires_in: Optional[int] = None  # minutes


class PasteResponse(BaseModel):
    id: str
    title: Optional[str]
    content: str
    language: str
    created_at: datetime
    expires_at: Optional[datetime]
    views: int

    class Config:
        from_attributes = True


class PasteListItem(BaseModel):
    id: str
    title: Optional[str]
    language: str
    created_at: datetime
    views: int

    class Config:
        from_attributes = True

