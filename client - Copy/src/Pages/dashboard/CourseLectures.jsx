import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Switch from "react-switch";
import { Link } from "react-router-dom";

import Footer from "../../components/Footer";
import HomeLayout from "../../layouts/HomeLayout";
import { deleteLecture, getLectures } from "../../redux/slices/LectureSlice";

function CourseLectures() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();
  const { lectures, enrollmentStatus } = useSelector((state) => state.lecture);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [autoPlay, setAutoPlay] = useState(
    localStorage.getItem("autoPlay") === "true"
  );
  const { role } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  // Simple access check - if enrolled or admin, grant access
  const hasAccess = role === "ADMIN" || enrollmentStatus === "enrolled";

  const handleVideoEnded = () => {
    if (autoPlay && currentVideo < lectures.length - 1) {
      setCurrentVideo(currentVideo + 1);
    }
  };
  const toggleAutoPlay = () => {
    const newValue = !autoPlay;
    setAutoPlay(newValue);
    localStorage.setItem("autoPlay", newValue.toString());
  };
  async function fetchData() {
    setIsLoading(true);
    try {
      await dispatch(getLectures(state?._id));
    } catch (error) {
      console.error("Error fetching lectures:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteHandle(cid, lectureId) {
    if (!window.confirm("Are you sure you want to delete this lecture? This action cannot be undone.")) {
      return;
    }
    
    const data = { cid, lectureId };
    const res = await dispatch(deleteLecture(data));
    if (res?.payload?.success) {
      if (lectures) {
        setCurrentVideo(0);
      }
    }
  }
  function handleClick(idx) {
    setCurrentVideo(idx);
  }

  const splitParagraph = (paragraph) => {
    const sentences = paragraph.split(".");
    return (
      <ul className="flex flex-col gap-4">
        {sentences.map((sentence, index) => (
          <li key={index} className="capitalize text-white px-4 list-disc">
            {sentence}
          </li>
        ))}
      </ul>
    );
  };

  useEffect(() => {
    if (!state) {
      navigate("/courses");
    } else {
      fetchData();
    }
  }, []);

  // Force admin access even if the backend doesn't give them enrolled status
  useEffect(() => {
    if (role === "ADMIN" && enrollmentStatus !== "enrolled") {
      console.log("Admin access granted regardless of enrollment status");
    }
  }, [role, enrollmentStatus]);

  useEffect(() => {
    if (lectures && currentVideo !== undefined) {
      document.title = `${lectures[currentVideo]?.title} - Learning Management System`;
    }
  }, [lectures, currentVideo]);

  useEffect(() => {
    console.log({
      role,
      enrollmentStatus,
      hasAccess,
      lectures: lectures?.length,
      currentVideoUrl: lectures?.[currentVideo]?.lecture?.secure_url,
    });
  }, [lectures, currentVideo, role, enrollmentStatus]);

  return (
    <HomeLayout>
      <div className="relative min-h-screen bg-gray-900">
        {isLoading ? (
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : lectures?.length > 0 ? (
          <>
            <div className="w-full flex lg:flex-row md:flex-row flex-col gap-4 lg:gap-0 md:gap-0 pb-16">
              <div className="lg:w-[70%] md:w-[60%] md:h-screen lg:h-screen h-[50vh] overflow-y-scroll">
                <div className="w-full h-16 flex justify-between items-center lg:px-12 px-6 bg-gray-800 lg:sticky md:sticky top-0 z-10 mb-4 shadow-lg">
                  <div className="flex gap-8 items-center h-full">
                    <FaArrowLeft
                      className="text-white text-2xl cursor-pointer hover:text-gray-300 transition-colors"
                      onClick={() => navigate(-1)}
                    />
                    <p className="text-white lg:text-xl">
                      Now playing -{" "}
                      <span className="font-semibold capitalize text-yellow-400">
                        {lectures[currentVideo]?.title}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="flex items-center h-full gap-4">
                      <span className="font-semibold text-white text-xl lg:block md:block hidden">
                        Autoplay
                      </span>
                      <Switch
                        onChange={toggleAutoPlay}
                        checked={autoPlay}
                        height={24}
                        width={48}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        onColor="#FCD34D"
                      />
                    </label>
                  </div>
                </div>
                <div className="h-full lg:overflow-y-scroll md:overflow-y-scroll px-4">
                  <div className="lg:px-6 lg:mb-8 mb-4">
                    {lectures.length > 0 && currentVideo !== undefined && (
                      <>
                        {isLoading ? (
                          <div className="text-white text-center p-4">
                            Loading video...
                          </div>
                        ) : lectures[currentVideo]?.lecture?.secure_url ? (
                          <>
                            {hasAccess || role === "ADMIN" ? (
                              <video
                                key={
                                  lectures[currentVideo]?.lecture?.secure_url
                                }
                                controls
                                autoPlay={autoPlay}
                                controlsList="nodownload"
                                disablePictureInPicture
                                onEnded={handleVideoEnded}
                                onError={(e) =>
                                  console.error("Video Error:", e)
                                }
                                className="w-full h-auto border-2 border-gray-700 rounded-lg outline-none focus:outline-none shadow-xl"
                              >
                                <source
                                  src={
                                    lectures[currentVideo]?.lecture?.secure_url
                                  }
                                  type="video/mp4"
                                  onError={(e) =>
                                    console.error("Source Error:", e)
                                  }
                                />
                                Your browser does not support the video tag.
                              </video>
                            ) : (
                              <div className="subscription-prompt p-8 text-center bg-gray-800 rounded-lg shadow-xl">
                                <p className="text-2xl text-white mb-6">
                                  Please enroll in this course to access the
                                  content
                                </p>
                                <Link
                                  to={`/course/${state?.title}/checkout`}
                                  className="px-6 py-3 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
                                >
                                  Enroll Now
                                </Link>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-white text-center p-4">
                            No video available
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex flex-col gap-4 p-8 bg-gray-800 rounded-lg shadow-lg mb-6">
                    <h1 className="text-white font-bold text-3xl border-b border-gray-700 pb-4">
                      Overview
                    </h1>
                    {splitParagraph(lectures[currentVideo]?.description)}
                    
                    {/* Admin action buttons */}
                    {role === "ADMIN" && (
                      <div className="flex gap-4 mt-4 border-t border-gray-700 pt-4">
                        <button
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          onClick={() =>
                            navigate(
                              `/course/${state?.title}/${state?._id}/lectures/editlecture`,
                              { state: lectures[currentVideo] }
                            )
                          }
                        >
                          <FiEdit /> Edit This Lecture
                        </button>
                        <button
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          onClick={() => deleteHandle(state?._id, lectures[currentVideo]?._id)}
                        >
                          <FiTrash2 /> Delete This Lecture
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="lg:w-[30%] md:w-[40%] lg:h-screen md:h-screen h-[50vh] overflow-y-scroll bg-gray-800">
                <div className="flex flex-col gap-4 z-10 lg:sticky md:sticky top-0">
                  <h1 className="w-full text-center font-bold text-white capitalize bg-gray-900 h-16 flex items-center justify-center lg:text-2xl md:text-xl text-xl">
                    {state?.title}
                  </h1>
                  {role === "ADMIN" && (
                    <>
                      <div className="mx-4 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold text-center">
                        Admin Mode
                      </div>
                      <button
                        onClick={() =>
                          navigate(
                            `/course/${state?.title}/${state?._id}/lectures/addlecture`,
                            { state: state }
                          )
                        }
                        className="mx-4 px-6 py-3 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
                      >
                        Add Lecture
                      </button>
                    </>
                  )}
                </div>
                <div className="py-4 h-full lg:overflow-y-scroll md:overflow-y-scroll px-4">
                  <ul className="menu gap-4">
                    {lectures &&
                      lectures.map((lecture, idx) => {
                        return (
                          <li
                            key={lecture._id}
                            className="border-b border-gray-700 last:border-none"
                          >
                            <div className="flex justify-between items-center p-4 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
                              <span
                                className={`text-lg font-semibold capitalize ${
                                  currentVideo === idx
                                    ? "text-yellow-400"
                                    : "text-white"
                                }`}
                                onClick={() => handleClick(idx)}
                              >
                                {lecture?.title}
                              </span>
                              {role === "ADMIN" && (
                                <div className="flex gap-4">
                                  <button
                                    className="text-xl text-blue-400 transform transition-all hover:scale-110 hover:text-blue-300 bg-blue-900 p-2 rounded-full"
                                    onClick={() =>
                                      navigate(
                                        `/course/${state?.title}/${state?._id}/lectures/editlecture`,
                                        { state: lectures[idx] }
                                      )
                                    }
                                    title="Edit this lecture"
                                  >
                                    <FiEdit />
                                  </button>
                                  <button
                                    className="text-xl text-red-400 transform transition-all hover:scale-110 hover:text-red-300 bg-red-900 p-2 rounded-full"
                                    onClick={() =>
                                      deleteHandle(state?._id, lecture?._id)
                                    }
                                    title="Delete this lecture"
                                  >
                                    <FiTrash2 />
                                  </button>
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-screen">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md">
              <h2 className="text-2xl font-bold text-white mb-4">No Lectures Available</h2>
              <p className="text-gray-300 mb-6">
                This course doesn't have any lectures yet.
              </p>
              {role === "ADMIN" && (
                <div className="flex flex-col gap-4">
                  <p className="text-yellow-400">
                    As an admin, you can add lectures to this course.
                  </p>
                  <button
                    onClick={() =>
                      navigate(
                        `/course/${state?.title}/${state?._id}/lectures/addlecture`,
                        { state: state }
                      )
                    }
                    className="px-6 py-3 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
                  >
                    Add First Lecture
                  </button>
                  <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors mt-2"
                  >
                    Go Back
                  </button>
                </div>
              )}
              {role !== "ADMIN" && (
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors"
                >
                  Go Back
                </button>
              )}
            </div>
          </div>
        )}
        <Footer />
      </div>
    </HomeLayout>
  );
}

export default CourseLectures;
