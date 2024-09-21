import axios from 'axios';

const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

const generatePrompt = (videoTitle) => `
Genera una idea completa y detallada para un video corto viral de menos de 1 minuto basado en el siguiente título: "${videoTitle}".
La idea DEBE incluir:
1. Un título atractivo y descriptivo (máximo 60 caracteres).
2. Un guión detallado (entre 100 y 150 palabras) que incluya:
   - Un gancho inicial impactante (5 segundos)
   - Desarrollo del contenido principal (40-45 segundos)
   - Un cierre fuerte o llamada a la acción (5-10 segundos)
3. 5 hashtags relevantes y populares.
4. 2-3 sugerencias específicas para la producción del video (ángulos de cámara, efectos, música, etc.).

Formato requerido para la idea:
Título: [Título de la idea]
Guión: [Guión detallado]
Hashtags: [#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5]
Sugerencias de Producción: [Lista de 2-3 sugerencias específicas para la producción]

Asegúrate de que la idea sea única, creativa y tenga un alto potencial viral para plataformas de videos cortos.
`;

const parseResponse = (rawContent) => {
  const titulo = rawContent.match(/Título:\s*(.+)/)?.[1]?.trim();
  const guion = rawContent.match(/Guión:\s*(.+?)(?=\n\w+:)/s)?.[1]?.trim();
  const hashtags = rawContent.match(/Hashtags:\s*(.+)/)?.[1]?.split(/\s+/) || [];
  const sugerenciasProduccion = rawContent.match(/Sugerencias de Producción:\s*(.+)/s)?.[1]?.trim().split('\n').map(item => item.trim());

  return {
    titulo,
    guion,
    hashtags,
    sugerenciasProduccion
  };
};

export const generarIdeaCorta = async (videoDetails) => {
  if (!apiKey) {
    throw new Error('API Key de OpenAI no encontrada. Verifica tu archivo .env');
  }

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        { role: 'system', content: 'Eres un experto en creación de contenido viral para videos cortos y estrategias de marketing digital.' },
        { role: 'user', content: generatePrompt(videoDetails.title) }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000
    });

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Respuesta de OpenAI inválida o vacía');
    }

    const rawContent = response.data.choices[0].message.content.trim();
    console.log('Contenido generado por OpenAI:', rawContent);

    const ideaCorta = parseResponse(rawContent);

    console.log('Idea corta procesada:', ideaCorta);
    return { success: true, idea: ideaCorta };

  } catch (error) {
    console.error('Error al generar la idea corta:', error);
    return { 
      error: 'No se pudo generar una idea para video corto. Por favor, intenta de nuevo más tarde.',
      idea: null
    };
  }
};