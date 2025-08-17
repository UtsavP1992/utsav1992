from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from services.content_service import ContentService
from services.tmdb_service import tmdb_service
from models.content import ContentResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
import os
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/content", tags=["content"])

# Database dependency
async def get_database() -> AsyncIOMotorDatabase:
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    return client[os.environ['DB_NAME']]

async def get_content_service() -> ContentService:
    db = await get_database()
    return ContentService(db)

@router.get("/featured", response_model=Optional[ContentResponse])
async def get_featured_content(content_service: ContentService = Depends(get_content_service)):
    """Get featured content for hero section"""
    try:
        content = await content_service.get_featured_content()
        if not content:
            raise HTTPException(status_code=404, detail="No featured content found")
        return content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting featured content: {str(e)}")

@router.get("/trending", response_model=List[ContentResponse])
async def get_trending_content(content_service: ContentService = Depends(get_content_service)):
    """Get trending movies and TV shows"""
    try:
        content = await content_service.get_trending_content()
        return content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting trending content: {str(e)}")

@router.get("/popular", response_model=List[ContentResponse])
async def get_popular_content(content_service: ContentService = Depends(get_content_service)):
    """Get popular movies and TV shows"""
    try:
        content = await content_service.get_popular_content()
        return content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting popular content: {str(e)}")

@router.get("/genre/{genre_name}", response_model=List[ContentResponse])
async def get_content_by_genre(
    genre_name: str,
    content_service: ContentService = Depends(get_content_service)
):
    """Get content by genre"""
    try:
        content = await content_service.get_content_by_genre(genre_name)
        return content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting content by genre: {str(e)}")

@router.get("/search", response_model=List[ContentResponse])
async def search_content(
    q: str = Query(..., description="Search query"),
    content_service: ContentService = Depends(get_content_service)
):
    """Search for movies and TV shows"""
    try:
        if not q.strip():
            return []
        
        content = await content_service.search_content(q)
        return content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching content: {str(e)}")

@router.get("/{content_id}", response_model=Optional[ContentResponse])
async def get_content_details(
    content_id: str,
    content_service: ContentService = Depends(get_content_service)
):
    """Get detailed content information"""
    try:
        content = await content_service.get_content_details(content_id)
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")
        return content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting content details: {str(e)}")

@router.get("/categories/all", response_model=Dict[str, List[ContentResponse]])
async def get_all_categories(content_service: ContentService = Depends(get_content_service)):
    """Get all content categories"""
    try:
        categories = {}
        
        # Get different categories
        categories["trending"] = await content_service.get_trending_content()
        categories["popular"] = await content_service.get_popular_content()
        categories["action"] = await content_service.get_content_by_genre("action")
        categories["horror"] = await content_service.get_content_by_genre("horror")
        categories["comedy"] = await content_service.get_content_by_genre("comedy")
        categories["drama"] = await content_service.get_content_by_genre("drama")
        
        return categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting categories: {str(e)}")