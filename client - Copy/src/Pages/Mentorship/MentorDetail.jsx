import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HomeLayout from "../../layouts/HomeLayout";
import { IoArrowBack } from "react-icons/io5";

function MentorDetail() {
  const { state } = useLocation(); // Access the state passed through navigation
  const mentor = state?.mentor; // Get the mentor object from the state
  const navigate = useNavigate(); // Initialize the navigate function

  const [showModal, setShowModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentPeriod, setAppointmentPeriod] = useState("AM");
  const [appointmentInfo, setAppointmentInfo] = useState(null); // New state to hold the appointment details

  const handleBack = () => {
    navigate(-1);
  };

  if (!mentor) {
    return (
      <HomeLayout>
        <div className="text-center text-2xl text-gray-600 mt-10">
          No mentor data found!
        </div>
      </HomeLayout>
    ); // Handle case where data is missing
  }

  const handleAppointment = () => {
    setShowModal(true);
  };

  const handleSubmit = () => {
    const meetLink = "http://localhost:5173/meet-mentor?roomID=ONH3z"; // Set the meet link

    // Set the appointment info in the state including the meet link
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
      <div className="max-w-4xl mx-auto p-8">
        {/* Back button */}
        <button 
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <IoArrowBack size={20} />
          <span>Back</span>
        </button>

        <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <img
              src={mentor.imageSrc}
              alt={mentor.name}
              className="w-48 h-48 rounded-full object-cover mb-6 md:mb-0 md:mr-8"
            />
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                {mentor.name}
              </h1>
              <p className="text-xl text-blue-600 font-semibold mb-2">
                {mentor.title}
              </p>
              <p className="text-lg text-gray-600 mb-1">{mentor.expertise}</p>
              <p className="text-md text-gray-500 mb-4">
                Experience: {mentor.yearsOfExperience} years
              </p>

              {/* Conditionally render the "Schedule Appointment" button or the "Chat" and "Meet" buttons */}
              {!appointmentInfo ? (
                <button
                  onClick={handleAppointment}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Schedule Appointment
                </button>
              ) : (
                <div className="flex space-x-4">
                  <button
                    onClick={handleChat}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out"
                  >
                    Chat
                  </button>
                  <button
                    onClick={handleMeet}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out"
                  >
                    Meet
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="text-gray-700 mt-8 text-lg leading-relaxed">
            {mentor.description}
          </p>

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
                  Schedule Appointment
                </h2>
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="date"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Date
                    </label>
                    <input
                      id="date"
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <label
                        htmlFor="time"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Time
                      </label>
                      <input
                        id="time"
                        type="time"
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="period"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        AM/PM
                      </label>
                      <select
                        id="period"
                        value={appointmentPeriod}
                        onChange={(e) => setAppointmentPeriod(e.target.value)}
                        className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Display the appointment information if available */}
          {appointmentInfo && (
            <div className="mt-8 bg-gray-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800">
                Your Appointment
              </h3>
              <p className="text-lg text-gray-700 mt-4">
                You have scheduled an appointment with {mentor.name} on{" "}
                {appointmentInfo.date} at {appointmentInfo.time}.
              </p>
              <p className="text-lg text-gray-700 mt-4">
                <strong>Meet Link:</strong>{" "}
                <a href={appointmentInfo.meetLink} className="text-blue-500">
                  {appointmentInfo.meetLink}
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </HomeLayout>
  );
}

export default MentorDetail;
