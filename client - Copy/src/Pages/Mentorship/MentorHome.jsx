import React from "react";
import { Link } from "react-router-dom"; // Importing Link for navigation
import { Briefcase, UserPlus } from "lucide-react"; // Importing icons
import HomeLayout from "../../layouts/HomeLayout"; 
function MentorHome() {
  return (
    <HomeLayout>
      <div className="min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-black text-3xl font-bold mb-8 text-center">Mentor Home</h1>
        <div className="flex flex-wrap justify-center items-center gap-8">
          {/* Card for Existing Business Owners */}
          <Link to="/mentor-home/exist-business-form" className="border border-black rounded-lg p-6 w-64 text-center shadow-lg hover:shadow-xl transition duration-300 ease-in-out">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl font-semibold mb-4">Existing Business Owners</h2>
            <p className="text-gray-700 mb-4">
              Discover resources and guidance to scale your existing business, enhance operations, and boost revenue.
            </p>
            <button className="bg-black text-white py-2 px-4 rounded-lg mt-4 hover:bg-gray-800">
              Learn More
            </button>
          </Link>
          
          {/* Card for Aspiring User */}
          <Link to="/mentor-home/aspiring-user" className="border border-black rounded-lg p-6 w-64 text-center shadow-lg hover:shadow-xl transition duration-300 ease-in-out">
            <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl font-semibold mb-4">Aspiring User</h2>
            <p className="text-gray-700 mb-4">
              Start your journey as a new entrepreneur. Get step-by-step guidance and mentorship to turn your ideas into reality.
            </p>
            <button className="bg-black text-white py-2 px-4 rounded-lg mt-4 hover:bg-gray-800">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </HomeLayout>
  );
}

export default MentorHome;
