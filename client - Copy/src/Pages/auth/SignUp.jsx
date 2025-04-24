import Cookies from "js-cookie";
import { useState } from "react";
import { BsCloudUpload, BsEnvelope, BsLock, BsPerson } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import option3 from "../../assets/Json/option3.json";
import Particle from "../../components/Particle";
import HomeLayout from "../../layouts/HomeLayout";
import { signup, login } from "../../redux/slices/AuthSlice";
import axiosInstance from "../../helpers/AxiosInstance";

function SignUp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = import.meta.env.VITE_TOKEN;
  const [viewImage, setViewImage] = useState("");
  const [role, setRole] = useState("USER");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    storeName: "",
    storeDescription: "",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  function getImage(event) {
    event.preventDefault();
    const uploadedImage = event.target.files[0];
    if (uploadedImage) {
      setFormData({ ...formData, avatar: uploadedImage });
    }

    const fileReader = new FileReader();
    fileReader.readAsDataURL(uploadedImage);
    fileReader.addEventListener("load", function () {
      setViewImage(this.result);
    });
  }

  async function onSubmit(e) {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("All fields are required");
      return;
    }

    if (
      role === "SELLER" &&
      (!formData.storeName || !formData.storeDescription)
    ) {
      toast.error("Store details are required for seller account");
      return;
    }

    try {
      const response = await axiosInstance.post("/user/signup", {
        ...formData,
        role,
      });

      if (response?.data?.success) {
        toast.success(response?.data?.message);
        dispatch(login(response?.data));
        navigate("/");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  }

  return (
    <HomeLayout>
      <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
          {/* Header Section */}
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
              Create Account
            </h2>
            <p className="text-gray-600">
              Join our community and start your journey
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-6">
            {/* Role Selection */}
            <div className="flex justify-center gap-4 p-2 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setRole("USER")}
                className={`px-6 py-2 rounded-md transition-all duration-300 ${
                  role === "USER"
                    ? "bg-yellow-500 text-gray-900 font-semibold"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                User Account
              </button>
              <button
                type="button"
                onClick={() => setRole("SELLER")}
                className={`px-6 py-2 rounded-md transition-all duration-300 ${
                  role === "SELLER"
                    ? "bg-yellow-500 text-gray-900 font-semibold"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Seller Account
              </button>
            </div>

            {/* Basic Fields */}
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="name" className="sr-only">
                  Name
                </label>
                <div className="relative">
                  <BsPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-xl" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="appearance-none relative block w-full px-12 py-3 bg-gray-100 border border-gray-300 placeholder-gray-500 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <div className="relative">
                  <BsEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-xl" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none relative block w-full px-12 py-3 bg-gray-100 border border-gray-300 placeholder-gray-500 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <BsLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-xl" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="appearance-none relative block w-full px-12 py-3 bg-gray-100 border border-gray-300 placeholder-gray-500 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Seller Specific Fields */}
              {role === "SELLER" && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label htmlFor="storeName" className="sr-only">
                      Store Name
                    </label>
                    <input
                      id="storeName"
                      name="storeName"
                      type="text"
                      required
                      className="appearance-none relative block w-full px-4 py-3 bg-gray-100 border border-gray-300 placeholder-gray-500 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      placeholder="Store Name"
                      value={formData.storeName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="storeDescription" className="sr-only">
                      Store Description
                    </label>
                    <textarea
                      id="storeDescription"
                      name="storeDescription"
                      required
                      rows="4"
                      className="appearance-none relative block w-full px-4 py-3 bg-gray-100 border border-gray-300 placeholder-gray-500 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none"
                      placeholder="Store Description"
                      value={formData.storeDescription}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-gray-900 bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-300"
              >
                Create Account
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link
                to="/login"
                className="font-medium text-yellow-600 hover:text-yellow-500 transition-colors duration-300"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </HomeLayout>
  );
}

export default SignUp;
