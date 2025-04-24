import { useEffect, useState } from "react";
import { FcAddImage } from "react-icons/fc";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import HomeLayout from "../../layouts/HomeLayout";
import { updateCourse } from "../../redux/slices/CourseSlice";

function EditCourse() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id } = useParams();
  const { data } = useSelector((state) => state.auth);

  const [userInput, setUserInput] = useState({
    id: id,
    title: state?.title || "",
    description: state?.description || "",
    category: state?.category || "",
    createdBy: state?.createdBy || data?.id || "",
    price: state?.price || "",
    thumbnail: null,
    previewImage: state?.thumbnail?.secure_url || "",
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

  useEffect(() => {
    if (!state) {
      navigate("/courses");
    }
    document.title = "Edit Course - Learning Management System";
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    const response = await dispatch(updateCourse(userInput));
    if (response.payload?.success) {
      navigate("/courses");
      setUserInput({
        title: "",
        description: "",
        category: "",
        createdBy: data?.id || "",
        price: "",
        thumbnail: null,
        previewImage: "",
      });
    }
  }

  const handleAddLecture = () => {
    navigate(`/course/${state?.title}/${id}/lectures/addlecture`, {
      state: { ...state, _id: id },
    });
  };

  return (
    <HomeLayout>
      <form
        onSubmit={onSubmit}
        className="flex flex-col lg:flex-row lg:px-20 py-12 bg-gray-200 rounded-lg shadow-lg"
      >
        <div className="lg:w-1/2 w-full px-12 flex flex-col gap-4 lg:py-12 py-0">
          {userInput.previewImage ? (
            <img
              src={userInput.previewImage}
              alt="thumbnail"
              className="rounded-xl w-full h-96 object-cover"
            />
          ) : (
            <div className="w-full h-96 flex justify-center items-center border-2 border-gray-300 rounded-lg bg-white">
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
              className="file-input file-input-bordered w-full text-black bg-white hover:bg-gray-50 transition duration-200"
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
              placeholder="Enter course title"
              className="input input-bordered w-full text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
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
              placeholder="Enter course domain"
              className="input input-bordered w-full text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
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
              className="input input-bordered w-full text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
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
              placeholder="Enter course description"
              className="textarea textarea-bordered resize-y min-h-16 w-full text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="btn btn-primary bg-blue-600 hover:bg-blue-700 transition duration-200 flex-1"
            >
              Update Course
            </button>
          </div>
        </div>
      </form>
    </HomeLayout>
  );
}

export default EditCourse;
