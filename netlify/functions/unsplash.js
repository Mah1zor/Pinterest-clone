// Netlify Serverless Function (Node.js) - Fetches real photos from Unsplash API
export async function handler(event, context) {
  const queryParam = event.queryStringParameters.q || 'minimalist design';
  const categoryParam = event.queryStringParameters.category || 'all';
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    // If no access key is configured, return high-quality public image data as a fallback API
    console.log("No Unsplash API Key configured. Returning default seeded category response.");
    
    // We will generate a list of high-quality Unsplash image URLs based on the query,
    // so the app still functions using real Unsplash photos!
    const fallbacks = [
      {
        id: 'un-1',
        title: 'Minimalist Cozy Living Room',
        description: 'Scandi style interior with wooden chairs and plants.',
        image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&auto=format&fit=crop&q=80',
        category: 'Интерьер',
        creator: { username: 'scandi_home', name: 'Albin', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
        likes: 120,
        link: 'https://unsplash.com',
        date: new Date().toISOString().split('T')[0]
      },
      {
        id: 'un-2',
        title: 'Sunset over Amalfi Coast',
        description: 'Italian coastal village of Positano during golden hour.',
        image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&auto=format&fit=crop&q=80',
        category: 'Путешествия',
        creator: { username: 'traveler_italy', name: 'Lucas', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
        likes: 450,
        link: 'https://unsplash.com',
        date: new Date().toISOString().split('T')[0]
      },
      {
        id: 'un-3',
        title: 'Forest pathway in Autumn',
        description: 'Golden orange leaves covering the pathway in a deep forest.',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&auto=format&fit=crop&q=80',
        category: 'Природа',
        creator: { username: 'nature_eye', name: 'Sophia', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
        likes: 310,
        link: 'https://unsplash.com',
        date: new Date().toISOString().split('T')[0]
      },
      {
        id: 'un-4',
        title: 'Modern Architecture Facade',
        description: 'Abstract geometries of a concrete building against blue sky.',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
        category: 'Архитектура',
        creator: { username: 'arch_shot', name: 'Marc', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
        likes: 220,
        link: 'https://unsplash.com',
        date: new Date().toISOString().split('T')[0]
      },
      {
        id: 'un-5',
        title: 'Homemade Neapolitan Pizza',
        description: 'Wood fired pizza with basil, tomato sauce, and fresh mozzarella.',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
        category: 'Еда',
        creator: { username: 'chef_luigi', name: 'Luigi', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80' },
        likes: 830,
        link: 'https://unsplash.com',
        date: new Date().toISOString().split('T')[0]
      },
      {
        id: 'un-6',
        title: 'Liquid Acrylic Abstract Painting',
        description: 'Vibrant waves of purple, blue, and gold paint swirls.',
        image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80',
        category: 'Арт',
        creator: { username: 'art_creative', name: 'Elena', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80' },
        likes: 540,
        link: 'https://unsplash.com',
        date: new Date().toISOString().split('T')[0]
      }
    ];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(fallbacks)
    };
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(queryParam)}&per_page=15`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API responded with status ${response.status}`);
    }

    const data = await response.json();
    
    // Map Unsplash results to our standard pin format
    const pins = data.results.map((photo) => {
      let pinCategory = 'Арт'; // fallback category
      if (queryParam.includes('interior') || queryParam.includes('home') || queryParam.includes('гостиная')) pinCategory = 'Интерьер';
      else if (queryParam.includes('travel') || queryParam.includes('пляж') || queryParam.includes('горы')) pinCategory = 'Путешествия';
      else if (queryParam.includes('nature') || queryParam.includes('лес') || queryParam.includes('природа')) pinCategory = 'Природа';
      else if (queryParam.includes('arch') || queryParam.includes('архитектура') || queryParam.includes('здания')) pinCategory = 'Архитектура';
      else if (queryParam.includes('food') || queryParam.includes('пицца') || queryParam.includes('еда')) pinCategory = 'Еда';
      
      if (categoryParam !== 'all') {
        const catMapping = {
          'interior': 'Интерьер',
          'travel': 'Путешествия',
          'nature': 'Природа',
          'architecture': 'Архитектура',
          'food': 'Еда',
          'art': 'Арт'
        };
        pinCategory = catMapping[categoryParam] || categoryParam;
      }

      return {
        id: photo.id,
        title: photo.description || photo.alt_description || 'Вдохновение',
        description: photo.alt_description || `Фото от ${photo.user.name} на Unsplash`,
        image: photo.urls.regular,
        category: pinCategory,
        creator: {
          username: photo.user.username,
          name: photo.user.name,
          avatar: photo.user.profile_image.medium
        },
        likes: photo.likes || 0,
        likedByMe: false,
        link: photo.links.html,
        date: photo.created_at.split('T')[0],
        comments: []
      };
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(pins)
    };
  } catch (error) {
    console.error("Error fetching from Unsplash API:", error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
}
