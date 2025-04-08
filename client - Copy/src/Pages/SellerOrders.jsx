import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import HomeLayout from "../layouts/HomeLayout";
import axiosInstance from "../helpers/AxiosInstance";

const SellerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [trackingInfo, setTrackingInfo] = useState({});
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await axiosInstance.get("/payment/seller-orders");
            console.log("Fetched orders:", data);
            if (data.success) {
                setOrders(data.orders);
            } else {
                toast.error("Failed to fetch orders");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error("Failed to fetch orders");
        }
    };

    const updateStatus = async (orderId) => {
        try {
            console.log("Updating order status:", {
                orderId,
                status: trackingInfo[orderId]?.status || "Shipped"
            });

            await axiosInstance.put(`/payment/order/${orderId}/status`, {
                status: trackingInfo[orderId]?.status || "Shipped",
                trackingNumber: trackingInfo[orderId]?.trackingNumber || "",
                expectedDelivery: trackingInfo[orderId]?.expectedDelivery || "",
                type: 'product'  // Add product type
            });

            // Trigger stats refresh after status update
            try {
                await axiosInstance.post(`/payment/order/${orderId}/calculate-earnings`);
            } catch (err) {
                console.log("Error calculating earnings:", err);
            }

            toast.success("Order updated successfully");
            fetchOrders();
        } catch (error) {
            console.error("Error updating order:", error);
            toast.error(error?.response?.data?.message || "Failed to update order");
        }
    };

    const handleTrackingInfoChange = (orderId, field, value) => {
        setTrackingInfo(prev => ({
            ...prev,
            [orderId]: {
                ...prev[orderId],
                [field]: value
            }
        }));
    };

    return (
        <HomeLayout>
            <div className="container mx-auto p-6">
                <button 
                    onClick={handleBack}
                    className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <IoArrowBack size={20} />
                    <span>Back</span>
                </button>

                <h1 className="text-3xl font-bold mb-8 text-gray-800">Orders Management</h1>
                
                {orders.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600 text-lg">No orders received yet</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {orders.map(order => (
                            <div key={order._id} className="bg-white p-6 rounded-lg shadow-md">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        Order ID: {order._id}
                                    </h2>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium
                                        ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <select 
                                        className="select select-bordered w-full"
                                        onChange={(e) => handleTrackingInfoChange(order._id, 'status', e.target.value)}
                                        defaultValue={order.status}
                                    >
                                        <option value="Shipped">Shipped</option>
                                        <option value="Out for Delivery">Out for Delivery</option>
                                        <option value="Delivered">Delivered</option>
                                    </select>

                                    <input
                                        type="text"
                                        placeholder="Tracking Number"
                                        className="input input-bordered w-full"
                                        defaultValue={order.trackingNumber}
                                        onChange={(e) => handleTrackingInfoChange(order._id, 'trackingNumber', e.target.value)}
                                    />
                                    
                                    <input
                                        type="date"
                                        className="input input-bordered w-full"
                                        defaultValue={order.expectedDelivery}
                                        onChange={(e) => handleTrackingInfoChange(order._id, 'expectedDelivery', e.target.value)}
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button 
                                        onClick={() => updateStatus(order._id)}
                                        className="btn btn-primary"
                                    >
                                        Update Order
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </HomeLayout>
    );
};

export default SellerOrders; 