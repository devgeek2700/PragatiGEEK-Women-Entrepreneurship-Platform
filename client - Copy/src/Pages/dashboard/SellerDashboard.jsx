import { useEffect, useState } from "react";
import {
  BsBox,
  BsGraphUp,
  BsShop,
  BsWallet2,
  BsCashStack,
} from "react-icons/bs";
import { Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { toast } from "react-toastify";

import axiosInstance from "../../helpers/AxiosInstance";
import SellerEarnings from "../../components/SellerEarnings";
import HomeLayout from "../../layouts/HomeLayout";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    monthlyRevenue: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const handleBack = () => {
    navigate(-1);
  };

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching seller dashboard stats...");
      const { data } = await axiosInstance.get("/seller/dashboard/stats");
      console.log("Received stats data:", data);

      if (data.success && data.stats) {
        console.log("Setting stats:", data.stats);
        setStats(data.stats);
      } else {
        console.error("Failed to load dashboard data:", data);
        toast.error("Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Dashboard error:", error?.response?.data || error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch dashboard data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Add periodic refresh of stats
  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Add manual refresh function
  const handleRefresh = () => {
    fetchStats();
  };

  useEffect(() => {
    console.log("Current stats state:", stats);
  }, [stats]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Monthly Revenue",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "₹" + value;
          },
        },
      },
    },
  };

  const chartData = {
    labels:
      stats.monthlyRevenue?.length > 0
        ? stats.monthlyRevenue.map(
            (item) => `${item._id?.month || "N/A"}/${item._id?.year || "N/A"}`
          )
        : ["No Data"],
    datasets: [
      {
        label: "Revenue (₹)",
        data:
          stats.monthlyRevenue?.length > 0
            ? stats.monthlyRevenue.map((item) => item.total || 0)
            : [0],
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-black text-sm font-medium uppercase">{title}</p>
          <p className="text-2xl font-bold mt-1 text-black">{value}</p>
        </div>
        <div
          className={`p-3 rounded-full ${color
            .replace("border-", "bg-")
            .replace("-500", "-100")}`}
        >
          <Icon className={`text-2xl ${color.replace("border-", "text-")}`} />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <HomeLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </HomeLayout>
    );
  }

  // Calculate monthly growth
  const calculateMonthlyGrowth = () => {
    if (!stats.monthlyRevenue || stats.monthlyRevenue.length < 2) {
      return "0.0";
    }
    const currentMonth =
      stats.monthlyRevenue[stats.monthlyRevenue.length - 1].total || 0;
    const lastMonth =
      stats.monthlyRevenue[stats.monthlyRevenue.length - 2].total || 1;
    const growth = (currentMonth / lastMonth) * 100 - 100;
    return growth.toFixed(1);
  };

  return (
    <HomeLayout>
      <div className="container mx-auto p-6">
        {/* Back button and refresh button */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <IoArrowBack size={20} />
            <span>Back</span>
          </button>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/dashboard/funding-schemes")}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <BsCashStack className="text-xl" />
              <span>Funding Schemes</span>
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
              <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-black">Seller Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Products"
            value={stats.totalProducts || 0}
            icon={BsBox}
            color="border-blue-500"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders || 0}
            icon={BsShop}
            color="border-green-500"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${(stats.totalRevenue || 0).toLocaleString()}`}
            icon={BsWallet2}
            color="border-yellow-500"
          />
          <StatCard
            title="Monthly Growth"
            value={`${calculateMonthlyGrowth()}%`}
            icon={BsGraphUp}
            color="border-purple-500"
          />
        </div>

        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <Line options={chartOptions} data={chartData} />
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4 text-black">Recent Orders</h2>
          {stats.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-black">
                          {order.buyer?.name || "N/A"}
                        </div>
                        <div className="text-sm text-black">
                          {order.buyer?.email || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                        ₹{(order.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${
                                                      order.status ===
                                                      "Processing"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : order.status ===
                                                          "Completed"
                                                        ? "bg-green-100 text-green-800"
                                                        : order.status ===
                                                          "Cancelled"
                                                        ? "bg-red-100 text-red-800"
                                                        : order.status ===
                                                          "Pending"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-gray-100 text-gray-800"
                                                    }`}
                        >
                          {order.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-black">
              No recent orders found
            </div>
          )}
        </div>

        {/* Earnings Component */}
        <SellerEarnings />
      </div>
    </HomeLayout>
  );
};

export default SellerDashboard;
