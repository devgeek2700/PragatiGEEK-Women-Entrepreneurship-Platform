import React, { useState } from "react";
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
    } else {
      // Filter mentors based on selected challenges
      const suggestedMentors = MentorData.filter((mentor) =>
        mentorshipChallenges.includes(mentor.expertise)
      );
      setMentors(suggestedMentors);
    }
  };

  const handleCheckboxChange = (option) => {
    setMentorshipChallenges((prev) =>
      prev.includes(option)
        ? prev.filter((challenge) => challenge !== option)
        : [...prev, option]
    );
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Perform any additional form submission logic if needed
    window.location.href = "/mentor-home/exist-business-form/mentor-list";
  };

  return (
    <HomeLayout>
      <div className="min-h-screen flex flex-col">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-md text-gray-600 hover:text-gray-800 transition-colors"
        >
          <IoArrowBack size={20} />
          <span>Back</span>
        </button>

        <div className="flex-grow flex justify-center items-center">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="bg-indigo-600 py-6 px-8">
              <h1 className="text-3xl font-bold text-white">
                Business Profile
              </h1>
              <p className="text-indigo-200 mt-2">
                Step {currentStep + 1} of {formSections.length}
              </p>
            </div>
            <form className="p-8 space-y-8" onSubmit={handleSubmit}>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                {formSections[currentStep].title}
              </h2>
              <div className="space-y-6">
                {formSections[currentStep].fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-medium text-gray-700"
                    >
                      {field.label}
                    </label>
                    {field.type === "select" ? (
                      <select
                        id={field.name}
                        name={field.name}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                      >
                        <option value="">Choose...</option>
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "checkbox" ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-4">
                        {field.options.map((option) => (
                          <div key={option} className="flex items-center">
                            <input
                              type="checkbox"
                              id={option}
                              name={field.name}
                              value={option}
                              checked={mentorshipChallenges.includes(option)}
                              onChange={() => handleCheckboxChange(option)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded bg-white"
                            />
                            <label
                              htmlFor={option}
                              className="ml-3 block text-sm text-gray-700"
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-black"
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {currentStep === formSections.length - 1 ? "Submit" : "Next"}
                  <ChevronRight className="h-5 w-5 ml-2" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Render suggested mentors if currentStep is the last step */}
        {currentStep === formSections.length - 1 && mentors.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Suggested Mentors:</h2>
            {mentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        )}
      </div>
    </HomeLayout>
  );
};

export default Existbusform;
