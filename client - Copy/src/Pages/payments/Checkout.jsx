import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Layout from "../../layouts/HomeLayout";
import axiosInstance from "../../helpers/AxiosInstance";
import CheckoutForm from "./../../Pages/payments/CheckoutForm";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
    phoneNumber: "",
    occupation: "",
    paymentMethod: "Card",
  });

  // Check if we have state data
  useEffect(() => {
    if (!location.state?.productId && !location.state?._id) {
      toast.error("Invalid checkout attempt");
      navigate("/");
    }
  }, [location.state, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (location.state?.productId) {
        // For products
        const productOrderData = {
          productId: location.state.productId,
          quantity: location.state.quantity || 1,
          shippingAddress: {
            name: formData.name,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            pinCode: formData.pinCode,
          },
          amount: location.state.price,
          orderId: location.state.orderId,
          paymentMethod: formData.paymentMethod,
          paymentType: "product",
        };
        response = await axiosInstance.post(
          "/payment/create-payment-intent",
          productOrderData
        );
      } else if (location.state?._id) {
        // For courses
        const courseOrderData = {
          courseId: location.state._id,
          amount: location.state.price,
          paymentMethod: formData.paymentMethod,
          paymentType: "course",
          studentInfo: {
            name: formData.name,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            occupation: formData.occupation,
          },
        };
        response = await axiosInstance.post(
          "/payment/course/create-payment-intent",
          courseOrderData
        );
      }
      setClientSecret(response.data.clientSecret);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to initialize payment"
      );
    } finally {
      setLoading(false);
    }
  };

  const appearance = {
    theme: "stripe",
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <Layout>
      <div className="min-h-screen p-6 bg-white">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold mb-6 text-black">
            {location.state?.productId
              ? "Product Checkout"
              : "Course Enrollment"}
          </h2>

          {!clientSecret ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Common Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black">
                  Basic Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-black">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 bg-gray-50 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 bg-gray-50 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Course-specific fields */}
                {location.state?._id && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-black">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 bg-gray-50 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black">
                        Occupation
                      </label>
                      <input
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 bg-gray-50 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                {/* Product-specific fields */}
                {location.state?.productId && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-black">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 bg-gray-50 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-black">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 bg-gray-50 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black">
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 bg-gray-50 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black">
                        PIN Code
                      </label>
                      <input
                        type="text"
                        name="pinCode"
                        value={formData.pinCode}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 bg-gray-50 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-lg font-semibold text-black">
                  Payment Method
                </h3>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 bg-gray-50 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="NetBanking">Net Banking</option>
                  <option value="WALLET">Wallet</option>
                </select>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-black">
                  {location.state?.productId
                    ? "Order Summary"
                    : "Course Enrollment Summary"}
                </h3>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between text-black">
                    <span>
                      {location.state?.productId ? "Product:" : "Course:"}
                    </span>
                    <span>{location.state?.title || location.state?.name}</span>
                  </div>
                  <div className="flex justify-between font-bold text-black">
                    <span>Total Amount:</span>
                    <span>₹{location.state?.price || 0}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg text-white font-medium 
                                    ${
                                      loading
                                        ? "bg-gray-400"
                                        : "bg-blue-600 hover:bg-blue-700"
                                    }`}
              >
                {loading ? "Processing..." : "Proceed to Payment"}
              </button>
            </form>
          ) : (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm
                orderData={{
                  ...location.state,
                  studentInfo: location.state?._id
                    ? {
                        name: formData.name,
                        email: formData.email,
                        phoneNumber: formData.phoneNumber,
                        occupation: formData.occupation,
                      }
                    : null,
                  shippingAddress: location.state?.productId
                    ? {
                        name: formData.name,
                        street: formData.street,
                        city: formData.city,
                        state: formData.state,
                        pinCode: formData.pinCode,
                      }
                    : null,
                  paymentType: location.state?.productId ? "product" : "course",
                }}
              />
            </Elements>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Checkout;
