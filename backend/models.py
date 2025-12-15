from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PasteCreate(BaseModel):
    title: Optional[str] = None
    content: str
    language: str = "plaintext"
    expires_in: Optional[int] = None  # minutes


class PasteResponse(BaseModel):
    """Public paste response (for viewing) - no secret_key exposed."""
    id: str
    title: Optional[str]
    content: str
    language: str
    created_at: datetime
    expires_at: Optional[datetime]
    views: int

    class Config:
        from_attributes = True


class PasteCreateResponse(BaseModel):
    """Response when creating a paste - includes secret_key for deletion."""
    id: str
    title: Optional[str]
    secret_key: str
    content: str
    language: str
    created_at: datetime
    expires_at: Optional[datetime]
    views: int

    class Config:
        from_attributes = True

