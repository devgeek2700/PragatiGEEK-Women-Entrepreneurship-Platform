import { useState } from "react";
import { FcAddImage } from "react-icons/fc";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BiSolidBookAdd } from "react-icons/bi";
import { MdCategory } from "react-icons/md";
import { BsCurrencyRupee, BsCardHeading } from "react-icons/bs";
import { TbFileDescription } from "react-icons/tb";

import HomeLayout from "../../layouts/HomeLayout";
import { createCourse } from "../../redux/slices/CourseSlice";

// Available course categories
const COURSE_CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "Artificial Intelligence",
  "Business",
  "Marketing",
  "Design",
  "Photography",
  "Music",
  "Cooking",
  "Personal Development",
  "Digital Marketing",
  "Entrepreneurship",
  "Other"
];

function CreateCourse() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data } = useSelector((state) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [userInput, setUserInput] = useState({
    title: "",
    description: "",
    category: "",
    createdBy: data?.id || "",
    thumbnail: null,
    previewImage: "",
    price: "",
  });

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    thumbnail: ""
  });
  
  function handleChange(e) {
    e.preventDefault();
    const { name, value } = e.target;
    setUserInput({
      ...userInput,
      [name]: value,
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  }
  
  function handleImage(e) {
    e.preventDefault();
    const uploadImage = e.target.files[0];
    if (uploadImage) {
      if (uploadImage.size > 2 * 1024 * 1024) {
        setErrors({
          ...errors,
          thumbnail: "Image size must be less than 2MB"
        });
        return;
      }
      
      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadImage);
      fileReader.addEventListener("load", function () {
        setUserInput({
          ...userInput,
          previewImage: this.result,
          thumbnail: uploadImage,
        });
        setErrors({
          ...errors,
          thumbnail: ""
        });
      });
    }
  }

  function validateForm() {
    const newErrors = {};
    let isValid = true;
    
    if (!userInput.title || userInput.title.length < 8) {
      newErrors.title = "Title must be at least 8 characters long";
      isValid = false;
    }
    
    if (!userInput.description || userInput.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters long";
      isValid = false;
    }
    
    if (!userInput.category) {
      newErrors.category = "Please select a category";
      isValid = false;
    }
    
    if (!userInput.price || userInput.price <= 0) {
      newErrors.price = "Price must be greater than 0";
      isValid = false;
    }
    
    if (!userInput.thumbnail) {
      newErrors.thumbnail = "Please upload a course thumbnail";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("title", userInput.title);
    formData.append("description", userInput.description);
    formData.append("category", userInput.category);
    formData.append("createdBy", data?.id || "");
    formData.append("thumbnail", userInput.thumbnail);
    formData.append("price", userInput.price);

    try {
      const response = await dispatch(createCourse(formData));
      if (response.payload?.success) {
        toast.success("Course created successfully! Now add lectures to your course.");
        
        // Navigate to add lecture page with the new course data
        const newCourse = response.payload.newCourse;
        navigate(`/course/${newCourse.title.replace(/\s+/g, '-')}/${newCourse._id}/lectures/addlecture`, {
          state: {
            _id: newCourse._id,
            title: newCourse.title,
            description: newCourse.description,
            thumbnail: newCourse.thumbnail,
            price: newCourse.price,
            category: newCourse.category,
            createdBy: newCourse.createdBy
          }
        });
      }
    } catch (error) {
      toast.error("Failed to create course. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <HomeLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          <BiSolidBookAdd className="inline-block mr-2 text-blue-600" size={35} />
          Create New Course
        </h1>
        
        <form
          onSubmit={onSubmit}
          className="flex flex-col lg:flex-row bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="lg:w-2/5 w-full p-6 bg-gray-50 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-gray-700 text-lg">Course Thumbnail</p>
              <p className="text-sm text-gray-500">Upload a high-quality image that represents your course (Max: 2MB)</p>
            </div>
            
            <div className="relative">
              {userInput.previewImage ? (
                <img
                  src={userInput.previewImage}
                  alt="course thumbnail"
                  className="rounded-xl w-full aspect-video object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-full aspect-video flex flex-col justify-center items-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <FcAddImage size={64} />
                  <p className="mt-2 text-gray-500">Upload thumbnail image</p>
                </div>
              )}
              
              <input
                type="file"
                name="thumbnail"
                id="thumbnail"
                accept=".jpg, .jpeg, .png, .webp"
                onChange={handleImage}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            
            {errors.thumbnail && (
              <p className="text-red-500 text-sm">{errors.thumbnail}</p>
            )}
            
            <div className="mt-4">
              <label className="file-input-label bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer block text-center">
                <input
                  type="file"
                  name="thumbnail"
                  accept=".jpg, .jpeg, .png, .webp"
                  onChange={handleImage}
                  className="hidden"
                />
                Browse Files
              </label>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4 rounded">
              <p className="text-sm text-yellow-700">
                <span className="font-bold">Tip:</span> Use a 16:9 aspect ratio image with clear, relevant visuals to attract more students.
              </p>
            </div>
          </div>
          
          <div className="lg:w-3/5 w-full p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-700 flex items-center" htmlFor="title">
                <BsCardHeading className="mr-2 text-blue-500" size={20} />
                Course Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={userInput.title}
                onChange={handleChange}
                placeholder="e.g., Complete Web Development Bootcamp"
                className={`input input-bordered w-full text-black bg-white ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title}</p>
              )}
              <p className="text-xs text-gray-500">Min 8 characters. A catchy title helps your course stand out.</p>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-700 flex items-center" htmlFor="category">
                <MdCategory className="mr-2 text-blue-500" size={20} />
                Course Category
              </label>
              <select
                name="category"
                id="category"
                value={userInput.category}
                onChange={handleChange}
                className={`select select-bordered w-full text-black bg-white ${
                  errors.category ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="" disabled>Select a category</option>
                {COURSE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm">{errors.category}</p>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-700 flex items-center" htmlFor="price">
                <BsCurrencyRupee className="mr-2 text-blue-500" size={20} />
                Course Price (₹)
              </label>
              <input
                type="number"
                name="price"
                id="price"
                value={userInput.price}
                onChange={handleChange}
                placeholder="e.g., 499"
                className={`input input-bordered w-full text-black bg-white ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.price && (
                <p className="text-red-500 text-sm">{errors.price}</p>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-700 flex items-center" htmlFor="description">
                <TbFileDescription className="mr-2 text-blue-500" size={20} />
                Course Description
              </label>
              <textarea
                name="description"
                id="description"
                value={userInput.description}
                onChange={handleChange}
                placeholder="Describe what students will learn in this course..."
                className={`textarea textarea-bordered resize-y min-h-32 w-full text-black bg-white ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm">{errors.description}</p>
              )}
              <p className="text-xs text-gray-500">Min 20 characters. A detailed description helps students understand what they'll learn.</p>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn mt-4 bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-lg font-semibold text-lg ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  Creating Course...
                </>
              ) : (
                "Create Course & Add Lectures"
              )}
            </button>
          </div>
        </form>
      </div>
    </HomeLayout>
  );
}

export default CreateCourse;
