import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../helpers/AxiosInstance';
import { loadStripe } from '@stripe/stripe-js';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

function OrderForm({ product, quantity, onClose }) {
    const navigate = useNavigate();
    const user = useSelector(state => state.auth.data);
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        paymentMethod: 'COD'
    });

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!formData.street || !formData.city || !formData.state || !formData.zipCode) {
            toast.error('Please fill in all address fields');
            return;
        }

        try {
            setLoading(true);
            
            // First create payment intent
            const { data: paymentIntent } = await axiosInstance.post('/product/checkout', {
                id: product._id,
                price: product.price * quantity
            });

            if (!stripe || !elements) {
                toast.error('Stripe not initialized');
                return;
            }

            // Confirm the payment
            const result = await stripe.confirmPayment({
                elements,
                clientSecret: paymentIntent.clientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/product/${product._id}/checkout/success`,
                },
            });

            if (result.error) {
                toast.error(result.error.message);
                return;
            }

            // If payment successful, create order
            const orderData = {
                products: [{
                    product: product._id,
                    quantity: quantity
                }],
                totalAmount: product.price * quantity,
                paymentMethod: formData.paymentMethod,
                shippingAddress: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode
                },
                paymentIntentId: result.paymentIntent.id
            };

            await axiosInstance.post('/orders/new', orderData);
            toast.success('Order placed successfully!');
            navigate('/orders');
            if (onClose) onClose();

        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Complete Your Order</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Shipping Address */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Shipping Address</h3>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Street Address</label>
                        <input
                            type="text"
                            name="street"
                            value={formData.street}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">City</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">State</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                        <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Payment Method</h3>
                    <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="Card">Card</option>
                        <option value="UPI">UPI</option>
                        <option value="NetBanking">Net Banking</option>
                        <option value="Wallet">Wallet</option>
                    </select>
                </div>

                {/* Add Stripe Card Element */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Payment Details</h3>
                    <div className="p-3 border rounded-md">
                        <CardElement 
                            options={{
                                style: {
                                    base: {
                                        fontSize: '16px',
                                        color: '#424770',
                                        '::placeholder': {
                                            color: '#aab7c4',
                                        },
                                    },
                                    invalid: {
                                        color: '#9e2146',
                                    },
                                },
                            }}
                        />
                    </div>
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4 space-y-2">
                    <h3 className="text-lg font-semibold">Order Summary</h3>
                    <div className="flex justify-between">
                        <span>Product:</span>
                        <span>{product.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Quantity:</span>
                        <span>{quantity}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                        <span>Total Amount:</span>
                        <span>₹{product.price * quantity}</span>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-lg text-white font-medium 
                        ${loading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-500 hover:bg-blue-600'}`}
                >
                    {loading ? 'Placing Order...' : 'Place Order'}
                </button>
            </form>
        </div>
    );
}

export default OrderForm; 