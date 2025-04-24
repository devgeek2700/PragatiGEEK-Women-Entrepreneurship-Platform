import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  getAllCourses,
  getEnrolledCourses,
  getAdminCourses
} from "../../redux/slices/CourseSlice";
import HomeLayout from "../../layouts/HomeLayout";
import CourseCard from "./CourseCard";

function CourseList() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');
  
  const dispatch = useDispatch();
  const { courseData, enrolledCourses, adminCourses, loading } = useSelector(
    (state) => state.course
  );
  const [activeTab, setActiveTab] = useState(tabParam === 'admin' ? 'all' : 'all');
  const { isLoggedIn, role } = useSelector((state) => state.auth);
  const [displayedCourses, setDisplayedCourses] = useState([]);

  useEffect(() => {
    // Set initial tab based on URL parameter
    if (tabParam === 'admin' && role === 'ADMIN') {
      setActiveTab('all');
    } else if (tabParam === 'marketplace') {
      setActiveTab('marketplace');
    } else if (tabParam === 'enrolled' && role !== 'ADMIN') {
      setActiveTab('enrolled');
    }
  }, [tabParam, role]);

  useEffect(() => {
    // Load the appropriate courses based on user role
    if (role === "ADMIN") {
      dispatch(getAdminCourses());
      dispatch(getAllCourses()); // Also get all courses for admin to view
    } else {
      dispatch(getAllCourses());
      if (isLoggedIn) {
        dispatch(getEnrolledCourses());
      }
    }
  }, [dispatch, isLoggedIn, role]);

  // Update displayed courses when tab changes or when data is loaded
  useEffect(() => {
    if (role === "ADMIN") {
      if (activeTab === "all") {
        setDisplayedCourses(adminCourses);
      } else if (activeTab === "marketplace") {
        setDisplayedCourses(courseData);
      }
    } else {
      if (activeTab === "all") {
        setDisplayedCourses(courseData);
      } else if (activeTab === "enrolled") {
        setDisplayedCourses(enrolledCourses);
      }
    }
  }, [activeTab, courseData, enrolledCourses, adminCourses, role]);

  return (
    <HomeLayout>
      <div className="min-h-[90vh] pt-12 px-20">
        <h1 className="text-center text-3xl font-bold mb-8 text-black">
          {role === "ADMIN" && activeTab === "all" ? "Your Uploaded Courses" : 
           role === "ADMIN" && activeTab === "marketplace" ? "All Courses Marketplace" :
           activeTab === "enrolled" ? "My Enrolled Courses" :
           "Explore Our Courses"}
        </h1>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex gap-4 p-1 bg-white rounded-lg shadow-md">
            <button
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === "all"
                  ? "bg-yellow-500 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("all")}
            >
              {role === "ADMIN" ? "My Uploaded Courses" : "All Courses"}
            </button>
            
            {/* Admin sees "All Courses Marketplace" tab */}
            {isLoggedIn && role === "ADMIN" && (
              <button
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === "marketplace"
                    ? "bg-yellow-500 text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("marketplace")}
              >
                All Courses Marketplace
              </button>
            )}
            
            {/* Regular users see "My Enrolled Courses" tab */}
            {isLoggedIn && role !== "ADMIN" && (
              <button
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === "enrolled"
                    ? "bg-yellow-500 text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("enrolled")}
              >
                My Enrolled Courses
              </button>
            )}
          </div>
        </div>

        {/* Content based on active tab */}
        {loading ? (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-8 justify-center">
            {displayedCourses?.length > 0 ? (
              displayedCourses.map((course) => {
                // Check if course exists in enrolledCourses
                const isEnrolled = role !== "ADMIN" && enrolledCourses?.some(
                  (enrolledCourse) => enrolledCourse._id === course._id
                );
                return (
                  <CourseCard
                    key={course._id}
                    data={course}
                    isEnrolled={isEnrolled}
                  />
                );
              })
            ) : (
              <p className="text-center text-black text-xl">
                {role === "ADMIN" && activeTab === "all" 
                  ? "You haven't uploaded any courses yet."
                  : role === "ADMIN" && activeTab === "marketplace"
                  ? "No courses available in the marketplace."
                  : activeTab === "enrolled"
                  ? "You haven't enrolled in any courses yet."
                  : "No courses available."}
              </p>
            )}
          </div>
        )}
      </div>
    </HomeLayout>
  );
}

export default CourseList;
