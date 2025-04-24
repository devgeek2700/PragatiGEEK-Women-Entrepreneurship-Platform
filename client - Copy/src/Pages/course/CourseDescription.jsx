import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";
import { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp, FaPlay, FaEdit, FaVideo } from "react-icons/fa";
import { useDispatch } from "react-redux";

import HomeLayout from "../../layouts/HomeLayout";
import { getLectures } from "../../redux/slices/LectureSlice";

function CourseDescription() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { role, data } = useSelector((state) => state.auth);
  const [openModule, setOpenModule] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state && state._id) {
      fetchLectures();
    }
  }, [state]);

  const fetchLectures = async () => {
    setLoading(true);
    try {
      const response = await dispatch(getLectures(state._id));
      if (response.payload && response.payload.lectures) {
        setLectures(response.payload.lectures);
      }
    } catch (error) {
      console.error("Error fetching lectures:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/course/${state.title}/${state._id}/editCourse`, {
      state: state,
    });
  };

  const handleViewLectures = () => {
    navigate(`/course/${state.title}/${state._id}/lectures`, {
      state: state,
    });
  };

  const handleAddLecture = () => {
    navigate(`/course/${state.title}/${state._id}/lectures/addlecture`, {
      state: state,
    });
  };

  // Use fetched lectures or fallback to sample data if not available
  const modules = lectures.length > 0 ? lectures : (state.lectures || [
    {
      _id: 1,
      title: "Introduction to the Course",
      description: "Get started with the basics",
      videoUrl: "https://example.com/video1",
      duration: "10:00",
    },
    {
      _id: 2,
      title: "Core Concepts",
      description: "Learn the fundamental principles",
      videoUrl: "https://example.com/video2",
      duration: "15:00",
    },
    // Add more modules as needed
  ]);

  const toggleModule = (moduleId) => {
    setOpenModule(openModule === moduleId ? null : moduleId);
  };

  // Determine if user can access the course content
  const canAccessContent = role === "ADMIN" || state.isEnrolled || data?.subscription?.status === "active";

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gray-100">
        {/* Course Header Section */}
        <div className="bg-white shadow-lg">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column - Thumbnail and Basic Info */}
              <div className="lg:w-1/2">
                <div className="relative">
                  <img
                    src={state.thumbnail?.secure_url}
                    alt="thumbnail"
                    className="rounded-xl w-full h-[400px] object-cover shadow-md"
                  />
                  {role === "ADMIN" && (
                    <button
                      onClick={handleEdit}
                      className="absolute top-4 right-4 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors duration-200 shadow-lg"
                    >
                      <FiEdit2 size={24} />
                    </button>
                  )}
                </div>

                {/* Course Stats */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">Category</p>
                    <p className="text-black font-semibold capitalize">
                      {state.category}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">Instructor</p>
                    <p className="text-black font-semibold capitalize">
                      {state.createdBy}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">Lectures</p>
                    <p className="text-black font-semibold">
                      {state.numberOfLectures}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">Price</p>
                    <p className="text-black font-semibold">₹{state.price}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  {/* Admin actions */}
                  {role === "ADMIN" && (
                    <div className="flex flex-col space-y-3">
                      <button
                        className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-200 shadow-md flex items-center justify-center gap-2"
                        onClick={handleViewLectures}
                      >
                        <FaPlay className="text-white" />
                        View All Lectures
                      </button>
                      <button
                        className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200 shadow-md flex items-center justify-center gap-2"
                        onClick={handleAddLecture}
                      >
                        <FaVideo className="text-white" />
                        Add New Lecture
                      </button>
                      <button
                        className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-600 transition-colors duration-200 shadow-md flex items-center justify-center gap-2"
                        onClick={handleEdit}
                      >
                        <FaEdit className="text-white" />
                        Edit Course Details
                      </button>
                    </div>
                  )}

                  {/* User actions */}
                  {role !== "ADMIN" && (
                    <>
                      {state.isEnrolled || data?.subscription?.status === "active" ? (
                        <button
                          className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-200 shadow-md"
                          onClick={handleViewLectures}
                        >
                          Go to Lectures
                        </button>
                      ) : (
                        <button
                          className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-200 shadow-md"
                          onClick={() =>
                            navigate(`/course/${state.title}/checkout`, {
                              state: state,
                            })
                          }
                        >
                          Subscribe to Course
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Right Column - Course Info and Modules */}
              <div className="lg:w-1/2">
                <h1 className="text-3xl font-bold text-black mb-4 capitalize">
                  {state.title}
                </h1>
                <div className="bg-white rounded-lg p-6 shadow-md mb-6">
                  <h2 className="text-xl font-semibold text-black mb-3">
                    Course Description
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {state.description}
                  </p>
                </div>

                {/* Course Modules Accordion */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-black mb-4">
                    Course Content
                  </h2>
                  {loading ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : modules.length > 0 ? (
                    modules.map((module) => (
                      <div
                        key={module._id}
                        className="bg-white rounded-lg shadow-md overflow-hidden"
                      >
                        <button
                          onClick={() => toggleModule(module._id)}
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <FaPlay className="text-blue-500" />
                            <span className="font-medium text-black">
                              {module.title}
                            </span>
                          </div>
                          {openModule === module._id ? (
                            <FaChevronUp className="text-gray-500" />
                          ) : (
                            <FaChevronDown className="text-gray-500" />
                          )}
                        </button>

                        {openModule === module._id && (
                          <div className="px-6 py-4 bg-gray-50">
                            <p className="text-gray-700 mb-4">
                              {module.description}
                            </p>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>Duration: {module.duration || "Not specified"}</span>
                              {canAccessContent && (
                                <button
                                  className="text-blue-500 hover:text-blue-600 font-medium"
                                  onClick={() => {
                                    navigate(`/course/${state.title}/${state._id}/lectures`, {
                                      state: {
                                        ...state,
                                        currentLecture: module._id
                                      },
                                    });
                                  }}
                                >
                                  Watch Video
                                </button>
                              )}
                              {role === "ADMIN" && (
                                <button
                                  className="text-green-500 hover:text-green-600 font-medium ml-4"
                                  onClick={() => {
                                    navigate(`/course/${state.title}/${state._id}/lectures/editlecture`, {
                                      state: module
                                    });
                                  }}
                                >
                                  Edit Lecture
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <p className="text-gray-500">No lectures available yet.</p>
                      {role === "ADMIN" && (
                        <button
                          onClick={handleAddLecture}
                          className="mt-4 inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                        >
                          <FaVideo className="mr-2" />
                          Add First Lecture
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

export default CourseDescription;
