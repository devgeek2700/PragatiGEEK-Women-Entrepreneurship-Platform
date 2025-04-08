import { useEffect, useState } from "react";
import { FaUsers, FaStore, FaShoppingCart, FaRupeeSign, FaBook, FaBox } from "react-icons/fa";
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
    Legend
} from 'chart.js';
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
            courses: 0
        },
        revenue: {
            total: 0,
            average: 0,
            max: 0,
            min: 0
        },
        recentOrders: [],
        monthlyData: [],
        topProducts: [],
        topCourses: [],
        topSellers: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStats();
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

    const revenueChartData = {
        labels: stats.monthlyData.map(item => item.month),
        datasets: [
            {
                label: 'Revenue (₹)',
                data: stats.monthlyData.map(item => item.revenue),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.1
            },
            {
                label: 'Orders',
                data: stats.monthlyData.map(item => item.orders),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.1,
                yAxisID: 'orders'
            }
        ]
    };

    const revenueChartOptions = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Monthly Revenue & Orders'
            }
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Revenue (₹)'
                }
            },
            orders: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Number of Orders'
                },
                grid: {
                    drawOnChartArea: false
                }
            }
        }
    };

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium uppercase">{title}</p>
                    <p className="text-2xl font-bold mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-500', '-100')}`}>
                    <Icon className={`text-2xl ${color.replace('border-', 'text-')}`} />
                </div>
            </div>
        </div>
    );

    const TopItemCard = ({ item, type }) => (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-4">
                <img
                    src={item.productDetails?.images?.[0]?.secure_url || item.courseDetails?.thumbnail?.secure_url || "https://via.placeholder.com/50"}
                    alt={item.productDetails?.name || item.courseDetails?.title}
                    className="w-12 h-12 object-cover rounded"
                />
                <div>
                    <h3 className="font-semibold">{item.productDetails?.name || item.courseDetails?.title}</h3>
                    <p className="text-sm text-gray-600">Sales: {item.totalSales}</p>
                    <p className="text-sm text-green-600">Revenue: ₹{item.revenue.toLocaleString()}</p>
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

                <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                    <StatCard 
                        title="Total Users" 
                        value={stats.counts.users}
                        icon={FaUsers}
                        color="border-blue-500"
                    />
                    <StatCard 
                        title="Total Sellers" 
                        value={stats.counts.sellers}
                        icon={FaStore}
                        color="border-green-500"
                    />
                    <StatCard 
                        title="Total Orders" 
                        value={stats.counts.orders}
                        icon={FaShoppingCart}
                        color="border-purple-500"
                    />
                    <StatCard 
                        title="Total Revenue" 
                        value={`₹${stats.revenue.total.toLocaleString()}`}
                        icon={FaRupeeSign}
                        color="border-yellow-500"
                    />
                    <StatCard 
                        title="Total Products" 
                        value={stats.counts.products}
                        icon={FaBox}
                        color="border-red-500"
                    />
                    <StatCard 
                        title="Total Courses" 
                        value={stats.counts.courses}
                        icon={FaBook}
                        color="border-indigo-500"
                    />
                </div>

                {/* Revenue Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">Average Order Value</h3>
                        <p className="text-2xl font-bold text-green-600">₹{stats.revenue.average.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">Highest Order Value</h3>
                        <p className="text-2xl font-bold text-blue-600">₹{stats.revenue.max.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">Lowest Order Value</h3>
                        <p className="text-2xl font-bold text-red-600">₹{stats.revenue.min.toLocaleString()}</p>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-8 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <Line options={revenueChartOptions} data={revenueChartData} />
                    </div>
                </div>

                {/* Top Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                    {/* Top Products */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">Top Products</h3>
                        <div className="space-y-4">
                            {stats.topProducts.map((product, index) => (
                                <TopItemCard key={product._id} item={product} type="product" />
                            ))}
                        </div>
                    </div>

                    {/* Top Courses */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">Top Courses</h3>
                        <div className="space-y-4">
                            {stats.topCourses.map((course, index) => (
                                <TopItemCard key={course._id} item={course} type="course" />
                            ))}
                        </div>
                    </div>

                    {/* Top Sellers */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">Top Sellers</h3>
                        <div className="space-y-4">
                            {stats.topSellers.map((seller, index) => (
                                <div key={seller._id} className="bg-white rounded-lg shadow-sm p-4 border">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={seller.sellerDetails.avatar?.secure_url || "https://via.placeholder.com/50"}
                                            alt={seller.sellerDetails.name}
                                            className="w-12 h-12 object-cover rounded-full"
                                        />
                                        <div>
                                            <h3 className="font-semibold capitalize">{seller.sellerDetails.name}</h3>
                                            <p className="text-sm text-gray-600">Sales: {seller.totalSales}</p>
                                            <p className="text-sm text-green-600">Revenue: ₹{seller.revenue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {stats.recentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {order._id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.buyer.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ₹{order.totalAmount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                                order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                                                'bg-red-100 text-red-800'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
};

export default AdminDashboard;