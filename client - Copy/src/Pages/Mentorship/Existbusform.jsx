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
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      businessChallenges: mentorshipChallenges
    };

    console.log("Submitting form with challenges:", mentorshipChallenges);
    
    // Use sample mentor data if no challenges selected or no matches found
    let suggestedMentors = [];
    
    if (mentorshipChallenges.length > 0) {
      // Filter mentors based on selected challenges
      suggestedMentors = MentorData.filter((mentor) => {
        // Debug logging for filtering
        console.log(`Checking mentor ${mentor.name}, expertise: ${mentor.expertise}`);
        return mentorshipChallenges.some(challenge => {
          const match = mentor.expertise.includes(challenge);
          console.log(`  - Challenge "${challenge}": ${match ? 'match' : 'no match'}`);
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
        <div className="min-h-screen bg-base-200 p-4">
          <button
            onClick={() => setIsFormSubmitted(false)}
            className="btn btn-ghost gap-2 mb-4"
          >
            <IoArrowBack size={20} />
            Back to Form
          </button>

          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Suggested Mentors</h2>
            {mentors && mentors.length > 0 ? (
              <div className="grid gap-6">
                {mentors.map((mentor) => (
                  <div key={mentor.id} className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                      <h3 className="card-title">{mentor.name}</h3>
                      <p className="text-gray-600">{mentor.expertise}</p>
                      <p>{mentor.description}</p>
                      <div className="card-actions justify-end mt-4">
                        <button 
                          className="btn btn-primary"
                          onClick={() => {
                            console.log(`Navigating to mentor details: /mentor-list/${mentor.id}`);
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
              <div className="text-center py-8">
                <p className="text-xl text-gray-600">No matching mentors found for your requirements.</p>
                <button 
                  className="btn btn-primary mt-4"
                  onClick={() => setIsFormSubmitted(false)}
                >
                  Modify Requirements
                </button>
              </div>
            )}
          </div>
        </div>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout>
      <div className="min-h-screen bg-base-200 p-4">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="btn btn-ghost gap-2 mb-4"
        >
          <IoArrowBack size={20} />
          Back
        </button>

        <div className="max-w-md mx-auto">
          <div className="card bg-base-100 shadow-xl">
            {/* Header */}
            <div className="bg-primary text-primary-content p-6 rounded-t-xl">
              <h1 className="text-2xl font-bold">Business Profile</h1>
              <p className="opacity-90 mt-1">
                Step {currentStep + 1} of {formSections.length}
              </p>
            </div>

            {/* Form Content */}
            <div className="card-body p-6">
              <h2 className="text-xl font-semibold mb-6">
                {formSections[currentStep].title}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {formSections[currentStep].fields.map((field) => (
                  <div key={field.name} className="form-control w-full">
                    <label className="label">
                      <span className="label-text">{field.label}</span>
                    </label>
                    {field.type === "select" ? (
                      <select
                        id={field.name}
                        name={field.name}
                        className="select select-bordered w-full"
                        value={formData[field.name] || ""}
                        onChange={handleInputChange}
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
                          <div key={option} className="form-control">
                            <label className="label cursor-pointer justify-start gap-3">
                              <input
                                type="checkbox"
                                id={option}
                                name={field.name}
                                value={option}
                                checked={mentorshipChallenges.includes(option)}
                                onChange={() => handleCheckboxChange(option)}
                                className="checkbox checkbox-primary"
                              />
                              <span className="label-text">{option}</span>
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
                        className="input input-bordered w-full"
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
                    className={`btn gap-2 ${
                      currentStep === 0 ? "btn-disabled" : "btn-neutral"
                    }`}
                  >
                    <ChevronLeft size={20} />
                    Previous
                  </button>
                  {currentStep === formSections.length - 1 ? (
                    <button
                      type="submit"
                      className="btn btn-primary gap-2"
                    >
                      Submit
                      <ChevronRight size={20} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn btn-primary gap-2"
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
    </HomeLayout>
  );
};

export default Existbusform;
