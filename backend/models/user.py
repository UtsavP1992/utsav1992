from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

class UserProfileBase(BaseModel):
    name: str
    avatar: str
    is_kids: bool = False

class UserProfile(UserProfileBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    is_kids: Optional[bool] = None

class MyListItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    profile_id: str
    content_id: str
    tmdb_id: int
    content_type: str
    added_at: datetime = Field(default_factory=datetime.utcnow)

class MyListItemCreate(BaseModel):
    content_id: str
    tmdb_id: int
    content_type: str

class ViewingProgress(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    profile_id: str
    content_id: str
    tmdb_id: int
    content_type: str
    progress: float = Field(ge=0, le=100)  # 0-100 percentage
    current_episode: Optional[str] = None
    season_number: Optional[int] = None
    episode_number: Optional[int] = None
    time_left: Optional[str] = None
    last_watched: datetime = Field(default_factory=datetime.utcnow)

class ViewingProgressCreate(BaseModel):
    content_id: str
    tmdb_id: int
    content_type: str
    progress: float = Field(ge=0, le=100)
    current_episode: Optional[str] = None
    season_number: Optional[int] = None
    episode_number: Optional[int] = None
    time_left: Optional[str] = None

class ViewingProgressUpdate(BaseModel):
    progress: Optional[float] = Field(None, ge=0, le=100)
    current_episode: Optional[str] = None
    season_number: Optional[int] = None
    episode_number: Optional[int] = None
    time_left: Optional[str] = None