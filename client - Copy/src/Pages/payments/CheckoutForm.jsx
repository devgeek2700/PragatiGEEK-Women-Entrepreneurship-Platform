import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../helpers/AxiosInstance";

function CheckoutForm({ orderData }) {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [showTestData, setShowTestData] = useState(false);

    // Add error handling for missing stripe initialization
    if (!stripe || !elements) {
        return (
            <div className="w-full px-4 mt-8 text-red-500">
                Payment system is not properly initialized. Please try again later.
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsProcessing(true);

        try {
            const { paymentIntent, error: paymentError } = await stripe.confirmPayment({
                elements,
                redirect: 'if_required',
                confirmParams: {
                    return_url: orderData.paymentType === 'product'
                        ? `${window.location.origin}/product/${orderData.productId}/checkout/success`
                        : `${window.location.origin}/course/${orderData._id}/checkout/success`,
                },
            });

            if (paymentError) {
                setError(paymentError.message);
                toast.error(paymentError.message);
                navigate(orderData.paymentType === 'product'
                    ? `/product/${orderData.productId}/checkout/fail`
                    : `/course/${orderData._id}/checkout/fail`
                );
            } else if (paymentIntent) {
                // Verify payment on backend
                const verifyEndpoint = orderData.paymentType === 'product'
                    ? '/payment/verify-payment'
                    : '/payment/course/verify-payment';

                await axiosInstance.post(verifyEndpoint, {
                    paymentIntentId: paymentIntent.id,
                    orderData: orderData.paymentType === 'product' ? {
                        shippingAddress: orderData.shippingAddress
                    } : {
                        studentInfo: orderData.studentInfo
                    }
                });

                toast.success(orderData.paymentType === 'product' 
                    ? 'Order placed successfully!' 
                    : 'Course enrollment successful!');
                    
                navigate(orderData.paymentType === 'product'
                    ? `/product/${orderData.productId}/checkout/success`
                    : `/course/${orderData._id}/checkout/success`
                );
            }
        } catch (err) {
            console.error('Payment error:', err);
            setError('An unexpected error occurred. Please try again.');
            toast.error('Payment processing failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const TestDataDisplay = () => (
        <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-700">Test Card Details</h3>
                <button 
                    type="button"
                    onClick={() => setShowTestData(false)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ×
                </button>
            </div>
            <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-600">Card Number:</div>
                    <div className="font-mono">4242 4242 4242 4242</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-600">Expiry Date:</div>
                    <div className="font-mono">Any future date (e.g., 12/25)</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-600">CVC:</div>
                    <div className="font-mono">Any 3 digits (e.g., 123)</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-600">Name:</div>
                    <div className="font-mono">Any name</div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500 font-medium">Other Test Cards:</div>
                    <div className="mt-2 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="text-gray-600">Declined Card:</div>
                            <div className="font-mono">4000 0000 0000 0002</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="text-gray-600">3D Secure Card:</div>
                            <div className="font-mono">4000 0025 0000 3155</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="w-full px-4 mt-8">
            <PaymentElement />
            {error && <div className="text-red-500 mt-2">{error}</div>}
            <button
                disabled={isProcessing}
                className="w-full bg-yellow-500 text-white py-2 rounded-md mt-4 hover:bg-yellow-600 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {isProcessing ? "Processing..." : "Pay Now"}
            </button>
            
            {!showTestData ? (
                <button
                    type="button"
                    onClick={() => setShowTestData(true)}
                    className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700"
                >
                    Show Test Card Details
                </button>
            ) : (
                <TestDataDisplay />
            )}
        </form>
    );
}

export default CheckoutForm; 