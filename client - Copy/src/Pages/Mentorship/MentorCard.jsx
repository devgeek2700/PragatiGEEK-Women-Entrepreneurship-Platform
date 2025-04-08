import React from "react";
import { useNavigate } from "react-router-dom";

const MentorCard = ({ mentor }) => {
  const navigate = useNavigate();

  const handleLearnMore = () => {
    // Passing the mentor data along with the navigation to the detail page
    navigate(`/mentor-list/${mentor.id}`, {
      state: { mentor }, // Send the entire mentor object as state
    });
  };

  return (
    <div className="p-6 border rounded-lg shadow-lg bg-gradient-to-r from-blue-50 to-blue-100 mb-6">
      <div className="flex items-center mb-4">
        <img
          src={mentor.imageSrc} // Corrected the typo in the image source
          alt={mentor.name}
          className="w-20 h-20 rounded-full border-2 border-blue-500"
        />
        <div className="ml-4">
          <h3 className="text-xl font-bold text-blue-800">{mentor.name}</h3>
          <p className="text-blue-600">{mentor.title}</p>
        </div>
      </div>
      <p className="text-gray-600 mb-2">{mentor.expertise}</p>
      <p className="text-sm text-gray-500 mb-4">
        Experience: {mentor.yearsOfExperience} years
      </p>
      <p className="text-gray-700 mb-4">{mentor.description}</p>
      <button
        onClick={handleLearnMore}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
      >
        Learn More
      </button>
    </div>
  );
};

export default MentorCard;
