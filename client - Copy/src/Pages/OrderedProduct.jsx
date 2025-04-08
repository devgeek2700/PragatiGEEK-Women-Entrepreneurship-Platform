import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../helpers/AxiosInstance';
import HomeLayout from '../layouts/HomeLayout';

function OrderedProduct() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            const response = await axiosInstance.get(`/orders/product/${id}`);
            setOrder(response.data.order);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch order details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <HomeLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </HomeLayout>
        );
    }

    if (!order) {
        return (
            <HomeLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <h2 className="text-2xl font-semibold text-gray-600">Order not found</h2>
                </div>
            </HomeLayout>
        );
    }

    return (
        <HomeLayout>
            <div className="min-h-screen p-8">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
                    {/* Order Header */}
                    <div className="p-6 border-b">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">
                                    Order #{order._id.slice(-6)}
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Ordered by: {order.buyer.name}
                                </p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium
                                    ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                        order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'}`}>
                                    {order.status}
                                </span>
                                <span className="text-sm text-gray-500 mt-1">
                                    Ordered on {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold mb-4">Product Details</h2>
                        <div className="space-y-4">
                            {order.products.map((item, index) => (
                                <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                                    <img 
                                        src={item.product.images[0].secure_url} 
                                        alt={item.product.name}
                                        className="w-24 h-24 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{item.product.name}</h3>
                                        <p className="text-gray-600">{item.product.description}</p>
                                        <div className="mt-2 flex justify-between items-end">
                                            <div>
                                                <p className="text-gray-600">
                                                    <span className="font-medium">Quantity: </span>
                                                    {item.quantity}
                                                </p>
                                                <p className="text-gray-600">
                                                    <span className="font-medium">Price: </span>
                                                    ₹{item.product.price}
                                                </p>
                                            </div>
                                            <p className="text-gray-800 font-medium">
                                                Subtotal: ₹{item.product.price * item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping Details */}
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold mb-4">Shipping Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-medium text-gray-700 mb-2">Delivery Address</h3>
                                <p className="text-gray-600">
                                    {order.shippingAddress.name}<br />
                                    {order.shippingAddress.street}<br />
                                    {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                                    PIN: {order.shippingAddress.pinCode}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-medium text-gray-700 mb-2">Payment Information</h3>
                                <p className="text-gray-600">
                                    Method: {order.paymentMethod}<br />
                                    Status: <span className={`font-medium ${order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                                        {order.paymentStatus}
                                    </span>
                                </p>
                                {order.trackingNumber && (
                                    <p className="mt-2">
                                        <span className="font-medium">Tracking Number: </span>
                                        {order.trackingNumber}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                        <div className="space-y-2 max-w-xs ml-auto">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span>₹{order.totalAmount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping</span>
                                <span>₹0</span>
                            </div>
                            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                                <span>Total</span>
                                <span>₹{order.totalAmount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
}

export default OrderedProduct; 