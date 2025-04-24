import React from "react";
import { Link } from "react-router-dom"; // Importing Link for navigation
import { Briefcase, UserPlus } from "lucide-react"; // Importing icons
import HomeLayout from "../../layouts/HomeLayout";

function MentorHome() {
  return (
    <HomeLayout>
      <div
        className="min-h-screen w-full flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: "100vw" }}
      >
        <h1 className="text-black text-3xl font-bold mb-8 text-center w-full">
          Mentor Home
        </h1>
        <div className="w-full max-w-7xl flex flex-wrap justify-center items-stretch gap-8">
          {/* Card for Existing Business Owners */}
          <Link
            to="/mentor-home/exist-business-form"
            className="flex-1 min-w-[300px] max-w-[400px] border border-black rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition duration-300 ease-in-out bg-white"
          >
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl font-semibold mb-4 text-black">
              Existing Business Owners
            </h2>
            <p className="text-gray-700 mb-4">
              Discover resources and guidance to scale your existing business,
              enhance operations, and boost revenue.
            </p>
            <button className="bg-black text-white py-2 px-4 rounded-lg mt-4 hover:bg-gray-800 w-full">
              Learn More
            </button>
          </Link>

          {/* Card for Aspiring User */}
          <Link
            to="/mentor-home/exist-business-form"
            className="flex-1 min-w-[300px] max-w-[400px] border border-black rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition duration-300 ease-in-out bg-white"
          >
            <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl font-semibold mb-4 text-black">
              Aspiring User
            </h2>
            <p className="text-gray-700 mb-4">
              Start your journey as a new entrepreneur. Get step-by-step
              guidance and mentorship to turn your ideas into reality.
            </p>
            <button className="bg-black text-white py-2 px-4 rounded-lg mt-4 hover:bg-gray-800 w-full">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </HomeLayout>
  );
}

export default MentorHome;
