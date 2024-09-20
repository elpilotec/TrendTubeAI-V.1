import axios from 'axios';

const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

const generatePrompt = (videoTitle) => `
Genera 2 ideas completas para videos cortos basadas en el siguiente título de video: "${videoTitle}".
Cada idea DEBE incluir:
1. Un título atractivo y descriptivo (mínimo 10 caracteres).
2. Un guión breve pero detallado (entre 50 y 100 palabras).
3. Al menos 3 hashtags relevantes.

Formato requerido para cada idea:
Título: [Título de la idea]
Guión: [Guión de la idea]
Hashtags: [#hashtag1 #hashtag2 #hashtag3]

Asegúrate de que cada idea sea única, creativa y esté completamente desarrollada.
`;

export const generateIdeas = async (videoDetails) => {
  let retries = 3;
  while (retries > 0) {
    try {
      if (!apiKey) {
        throw new Error('API Key de OpenAI no encontrada. Verifica tu archivo .env');
      }

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-3.5-turbo",
        messages: [
          { role: 'system', content: 'Eres un experto en generación de ideas para videos virales.' },
          { role: 'user', content: generatePrompt(videoDetails.title) }
        ],
        max_tokens: 1500,
        temperature: 0.8,
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000
      });

      if (!response.data || !response.data.choices || response.data.choices.length === 0) {
        throw new Error('Respuesta de OpenAI inválida o vacía');
      }

      const rawContent = response.data.choices[0].message.content.trim();
      console.log('Contenido generado por OpenAI:', rawContent);

      const ideas = rawContent.split(/\n\s*\n/).map((ideaText, index) => {
        const title = ideaText.match(/Título:\s*(.+)/)?.[1]?.trim();
        const script = ideaText.match(/Guión:\s*(.+)/s)?.[1]?.trim();
        const hashtags = ideaText.match(/Hashtags:\s*(.+)/)?.[1]?.split(/\s+/) || [];

        if (!title || title.length < 10) {
          throw new Error(`Idea ${index + 1}: Título inválido o demasiado corto`);
        }
        if (!script || script.split(' ').length < 50) {
          throw new Error(`Idea ${index + 1}: Guión inválido o demasiado corto`);
        }
        if (hashtags.length < 3) {
          throw new Error(`Idea ${index + 1}: Se requieren al menos 3 hashtags`);
        }

        return { title, script, hashtags };
      });

      if (ideas.length < 2) {
        throw new Error('Se generaron menos de 2 ideas válidas');
      }

      console.log('Ideas procesadas:', ideas);
      return { success: true, ideas };

    } catch (error) {
      console.error(`Intento ${4 - retries} fallido:`, error);
      retries--;
      if (retries === 0) {
        return { 
          error: 'No se pudieron generar ideas después de varios intentos. Por favor, intenta de nuevo más tarde.',
          ideas: [] 
        };
      }
    }
  }
};