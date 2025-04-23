import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Dialog } from "@headlessui/react";
import { useSelector } from "react-redux";
import { IoArrowBack } from "react-icons/io5";

import axiosInstance from "../helpers/AxiosInstance";
import HomeLayout from "../layouts/HomeLayout";
import OrderForm from "../components/OrderForm";

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
      toast.error("Failed to fetch product details");
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
        state: { from: `/product/${id}` },
      });
      return;
    }

    setLoading(true);
    try {
      navigate(`/product/${product._id}/checkout`, {
        state: {
          productId: product._id,
          quantity: quantity,
          price: product.price * quantity,
        },
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
          <p className="text-black">Product not found</p>
        </div>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout>
      <div className="min-h-screen bg-white p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back button */}
          <button
            onClick={handleBack}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors group"
          >
            <IoArrowBack
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>Back to Products</span>
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              {/* Product Images */}
              <div className="space-y-6">
                <div className="relative group bg-gray-50 rounded-xl p-4">
                  <img
                    src={
                      product?.images[selectedImage]?.secure_url ||
                      "/placeholder.png"
                    }
                    alt={product?.name}
                    className="w-full h-[500px] object-cover rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {product?.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative group bg-gray-50 rounded-lg p-2"
                    >
                      <img
                        src={image.secure_url}
                        alt={`${product.name} ${index + 1}`}
                        className={`w-full h-24 object-cover rounded-lg cursor-pointer transition-all duration-300 ${
                          selectedImage === index
                            ? "ring-2 ring-blue-500 ring-offset-2 scale-105"
                            : "hover:ring-1 hover:ring-gray-200"
                        }`}
                        onClick={() => handleThumbnailClick(index)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-8">
                <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
                  <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                    {product?.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm font-medium border border-gray-200">
                      {product?.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{product?.price}
                    </span>
                    <span className="text-sm text-gray-500">
                      (Inclusive of all taxes)
                    </span>
                  </div>
                </div>

                <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Description
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product?.description}
                  </p>
                </div>

                <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Quantity
                  </h3>
                  <div className="flex items-center gap-4">
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="bg-white border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-24 text-gray-900 font-medium"
                    >
                      {[...Array(10)].map((_, i) => (
                        <option
                          key={i + 1}
                          value={i + 1}
                          className="text-gray-900"
                        >
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleBuyNow}
                  disabled={loading}
                  className={`w-full ${
                    loading
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white py-4 rounded-xl transition-all duration-300 font-medium text-lg shadow-sm hover:shadow-md`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Buy Now"
                  )}
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
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">
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
