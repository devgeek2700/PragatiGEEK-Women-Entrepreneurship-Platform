import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { RiVideoAddFill } from "react-icons/ri";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { addLecture } from "../../redux/slices/LectureSlice";
import HomeLayout from "../../layouts/HomeLayout";

function AddCourseLecture() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();

  useEffect(() => {
    if (!state) {
      navigate("/courses");
    }
    document.title = "Add lecture - Learning Management System";
  }, []);

  const [data, setData] = useState({
    cid: state?._id,
    lecture: undefined,
    title: "",
    description: "",
    videoSrc: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  }

  const handleVideo = (e) => {
    const video = e.target.files[0];
    if (video) {
      const source = window.URL.createObjectURL(video);
      setData({
        ...data,
        lecture: video,
        videoSrc: source,
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!data.lecture || !data.title || !data.description) {
      toast.error("All feilds are required");
      return;
    }
    const res = await dispatch(addLecture(data));
    if (res?.payload?.success) {
      navigate(-1);
      setData({
        cid: state._id,
        lecture: undefined,
        title: "",
        description: "",
        videoSrc: "",
      });
    }
  };

  return (
    <HomeLayout>
      <form
        onSubmit={handleSubmit}
        className="flex lg:flex-row md:flex-row flex-col items-center justify-center lg:h-screen md:h-screen w-full lg:px-20 py-6 lg:py-0 md:py-0 bg-white"
      >
        <div className="lg:w-1/2 md:w-1/2 w-full lg:px-12 md:px-12 px-5">
          <div className="mb-4 flex items-center gap-4">
            <FaArrowLeft
              className="text-black text-2xl cursor-pointer hover:text-slate-600"
              onClick={() => navigate(-1)}
            />
            Go back
          </div>
          {data.videoSrc ? (
            <video
              key={data.videoSrc}
              controls
              controlsList="nodownload nofullscreen"
              disablePictureInPicture
              className="w-full lg:h-96 md:h-96 h-auto mb-3 lg:mb-0 md:mb-0 border-2 border-slate-500 rounded-md outline-none focus:outline-none"
            >
              <source src={data.videoSrc} type="video/mp4" />
            </video>
          ) : (
            <div className="w-full lg:h-96 md:h-96 h-auto mb-3 lg:mb-0 md:mb-0 flex justify-center items-center border-2 border-slate-500 rounded-lg">
              <RiVideoAddFill size={"10rem"} />
            </div>
          )}
        </div>
        <div className="lg:w-1/2 md:w-1/2 w-full lg:px-12 md:px-12 px-5 flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <label
              className="font-semibold text-black text-xl"
              htmlFor="lecture"
            >
              Course lecture
            </label>
            <input
              type="file"
              name="lecture"
              id="lecture"
              accept="video/mp4"
              onChange={handleVideo}
              className="file-input file-input-bordered file-input-accent w-full bg-gray-200 text-black"
            />
          </div>
          <div className="flex flex-col gap-3">
            <label className="font-semibold text-black text-xl" htmlFor="title">
              Lecture Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={data.title}
              onChange={handleChange}
              placeholder="Type here"
              className="input input-bordered input-accent w-full bg-gray-200 text-black"
            />
          </div>
          <div className="flex flex-col gap-3">
            <label
              className="font-semibold text-black text-xl"
              htmlFor="description"
            >
              Lecture Description
            </label>
            <textarea
              name="description"
              id="description"
              value={data.description}
              onChange={handleChange}
              placeholder="Type here"
              className="textarea textarea-accent text-black bg-gray-200 min-h-16 resize-y"
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary">
            Add lecture
          </button>
        </div>
      </form>
    </HomeLayout>
  );
}

export default AddCourseLecture;
