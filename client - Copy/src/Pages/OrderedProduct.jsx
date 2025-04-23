import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../helpers/AxiosInstance";
import HomeLayout from "../layouts/HomeLayout";

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
      toast.error(
        error.response?.data?.message || "Failed to fetch order details"
      );
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
          <h2 className="text-2xl font-semibold text-black">Order not found</h2>
        </div>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Order Header */}
            <div className="p-8 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-black">
                    Order #{order._id.slice(-6)}
                  </h1>
                  <p className="text-black mt-1">
                    Ordered by: {order.buyer.name}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold
                      ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-black"
                          : order.status === "Processing"
                          ? "bg-yellow-100 text-black"
                          : order.status === "Shipped"
                          ? "bg-blue-100 text-black"
                          : "bg-gray-100 text-black"
                      }`}
                  >
                    {order.status}
                  </span>
                  <span className="text-sm text-black mt-2">
                    Ordered on {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-xl font-bold text-black mb-6">
                Product Details
              </h2>
              <div className="space-y-6">
                {order.products.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row gap-6 p-6 bg-gray-50 rounded-xl"
                  >
                    <img
                      src={item.product.images[0].secure_url}
                      alt={item.product.name}
                      className="w-full sm:w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-black">
                        {item.product.name}
                      </h3>
                      <p className="text-black mt-2">
                        {item.product.description}
                      </p>
                      <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                        <div className="space-y-2">
                          <p className="text-black">
                            <span className="font-semibold">Quantity: </span>
                            {item.quantity}
                          </p>
                          <p className="text-black">
                            <span className="font-semibold">Price: </span>₹
                            {item.product.price}
                          </p>
                        </div>
                        <p className="text-black font-bold text-lg">
                          Subtotal: ₹{item.product.price * item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Details */}
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-xl font-bold text-black mb-6">
                Shipping Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-black mb-3">
                    Delivery Address
                  </h3>
                  <p className="text-black">
                    {order.shippingAddress.name}
                    <br />
                    {order.shippingAddress.street}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                    <br />
                    PIN: {order.shippingAddress.pinCode}
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-black mb-3">
                    Payment Information
                  </h3>
                  <p className="text-black">
                    Method: {order.paymentMethod}
                    <br />
                    Status:{" "}
                    <span
                      className={`font-semibold ${
                        order.paymentStatus === "Paid"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </p>
                  {order.trackingNumber && (
                    <p className="mt-3 text-black">
                      <span className="font-semibold">Tracking Number: </span>
                      {order.trackingNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-8">
              <h2 className="text-xl font-bold text-black mb-6">
                Order Summary
              </h2>
              <div className="max-w-xs ml-auto space-y-3">
                <div className="flex justify-between">
                  <span className="text-black">Subtotal</span>
                  <span className="text-black">₹{order.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Shipping</span>
                  <span className="text-black">₹0</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-200">
                  <span className="text-black">Total</span>
                  <span className="text-black">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

export default OrderedProduct;
