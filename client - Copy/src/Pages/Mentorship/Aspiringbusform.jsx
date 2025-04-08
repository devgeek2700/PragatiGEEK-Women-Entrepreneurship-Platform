import React from 'react';
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import HomeLayout from "../../layouts/HomeLayout";

function Aspiringbusform() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <HomeLayout>
      <div className="relative min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 py-12 px-4">
        {/* Back button */}
        <button 
          onClick={handleBack}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-md text-gray-600 hover:text-gray-800 transition-colors"
        >
          <IoArrowBack size={20} />
          <span>Back</span>
        </button>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Aspiring Business Form</h1>
          {/* Add your form content here */}
        </div>
      </div>
    </HomeLayout>
  );
}

export default Aspiringbusform;
