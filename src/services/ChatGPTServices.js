import axios from 'axios';

// Obtener la clave API de OpenAI desde las variables de entorno
const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

// Función para generar ideas usando GPT-3.5-Turbo
export const generateIdeas = async (comments) => {
  try {
    // Verificar si la API Key está disponible
    if (!apiKey) {
      console.error('API Key de OpenAI no encontrada');
      return { error: 'API Key de OpenAI no encontrada. Verifica tu archivo .env' };
    }

    // Crear el mensaje que será enviado al modelo
    const messages = [
      {
        role: 'system',
        content: 'Eres un asistente experto en generación de títulos de ideas para videos de YouTube, basados en los comentarios proporcionados.'
      },
      {
        role: 'user',
        content: `Genera 5 títulos de ideas para videos de YouTube basadas en estos comentarios: \n${comments.map(c => c.text).join('\n')}`
      }
    ];

    console.log('Enviando solicitud a OpenAI con el siguiente mensaje:', messages);

    // Hacer la solicitud a la API de OpenAI utilizando gpt-3.5-turbo
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 150, // Reducimos los tokens para ahorrar
      temperature: 0.7,
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    // Verificar si la respuesta tiene ideas generadas
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const ideas = response.data.choices[0].message.content.trim().split('\n').filter(idea => idea); // Convertir el texto en una lista de ideas
      return { success: true, ideas: ideas }; // Devolver las ideas en un objeto
    } else {
      console.error('No se generaron ideas. Respuesta de OpenAI:', response.data);
      return { error: 'No se generaron ideas.' };
    }

  } catch (error) {
    console.error('Error al generar ideas:', error.response ? error.response.data : error.message);
    return { error: 'Hubo un problema generando ideas.' };
  }
};
