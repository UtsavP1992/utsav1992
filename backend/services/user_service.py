from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.user import UserProfile, UserProfileCreate, MyListItem, MyListItemCreate, ViewingProgress, ViewingProgressCreate, ViewingProgressUpdate
from models.content import ContentResponse
from services.content_service import ContentService
import logging

logger = logging.getLogger(__name__)

class UserService:
    def __init__(self, db: AsyncIOMotorDatabase, content_service: ContentService):
        self.db = db
        self.content_service = content_service
        self.profiles_collection = db.user_profiles
        self.my_list_collection = db.my_list
        self.progress_collection = db.viewing_progress

    async def create_default_profiles(self) -> List[UserProfile]:
        """Create default user profiles if none exist"""
        try:
            existing_count = await self.profiles_collection.count_documents({})
            if existing_count > 0:
                profiles = await self.profiles_collection.find().to_list(10)
                return [UserProfile(**profile) for profile in profiles]

            # Create default profiles
            default_profiles = [
                UserProfileCreate(
                    name="John",
                    avatar="https://mir-s3-cdn-cf.behance.net/project_modules/disp/ce54bf11889067.562541ef7cde4.png",
                    is_kids=False
                ),
                UserProfileCreate(
                    name="Sarah",
                    avatar="https://mir-s3-cdn-cf.behance.net/project_modules/disp/1bdc9a11889067.562541ef52d36.png",
                    is_kids=False
                ),
                UserProfileCreate(
                    name="Kids",
                    avatar="https://mir-s3-cdn-cf.behance.net/project_modules/disp/bf6e4a11889067.562541ef6036f.png",
                    is_kids=True
                )
            ]

            created_profiles = []
            for profile_data in default_profiles:
                profile = UserProfile(**profile_data.dict())
                await self.profiles_collection.insert_one(profile.dict())
                created_profiles.append(profile)

            return created_profiles

        except Exception as e:
            logger.error(f"Error creating default profiles: {str(e)}")
            return []

    async def get_all_profiles(self) -> List[UserProfile]:
        """Get all user profiles"""
        try:
            profiles = await self.profiles_collection.find().to_list(10)
            return [UserProfile(**profile) for profile in profiles]
        except Exception as e:
            logger.error(f"Error getting profiles: {str(e)}")
            return []

    async def create_profile(self, profile_data: UserProfileCreate) -> Optional[UserProfile]:
        """Create a new user profile"""
        try:
            profile = UserProfile(**profile_data.dict())
            await self.profiles_collection.insert_one(profile.dict())
            return profile
        except Exception as e:
            logger.error(f"Error creating profile: {str(e)}")
            return None

    async def get_my_list(self, profile_id: str) -> List[ContentResponse]:
        """Get user's my list"""
        try:
            my_list_items = await self.my_list_collection.find({"profile_id": profile_id}).to_list(100)
            
            content_list = []
            for item in my_list_items:
                content = await self.content_service.get_content_details(item["content_id"])
                if content:
                    # Add progress if available
                    progress_doc = await self.progress_collection.find_one({
                        "profile_id": profile_id,
                        "content_id": item["content_id"]
                    })
                    
                    content_dict = content.dict()
                    if progress_doc:
                        content_dict["progress"] = progress_doc["progress"]
                    else:
                        content_dict["progress"] = 0
                    
                    content_list.append(ContentResponse(**content_dict))
            
            return content_list

        except Exception as e:
            logger.error(f"Error getting my list: {str(e)}")
            return []

    async def add_to_my_list(self, profile_id: str, content_data: MyListItemCreate) -> bool:
        """Add content to user's my list"""
        try:
            # Check if already in list
            existing = await self.my_list_collection.find_one({
                "profile_id": profile_id,
                "content_id": content_data.content_id
            })
            
            if existing:
                return False  # Already in list
            
            # Add to list
            my_list_item = MyListItem(
                profile_id=profile_id,
                **content_data.dict()
            )
            
            await self.my_list_collection.insert_one(my_list_item.dict())
            return True

        except Exception as e:
            logger.error(f"Error adding to my list: {str(e)}")
            return False

    async def remove_from_my_list(self, profile_id: str, content_id: str) -> bool:
        """Remove content from user's my list"""
        try:
            result = await self.my_list_collection.delete_one({
                "profile_id": profile_id,
                "content_id": content_id
            })
            return result.deleted_count > 0

        except Exception as e:
            logger.error(f"Error removing from my list: {str(e)}")
            return False

    async def get_continue_watching(self, profile_id: str) -> List[ContentResponse]:
        """Get continue watching list with progress"""
        try:
            progress_items = await self.progress_collection.find({
                "profile_id": profile_id,
                "progress": {"$gt": 0, "$lt": 100}
            }).sort("last_watched", -1).limit(20).to_list(20)
            
            content_list = []
            for item in progress_items:
                content = await self.content_service.get_content_details(item["content_id"])
                if content:
                    content_dict = content.dict()
                    content_dict["progress"] = item["progress"]
                    content_dict["episode"] = item.get("current_episode")
                    content_dict["timeLeft"] = item.get("time_left")
                    
                    content_list.append(ContentResponse(**content_dict))
            
            return content_list

        except Exception as e:
            logger.error(f"Error getting continue watching: {str(e)}")
            return []

    async def update_viewing_progress(self, profile_id: str, content_id: str, progress_data: ViewingProgressUpdate) -> bool:
        """Update viewing progress"""
        try:
            # Try to update existing progress
            result = await self.progress_collection.update_one(
                {"profile_id": profile_id, "content_id": content_id},
                {"$set": {**progress_data.dict(exclude_none=True), "last_watched": ViewingProgress().last_watched}}
            )
            
            if result.matched_count == 0:
                # Create new progress entry
                content = await self.content_service.get_content_details(content_id)
                if not content:
                    return False
                
                viewing_progress = ViewingProgress(
                    profile_id=profile_id,
                    content_id=content_id,
                    tmdb_id=content.tmdb_id,
                    content_type=content.type,
                    **progress_data.dict(exclude_none=True)
                )
                
                await self.progress_collection.insert_one(viewing_progress.dict())
            
            return True

        except Exception as e:
            logger.error(f"Error updating viewing progress: {str(e)}")
            return False

    async def create_viewing_progress(self, profile_id: str, progress_data: ViewingProgressCreate) -> bool:
        """Create viewing progress entry"""
        try:
            viewing_progress = ViewingProgress(
                profile_id=profile_id,
                **progress_data.dict()
            )
            
            # Upsert the progress
            await self.progress_collection.replace_one(
                {"profile_id": profile_id, "content_id": progress_data.content_id},
                viewing_progress.dict(),
                upsert=True
            )
            
            return True

        except Exception as e:
            logger.error(f"Error creating viewing progress: {str(e)}")
            return False