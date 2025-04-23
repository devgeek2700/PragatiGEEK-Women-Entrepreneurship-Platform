import { useEffect, useState } from "react";
import { FiTrash2, FiEdit } from "react-icons/fi";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import Layout from "../layouts/HomeLayout";
import axiosInstance from "../helpers/AxiosInstance";

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get("/seller/products/my-products");
      setProducts(data.products);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/products/${id}`);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete product");
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <button
          onClick={handleBack}
          className="mb-4 flex items-center gap-2 text-black hover:text-black transition-colors"
        >
          <IoArrowBack size={20} />
          <span>Back</span>
        </button>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">Your Products</h1>
          <Link
            to="/seller/products/new"
            className="px-6 py-2 bg-blue-500 text-black rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add New Product
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-black text-lg">
              No products found. Add some products to get started!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-black">
                    Image
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-black">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-black">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-black">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <img
                        src={product.images[0]?.secure_url}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </td>
                    <td className="px-6 py-4 text-black">{product.name}</td>
                    <td className="px-6 py-4 text-black">₹{product.price}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/seller/products/edit/${product._id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <FiEdit />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <FiTrash2 />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return <Layout>{renderContent()}</Layout>;
};

export default SellerProducts;
