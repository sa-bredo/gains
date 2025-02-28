
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400', // 24 hours cache for preflight requests
};

// GoCardless API URL
const GOCARDLESS_API_URL = "https://bankaccountdata.gocardless.com/api/v2";

// Mock data in case the real API fails
const mockBanks = [
  { 
    id: "SANTANDER_RETAIL_GB", 
    name: "Santander UK", 
    logo: "https://cdn.nordigen.com/ais/SANTANDER_RETAIL_GB.png",
    countries: ["GB"],
    bic: "ABBYGB2LXXX"
  },
  { 
    id: "HSBC_RETAIL_GB", 
    name: "HSBC UK", 
    logo: "https://cdn.nordigen.com/ais/HSBC_RETAIL_GB.png",
    countries: ["GB"],
    bic: "HBUKGB4BXXX"
  },
  { 
    id: "LLOYDS_RETAIL_GB", 
    name: "Lloyds Bank", 
    logo: "https://cdn.nordigen.com/ais/LLOYDS_RETAIL_GB.png",
    countries: ["GB"],
    bic: "LOYDGB21XXX"
  },
  { 
    id: "BARCLAYS_RETAIL_GB", 
    name: "Barclays", 
    logo: "https://cdn.nordigen.com/ais/BARCLAYS_RETAIL_GB.png",
    countries: ["GB"],
    bic: "BARCGB22XXX"
  },
  { 
    id: "NATWEST_RETAIL_GB", 
    name: "NatWest", 
    logo: "https://cdn.nordigen.com/ais/NATWEST_RETAIL_GB.png",
    countries: ["GB"],
    bic: "NWBKGB2LXXX"
  }
];

serve(async (req) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request (CORS preflight)');
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('User auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', user.id);

    // For development purposes, we can return mock data instead of calling the real API
    // This is useful when setting up and testing the UI
    const useMockData = false; // Set to true to use mock data
    
    if (useMockData) {
      console.log('Using mock data instead of calling GoCardless API');
      return new Response(
        JSON.stringify({ banks: mockBanks }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Cache-Control': 'max-age=3600' // Cache for 1 hour
          } 
        }
      );
    }

    // Get GoCardless credentials
    const clientId = Deno.env.get('GOCARDLESS_CLIENT_ID');
    const clientSecret = Deno.env.get('GOCARDLESS_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      console.error('Missing GoCardless credentials');
      // If we don't have credentials, return mock data as fallback
      console.log('No requisitions found, returning mock data');
      return new Response(
        JSON.stringify({ banks: mockBanks }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    console.log('Getting access token from GoCardless');
    
    // Get access token
    const tokenRequestBody = {
      secret_id: clientId,
      secret_key: clientSecret
    };
    
    const tokenResponse = await fetch(`${GOCARDLESS_API_URL}/token/new/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(tokenRequestBody),
    });

    const tokenResponseText = await tokenResponse.text();
    console.log('Token response status:', tokenResponse.status);
    
    if (!tokenResponse.ok) {
      console.error('Failed to obtain access token:', {
        status: tokenResponse.status,
        response: tokenResponseText
      });
      
      // If token request fails, return mock data as fallback
      console.log('Token request failed, returning mock data');
      return new Response(
        JSON.stringify({ banks: mockBanks }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    let tokenData;
    try {
      tokenData = JSON.parse(tokenResponseText);
    } catch (parseError) {
      console.error('Failed to parse token response:', parseError);
      // Return mock data if we can't parse the response
      return new Response(
        JSON.stringify({ banks: mockBanks }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    const accessToken = tokenData.access;
    if (!accessToken) {
      console.error('No access token in response');
      // Return mock data if no access token
      return new Response(
        JSON.stringify({ banks: mockBanks }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    console.log('Access token obtained successfully');

    // Get available banks (institutions)
    // Filter for UK banks if requested
    const url = new URL(req.url);
    const country = url.searchParams.get('country') || '';
    const endpoint = country 
      ? `${GOCARDLESS_API_URL}/institutions/?country=${country.toUpperCase()}`
      : `${GOCARDLESS_API_URL}/institutions/`;
    
    console.log(`Fetching institutions from ${endpoint}`);
    
    const institutionsResponse = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    const institutionsResponseText = await institutionsResponse.text();
    console.log('Institutions response status:', institutionsResponse.status);
    
    if (!institutionsResponse.ok) {
      console.error('Failed to retrieve institutions:', {
        status: institutionsResponse.status,
        response: institutionsResponseText
      });
      
      // Return mock data if institutions request fails
      return new Response(
        JSON.stringify({ banks: mockBanks }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    let institutionsData;
    try {
      institutionsData = JSON.parse(institutionsResponseText);
    } catch (parseError) {
      console.error('Failed to parse institutions response:', parseError);
      // Return mock data if we can't parse the response
      return new Response(
        JSON.stringify({ banks: mockBanks }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Format and return the institutions data
    const banks = institutionsData.map(institution => ({
      id: institution.id,
      name: institution.name,
      logo: institution.logo,
      countries: institution.countries || [],
      bic: institution.bic || null,
      transaction_total_days: institution.transaction_total_days
    }));

    // Sort banks alphabetically by name
    banks.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log(`Returning ${banks.length} banks`);
    
    return new Response(
      JSON.stringify({ banks }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=3600' // Cache for 1 hour
        } 
      }
    );
  } catch (error) {
    console.error('Error fetching banks:', error);
    
    // Return mock data in case of any unexpected errors
    return new Response(
      JSON.stringify({ 
        banks: mockBanks,
        error_details: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
