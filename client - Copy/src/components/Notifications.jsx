import { useState, useEffect } from "react";
import { BsBell } from "react-icons/bs";
import { useSelector } from "react-redux";

import axiosInstance from "../helpers/AxiosInstance";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    
    const user = useSelector((state) => state.auth.data);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            // Different endpoints based on user role
            const endpoint = user.role === 'SELLER' ? "/orders/seller" : "/orders/buyer";
            const { data } = await axiosInstance.get(endpoint);
            const newNotifications = data.orders.map(order => ({
                id: order._id,
                message: user.role === 'SELLER' 
                    ? `${order.paymentStatus === 'Paid' 
                        ? `Payment received for order #${order._id.slice(-6)} - ${order.status}`
                        : `New order #${order._id.slice(-6)} received - ${order.status}`}`
                    : `Order #${order._id.slice(-6)} is ${order.status}`,
                timestamp: new Date(order.updatedAt).toLocaleString(),
                status: order.status,
                paymentStatus: order.paymentStatus,
                seen: false
            }));

            setNotifications(newNotifications);
            setUnreadCount(newNotifications.filter(n => !n.seen).length);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const markAsRead = (notificationId) => {
        setNotifications(notifications.map(notification => 
            notification.id === notificationId 
                ? { ...notification, seen: true }
                : notification
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const getStatusColor = (status, paymentStatus) => {
        // For payment status
        if (paymentStatus === 'Paid') return 'text-green-600';
        if (paymentStatus === 'Failed') return 'text-red-600';
        
        // For order status
        switch(status.toLowerCase()) {
            case 'delivered':
                return 'text-green-600';
            case 'shipped':
                return 'text-blue-600';
            case 'out for delivery':
                return 'text-purple-600';
            case 'processing':
                return 'text-orange-600';
            case 'pending':
                return 'text-yellow-600';
            case 'cancelled':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="relative">
            {/* Notification Bell */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-gray-100 rounded-full"
            >
                <BsBell className="text-xl" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b">
                        <h3 className="text-lg font-semibold">Notifications</h3>
                    </div>
                    
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            No notifications
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div 
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                                        notification.seen ? 'bg-white' : 'bg-blue-50'
                                    }`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex justify-between items-start">
                                        <p className={`${getStatusColor(notification.status, notification.paymentStatus)}`}>
                                            {notification.message}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {notification.timestamp}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Notifications; 