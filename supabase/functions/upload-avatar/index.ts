
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get content-type
    const contentType = req.headers.get('content-type') || '';
    
    // Ensure proper content-type with boundary
    if (!contentType.includes('multipart/form-data') || !contentType.includes('boundary=')) {
      console.error('Invalid content type', contentType);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid content type', 
          details: 'Content-Type must be multipart/form-data with a boundary' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      )
    }

    const formData = await req.formData()
    const file = formData.get('avatar')
    const employeeId = formData.get('employeeId')

    if (!file || !employeeId) {
      return new Response(
        JSON.stringify({ error: 'Missing file or employee ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Sanitize filename and generate a unique path
    const fileName = file.name.replace(/[^\x00-\x7F]/g, '')
    const fileExt = fileName.split('.').pop()
    const filePath = `${employeeId}/${crypto.randomUUID()}.${fileExt}`

    // Upload to storage
    const { data, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: 'Failed to upload avatar', details: uploadError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const avatarUrl = publicUrlData.publicUrl

    // Update employee record with avatar URL
    const { error: updateError } = await supabase
      .from('employees')
      .update({ avatar_url: avatarUrl })
      .eq('id', employeeId)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update employee record', details: updateError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        message: 'Avatar uploaded successfully', 
        avatarUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error in upload-avatar function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
