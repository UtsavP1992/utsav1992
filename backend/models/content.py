from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

class ContentBase(BaseModel):
    title: str
    overview: Optional[str] = None
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    logo_path: Optional[str] = None
    content_type: str = Field(..., description="movie or tv")
    tmdb_id: int
    genre_ids: List[int] = []
    genre_names: List[str] = []
    release_date: Optional[str] = None
    first_air_date: Optional[str] = None
    vote_average: float = 0.0
    popularity: float = 0.0
    adult: bool = False
    original_language: str = "en"
    trailer_url: Optional[str] = None
    rating: Optional[str] = None
    seasons: Optional[str] = None

class Content(ContentBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ContentCreate(ContentBase):
    pass

class ContentUpdate(BaseModel):
    title: Optional[str] = None
    overview: Optional[str] = None
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    logo_path: Optional[str] = None
    trailer_url: Optional[str] = None
    rating: Optional[str] = None
    seasons: Optional[str] = None

class ContentResponse(BaseModel):
    id: str
    title: str
    image: str
    backdrop: Optional[str] = None
    logo: Optional[str] = None
    type: str
    rating: Optional[str] = None
    year: str
    genre: List[str]
    description: Optional[str] = None
    seasons: Optional[str] = None
    trailerUrl: Optional[str] = None
    tmdb_id: int
    vote_average: float
    popularity: float