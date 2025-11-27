export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Get API Key from server-side environment variables
  const apiKey = process.env.VITE_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server Configuration Error: API Key missing' });
  }

  try {
    const { contents, config, model } = req.body;
    const targetModel = model || 'gemini-2.5-flash';
    
    // Call Google Gemini REST API directly from Vercel Server
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        contents, 
        generationConfig: config 
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
       console.error('Gemini API Error:', data);
       return res.status(response.status).json(data);
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error("Proxy Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}