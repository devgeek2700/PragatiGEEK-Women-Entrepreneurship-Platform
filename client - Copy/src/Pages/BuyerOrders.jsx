import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaGraduationCap, FaShoppingBag } from "react-icons/fa";
import { Tab } from "@headlessui/react";

import axiosInstance from "../helpers/AxiosInstance";
import Footer from "../components/Footer";
import HomeLayout from "../layouts/HomeLayout";

function BuyerOrders() {
    const [orders, setOrders] = useState({ products: [], courses: [] });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function fetchOrders() {
        try {
            setLoading(true);
            const [productOrders, courseOrders] = await Promise.all([
                axiosInstance.get('/orders/buyer').catch((err) => {
                    console.log('Product order error:', err);
                    return { data: { orders: [] } };
                }),
                axiosInstance.get('/course/my-courses').catch((err) => {
                    console.log('Course order error:', err);
                    return { data: { courses: [] } };
                })
            ]);

            setOrders({
                products: productOrders.data?.orders || [],
                courses: courseOrders.data?.courses || []
            });
        } catch (error) {
            console.error('Fetch orders error:', error);
            toast.error('Failed to fetch orders');
            setOrders({ products: [], courses: [] });
        } finally {
            setLoading(false);
        }
    }

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'shipped':
                return 'bg-blue-100 text-blue-800';
            case 'processing':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <HomeLayout>
            <div className="min-h-screen py-8 px-4 md:px-8 lg:px-16">
                <h1 className="text-3xl font-bold text-center mb-8">My Orders</h1>

                {loading ? (
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <Tab.Group>
                        <Tab.List className="flex space-x-4 rounded-xl bg-gray-100 p-1 mb-8">
                            <Tab className={({ selected }) =>
                                `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                                ${selected 
                                    ? 'bg-white shadow text-blue-700' 
                                    : 'text-gray-700 hover:bg-white/[0.12] hover:text-blue-600'
                                } flex items-center justify-center gap-2`
                            }>
                                <FaShoppingBag /> Products
                            </Tab>
                            <Tab className={({ selected }) =>
                                `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                                ${selected 
                                    ? 'bg-white shadow text-blue-700' 
                                    : 'text-gray-700 hover:bg-white/[0.12] hover:text-blue-600'
                                } flex items-center justify-center gap-2`
                            }>
                                <FaGraduationCap /> Courses
                            </Tab>
                        </Tab.List>

                        <Tab.Panels>
                            {/* Product Orders Panel */}
                            <Tab.Panel>
                                <div className="flex flex-col gap-4 w-full max-w-4xl">
                                    {orders.products.length > 0 ? (
                                        orders.products.map((order) => (
                                            <div 
                                                key={order._id} 
                                                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-2">
                                                        <h3 className="font-semibold text-lg">
                                                            Order #{order._id}
                                                        </h3>
                                                        <p className="text-gray-600">
                                                            Purchase Date: {new Date(order.createdAt).toLocaleDateString()}
                                                        </p>
                                                        <div className="space-y-2">
                                                            {order.products.map((item) => (
                                                                <div key={item._id} className="ml-4">
                                                                    <p className="font-medium">{item.product.name}</p>
                                                                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <p className="text-gray-600">
                                                            Shipping Address: {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-lg">
                                                            ₹{order.totalAmount}
                                                        </p>
                                                        <span className={`${getStatusColor(order.status)} px-2 py-1 rounded-full text-sm`}>
                                                            {order.status}
                                                        </span>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Payment: {order.paymentStatus}
                                                        </p>
                                                    </div>
                                                </div>

                                                {order.products.map((item) => (
                                                    <button 
                                                        key={item._id}
                                                        onClick={() => navigate(`/product/order/${order._id}`)}
                                                        className="mt-4 text-blue-500 hover:text-blue-700"
                                                    >
                                                        View Product →
                                                    </button>
                                                ))}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center gap-4">
                                            <p className="text-lg">No product orders found</p>
                                            <button 
                                                onClick={() => navigate("/products")}
                                                className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                                            >
                                                Browse Products
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </Tab.Panel>

                            {/* Course Orders Panel */}
                            <Tab.Panel>
                                <div className="flex flex-col gap-4 w-full max-w-4xl">
                                    {orders.courses.length > 0 ? (
                                        orders.courses.map((course) => (
                                            <div 
                                                key={course._id} 
                                                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-2">
                                                        <h3 className="font-semibold text-lg">
                                                            {course.title || 'Course Unavailable'}
                                                        </h3>
                                                        <p className="text-gray-600">
                                                            Course ID: {course._id}
                                                        </p>
                                                        <p className="text-gray-600">
                                                            Created By: {course.createdBy}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-lg">
                                                            ₹{course.price}
                                                        </p>
                                                        <span className={getStatusColor('delivered')}>
                                                            Purchased
                                                        </span>
                                                    </div>
                                                </div>

                                                <button 
                                                    onClick={() => navigate(`/course/${course._id}`)}
                                                    className="mt-4 text-blue-500 hover:text-blue-700"
                                                >
                                                    View Course →
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center gap-4">
                                            <p className="text-lg">No course orders found</p>
                                            <button 
                                                onClick={() => navigate("/courses")}
                                                className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                                            >
                                                Browse Courses
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>
                )}
            </div>
            <Footer />
        </HomeLayout>
    );
}

export default BuyerOrders; 