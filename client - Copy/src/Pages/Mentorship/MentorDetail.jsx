import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HomeLayout from "../../layouts/HomeLayout";
import { IoArrowBack } from "react-icons/io5";
import MentorData from "./MentorData.json";

function MentorDetail() {
  const { id } = useParams(); // Get mentor ID from URL parameter
  const [mentor, setMentor] = useState(null);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentPeriod, setAppointmentPeriod] = useState("AM");
  const [appointmentInfo, setAppointmentInfo] = useState(null);

  // Fetch mentor data based on ID
  useEffect(() => {
    console.log("Looking for mentor with ID:", id);
    if (id) {
      const mentorId = parseInt(id);
      const foundMentor = MentorData.find(m => m.id === mentorId);
      
      if (foundMentor) {
        console.log("Found mentor:", foundMentor);
        setMentor(foundMentor);
      } else {
        console.log("No mentor found with ID:", id);
      }
    }
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  if (!mentor) {
    return (
      <HomeLayout>
        <div className="min-h-screen bg-base-200 p-4">
          <button
            onClick={handleBack}
            className="btn btn-ghost gap-2 mb-4"
          >
            <IoArrowBack size={20} />
            Back
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
      <div className="min-h-screen bg-base-200 p-4">
        <button 
          onClick={handleBack}
          className="btn btn-ghost gap-2 mb-4"
        >
          <IoArrowBack size={20} />
          Back
        </button>

        <div className="max-w-4xl mx-auto bg-base-100 shadow-xl rounded-lg p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <img
              src={mentor.imageSrc}
              alt={mentor.name}
              className="w-48 h-48 rounded-full object-cover"
            />
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">
                {mentor.name}
              </h1>
              <p className="text-xl text-primary font-semibold mb-2">
                {mentor.title}
              </p>
              <p className="text-lg mb-1">{mentor.expertise}</p>
              <p className="text-md opacity-70 mb-4">
                Experience: {mentor.yearsOfExperience} years
              </p>

              {!appointmentInfo ? (
                <button
                  onClick={handleAppointment}
                  className="btn btn-success btn-lg"
                >
                  Schedule Appointment
                </button>
              ) : (
                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={handleChat}
                    className="btn btn-primary"
                  >
                    Chat
                  </button>
                  <button
                    onClick={handleMeet}
                    className="btn btn-warning"
                  >
                    Meet
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="mt-8 text-lg">
            {mentor.description}
          </p>

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-base-100 p-8 rounded-lg shadow-xl max-w-md w-full">
                <h2 className="text-3xl font-bold mb-6 text-center">
                  Schedule Appointment
                </h2>
                <div className="space-y-6">
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Date</span>
                    </label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="form-control flex-1">
                      <label className="label">
                        <span className="label-text">Time</span>
                      </label>
                      <input
                        type="time"
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        className="input input-bordered w-full"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">AM/PM</span>
                      </label>
                      <select
                        value={appointmentPeriod}
                        onChange={(e) => setAppointmentPeriod(e.target.value)}
                        className="select select-bordered"
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
                    className="btn btn-neutral"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="btn btn-primary"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {appointmentInfo && (
            <div className="mt-8 bg-base-200 p-6 rounded-lg">
              <h3 className="text-xl font-semibold">
                Your Appointment
              </h3>
              <p className="text-lg mt-4">
                You have scheduled an appointment with {mentor.name} on{" "}
                {appointmentInfo.date} at {appointmentInfo.time}.
              </p>
              <p className="text-lg mt-4">
                <strong>Meet Link:</strong>{" "}
                <a href={appointmentInfo.meetLink} className="text-primary">
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
