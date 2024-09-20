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
        content: 'Eres un experto en crear guiones concisos y atractivos para videos cortos (como YouTube Shorts o TikTok). Tu tarea es generar guiones que sean fáciles de leer y usar para crear videos de 15 a 60 segundos.'
      },
      {
        role: 'user',
        content: `Genera 2 ideas para videos cortos basadas en el video titulado: "${videoDetails.title}". 
        Para cada idea, proporciona:
        1. Un título atractivo y conciso (máximo 8 palabras).
        2. Un guion breve y directo (máximo 50 palabras) estructurado en 3-4 puntos clave. Cada punto debe ser una frase corta, directa y accionable, ideal para un video corto.
        3. 3-4 hashtags relevantes y populares.
        
        Estructura cada idea de la siguiente manera:
        Título: [Título generado]
        Guion:
        • [Punto clave 1 - máximo 15 palabras]
        • [Punto clave 2 - máximo 15 palabras]
        • [Punto clave 3 - máximo 15 palabras]
        • [Punto clave 4 (opcional) - máximo 15 palabras]
        Hashtags: [Lista de hashtags]
        
        Asegúrate de que cada punto del guion sea conciso, impactante y fácil de visualizar en un video corto.`
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
        const scriptLines = lines.filter(line => line.startsWith('•')).map(line => line.replace('•', '').trim());
        const script = scriptLines.join('\n');
        const hashtagsLine = lines.find(line => line.startsWith('Hashtags:'))?.replace('Hashtags:', '').trim() || '';
        const hashtags = hashtagsLine.split(' ').filter(tag => tag.startsWith('#'));

        return { title, script, hashtags };
      });

      console.log('Ideas procesadas:', ideas);
      return { success: true, ideas };
    } else {
      throw new Error('No se generaron ideas. Respuesta de OpenAI vacía o inválida.');
    }

  } catch (error) {
    console.error('Error en generateIdeas:', error);
    let errorMessage = 'Hubo un problema generando ideas. ';

    if (error.response) {
      console.error('Error en la respuesta de la API:', error.response.data);
      errorMessage += 'Error en la respuesta de la API.';
    } else if (error.request) {
      console.error('Error: No se recibió respuesta de la API', error.request);
      errorMessage += 'No se recibió respuesta de la API.';
    } else {
      console.error('Error en la solicitud:', error.message);
      errorMessage += error.message;
    }

    return { error: errorMessage };
  }
};

export default function Component() {
  return null;
}