import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Dialog } from '@headlessui/react';
import { useSelector } from 'react-redux';
import { IoArrowBack } from "react-icons/io5";

import axiosInstance from '../helpers/AxiosInstance';
import HomeLayout from '../layouts/HomeLayout';
import OrderForm from '../components/OrderForm';

function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const navigate = useNavigate();
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

    const handleBack = () => {
        navigate(-1);
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(`/products/${id}`);
            setProduct(data.product);
        } catch (error) {
            toast.error('Failed to fetch product details');
        } finally {
            setLoading(false);
        }
    };

    const handleThumbnailClick = (index) => {
        setSelectedImage(index);
    };

    const handleBuyNow = () => {
        if (!isLoggedIn) {
            toast.error("Please login to continue");
            navigate("/login", { 
                state: { from: `/product/${id}` } 
            });
            return;
        }

        setLoading(true);
        try {
            navigate(`/product/${product._id}/checkout`, {
                state: {
                    productId: product._id,
                    quantity: quantity,
                    price: product.price * quantity
                }
            });
        } catch (error) {
            toast.error("Something went wrong");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <HomeLayout>
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </HomeLayout>
        );
    }

    if (!product) {
        return (
            <HomeLayout>
                <div className="flex justify-center items-center h-screen">
                    <p className="text-gray-500">Product not found</p>
                </div>
            </HomeLayout>
        );
    }

    return (
        <HomeLayout>
            <div className="min-h-screen p-4 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Back button */}
                    <button 
                        onClick={handleBack}
                        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <IoArrowBack size={20} />
                        <span>Back</span>
                    </button>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                            {/* Product Images */}
                            <div className="space-y-4">
                                <img
                                    src={product?.images[selectedImage]?.secure_url || '/placeholder.png'}
                                    alt={product?.name}
                                    className="w-full h-96 object-cover rounded-lg"
                                />
                                <div className="grid grid-cols-4 gap-2">
                                    {product?.images.map((image, index) => (
                                        <img
                                            key={index}
                                            src={image.secure_url}
                                            alt={`${product.name} ${index + 1}`}
                                            className={`w-full h-24 object-cover rounded-lg cursor-pointer ${
                                                selectedImage === index ? 'border-2 border-blue-500' : ''
                                            }`}
                                            onClick={() => handleThumbnailClick(index)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Product Details */}
                            <div className="space-y-6">
                                <h1 className="text-3xl font-bold text-gray-800">{product?.name}</h1>
                                <p className="text-gray-600">{product?.description}</p>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-blue-600">
                                        ₹{product?.price}
                                    </span>
                                    <span className="text-sm text-gray-500 capitalize">
                                        Category: {product?.category}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <label className="text-gray-700">Quantity:</label>
                                    <select
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        className="border rounded-md px-2 py-1"
                                    >
                                        {[...Array(10)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {i + 1}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={handleBuyNow}
                                    disabled={loading}
                                    className={`w-full ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} 
                                        text-white py-3 rounded-lg transition-colors`}
                                >
                                    {loading ? 'Processing...' : 'Buy Now'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Form Modal */}
            <Dialog
                open={showOrderForm}
                onClose={() => setShowOrderForm(false)}
                className="relative z-50"
            >
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto max-w-2xl">
                        <OrderForm 
                            product={product}
                            quantity={quantity}
                            onClose={() => setShowOrderForm(false)}
                        />
                    </Dialog.Panel>
                </div>
            </Dialog>
        </HomeLayout>
    );
}

export default ProductDetail; 