import { useState } from "react";
import { FcAddImage } from "react-icons/fc";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import HomeLayout from "../../layouts/HomeLayout";
import { createCourse } from "../../redux/slices/CourseSlice";
function CreateCourse() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userInput, setUserInput] = useState({
    title: "",
    description: "",
    category: "",
    createdBy: "",
    thumbnail: null,
    previewImage: "",
    price: "",
  });
  function handleChange(e) {
    e.preventDefault();
    const { name, value } = e.target;
    setUserInput({
      ...userInput,
      [name]: value,
    });
  }
  function handleImage(e) {
    e.preventDefault();
    const uploadImage = e.target.files[0];
    if (uploadImage) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadImage);
      fileReader.addEventListener("load", function () {
        setUserInput({
          ...userInput,
          previewImage: this.result,
          thumbnail: uploadImage,
        });
      });
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!userInput.thumbnail) {
      toast.error("Please enter course thumbnail");
      return;
    }
    const formData = new FormData();
    formData.append("title", userInput.title);
    formData.append("description", userInput.description);
    formData.append("category", userInput.category);
    formData.append("createdBy", userInput.createdBy);
    formData.append("thumbnail", userInput.thumbnail);
    formData.append("price", userInput.price);

    const response = await dispatch(createCourse(formData));
    if (response.payload?.success) {
      navigate("/courses");
      setUserInput({
        title: "",
        description: "",
        category: "",
        createdBy: "",
        thumbnail: null,
        previewImage: "",
        price: "",
      });
    }
  }

  return (
    <HomeLayout>
      <form
        onSubmit={onSubmit}
        className="flex flex-col lg:flex-row lg:px-20 py-12 bg-white rounded-lg shadow-lg"
      >
        <div className="lg:w-1/2 w-full px-12 flex flex-col gap-4 lg:py-12 py-0">
          {userInput.previewImage ? (
            <img
              src={userInput.previewImage}
              alt="thumbnail"
              className="rounded-xl w-full h-96 object-cover"
            />
          ) : (
            <div className="w-full h-96 flex justify-center items-center border-2 border-gray-300 rounded-lg bg-gray-200">
              <FcAddImage size={"10rem"} />
            </div>
          )}
          <div className="flex flex-col gap-3">
            <label
              className="font-semibold text-black text-xl"
              htmlFor="thumbnail"
            >
              Course Thumbnail
            </label>
            <input
              type="file"
              name="thumbnail"
              id="thumbnail"
              accept=".jpg, .jpeg, .png, .svg"
              onChange={handleImage}
              className="file-input file-input-bordered file-input-accent w-full text-black bg-white border-gray-300"
            />
          </div>
        </div>
        <div className="lg:w-1/2 w-full px-12 py-9 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label className="font-semibold text-black text-xl" htmlFor="title">
              Course Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={userInput.title}
              onChange={handleChange}
              placeholder="Type here"
              className="input input-bordered input-accent w-full text-black bg-white border-gray-300"
            />
          </div>
          <div className="flex flex-col gap-3">
            <label
              className="font-semibold text-black text-xl"
              htmlFor="createdBy"
            >
              Course Instructor
            </label>
            <input
              type="text"
              name="createdBy"
              id="createdBy"
              value={userInput.createdBy}
              onChange={handleChange}
              placeholder="Type here"
              className="input input-bordered input-accent w-full text-black bg-white border-gray-300"
            />
          </div>
          <div className="flex flex-col gap-3">
            <label
              className="font-semibold text-black text-xl"
              htmlFor="category"
            >
              Course Domain
            </label>
            <input
              type="text"
              name="category"
              id="category"
              value={userInput.category}
              onChange={handleChange}
              placeholder="Type here"
              className="input input-bordered input-accent w-full text-black bg-white border-gray-300"
            />
          </div>
          <div className="flex flex-col gap-3">
            <label className="font-semibold text-black text-xl" htmlFor="price">
              Course Price (₹)
            </label>
            <input
              type="number"
              name="price"
              id="price"
              value={userInput.price}
              onChange={handleChange}
              placeholder="Enter course price"
              className="input input-bordered input-accent w-full text-black bg-white border-gray-300"
            />
          </div>
          <div className="flex flex-col gap-3">
            <label
              className="font-semibold text-black text-xl"
              htmlFor="description"
            >
              Course Description
            </label>
            <textarea
              type="text"
              name="description"
              id="description"
              value={userInput.description}
              onChange={handleChange}
              placeholder="Type here"
              className="textarea textarea-accent resize-y min-h-16 w-full text-black bg-white border-gray-300"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary bg-blue-600 hover:bg-blue-700 transition duration-300 text-white"
          >
            Create
          </button>
        </div>
      </form>
    </HomeLayout>
  );
}

export default CreateCourse;
