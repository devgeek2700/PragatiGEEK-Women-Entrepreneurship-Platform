import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
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

  // Log the orderData for debugging
  console.log("CheckoutForm orderData:", orderData);

  // Add error handling for missing stripe initialization
  if (!stripe || !elements) {
    return (
      <div className="w-full px-4 mt-8 text-black">
        Payment system is not properly initialized. Please try again later.
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      // Confirm the payment
      console.log("Confirming payment with Stripe...");
      const { paymentIntent, error: paymentError } =
        await stripe.confirmPayment({
          elements,
          redirect: "if_required",
          confirmParams: {
            return_url:
              orderData.paymentType === "product"
                ? `${window.location.origin}/product/${orderData.productId}/checkout/success`
                : `${window.location.origin}/course/${orderData._id}/checkout/success`,
          },
        });

      if (paymentError) {
        console.error("Payment error:", paymentError);
        setError(paymentError.message);
        toast.error(`Payment error: ${paymentError.message}`);
        navigate(
          orderData.paymentType === "product"
            ? `/product/${orderData.productId}/checkout/fail`
            : `/course/${orderData._id}/checkout/fail`
        );
        return;
      } 
      
      if (paymentIntent) {
        console.log("Payment intent succeeded:", paymentIntent.id);
        
        // Verify payment on backend
        const verifyEndpoint =
          orderData.paymentType === "product"
            ? "/payment/verify-payment"
            : "/payment/course/verify-payment";

        try {
          console.log("Verifying payment with server...");
          
          // Prepare verification payload
          const payload = {
            paymentIntentId: paymentIntent.id,
          };
          
          // Add orderData if it exists
          if (orderData) {
            // For courses
            if (orderData.paymentType === "course") {
              payload.orderData = {
                studentInfo: orderData.studentInfo || {},
                courseId: orderData._id || null
              };
            } 
            // For products
            else {
              payload.orderData = {
                shippingAddress: orderData.shippingAddress || {},
                productId: orderData.productId || null
              };
            }
          }
          
          console.log("Sending verification payload:", payload);
          const response = await axiosInstance.post(verifyEndpoint, payload);

          console.log("Verification response:", response.data);

          if (response.data.success) {
            toast.success(
              orderData.paymentType === "product"
                ? "Order placed successfully!"
                : "Course enrollment successful!"
            );

            navigate(
              orderData.paymentType === "product"
                ? `/product/${orderData.productId}/checkout/success`
                : `/course/${orderData._id}/checkout/success`
            );
          } else {
            setError(response.data.message || "Payment verification failed");
            toast.error(response.data.message || "Payment verification failed");
          }
        } catch (verifyError) {
          console.error("Verification error:", verifyError);
          const errorMessage = verifyError.response?.data?.message || "Payment verification failed";
          setError(`Verification error: ${errorMessage}`);
          toast.error(`Verification error: ${errorMessage}`);
        }
      } else {
        setError("No payment confirmation received");
        toast.error("Payment failed - no confirmation received");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(`An unexpected error occurred: ${err.message}`);
      toast.error("Payment processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const TestDataDisplay = () => (
    <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-black">Test Card Details</h3>
        <button
          type="button"
          onClick={() => setShowTestData(false)}
          className="text-black hover:text-black"
        >
          ×
        </button>
      </div>
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-black">Card Number:</div>
          <div className="font-mono">4242 4242 4242 4242</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-black">Expiry Date:</div>
          <div className="font-mono">Any future date (e.g., 12/25)</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-black">CVC:</div>
          <div className="font-mono">Any 3 digits (e.g., 123)</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-black">Name:</div>
          <div className="font-mono">Any name</div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-black font-medium">
            Other Test Cards:
          </div>
          <div className="mt-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-black">Declined Card:</div>
              <div className="font-mono">4000 0000 0000 0002</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-black">3D Secure Card:</div>
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
      {error && <div className="text-red-500 mt-2 p-2 bg-red-50 rounded">{error}</div>}
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
          className="w-full mt-2 text-sm text-black hover:text-black"
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
