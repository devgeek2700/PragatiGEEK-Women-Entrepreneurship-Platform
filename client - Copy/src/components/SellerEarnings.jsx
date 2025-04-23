import { useEffect, useState } from "react";
import {
  FaMoneyBillWave,
  FaShoppingBag,
  FaGraduationCap,
} from "react-icons/fa";
import { MdHistory } from "react-icons/md";
import { toast } from "react-toastify";
import axiosInstance from "../helpers/AxiosInstance";

const SellerEarnings = () => {
  const [earnings, setEarnings] = useState({
    total: 0,
    productSales: 0,
    courseSales: 0,
    availableBalance: 0,
    history: [],
  });
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get("/earnings");
      if (data.success) {
        setEarnings({
          total: data.earnings?.total || 0,
          productSales: data.earnings?.productSales || 0,
          courseSales: data.earnings?.courseSales || 0,
          availableBalance: data.earnings?.availableBalance || 0,
          history: data.history || [],
        });
      } else {
        toast.error(data.message || "Failed to fetch earnings");
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch earnings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (withdrawAmount > earnings.availableBalance) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await axiosInstance.post("/earnings/withdraw", {
        amount: Number(withdrawAmount),
      });

      if (data.success) {
        toast.success(
          data.message ||
            `Withdrawal of ₹${withdrawAmount} requested successfully!`
        );
        setWithdrawAmount("");
        fetchEarnings();
      } else {
        toast.error(data.message || "Failed to process withdrawal");
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to process withdrawal"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilteredHistory = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filterType !== "all") params.append("type", filterType);

      const { data } = await axiosInstance.get(
        `/earnings/history?${params.toString()}`
      );
      if (data.success) {
        setEarnings((prev) => ({
          ...prev,
          history: data.history || [],
        }));
      } else {
        toast.error(data.message || "Failed to fetch earnings history");
      }
    } catch (error) {
      console.error("Error fetching filtered history:", error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch earnings history"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredHistory();
  }, [filterType]);

  return (
    <div className="container mx-auto p-6">
      {/* Earnings Overview */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6 text-black flex items-center gap-2">
          <FaMoneyBillWave className="text-green-500" />
          Seller Earnings Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-black">
              Total Earnings
            </h3>
            <p className="text-2xl font-bold text-black">
              ₹{(earnings?.total || 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-black flex items-center gap-2">
              <FaShoppingBag className="text-blue-500" />
              Product Sales
            </h3>
            <p className="text-2xl font-bold text-black">
              ₹{(earnings?.productSales || 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-black flex items-center gap-2">
              <FaGraduationCap className="text-purple-500" />
              Course Sales
            </h3>
            <p className="text-2xl font-bold text-black">
              ₹{(earnings?.courseSales || 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-black">
              Available Balance
            </h3>
            <p className="text-2xl font-bold text-black">
              ₹{(earnings?.availableBalance || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Withdrawal Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 text-black">
          Request Withdrawal
        </h2>
        <div className="flex gap-4">
          <input
            type="number"
            placeholder="Enter amount to withdraw"
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            disabled={isLoading}
          />
          <button
            onClick={handleWithdraw}
            disabled={
              isLoading || !withdrawAmount || Number(withdrawAmount) <= 0
            }
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
          >
            {isLoading ? "Processing..." : "Withdraw"}
          </button>
        </div>
      </div>

      {/* Earnings History */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-black flex items-center gap-2">
            <MdHistory />
            Earnings History
          </h2>
          <div className="flex gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="sale">Product Sales</option>
              <option value="course_sale">Course Sales</option>
              <option value="withdrawal">Withdrawals</option>
            </select>
            <button
              onClick={fetchFilteredHistory}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Apply Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-black">Date</th>
                <th className="px-6 py-3 text-left text-black">Description</th>
                <th className="px-6 py-3 text-left text-black">Type</th>
                <th className="px-6 py-3 text-left text-black">Amount</th>
                <th className="px-6 py-3 text-left text-black">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {earnings.history.map((entry, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-black">
                    {new Date(entry.timestamp).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4 text-black">
                    <div>
                      <p className="font-medium">{entry.description}</p>
                      {entry.orderId && (
                        <p className="text-sm text-gray-600">
                          Order ID: {entry.orderId}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        entry.type === "sale"
                          ? "bg-green-100 text-black"
                          : entry.type === "course_sale"
                          ? "bg-blue-100 text-black"
                          : entry.type === "withdrawal"
                          ? "bg-red-100 text-black"
                          : "bg-gray-100 text-black"
                      }`}
                    >
                      {entry.type === "sale"
                        ? "Product Sale"
                        : entry.type === "course_sale"
                        ? "Course Sale"
                        : entry.type === "withdrawal"
                        ? "Withdrawal"
                        : entry.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-black">
                    <div>
                      <p className="font-medium">
                        {entry.type === "withdrawal" ? "-" : ""}₹
                        {Math.abs(entry?.amount || 0).toFixed(2)}
                      </p>
                      {entry.quantity && (
                        <p className="text-sm text-gray-600">
                          {entry.quantity}{" "}
                          {entry.type === "course_sale"
                            ? "enrollment(s)"
                            : "item(s)"}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-black">
                    {entry.quantity && (
                      <div className="text-sm">
                        <p>Unit Price: ₹{entry.unitPrice?.toFixed(2)}</p>
                        <p>Total Amount: ₹{entry.totalAmount?.toFixed(2)}</p>
                        <p className="text-green-600">
                          Earnings (80%): ₹{entry.amount?.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {earnings.history.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-black">
                    No earnings history available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerEarnings;
