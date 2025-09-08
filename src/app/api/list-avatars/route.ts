export async function GET() {
  try {
    console.log('🎭 Fetching available avatars...');
    
    const response = await fetch('https://api.heygen.com/v1/streaming/avatar.list', {
      method: 'GET',
      headers: {
        'X-API-Key': process.env.HEYGEN_API_KEY!,
        'Content-Type': 'application/json',
      },
    });

    console.log('HeyGen Avatar List Response:', { 
      status: response.status, 
      statusText: response.statusText, 
      ok: response.ok 
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Avatar list fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        response: errorText
      });
      throw new Error(`Failed to fetch avatars: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Avatars fetched successfully:', data);
    
    return Response.json(data);
  } catch (error) {
    console.error('❌ Error fetching avatars:', error);
    return Response.json(
      { error: 'Failed to fetch avatars' },
      { status: 500 }
    );
  }
}