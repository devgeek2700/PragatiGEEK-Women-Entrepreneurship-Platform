import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

import axiosInstance from "../../helpers/AxiosInstance";
import HomeLayout from "../../layouts/HomeLayout";

function SellerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingOrder, setUpdatingOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axiosInstance.get("/payment/seller-orders");
            console.log("Orders response:", response?.data);
            if (response?.data?.orders) {
                setOrders(response.data.orders);
            } else {
                setOrders([]);
                toast.error("No orders data received");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error(error?.response?.data?.message || "Failed to fetch orders");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        if (!orderId || !newStatus) {
            toast.error("Invalid order or status");
            return;
        }

        // Find the order to get its current data
        const orderToUpdate = orders.find(o => o.orderId === orderId);
        if (!orderToUpdate) {
            toast.error("Order not found");
            return;
        }

        try {
            setUpdatingOrder(orderId);
            console.log("Updating order:", { orderId, status: newStatus });
            
            // Send only the status in the update request
            const response = await axiosInstance.put(`/payment/order/${orderId}/status`, {
                status: newStatus
            });
            
            console.log("Update response:", response?.data);
            
            if (response?.data?.success) {
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order.orderId === orderId 
                            ? { ...order, status: newStatus }
                            : order
                    )
                );
                toast.success("Order status updated successfully");
                // Refresh orders after successful update
                fetchOrders();
            } else {
                toast.error(response?.data?.message || "Failed to update order status");
            }
        } catch (error) {
            console.error("Error updating order:", error);
            toast.error(error?.response?.data?.message || "Failed to update order status");
        } finally {
            setUpdatingOrder(null);
        }
    };

    const getStatusColor = (status) => {
        if (!status) return 'text-gray-600';
        
        switch (status.toLowerCase()) {
            case 'completed':
                return 'text-green-600';
            case 'processing':
                return 'text-yellow-600';
            case 'pending':
                return 'text-blue-600';
            case 'cancelled':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const formatCurrency = (amount) => {
        try {
            return `₹${Number(amount || 0).toLocaleString()}`;
        } catch (error) {
            return '₹0';
        }
    };

    const canUpdateOrder = (order) => {
        console.log("Order status:", order?.status);
        return order?.status === 'Processing' || order?.status === 'Pending';
    };

    return (
        <HomeLayout>
            <div className="min-h-[90vh] pt-20 px-4 flex flex-col items-center">
                <h1 className="text-3xl font-bold text-center mb-8">Orders Received</h1>
                
                {loading ? (
                    <div className="flex justify-center items-center">
                        <FaSpinner className="animate-spin text-4xl text-yellow-500" />
                    </div>
                ) : !Array.isArray(orders) || orders.length === 0 ? (
                    <p className="text-center text-gray-600">No orders received yet</p>
                ) : (
                    <div className="w-full max-w-3xl">
                        <div className="grid gap-4">
                            {orders.map((order) => order && (
                                <div 
                                    key={order.orderId}
                                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-semibold text-xl mb-2">
                                                Order #{order.orderId.slice(-6)}
                                            </h3>
                                            <p className="text-gray-600 text-sm">
                                                Order ID: {order.orderId}
                                            </p>
                                            <p className="text-gray-600 text-sm">
                                                Buyer: {order.buyer?.name || 'N/A'}
                                            </p>
                                            <p className="text-gray-600 text-sm">
                                                Payment Method: {order.paymentMethod || 'N/A'}
                                            </p>
                                        </div>
                                        <p className="text-lg font-bold">
                                            {formatCurrency(order.totalAmount)}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm mb-2">
                                                Ordered on: {formatDate(order.createdAt)}
                                            </p>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                                Status: {order.status || 'N/A'}
                                            </span>
                                            <p className="text-sm mt-2">
                                                Payment Status: {order.paymentStatus || 'N/A'}
                                            </p>
                                        </div>
                                        
                                        <div className="space-x-2">
                                            {canUpdateOrder(order) && (
                                                <>
                                                    <button
                                                        onClick={() => updateStatus(order.orderId, 'Completed')}
                                                        disabled={updatingOrder === order.orderId}
                                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {updatingOrder === order.orderId ? (
                                                            <FaSpinner className="animate-spin" />
                                                        ) : (
                                                            'Mark as Completed'
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(order.orderId, 'Cancelled')}
                                                        disabled={updatingOrder === order.orderId}
                                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Cancel Order
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </HomeLayout>
    );
}

export default SellerOrders; 