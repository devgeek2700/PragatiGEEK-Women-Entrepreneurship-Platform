import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import axiosInstance from "../helpers/AxiosInstance";

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    image: null,
  });

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/products/${id}`);
      const product = response.data.product;

      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        image: null,
      });
    } catch (error) {
      toast.error("Failed to fetch product details");
      navigate("/seller/products");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Validate form data
      if (
        !formData.name ||
        !formData.description ||
        !formData.price ||
        !formData.stock ||
        !formData.category
      ) {
        toast.error("Please fill all required fields");
        return;
      }

      // Create FormData object to send multipart/form-data
      const productData = new FormData();
      productData.append("name", formData.name);
      productData.append("description", formData.description);
      productData.append("price", formData.price);
      productData.append("stock", formData.stock);
      productData.append("category", formData.category);
      if (formData.image) {
        productData.append("images", formData.image);
      }

      // Get token from localStorage
      const token = localStorage.getItem("token");

      const response = await axiosInstance.put(
        `/seller/products/${id}`,
        productData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Product updated successfully");
        navigate("/seller/products");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading && !formData.name) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-white">
      <button
        onClick={handleBack}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <IoArrowBack size={20} />
        <span>Back to Products</span>
      </button>

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
          Edit Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-3 bg-white text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-3 bg-white text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="Enter product description"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-3 bg-white text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Enter price"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-3 bg-white text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Enter stock quantity"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-3 bg-white text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            >
              <option value="">Select Category</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Books">Books</option>
              <option value="Home">Home & Kitchen</option>
              <option value="Beauty">Beauty</option>
              <option value="Sports">Sports</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Update Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-gray-700"
            />
            <p className="mt-1 text-sm text-gray-500">
              Leave empty to keep the current image
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-base"
          >
            {loading ? "Updating..." : "Update Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
