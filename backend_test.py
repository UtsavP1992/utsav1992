#!/usr/bin/env python3
"""
Netflix Clone Backend API Test Suite
Tests all backend API endpoints for functionality and data integrity
"""

import asyncio
import httpx
import json
import sys
from typing import Dict, List, Any, Optional
from datetime import datetime

# Configuration
BACKEND_URL = "https://netflixclone-1000.preview.emergentagent.com/api"
TIMEOUT = 30.0

class NetflixAPITester:
    def __init__(self):
        self.client = None
        self.test_results = []
        self.failed_tests = []
        
    async def setup(self):
        """Initialize HTTP client"""
        self.client = httpx.AsyncClient(timeout=TIMEOUT)
        
    async def cleanup(self):
        """Cleanup HTTP client"""
        if self.client:
            await self.client.aclose()
    
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        
        if not success:
            self.failed_tests.append(result)
            
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        
    async def test_health_check(self):
        """Test health check endpoint"""
        try:
            response = await self.client.get(f"{BACKEND_URL}/health")
            
            if response.status_code == 200:
                data = response.json()
                if "status" in data and data["status"] == "healthy":
                    self.log_test("Health Check", True, f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_test("Health Check", False, f"Invalid response format: {data}")
            else:
                self.log_test("Health Check", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
    
    async def test_featured_content(self):
        """Test featured content endpoint"""
        try:
            response = await self.client.get(f"{BACKEND_URL}/content/featured")
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate response structure
                required_fields = ["id", "title", "image", "type", "year", "genre", "description"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    # Check if it's real movie data
                    has_tmdb_data = data.get("tmdb_id") is not None
                    has_valid_image = data.get("image") and "tmdb.org" in data.get("image", "")
                    
                    if has_tmdb_data and has_valid_image:
                        self.log_test("Featured Content", True, 
                                    f"Valid featured content: {data.get('title')} (TMDB ID: {data.get('tmdb_id')})")
                    else:
                        self.log_test("Featured Content", False, 
                                    f"Missing TMDB integration data: {data}")
                else:
                    self.log_test("Featured Content", False, 
                                f"Missing required fields: {missing_fields}")
            else:
                self.log_test("Featured Content", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Featured Content", False, f"Exception: {str(e)}")
    
    async def test_trending_content(self):
        """Test trending content endpoint"""
        try:
            response = await self.client.get(f"{BACKEND_URL}/content/trending")
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list) and len(data) > 0:
                    # Check first item structure
                    first_item = data[0]
                    required_fields = ["id", "title", "image", "type", "year", "genre"]
                    missing_fields = [field for field in required_fields if field not in first_item]
                    
                    if not missing_fields:
                        # Validate TMDB integration
                        tmdb_items = [item for item in data if item.get("tmdb_id")]
                        valid_images = [item for item in data if item.get("image") and "tmdb.org" in item.get("image", "")]
                        
                        if len(tmdb_items) > 0 and len(valid_images) > 0:
                            self.log_test("Trending Content", True, 
                                        f"Retrieved {len(data)} trending items with TMDB data")
                        else:
                            self.log_test("Trending Content", False, 
                                        f"Missing TMDB integration: {len(tmdb_items)} TMDB items, {len(valid_images)} valid images")
                    else:
                        self.log_test("Trending Content", False, 
                                    f"Missing required fields in items: {missing_fields}")
                else:
                    self.log_test("Trending Content", False, 
                                f"Empty or invalid response: {type(data)}, length: {len(data) if isinstance(data, list) else 'N/A'}")
            else:
                self.log_test("Trending Content", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Trending Content", False, f"Exception: {str(e)}")
    
    async def test_popular_content(self):
        """Test popular content endpoint"""
        try:
            response = await self.client.get(f"{BACKEND_URL}/content/popular")
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list) and len(data) > 0:
                    # Check data quality
                    first_item = data[0]
                    required_fields = ["id", "title", "image", "type", "year", "genre"]
                    missing_fields = [field for field in required_fields if field not in first_item]
                    
                    if not missing_fields:
                        # Check for real movie/TV data
                        has_real_data = any(item.get("tmdb_id") for item in data)
                        has_valid_images = any(item.get("image") and "tmdb.org" in item.get("image", "") for item in data)
                        
                        if has_real_data and has_valid_images:
                            self.log_test("Popular Content", True, 
                                        f"Retrieved {len(data)} popular items with real TMDB data")
                        else:
                            self.log_test("Popular Content", False, 
                                        f"Missing real TMDB data in popular content")
                    else:
                        self.log_test("Popular Content", False, 
                                    f"Missing required fields: {missing_fields}")
                else:
                    self.log_test("Popular Content", False, 
                                f"Empty or invalid response format")
            else:
                self.log_test("Popular Content", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Popular Content", False, f"Exception: {str(e)}")
    
    async def test_search_content(self):
        """Test search functionality"""
        search_queries = ["stranger", "avengers", "breaking bad", "netflix"]
        
        for query in search_queries:
            try:
                response = await self.client.get(f"{BACKEND_URL}/content/search", params={"q": query})
                
                if response.status_code == 200:
                    data = response.json()
                    
                    if isinstance(data, list):
                        if len(data) > 0:
                            # Check if results are relevant
                            first_item = data[0]
                            title = first_item.get("title", "").lower()
                            description = first_item.get("description", "").lower()
                            
                            # Check if search term appears in title or description
                            query_lower = query.lower()
                            is_relevant = query_lower in title or query_lower in description
                            
                            if is_relevant or query == "netflix":  # Netflix might not appear in titles
                                self.log_test(f"Search '{query}'", True, 
                                            f"Found {len(data)} relevant results")
                            else:
                                self.log_test(f"Search '{query}'", False, 
                                            f"Results not relevant to query '{query}': {title}")
                        else:
                            # Empty results might be valid for some queries
                            self.log_test(f"Search '{query}'", True, 
                                        f"No results found for '{query}' (valid response)")
                    else:
                        self.log_test(f"Search '{query}'", False, 
                                    f"Invalid response format: {type(data)}")
                else:
                    self.log_test(f"Search '{query}'", False, 
                                f"Status: {response.status_code}, Response: {response.text}")
                    
            except Exception as e:
                self.log_test(f"Search '{query}'", False, f"Exception: {str(e)}")
    
    async def test_genre_content(self):
        """Test genre-based content retrieval"""
        genres = ["action", "comedy", "horror", "drama"]
        
        for genre in genres:
            try:
                response = await self.client.get(f"{BACKEND_URL}/content/genre/{genre}")
                
                if response.status_code == 200:
                    data = response.json()
                    
                    if isinstance(data, list) and len(data) > 0:
                        # Check if content matches genre
                        first_item = data[0]
                        item_genres = first_item.get("genre", [])
                        
                        # Check for TMDB integration
                        has_tmdb_data = first_item.get("tmdb_id") is not None
                        has_valid_image = first_item.get("image") and "tmdb.org" in first_item.get("image", "")
                        
                        if has_tmdb_data and has_valid_image:
                            self.log_test(f"Genre '{genre}'", True, 
                                        f"Retrieved {len(data)} {genre} items with TMDB data")
                        else:
                            self.log_test(f"Genre '{genre}'", False, 
                                        f"Missing TMDB integration for {genre} content")
                    else:
                        self.log_test(f"Genre '{genre}'", False, 
                                    f"No content found for genre '{genre}'")
                else:
                    self.log_test(f"Genre '{genre}'", False, 
                                f"Status: {response.status_code}, Response: {response.text}")
                    
            except Exception as e:
                self.log_test(f"Genre '{genre}'", False, f"Exception: {str(e)}")
    
    async def test_user_profiles_get(self):
        """Test getting user profiles"""
        try:
            response = await self.client.get(f"{BACKEND_URL}/users/profiles")
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    if len(data) > 0:
                        # Check profile structure
                        first_profile = data[0]
                        required_fields = ["id", "name"]
                        missing_fields = [field for field in required_fields if field not in first_profile]
                        
                        if not missing_fields:
                            self.log_test("Get User Profiles", True, 
                                        f"Retrieved {len(data)} user profiles")
                        else:
                            self.log_test("Get User Profiles", False, 
                                        f"Missing required fields in profile: {missing_fields}")
                    else:
                        # Empty profiles should trigger default profile creation
                        self.log_test("Get User Profiles", True, 
                                    "No profiles found - should create defaults")
                else:
                    self.log_test("Get User Profiles", False, 
                                f"Invalid response format: {type(data)}")
            else:
                self.log_test("Get User Profiles", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Get User Profiles", False, f"Exception: {str(e)}")
    
    async def test_user_profiles_create(self):
        """Test creating user profiles"""
        test_profiles = [
            {"name": "John Doe", "avatar": "adult"},
            {"name": "Jane Smith", "avatar": "adult"},
            {"name": "Kids Profile", "avatar": "kids"}
        ]
        
        for profile_data in test_profiles:
            try:
                response = await self.client.post(
                    f"{BACKEND_URL}/users/profiles",
                    json=profile_data
                )
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Check if created profile has required fields
                    required_fields = ["id", "name"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        created_name = data.get("name")
                        if created_name == profile_data["name"]:
                            self.log_test(f"Create Profile '{profile_data['name']}'", True, 
                                        f"Successfully created profile: {created_name}")
                        else:
                            self.log_test(f"Create Profile '{profile_data['name']}'", False, 
                                        f"Name mismatch: expected {profile_data['name']}, got {created_name}")
                    else:
                        self.log_test(f"Create Profile '{profile_data['name']}'", False, 
                                    f"Missing required fields: {missing_fields}")
                else:
                    self.log_test(f"Create Profile '{profile_data['name']}'", False, 
                                f"Status: {response.status_code}, Response: {response.text}")
                    
            except Exception as e:
                self.log_test(f"Create Profile '{profile_data['name']}'", False, f"Exception: {str(e)}")
    
    async def test_database_operations(self):
        """Test database connectivity and operations"""
        try:
            # Test by creating and retrieving a profile
            test_profile = {"name": "Database Test User", "avatar": "adult"}
            
            # Create profile
            create_response = await self.client.post(
                f"{BACKEND_URL}/users/profiles",
                json=test_profile
            )
            
            if create_response.status_code == 200:
                created_profile = create_response.json()
                profile_id = created_profile.get("id")
                
                # Retrieve profiles to verify persistence
                get_response = await self.client.get(f"{BACKEND_URL}/users/profiles")
                
                if get_response.status_code == 200:
                    profiles = get_response.json()
                    
                    # Check if our created profile exists
                    found_profile = next((p for p in profiles if p.get("id") == profile_id), None)
                    
                    if found_profile:
                        self.log_test("Database Operations", True, 
                                    "Successfully created and retrieved profile from database")
                    else:
                        self.log_test("Database Operations", False, 
                                    "Created profile not found in database")
                else:
                    self.log_test("Database Operations", False, 
                                f"Failed to retrieve profiles: {get_response.status_code}")
            else:
                self.log_test("Database Operations", False, 
                            f"Failed to create test profile: {create_response.status_code}")
                
        except Exception as e:
            self.log_test("Database Operations", False, f"Exception: {str(e)}")
    
    async def test_error_handling(self):
        """Test error handling for invalid requests"""
        error_tests = [
            {
                "name": "Invalid Genre",
                "url": f"{BACKEND_URL}/content/genre/invalidgenre",
                "expected_behavior": "Should return empty list or 404"
            },
            {
                "name": "Empty Search Query",
                "url": f"{BACKEND_URL}/content/search?q=",
                "expected_behavior": "Should return empty list"
            },
            {
                "name": "Invalid Content ID",
                "url": f"{BACKEND_URL}/content/invalid-id-12345",
                "expected_behavior": "Should return 404"
            }
        ]
        
        for test in error_tests:
            try:
                response = await self.client.get(test["url"])
                
                # Accept various valid error responses
                if response.status_code in [200, 404]:
                    if response.status_code == 200:
                        data = response.json()
                        if isinstance(data, list) and len(data) == 0:
                            self.log_test(f"Error Handling - {test['name']}", True, 
                                        "Correctly returned empty list")
                        else:
                            self.log_test(f"Error Handling - {test['name']}", True, 
                                        f"Returned data: {len(data) if isinstance(data, list) else 'non-list'}")
                    else:  # 404
                        self.log_test(f"Error Handling - {test['name']}", True, 
                                    "Correctly returned 404 for invalid request")
                else:
                    self.log_test(f"Error Handling - {test['name']}", False, 
                                f"Unexpected status: {response.status_code}")
                    
            except Exception as e:
                self.log_test(f"Error Handling - {test['name']}", False, f"Exception: {str(e)}")
    
    async def run_all_tests(self):
        """Run all test suites"""
        print("🎬 Starting Netflix Clone Backend API Tests")
        print(f"🔗 Testing against: {BACKEND_URL}")
        print("=" * 60)
        
        await self.setup()
        
        try:
            # Core API tests
            await self.test_health_check()
            await self.test_featured_content()
            await self.test_trending_content()
            await self.test_popular_content()
            await self.test_search_content()
            await self.test_genre_content()
            
            # User API tests
            await self.test_user_profiles_get()
            await self.test_user_profiles_create()
            
            # Integration tests
            await self.test_database_operations()
            await self.test_error_handling()
            
        finally:
            await self.cleanup()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t["success"]])
        failed_tests = len(self.failed_tests)
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if self.failed_tests:
            print("\n🚨 FAILED TESTS:")
            for test in self.failed_tests:
                print(f"  • {test['test']}: {test['details']}")
        
        print("\n" + "=" * 60)
        return failed_tests == 0

async def main():
    """Main test runner"""
    tester = NetflixAPITester()
    success = await tester.run_all_tests()
    
    if success:
        print("🎉 All tests passed! Netflix Clone backend is working correctly.")
        sys.exit(0)
    else:
        print("⚠️  Some tests failed. Check the details above.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())