import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import axiosInstance from "../helpers/AxiosInstance";

const TrackOrder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tracking, setTracking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleBack = () => {
        navigate(-1);
    };

    useEffect(() => {
        fetchTracking();
    }, [id]); // Added id as dependency

    const fetchTracking = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await axiosInstance.get(`/orders/track/${id}`);
            setTracking(data);
        } catch (error) {
            setError("Unable to fetch tracking information. Please try again later.");
            console.error("Error tracking order:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Delivered":
                return "bg-green-100 text-green-800";
            case "Shipped":
                return "bg-blue-100 text-blue-800";
            case "Out for Delivery":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6 flex justify-center items-center min-h-[400px]">
                <div className="animate-pulse text-gray-600">Loading tracking details...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-red-50 text-red-800 p-4 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <button 
                onClick={handleBack}
                className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
                <IoArrowBack size={20} />
                <span>Back</span>
            </button>

            <h1 className="text-3xl font-bold mb-8 text-gray-800">Track Your Order</h1>
            {tracking && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b pb-4">
                            <span className="text-gray-600">Order ID:</span>
                            <span className="font-medium">{id}</span>
                        </div>

                        <div className="flex justify-between items-center border-b pb-4">
                            <span className="text-gray-600">Tracking Number:</span>
                            <span className="font-medium">
                                {tracking.trackingNumber || "Not Assigned"}
                            </span>
                        </div>

                        <div className="flex justify-between items-center border-b pb-4">
                            <span className="text-gray-600">Status:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tracking.status)}`}>
                                {tracking.status}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Expected Delivery:</span>
                            <span className="font-medium">
                                {tracking.expectedDelivery 
                                    ? new Date(tracking.expectedDelivery).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })
                                    : "Not Available"}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackOrder; 