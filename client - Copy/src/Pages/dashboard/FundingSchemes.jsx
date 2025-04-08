import React from 'react';
import { toast } from 'react-toastify';
import HomeLayout from '../../layouts/HomeLayout';

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
      "Manufacturing, trading, and service sector enterprises"
    ],
    requiredDocuments: [
      "Identity Proof",
      "Address Proof",
      "Business Plan",
      "Bank Statements",
      "KYC Documents"
    ],
    applicationLink: "https://www.mudra.org.in"
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
      "Credit facility up to ₹2 crore"
    ],
    requiredDocuments: [
      "MSME Registration",
      "Business Profile",
      "Financial Statements",
      "Tax Returns",
      "Project Report"
    ],
    applicationLink: "https://www.cgtmse.in"
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
      "New enterprise in manufacturing, services, or trading sector"
    ],
    requiredDocuments: [
      "Caste Certificate (for SC/ST)",
      "Identity & Address Proof",
      "Project Report",
      "Education Qualification Proof",
      "Bank Account Details"
    ],
    applicationLink: "https://www.standupmitra.in"
  }
];

function FundingSchemes() {
  return (
    <HomeLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Business Funding Schemes</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FUNDING_SCHEMES.map((scheme, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-3 text-blue-600">{scheme.name}</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Offered By:</span> {scheme.offeredBy}</p>
                <p><span className="font-medium">Governing Body:</span> {scheme.governingBody}</p>
                <p><span className="font-medium">Category:</span> {scheme.category}</p>
                <p><span className="font-medium">Amount:</span> {scheme.amount}</p>
                
                <div>
                  <p className="font-medium mb-1">Eligibility Criteria:</p>
                  <ul className="list-disc list-inside pl-2 text-sm">
                    {scheme.eligibilityCriteria.map((criteria, idx) => (
                      <li key={idx}>{criteria}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <p className="font-medium mb-1">Required Documents:</p>
                  <ul className="list-disc list-inside pl-2 text-sm">
                    {scheme.requiredDocuments.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>
                
                <a 
                  href={scheme.applicationLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block mt-4 text-center bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Apply Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </HomeLayout>
  );
}

export default FundingSchemes; 