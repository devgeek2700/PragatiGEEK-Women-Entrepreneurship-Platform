import { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { AiOutlineArrowLeft } from "react-icons/ai";

import HomeLayout from "../../layouts/HomeLayout";
import { updateProduct } from "../../redux/slices/productSlice";

function EditProduct() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState({
    name: state?.name || "",
    description: state?.description || "",
    price: state?.price || 0,
    stock: state?.stock || 1,
    category: state?.category || "",
    thumbnail: null,
    previewImage: state?.images[0]?.secure_url || "",
  });

  function handleImageUpload(e) {
    e.preventDefault();
    const uploadedImage = e.target.files[0];
    if (uploadedImage) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadedImage);
      fileReader.addEventListener("load", function () {
        setProductData({
          ...productData,
          previewImage: this.result,
          thumbnail: uploadedImage,
        });
      });
    }
  }

  function handleUserInput(e) {
    const { name, value } = e.target;
    setProductData({
      ...productData,
      [name]: value,
    });
  }

  async function onFormSubmit(e) {
    e.preventDefault();

    if (
      !productData.name ||
      !productData.description ||
      !productData.price ||
      !productData.category
    ) {
      toast.error("All fields are mandatory");
      return;
    }

    if (productData.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    if (productData.stock <= 0) {
      toast.error("Stock must be greater than 0");
      return;
    }

    const formData = new FormData();
    formData.append("name", productData.name);
    formData.append("description", productData.description);
    formData.append("price", productData.price);
    formData.append("stock", productData.stock);
    formData.append("category", productData.category);
    if (productData.thumbnail) {
      formData.append("thumbnail", productData.thumbnail);
    }

    setLoading(true);
    const response = await dispatch(
      updateProduct({ productId: state._id, formData })
    );
    setLoading(false);

    if (response?.payload?.success) {
      navigate(-1);
    }
  }

  return (
    <HomeLayout>
      <div className="flex flex-col items-center justify-center min-h-[90vh] gap-5 mx-16">
        <div className="flex flex-col gap-5 p-8 shadow-[0_0_10px_black] w-full max-w-3xl rounded-lg">
          <header className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="text-xl text-green-500"
            >
              <AiOutlineArrowLeft />
            </button>
            <h1 className="text-center text-2xl font-bold">Edit Product</h1>
          </header>
          <form onSubmit={onFormSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="font-semibold">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Enter product name"
                className="bg-transparent px-3 py-2 border"
                value={productData.name}
                onChange={handleUserInput}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="description" className="font-semibold">
                Product Description
              </label>
              <textarea
                name="description"
                id="description"
                placeholder="Enter product description"
                className="bg-transparent px-3 py-2 border resize-none h-32"
                value={productData.description}
                onChange={handleUserInput}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="price" className="font-semibold">
                Product Price
              </label>
              <input
                type="number"
                name="price"
                id="price"
                placeholder="Enter product price"
                className="bg-transparent px-3 py-2 border"
                value={productData.price}
                onChange={handleUserInput}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="stock" className="font-semibold">
                Stock Available
              </label>
              <input
                type="number"
                name="stock"
                id="stock"
                placeholder="Enter available stock"
                className="bg-transparent px-3 py-2 border"
                value={productData.stock}
                onChange={handleUserInput}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="category" className="font-semibold">
                Product Category
              </label>
              <input
                type="text"
                name="category"
                id="category"
                placeholder="Enter product category"
                className="bg-transparent px-3 py-2 border"
                value={productData.category}
                onChange={handleUserInput}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="thumbnail" className="font-semibold">
                Product Thumbnail
              </label>
              <input
                type="file"
                name="thumbnail"
                id="thumbnail"
                className="hidden"
                accept=".jpg, .jpeg, .png"
                onChange={handleImageUpload}
              />
              <div className="flex items-center justify-center h-40 border cursor-pointer">
                {productData.previewImage ? (
                  <img
                    src={productData.previewImage}
                    alt="product thumbnail"
                    className="h-full object-cover"
                  />
                ) : (
                  <label
                    htmlFor="thumbnail"
                    className="text-center cursor-pointer"
                  >
                    Click to upload image
                  </label>
                )}
              </div>
            </div>
            <button
              type="submit"
              className={`bg-yellow-500 text-white py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors duration-200 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Product"}
            </button>
          </form>
        </div>
      </div>
    </HomeLayout>
  );
}

export default EditProduct;
