import { useEffect, useState } from "react";
import { FaMoneyBillWave } from "react-icons/fa";
import { MdHistory } from "react-icons/md";
import { toast } from "react-toastify";

import axiosInstance from "../helpers/AxiosInstance";

const SellerEarnings = () => {
    const [earnings, setEarnings] = useState({
        totalEarnings: 0,
        availableBalance: 0,
        pendingPayouts: 0,
        earningsHistory: []
    });
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchEarnings();
    }, []);

    const fetchEarnings = async () => {
        try {
            setIsLoading(true);
            const { data } = await axiosInstance.get("/seller/earnings");
            if (data.success) {
                setEarnings({
                    totalEarnings: data.earnings || 0,
                    availableBalance: data.availableBalance || 0,
                    pendingPayouts: data.pendingPayouts || 0,
                    earningsHistory: data.earningsHistory || []
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
            toast.error("Withdrawal amount exceeds available balance");
            return;
        }

        try {
            setIsLoading(true);
            const { data } = await axiosInstance.post("/seller/withdraw", { 
                amount: Number(withdrawAmount)
            });
            
            if (data.success) {
                toast.success(`Withdrawal of ₹${withdrawAmount} requested successfully!`);
                setWithdrawAmount("");
                fetchEarnings(); // Refresh earnings data
            } else {
                toast.error(data.message || "Failed to process withdrawal");
            }
        } catch (error) {
            console.error("Withdrawal error:", error);
            toast.error(error?.response?.data?.message || "Failed to process withdrawal");
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate earnings for an order
    const calculateEarnings = async (orderId) => {
        try {
            console.log("Calculating earnings for order:", orderId);
            const { data } = await axiosInstance.post(`/seller/order/${orderId}/calculate-earnings`);
            if (data.success) {
                toast.success("Earnings calculated successfully");
                fetchEarnings(); // Refresh earnings data
            } else {
                toast.error(data.message || "Failed to calculate earnings");
            }
        } catch (error) {
            console.error("Error calculating earnings:", error);
            toast.error(error?.response?.data?.message || "Failed to calculate earnings");
        }
    };

    return (
        <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
            {/* Earnings Overview */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    <FaMoneyBillWave className="text-green-500" />
                    Seller Earnings Dashboard
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 p-6 rounded-lg text-white">
                        <h3 className="text-lg font-semibold mb-2">Total Earnings</h3>
                        <p className="text-2xl font-bold">₹{earnings.totalEarnings.toFixed(2)}</p>
                    </div>

                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-6 rounded-lg text-white">
                        <h3 className="text-lg font-semibold mb-2">Available Balance</h3>
                        <p className="text-2xl font-bold">₹{earnings.availableBalance.toFixed(2)}</p>
                    </div>

                    <div className="bg-gradient-to-r from-purple-400 to-purple-600 p-6 rounded-lg text-white">
                        <h3 className="text-lg font-semibold mb-2">Pending Payouts</h3>
                        <p className="text-2xl font-bold">₹{earnings.pendingPayouts.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Withdrawal Section */}
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Request Withdrawal</h2>
                <div className="flex gap-4">
                    <input
                        type="number"
                        placeholder="Enter amount to withdraw"
                        className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        disabled={isLoading}
                        min="0"
                        step="0.01"
                    />
                    <button
                        onClick={handleWithdraw}
                        disabled={isLoading || !withdrawAmount || Number(withdrawAmount) <= 0}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                    >
                        {isLoading ? "Processing..." : "Withdraw"}
                    </button>
                </div>
            </div>

            {/* Earnings History */}
            <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <MdHistory />
                    Earnings History
                </h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-gray-600">Date</th>
                                <th className="px-6 py-3 text-left text-gray-600">Description</th>
                                <th className="px-6 py-3 text-left text-gray-600">Type</th>
                                <th className="px-6 py-3 text-left text-gray-600">Amount</th>
                                <th className="px-6 py-3 text-left text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {earnings.earningsHistory.map((entry, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4">
                                        {new Date(entry.timestamp).toLocaleDateString('en-IN', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </td>
                                    <td className="px-6 py-4">{entry.description}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-sm ${
                                            entry.type === 'sale' 
                                                ? 'bg-green-100 text-green-800'
                                                : entry.type === 'course_sale'
                                                ? 'bg-blue-100 text-blue-800'
                                                : entry.type === 'withdrawal'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {entry.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">₹{entry.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        {entry.type === 'sale' && !entry.earnings && (
                                            <button
                                                onClick={() => calculateEarnings(entry.orderId)}
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                Calculate Earnings
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {earnings.earningsHistory.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
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