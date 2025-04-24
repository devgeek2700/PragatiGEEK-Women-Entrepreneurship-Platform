import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import HomeLayout from "../../layouts/HomeLayout";
import MentorData from "./MentorData.json";
import MentorCard from "./MentorCard";

const Existbusform = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [mentorshipChallenges, setMentorshipChallenges] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({});

  // Debug mentor data on component mount
  useEffect(() => {
    console.log("MentorData available:", MentorData);
    console.log("Sample mentor:", MentorData[0]);
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const formSections = [
    {
      title: "COMPANY LOCATION",
      fields: [
        { name: "country", label: "Country" },
        { name: "stateProvince", label: "State/Province" },
        { name: "city", label: "City" },
      ],
    },
    {
      title: "BUSINESS OVERVIEW",
      fields: [
        {
          name: "businessDescription",
          label: "Describe your business in a sentence",
        },
        {
          name: "valueProposition",
          label: "What is your unique value proposition?",
        },
        { name: "targetMarket", label: "Who is your target market?" },
        {
          name: "productService",
          label: "What product or service do you offer?",
        },
        { name: "competitors", label: "Who are your main competitors?" },
        {
          name: "revenue",
          label: "What type of revenue does your business generate?",
        },
        { name: "challenges", label: "What are your biggest challenges?" },
        {
          name: "goals",
          label: "What are your business goals for the next year?",
        },
      ],
    },
    {
      title: "COMPANY DETAILS",
      fields: [
        { name: "legalName", label: "What is your legal business name?" },
        { name: "industry", label: "Industry" },
        { name: "subIndustry", label: "Sub-Industry" },
        {
          name: "businessType",
          label: "Business Type",
          type: "select",
          options: ["Corporation", "Partnership", "Sole Proprietorship"],
        },
      ],
    },
    {
      title: "FINANCIAL DETAILS",
      fields: [
        { name: "financialYear", label: "The most recent financial year" },
        { name: "annualRevenue", label: "What was your annual revenue?" },
        {
          name: "operatingProfit",
          label: "What was your operating profit?",
          type: "select",
          options: ["Positive", "Negative", "Break-even"],
        },
        {
          name: "fundingRaised",
          label: "How much funding have you raised to date?",
          type: "select",
          options: ["0-100k", "100k-500k", "500k-1M", "1M+"],
        },
        {
          name: "fundingStage",
          label: "At which funding stage is your company?",
          type: "select",
          options: ["Pre-seed", "Seed", "Series A", "Series B+"],
        },
      ],
    },
    {
      title: "SOCIAL MEDIA DETAILS",
      fields: [
        { name: "websiteUrl", label: "Website URL" },
        { name: "facebookUrl", label: "Facebook URL" },
        { name: "twitterUrl", label: "Twitter URL" },
        { name: "linkedinUrl", label: "LinkedIn URL" },
      ],
    },
    {
      title: "MENTORSHIP REQUIREMENTS",
      fields: [
        {
          name: "businessChallenges",
          label:
            "What are the key business challenges that you are looking to solve through mentorship? (Please select them)",
          type: "checkbox",
          options: [
            "Compliance and navigating complex regulations",
            "Customer retention",
            "Demand volatility",
            "Funds and cash flow management",
            "Inventory and procurement management",
            "Labour related",
            "Lack of business expertise",
            "Lack of required skills and knowledge",
            "Marketing and managerial",
            "Others",
            "Technological adoption and upgradation",
          ],
        },
        {
          name: "sessionLength",
          label: "How long should each of your mentorship sessions last?",
          type: "select",
          options: ["30 minutes", "1 hour", "1.5 hours", "2 hours"],
        },
        {
          name: "engagementLength",
          label: "How long should your engagement with the mentor last?",
          type: "select",
          options: ["1 month", "3 months", "6 months", "1 year"],
        },
        {
          name: "preferPeers",
          label: "Would you like to mentor your peers?",
          type: "select",
          options: ["Yes", "No", "Maybe"],
        },
      ],
    },
  ];

  const handleNext = () => {
    if (currentStep < formSections.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCheckboxChange = (option) => {
    setMentorshipChallenges((prev) =>
      prev.includes(option)
        ? prev.filter((challenge) => challenge !== option)
        : [...prev, option]
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Combine all form data
    const finalFormData = {
      ...formData,
      businessChallenges: mentorshipChallenges,
    };

    console.log("Submitting form with challenges:", mentorshipChallenges);

    // Use sample mentor data if no challenges selected or no matches found
    let suggestedMentors = [];

    if (mentorshipChallenges.length > 0) {
      // Filter mentors based on selected challenges
      suggestedMentors = MentorData.filter((mentor) => {
        // Debug logging for filtering
        console.log(
          `Checking mentor ${mentor.name}, expertise: ${mentor.expertise}`
        );
        return mentorshipChallenges.some((challenge) => {
          const match = mentor.expertise.includes(challenge);
          console.log(
            `  - Challenge "${challenge}": ${match ? "match" : "no match"}`
          );
          return match;
        });
      });
    }

    // If no matches found, use the first few mentors as examples
    if (suggestedMentors.length === 0) {
      console.log("No matching mentors found, using sample mentors");
      suggestedMentors = MentorData.slice(0, 3);
    }

    setMentors(suggestedMentors);
    setIsFormSubmitted(true);
    console.log("Form submitted with data:", finalFormData);
    console.log("Suggested mentors:", suggestedMentors);
  };

  if (isFormSubmitted) {
    return (
      <HomeLayout>
        <div className="min-h-screen bg-gray-50 w-full">
          {/* Back button container */}
          <div className="w-full px-6 py-4 bg-white border-b border-gray-200">
            <div className="max-w-[1440px] mx-auto">
              <button
                onClick={() => setIsFormSubmitted(false)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <IoArrowBack size={20} />
                <span>Back to Form</span>
              </button>
            </div>
          </div>

          <div className="w-full px-4 py-8 md:px-6 lg:px-8">
            <div className="max-w-[1440px] mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-gray-800">
                Suggested Mentors
              </h2>
              {mentors && mentors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mentors.map((mentor) => (
                    <div
                      key={mentor.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden"
                    >
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          {mentor.name}
                        </h3>
                        <p className="text-gray-600 font-medium mb-2">
                          {mentor.expertise}
                        </p>
                        <p className="text-gray-600">{mentor.description}</p>
                        <div className="mt-4 flex justify-end">
                          <button
                            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
                            onClick={() => {
                              navigate(`/mentor-list/${mentor.id}`);
                            }}
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                  <p className="text-xl text-gray-600 mb-4">
                    No matching mentors found for your requirements.
                  </p>
                  <button
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
                    onClick={() => setIsFormSubmitted(false)}
                  >
                    Modify Requirements
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gray-50 w-full">
        {/* Back button container */}
        <div className="w-full px-6 py-4 bg-white border-b border-gray-200">
          <div className="max-w-[1440px] mx-auto">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <IoArrowBack size={20} />
              <span>Back</span>
            </button>
          </div>
        </div>

        <div className="w-full px-4 py-8 md:px-6 lg:px-8">
          <div className="max-w-[1440px] mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8">
                <h1 className="text-3xl font-bold">Business Profile</h1>
                <p className="mt-2 text-gray-300">
                  Step {currentStep + 1} of {formSections.length}
                </p>
              </div>

              {/* Form Content */}
              <div className="p-8">
                <h2 className="text-2xl font-semibold mb-8 text-gray-800">
                  {formSections[currentStep].title}
                </h2>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-6 max-w-4xl mx-auto"
                >
                  {formSections[currentStep].fields.map((field) => (
                    <div key={field.name} className="form-control w-full">
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        {field.label}
                      </label>
                      {field.type === "select" ? (
                        <select
                          id={field.name}
                          name={field.name}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-200 transition-all hover:bg-gray-100"
                          value={formData[field.name] || ""}
                          onChange={handleInputChange}
                        >
                          <option value="">Choose...</option>
                          {field.options.map((option) => (
                            <option
                              key={option}
                              value={option}
                              className="text-gray-900"
                            >
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : field.type === "checkbox" ? (
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                          {field.options.map((option) => (
                            <div
                              key={option}
                              className="flex items-center hover:bg-gray-100 p-2 rounded-md transition-all"
                            >
                              <input
                                type="checkbox"
                                id={option}
                                name={field.name}
                                value={option}
                                checked={mentorshipChallenges.includes(option)}
                                onChange={() => handleCheckboxChange(option)}
                                className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                              />
                              <label
                                htmlFor={option}
                                className="ml-3 text-sm text-gray-800 font-medium cursor-pointer select-none"
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <input
                          type="text"
                          id={field.name}
                          name={field.name}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-200 transition-all hover:bg-gray-100"
                          value={formData[field.name] || ""}
                          onChange={handleInputChange}
                        />
                      )}
                    </div>
                  ))}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    <button
                      type="button"
                      onClick={handlePrevious}
                      disabled={currentStep === 0}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                        currentStep === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <ChevronLeft size={20} />
                      Previous
                    </button>
                    {currentStep === formSections.length - 1 ? (
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
                      >
                        Submit
                        <ChevronRight size={20} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
                      >
                        Next
                        <ChevronRight size={20} />
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
};

export default Existbusform;
