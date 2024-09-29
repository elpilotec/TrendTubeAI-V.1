import axios from 'axios';
import { VideoDetails, TopComment, GeneratedIdea } from '../types';

const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

const generatePrompt = (videoDetails: VideoDetails, topComments: TopComment[], isPremium: boolean): string => {
  if (!videoDetails || !topComments) {
    throw new Error('Faltan detalles del video o comentarios');
  }

  const commentSummary = topComments
    .map(comment => comment.text)
    .join(' ')
    .slice(0, 500);

  return `
Genera una idea innovadora y viral para un video corto de menos de 1 minuto basado en este video de YouTube:

Título: "${videoDetails.title || 'No disponible'}"
Descripción: "${videoDetails.description?.slice(0, 200) || 'No disponible'}"
Duración: ${videoDetails.duration || 'No disponible'} segundos
Vistas: ${videoDetails.viewCount || 'No disponible'}

Resumen de comentarios relevantes: "${commentSummary}"

La idea DEBE incluir:
1. Un título atractivo y descriptivo (máximo 60 caracteres) que capture la esencia del video original pero con un giro único.
2. Un guión narrado detallado (${isPremium ? '200-250' : '150-200'} palabras) estructurado así:
   - Gancho inicial impactante (5-10 segundos)
   - Desarrollo del contenido principal (40-45 segundos)
   - Cierre fuerte o llamada a la acción (5-10 segundos)
   - Incluye [instrucciones de entonación] y [pausas] entre corchetes
3. ${isPremium ? '7' : '5'} hashtags relevantes y populares.
4. ${isPremium ? '4-5' : '2-3'} sugerencias específicas para la producción del video.
${isPremium ? '5. 2-3 ideas para contenido adicional relacionado.' : ''}

Asegúrate de que la idea sea única, creativa y tenga un alto potencial viral. El guión debe ser fluido y atractivo, incorporando elementos del video original y los comentarios más relevantes.
${isPremium ? 'Como solicitud premium, proporciona ideas más detalladas y de mayor calidad.' : ''}

Formato requerido:
Título: [Título de la idea]
Guión Narrado:
[Guión detallado con instrucciones de narración]
Hashtags: [hashtags]
Sugerencias de Producción:
- [Sugerencias]
${isPremium ? 'Ideas para Contenido Adicional:\n- [Ideas]' : ''}
`;
};

const parseResponse = (rawContent: string, isPremium: boolean): GeneratedIdea => {
  const titulo = rawContent.match(/Título:\s*(.+)/)?.[1]?.trim() || 'Título no disponible';
  const guion = rawContent.match(/Guión Narrado:\s*(.+?)(?=\nHashtags:)/s)?.[1]?.trim() || 'Guión no disponible';
  const hashtags = rawContent.match(/Hashtags:\s*(.+)/)?.[1]?.split(/\s+/).filter(Boolean) || [];
  
  const sugerenciasMatch = rawContent.match(/Sugerencias de Producción:\s*([\s\S]+?)(?=\n(?:Ideas para Contenido Adicional:|$))/);
  const sugerenciasProduccion = sugerenciasMatch
    ? sugerenciasMatch[1].trim().split('\n').map(item => item.trim().replace(/^-\s*/, ''))
    : [];

  const ideasAdicionales = isPremium
    ? (rawContent.match(/Ideas para Contenido Adicional:\s*([\s\S]+)$/)?.[1]?.trim().split('\n').map(item => item.trim().replace(/^-\s*/, '')) || [])
    : [];

  return {
    titulo,
    guion,
    hashtags,
    sugerenciasProduccion,
    ...(isPremium && { ideasAdicionales })
  };
};

export const generarIdea = async (videoDetails: VideoDetails, topComments: TopComment[], isPremium = false): Promise<{ success: boolean; idea?: GeneratedIdea; error?: string }> => {
  if (!apiKey) {
    throw new Error('API Key de OpenAI no encontrada. Verifica tu archivo .env');
  }

  try {
    const prompt = generatePrompt(videoDetails, topComments, isPremium);
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        { role: 'system', content: 'Eres un experto en creación de contenido viral para videos cortos y estrategias de marketing digital, con habilidades especiales en escritura de guiones narrados y adaptación creativa de contenido existente.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: isPremium ? 2500 : 2000,
      temperature: 0.8,
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

    const idea = parseResponse(rawContent, isPremium);

    console.log('Idea procesada:', idea);
    return { success: true, idea };

  } catch (error) {
    console.error('Error al generar la idea:', error);
    return { 
      success: false,
      error: error.message || 'No se pudo generar una idea para el video. Por favor, intenta de nuevo más tarde.',
    };
  }
};