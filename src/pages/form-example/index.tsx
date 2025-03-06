
import React from "react";
import { Button } from "@/components/ui/button";
import { StyledRadioButton } from "@/pages/forms/components/styled-radio-button";

export default function FormExample() {
  return (
    <div className="min-h-screen w-full">
      {/* Top Navigation */}
      <header className="bg-white py-4 px-8 flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-2xl font-bold text-[#1A2C55]">B3</div>
          <span className="text-xs ml-2 mt-auto">LPR</span>
        </div>
        <nav className="hidden md:flex space-x-8">
          <a href="#" className="text-gray-700 hover:text-gray-900">Home</a>
          <a href="#" className="text-gray-700 hover:text-gray-900">Services</a>
          <a href="#" className="text-gray-700 hover:text-gray-900">Blog</a>
          <a href="#" className="text-gray-700 hover:text-gray-900">About Us</a>
          <a href="#" className="text-gray-700 hover:text-gray-900">Contact Us</a>
        </nav>
        <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded-full">
          Log in
        </button>
      </header>

      {/* Main Content - Two Column Layout */}
      <div className="flex flex-col md:flex-row w-full">
        {/* Left Column - Image with CTA */}
        <div className="md:w-1/2 relative overflow-hidden">
          <div className="h-full min-h-[600px] max-h-[800px]">
            <img
              src="https://images.squarespace-cdn.com/content/v1/66dfede09053481feac2a1aa/0abe5d7d-14f7-478f-9e30-7671976f644f/Screenshot+2024-09-22+at+11.03.17.png?format=2500w"
              alt="Studio Anatomy"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute bottom-16 left-12 text-white">
              <h1 className="text-5xl font-bold leading-tight">
                Join the Studio<br />
                Anatomy Family
              </h1>
            </div>
          </div>
        </div>

        {/* Right Column - Survey Form */}
        <div className="md:w-1/2 bg-[#d3e4fd]/30 p-12 flex items-center">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                1. Which of the following best describes your reason for pursuing US permanent residency?
              </h2>
              
              <div className="space-y-3">
                <div className="block">
                  <StyledRadioButton
                    id="employment"
                    label="Employment opportunities"
                    checked={true}
                    onChange={() => {}}
                  />
                </div>
                
                <div className="block">
                  <StyledRadioButton
                    id="family"
                    label="Family reunification"
                    checked={false}
                    onChange={() => {}}
                  />
                </div>
                
                <div className="block">
                  <StyledRadioButton
                    id="education"
                    label="Education opportunities"
                    checked={false}
                    onChange={() => {}}
                  />
                </div>
                
                <div className="block">
                  <StyledRadioButton
                    id="other"
                    label="Other"
                    checked={false}
                    onChange={() => {}}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-6">
              <Button 
                className="w-full bg-[#1A2C55] hover:bg-[#0f1a33] text-white py-6 rounded-lg"
              >
                Next
              </Button>
              
              <a href="#" className="text-gray-500 hover:text-gray-700">
                Skip Survey
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
