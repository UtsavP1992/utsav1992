from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from services.tmdb_service import tmdb_service
from models.content import Content, ContentCreate, ContentResponse
import logging
import asyncio

logger = logging.getLogger(__name__)

class ContentService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.content_collection = db.content
        
    async def get_or_create_content(self, tmdb_data: Dict[str, Any], content_type: str) -> Optional[ContentResponse]:
        """Get content from DB or create from TMDB data"""
        tmdb_id = tmdb_data.get("id")
        if not tmdb_id:
            return None
            
        # Check if content exists in DB
        existing = await self.content_collection.find_one({"tmdb_id": tmdb_id, "content_type": content_type})
        
        if existing:
            return self._format_content_response(existing)
        
        # Create new content from TMDB data
        try:
            # Get trailer URL
            if content_type == "movie":
                videos = await tmdb_service.get_movie_videos(tmdb_id)
            else:
                videos = await tmdb_service.get_tv_videos(tmdb_id)
            
            trailer_url = tmdb_service.extract_youtube_trailer(videos)
            
            # Create content object
            content_data = ContentCreate(
                title=tmdb_data.get("title") or tmdb_data.get("name", "Unknown Title"),
                overview=tmdb_data.get("overview"),
                poster_path=tmdb_data.get("poster_path"),
                backdrop_path=tmdb_data.get("backdrop_path"),
                content_type=content_type,
                tmdb_id=tmdb_id,
                genre_ids=tmdb_data.get("genre_ids", []),
                release_date=tmdb_data.get("release_date"),
                first_air_date=tmdb_data.get("first_air_date"),
                vote_average=tmdb_data.get("vote_average", 0),
                popularity=tmdb_data.get("popularity", 0),
                adult=tmdb_data.get("adult", False),
                original_language=tmdb_data.get("original_language", "en"),
                trailer_url=trailer_url,
                rating=tmdb_service.get_content_rating(tmdb_data, content_type),
                seasons=f"{tmdb_data.get('number_of_seasons', 1)} Season{'s' if tmdb_data.get('number_of_seasons', 1) != 1 else ''}" if content_type == "tv" else None
            )
            
            content = Content(**content_data.dict())
            await self.content_collection.insert_one(content.dict())
            
            return self._format_content_response(content.dict())
            
        except Exception as e:
            logger.error(f"Error creating content: {str(e)}")
            return None

    async def get_trending_content(self) -> List[ContentResponse]:
        """Get trending movies and TV shows"""
        try:
            # Get trending from TMDB
            trending_movies = await tmdb_service.get_trending_movies("week")
            trending_tv = await tmdb_service.get_trending_tv("week")
            
            # Combine and limit results
            all_trending = trending_movies[:10] + trending_tv[:10]
            
            # Process each item
            content_list = []
            for item in all_trending:
                content_type = "movie" if "title" in item else "tv"
                content = await self.get_or_create_content(item, content_type)
                if content:
                    content_list.append(content)
            
            return content_list[:20]  # Limit to 20 items
            
        except Exception as e:
            logger.error(f"Error getting trending content: {str(e)}")
            return []

    async def get_popular_content(self) -> List[ContentResponse]:
        """Get popular movies and TV shows"""
        try:
            # Get popular from TMDB
            popular_movies = await tmdb_service.get_popular_movies()
            popular_tv = await tmdb_service.get_popular_tv()
            
            # Combine and limit results
            all_popular = popular_movies[:10] + popular_tv[:10]
            
            # Process each item
            content_list = []
            for item in all_popular:
                content_type = "movie" if "title" in item else "tv"
                content = await self.get_or_create_content(item, content_type)
                if content:
                    content_list.append(content)
            
            return content_list[:20]  # Limit to 20 items
            
        except Exception as e:
            logger.error(f"Error getting popular content: {str(e)}")
            return []

    async def get_content_by_genre(self, genre_name: str) -> List[ContentResponse]:
        """Get content by genre"""
        try:
            # Map genre names to IDs (common genres)
            genre_map = {
                "action": 28,
                "adventure": 12,
                "comedy": 35,
                "drama": 18,
                "horror": 27,
                "thriller": 53,
                "sci-fi": 878,
                "fantasy": 14,
                "crime": 80,
                "mystery": 9648,
                "romance": 10749,
                "family": 10751
            }
            
            genre_id = genre_map.get(genre_name.lower())
            if not genre_id:
                return []
            
            # Get content from TMDB
            movies = await tmdb_service.discover_movies(genre_id)
            tv_shows = await tmdb_service.discover_tv(genre_id)
            
            # Combine results
            all_content = movies[:12] + tv_shows[:8]
            
            # Process each item
            content_list = []
            for item in all_content:
                content_type = "movie" if "title" in item else "tv"
                content = await self.get_or_create_content(item, content_type)
                if content:
                    content_list.append(content)
            
            return content_list[:20]
            
        except Exception as e:
            logger.error(f"Error getting content by genre: {str(e)}")
            return []

    async def search_content(self, query: str) -> List[ContentResponse]:
        """Search for content"""
        try:
            results = await tmdb_service.search_multi(query)
            
            content_list = []
            for item in results:
                # Skip person results
                if item.get("media_type") == "person":
                    continue
                    
                content_type = item.get("media_type", "movie")
                if content_type not in ["movie", "tv"]:
                    continue
                    
                content = await self.get_or_create_content(item, content_type)
                if content:
                    content_list.append(content)
            
            return content_list[:30]
            
        except Exception as e:
            logger.error(f"Error searching content: {str(e)}")
            return []

    async def get_featured_content(self) -> Optional[ContentResponse]:
        """Get featured content for hero section"""
        try:
            # Get trending movies and pick the most popular one
            trending = await tmdb_service.get_trending_movies("week")
            if not trending:
                return None
                
            featured_item = trending[0]  # Most trending
            content = await self.get_or_create_content(featured_item, "movie")
            
            return content
            
        except Exception as e:
            logger.error(f"Error getting featured content: {str(e)}")
            return None

    async def get_content_details(self, content_id: str) -> Optional[ContentResponse]:
        """Get detailed content information"""
        try:
            content = await self.content_collection.find_one({"id": content_id})
            if content:
                return self._format_content_response(content)
            return None
        except Exception as e:
            logger.error(f"Error getting content details: {str(e)}")
            return None

    def _format_content_response(self, content_data: Dict[str, Any]) -> ContentResponse:
        """Format content data for API response"""
        return ContentResponse(
            id=content_data.get("id"),
            title=content_data.get("title"),
            image=tmdb_service.get_full_image_url(content_data.get("poster_path")),
            backdrop=tmdb_service.get_full_image_url(content_data.get("backdrop_path"), "original"),
            logo=tmdb_service.get_full_image_url(content_data.get("logo_path"), "original"),
            type="series" if content_data.get("content_type") == "tv" else "movie",
            rating=content_data.get("rating"),
            year=str(tmdb_service.get_content_year({"release_date": content_data.get("release_date"), "first_air_date": content_data.get("first_air_date")})),
            genre=content_data.get("genre_names", ["Drama"]),
            description=content_data.get("overview"),
            seasons=content_data.get("seasons"),
            trailerUrl=content_data.get("trailer_url"),
            tmdb_id=content_data.get("tmdb_id"),
            vote_average=content_data.get("vote_average", 0),
            popularity=content_data.get("popularity", 0)
        )