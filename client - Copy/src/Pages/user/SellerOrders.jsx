import { useEffect, useState } from "react";
import {
  FaSpinner,
  FaShoppingBag,
  FaUser,
  FaCalendarAlt,
  FaRupeeSign,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
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

    const orderToUpdate = orders.find((o) => o.orderId === orderId);
    if (!orderToUpdate) {
      toast.error("Order not found");
      return;
    }

    try {
      setUpdatingOrder(orderId);
      const response = await axiosInstance.put(
        `/payment/order/${orderId}/status`,
        { status: newStatus }
      );

      if (response?.data?.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId ? { ...order, status: newStatus } : order
          )
        );
        toast.success("Order status updated successfully");
        fetchOrders();
      } else {
        toast.error(response?.data?.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update order status"
      );
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-black";

    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-black";
      case "processing":
        return "bg-yellow-100 text-black";
      case "pending":
        return "bg-blue-100 text-black";
      case "cancelled":
        return "bg-red-100 text-black";
      default:
        return "bg-gray-100 text-black";
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount) => {
    try {
      return `₹${Number(amount || 0).toLocaleString()}`;
    } catch (error) {
      return "₹0";
    }
  };

  const canUpdateOrder = (order) => {
    return order?.status === "Processing" || order?.status === "Pending";
  };

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-black mb-4">
              Orders Received
            </h1>
            <p className="text-black text-lg">Manage and track your orders</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-4xl text-black" />
            </div>
          ) : !Array.isArray(orders) || orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <FaShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-black">
                No orders received yet
              </h3>
              <p className="mt-1 text-black">
                Your orders will appear here when customers make purchases
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {orders.map(
                (order) =>
                  order && (
                    <div
                      key={order.orderId}
                      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <FaShoppingBag className="text-black" />
                              <h3 className="text-xl font-bold text-black">
                                Order #{order.orderId.slice(-6)}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 text-black">
                              <FaUser className="text-black" />
                              <span>{order.buyer?.name || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-black">
                              <FaCalendarAlt className="text-black" />
                              <span>{formatDate(order.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaRupeeSign className="text-black" />
                            <p className="text-2xl font-bold text-black">
                              {formatCurrency(order.totalAmount)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                                    order.status
                                  )}`}
                                >
                                  {order.status || "N/A"}
                                </span>
                                <span className="text-black">
                                  Payment: {order.paymentStatus || "N/A"}
                                </span>
                              </div>
                              <p className="text-black">
                                Payment Method: {order.paymentMethod || "N/A"}
                              </p>
                            </div>

                            {canUpdateOrder(order) && (
                              <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                  onClick={() =>
                                    updateStatus(order.orderId, "Completed")
                                  }
                                  disabled={updatingOrder === order.orderId}
                                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {updatingOrder === order.orderId ? (
                                    <FaSpinner className="animate-spin" />
                                  ) : (
                                    <>
                                      <FaCheckCircle />
                                      <span>Mark as Completed</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    updateStatus(order.orderId, "Cancelled")
                                  }
                                  disabled={updatingOrder === order.orderId}
                                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <FaTimesCircle />
                                  <span>Cancel Order</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
              )}
            </div>
          )}
        </div>
      </div>
    </HomeLayout>
  );
}

export default SellerOrders;
