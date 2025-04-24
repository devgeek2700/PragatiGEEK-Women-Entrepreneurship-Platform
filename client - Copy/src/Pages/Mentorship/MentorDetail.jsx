import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HomeLayout from "../../layouts/HomeLayout";
import { IoArrowBack } from "react-icons/io5";
import { FaCalendar, FaClock, FaVideo, FaComments } from "react-icons/fa";
import MentorData from "./MentorData.json";

function MentorDetail() {
  const { id } = useParams();
  const [mentor, setMentor] = useState(null);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentPeriod, setAppointmentPeriod] = useState("AM");
  const [appointmentInfo, setAppointmentInfo] = useState(null);

  useEffect(() => {
    if (id) {
      const mentorId = parseInt(id);
      const foundMentor = MentorData.find((m) => m.id === mentorId);
      if (foundMentor) {
        setMentor(foundMentor);
      }
    }
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  if (!mentor) {
    return (
      <HomeLayout>
        <div className="min-h-screen bg-white p-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <IoArrowBack size={20} />
            <span>Back</span>
          </button>
          <div className="text-center text-2xl text-gray-600 mt-10">
            No mentor data found!
          </div>
        </div>
      </HomeLayout>
    );
  }

  const handleAppointment = () => {
    setShowModal(true);
  };

  const handleSubmit = () => {
    const meetLink = "http://localhost:5173/meet-mentor?roomID=ONH3z";
    setAppointmentInfo({
      date: appointmentDate,
      time: `${appointmentTime} ${appointmentPeriod}`,
      meetLink: meetLink,
    });
    setShowModal(false);
  };

  const handleMeet = () => {
    navigate("/meet-mentor");
  };

  const handleChat = () => {
    navigate("/chat-mentor");
  };

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <IoArrowBack size={20} />
            <span>Back</span>
          </button>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <img
                  src={mentor.imageSrc}
                  alt={mentor.name}
                  className="w-48 h-48 rounded-full object-cover ring-4 ring-white shadow-lg"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {mentor.name}
                  </h1>
                  <p className="text-xl text-blue-600 font-semibold mb-2">
                    {mentor.title}
                  </p>
                  <p className="text-lg text-gray-700 mb-1">
                    {mentor.expertise}
                  </p>
                  <p className="text-md text-gray-500 mb-6">
                    {mentor.yearsOfExperience} years of experience
                  </p>

                  {!appointmentInfo ? (
                    <button
                      onClick={handleAppointment}
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
                    >
                      <FaCalendar className="mr-2" />
                      Schedule Appointment
                    </button>
                  ) : (
                    <div className="flex gap-4">
                      <button
                        onClick={handleChat}
                        className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-200 shadow-md border border-blue-200"
                      >
                        <FaComments className="mr-2" />
                        Chat
                      </button>
                      <button
                        onClick={handleMeet}
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
                      >
                        <FaVideo className="mr-2" />
                        Join Meeting
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="px-8 py-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">
                {mentor.description}
              </p>
            </div>
          </div>

          {/* Appointment Info Card */}
          {appointmentInfo && (
            <div className="mt-8 bg-white rounded-xl shadow-md p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Your Scheduled Appointment
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <FaCalendar className="text-blue-500 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="text-gray-900 font-medium">
                      {appointmentInfo.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaClock className="text-blue-500 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="text-gray-900 font-medium">
                      {appointmentInfo.time}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Meeting Link</p>
                <a
                  href={appointmentInfo.meetLink}
                  className="text-blue-600 hover:text-blue-700 font-medium break-all"
                >
                  {appointmentInfo.meetLink}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full m-4 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Schedule Appointment
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AM/PM
                    </label>
                    <select
                      value={appointmentPeriod}
                      onChange={(e) => setAppointmentPeriod(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </HomeLayout>
  );
}

export default MentorDetail;
