import React from "react";
import { toast } from "react-toastify";
import HomeLayout from "../../layouts/HomeLayout";

const FUNDING_SCHEMES = [
  {
    name: "MUDRA Loan Scheme",
    offeredBy: "Government of India",
    governingBody: "Small Industries Development Bank of India (SIDBI)",
    category: "Micro Enterprises",
    amount: "Up to ₹10 lakhs",
    eligibilityCriteria: [
      "Small business owners",
      "Entrepreneurs starting new business",
      "Manufacturing, trading, and service sector enterprises",
    ],
    requiredDocuments: [
      "Identity Proof",
      "Address Proof",
      "Business Plan",
      "Bank Statements",
      "KYC Documents",
    ],
    applicationLink: "https://www.mudra.org.in",
  },
  {
    name: "Credit Guarantee Fund Scheme",
    offeredBy: "Ministry of MSME",
    governingBody: "CGTMSE",
    category: "Small & Medium Enterprises",
    amount: "Up to ₹2 crores",
    eligibilityCriteria: [
      "New and existing MSMEs",
      "Both manufacturing and service enterprises",
      "Credit facility up to ₹2 crore",
    ],
    requiredDocuments: [
      "MSME Registration",
      "Business Profile",
      "Financial Statements",
      "Tax Returns",
      "Project Report",
    ],
    applicationLink: "https://www.cgtmse.in",
  },
  {
    name: "Stand-Up India Scheme",
    offeredBy: "Government of India",
    governingBody: "Small Industries Development Bank of India (SIDBI)",
    category: "SC/ST/Women Entrepreneurs",
    amount: "₹10 lakhs to ₹1 crore",
    eligibilityCriteria: [
      "SC/ST and/or women entrepreneurs",
      "Above 18 years of age",
      "New enterprise in manufacturing, services, or trading sector",
    ],
    requiredDocuments: [
      "Caste Certificate (for SC/ST)",
      "Identity & Address Proof",
      "Project Report",
      "Education Qualification Proof",
      "Bank Account Details",
    ],
    applicationLink: "https://www.standupmitra.in",
  },
];

function FundingSchemes() {
  return (
    <HomeLayout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-black mb-4">
              Business Funding Schemes
            </h1>
            <p className="text-lg text-black">
              Explore various government funding schemes for your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FUNDING_SCHEMES.map((scheme, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-black border-b pb-2">
                    {scheme.name}
                  </h2>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-black">
                        Offered By:
                      </span>
                      <span className="text-black">{scheme.offeredBy}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-black">
                        Governing Body:
                      </span>
                      <span className="text-black">{scheme.governingBody}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-black">
                        Category:
                      </span>
                      <span className="text-black">{scheme.category}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-black">Amount:</span>
                      <span className="text-black font-bold">
                        {scheme.amount}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className="font-semibold text-black mb-2">
                      Eligibility Criteria:
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-black">
                      {scheme.eligibilityCriteria.map((criteria, idx) => (
                        <li key={idx} className="text-sm">
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4">
                    <h3 className="font-semibold text-black mb-2">
                      Required Documents:
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-black">
                      {scheme.requiredDocuments.map((doc, idx) => (
                        <li key={idx} className="text-sm">
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href={scheme.applicationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-6 text-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Apply Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

export default FundingSchemes;
