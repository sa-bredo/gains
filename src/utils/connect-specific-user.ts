
import { supabase } from "@/integrations/supabase/client";
import { connectUserToCompany } from "@/pages/SignUp";

// The specific user and company IDs from the request
const CLERK_USER_ID = "4657d8fd-fa55-47f9-9070-a06957c86f0a";
const COMPANY_ID = "6727231e-e9bd-459d-9117-b3ff2a3a7192";

// Function to execute the connection
async function connectSpecificUserToCompany() {
  console.log(`Connecting user ${CLERK_USER_ID} to company ${COMPANY_ID}...`);
  
  const result = await connectUserToCompany(CLERK_USER_ID, COMPANY_ID);
  
  if (result.success) {
    console.log("Successfully connected user to company!");
  } else {
    console.error("Failed to connect user to company:", result.error);
  }
}

// Execute the function
connectSpecificUserToCompany();

// To run this script, open the browser console and execute:
// import('./utils/connect-specific-user.ts').then(module => console.log('Script loaded'));
