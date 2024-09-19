import axios from 'axios';

const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

export const generateIdeas = async (videoDetails) => {
  try {
    if (!apiKey) {
      console.error('API Key de OpenAI no encontrada');
      return { error: 'API Key de OpenAI no encontrada. Verifica tu archivo .env' };
    }

    const messages = [
      {
        role: 'system',
        content: 'Eres un asistente experto en generación de ideas para videos. Genera títulos, guiones breves (menos de 1 minuto de duración al leerlos) y hashtags basados únicamente en el contenido del video.'
      },
      {
        role: 'user',
        content: `Genera 2 ideas completas para videos cortos basadas en el contenido del video titulado: "${videoDetails.title}". Cada idea debe incluir un título atractivo, un guión breve (menos de 1 minuto de duración al leerlo) y hashtags recomendados, sin tener en cuenta los comentarios del video. Estructura cada idea con "Título:", "Guión:" y "Hashtags:" en líneas separadas.`
      }
    ];

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000
    });

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const rawContent = response.data.choices[0].message.content.trim();
      
      console.log('Contenido generado por OpenAI:', rawContent);

      const ideas = rawContent.split(/\n\s*\n/).map((ideaText) => {
        const lines = ideaText.split('\n').map(line => line.trim());
        
        const title = lines.find(line => line.startsWith('Título:'))?.replace('Título:', '').trim() || 'Sin título';
        const script = lines.find(line => line.startsWith('Guión:'))?.replace('Guión:', '').trim() || 'Sin guión';
        const hashtagsLine = lines.find(line => line.startsWith('Hashtags:'))?.replace('Hashtags:', '').trim() || '';
        const hashtags = hashtagsLine ? hashtagsLine.split(' ').filter(tag => tag.startsWith('#')) : [];

        return { title, script, hashtags };
      });

      console.log('Ideas procesadas:', ideas);
      return { success: true, ideas };
    } else {
      console.error('No se generaron ideas. Respuesta de OpenAI:', response.data);
      return { error: 'No se generaron ideas.' };
    }

  } catch (error) {
    if (error.response) {
      console.error('Error en la respuesta de la API:', error.response.data);
    } else if (error.request) {
      console.error('Error: No se recibió respuesta de la API', error.request);
    } else {
      console.error('Error en la solicitud:', error.message);
    }
    return { error: 'Hubo un problema generando ideas. Revisa la consola para más detalles.' };
  }
};