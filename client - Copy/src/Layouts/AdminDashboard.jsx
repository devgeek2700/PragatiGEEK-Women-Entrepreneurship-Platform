import { useEffect, useState } from "react";
import {
  FaUsers,
  FaStore,
  FaShoppingCart,
  FaRupeeSign,
  FaBook,
  FaBox,
  FaPlus,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { Line, Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { toast } from "react-toastify";

import axiosInstance from "../../helpers/AxiosInstance";
import HomeLayout from "../../layouts/HomeLayout";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    counts: {
      users: 0,
      sellers: 0,
      orders: 0,
      products: 0,
      courses: 0,
    },
    revenue: {
      total: 0,
      average: 0,
      max: 0,
      min: 0,
    },
    recentOrders: [],
    monthlyData: [],
    topProducts: [],
    topCourses: [],
    topSellers: [],
  });
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchCourses();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/admin/dashboard");
      setStats(response.data.stats);
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
      console.error("Dashboard Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get("/course");
      setCourses(response.data.courses);
    } catch (error) {
      toast.error("Failed to fetch courses");
      console.error("Courses Error:", error);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await axiosInstance.delete(`/course/${courseId}`);
        toast.success("Course deleted successfully");
        fetchCourses();
      } catch (error) {
        toast.error("Failed to delete course");
        console.error("Delete Course Error:", error);
      }
    }
  };

  const handleEditCourse = (course) => {
    navigate(`/course/${course.title}/${course._id}/editCourse`, {
      state: course,
    });
  };

  const handleAddCourse = () => {
    navigate("/course/create");
  };

  const handleAddLecture = (course) => {
    navigate(`/course/${course.title}/${course._id}/lectures/addlecture`, {
      state: course,
    });
  };

  // ... existing chart data and options ...

  if (isLoading) {
    return (
      <HomeLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout>
      <div className="container mx-auto p-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <IoArrowBack size={20} />
          <span>Back</span>
        </button>

        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Admin Dashboard
        </h1>

        {/* Add Course Button */}
        <div className="mb-6">
          <button
            onClick={handleAddCourse}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
          >
            <FaPlus />
            Add New Course
          </button>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Course Management</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={course.thumbnail?.secure_url}
                        alt={course.title}
                        className="h-12 w-12 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {course.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.createdBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{course.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCourse(course)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleAddLecture(course)}
                          className="text-green-500 hover:text-green-700"
                        >
                          <FaPlus size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ... rest of the existing dashboard content ... */}
      </div>
    </HomeLayout>
  );
};

export default AdminDashboard;
