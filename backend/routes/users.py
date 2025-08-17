from fastapi import APIRouter, HTTPException, Depends
from typing import List
from services.user_service import UserService
from services.content_service import ContentService
from models.user import UserProfile, UserProfileCreate, MyListItemCreate, ViewingProgressCreate, ViewingProgressUpdate
from models.content import ContentResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
import os
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/users", tags=["users"])

# Database dependency
async def get_database() -> AsyncIOMotorDatabase:
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    return client[os.environ['DB_NAME']]

async def get_user_service() -> UserService:
    db = await get_database()
    content_service = ContentService(db)
    return UserService(db, content_service)

@router.get("/profiles", response_model=List[UserProfile])
async def get_user_profiles(user_service: UserService = Depends(get_user_service)):
    """Get all user profiles"""
    try:
        profiles = await user_service.get_all_profiles()
        if not profiles:
            # Create default profiles if none exist
            profiles = await user_service.create_default_profiles()
        return profiles
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting profiles: {str(e)}")

@router.post("/profiles", response_model=UserProfile)
async def create_user_profile(
    profile_data: UserProfileCreate,
    user_service: UserService = Depends(get_user_service)
):
    """Create a new user profile"""
    try:
        profile = await user_service.create_profile(profile_data)
        if not profile:
            raise HTTPException(status_code=400, detail="Failed to create profile")
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating profile: {str(e)}")

@router.get("/{profile_id}/my-list", response_model=List[ContentResponse])
async def get_my_list(
    profile_id: str,
    user_service: UserService = Depends(get_user_service)
):
    """Get user's my list"""
    try:
        my_list = await user_service.get_my_list(profile_id)
        return my_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting my list: {str(e)}")

@router.post("/{profile_id}/my-list")
async def add_to_my_list(
    profile_id: str,
    content_data: MyListItemCreate,
    user_service: UserService = Depends(get_user_service)
):
    """Add content to user's my list"""
    try:
        success = await user_service.add_to_my_list(profile_id, content_data)
        if not success:
            raise HTTPException(status_code=400, detail="Content already in list or failed to add")
        return {"message": "Added to my list successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding to my list: {str(e)}")

@router.delete("/{profile_id}/my-list/{content_id}")
async def remove_from_my_list(
    profile_id: str,
    content_id: str,
    user_service: UserService = Depends(get_user_service)
):
    """Remove content from user's my list"""
    try:
        success = await user_service.remove_from_my_list(profile_id, content_id)
        if not success:
            raise HTTPException(status_code=404, detail="Content not found in list")
        return {"message": "Removed from my list successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing from my list: {str(e)}")

@router.get("/{profile_id}/continue-watching", response_model=List[ContentResponse])
async def get_continue_watching(
    profile_id: str,
    user_service: UserService = Depends(get_user_service)
):
    """Get continue watching list with progress"""
    try:
        continue_watching = await user_service.get_continue_watching(profile_id)
        return continue_watching
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting continue watching: {str(e)}")

@router.post("/{profile_id}/progress")
async def create_viewing_progress(
    profile_id: str,
    progress_data: ViewingProgressCreate,
    user_service: UserService = Depends(get_user_service)
):
    """Create viewing progress entry"""
    try:
        success = await user_service.create_viewing_progress(profile_id, progress_data)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to create viewing progress")
        return {"message": "Viewing progress created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating viewing progress: {str(e)}")

@router.put("/{profile_id}/progress/{content_id}")
async def update_viewing_progress(
    profile_id: str,
    content_id: str,
    progress_data: ViewingProgressUpdate,
    user_service: UserService = Depends(get_user_service)
):
    """Update viewing progress"""
    try:
        success = await user_service.update_viewing_progress(profile_id, content_id, progress_data)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to update viewing progress")
        return {"message": "Viewing progress updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating viewing progress: {str(e)}")