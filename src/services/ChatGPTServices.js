import axios from 'axios';

const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

const generatePrompt = (videoDetails, topComments, isPremium) => {
  if (!videoDetails || !topComments) {
    throw new Error('Faltan detalles del video o comentarios');
  }

  return `
Genera una idea completa y detallada para un video corto viral de menos de 1 minuto basado en el siguiente video de YouTube:

Título: "${videoDetails.title || 'No disponible'}"
Descripción: "${videoDetails.description || 'No disponible'}"
Duración: ${videoDetails.duration || 'No disponible'} segundos
Vistas: ${videoDetails.viewCount || 'No disponible'}

Comentarios más relevantes:
${topComments.map(comment => `- "${comment.text}"`).join('\n')}

La idea DEBE incluir:
1. Un título atractivo y descriptivo (máximo 60 caracteres) que capture la esencia del contenido y tenga un alto potencial viral.
2. Un guión narrado detallado (${isPremium ? 'entre 200 y 250' : 'entre 150 y 200'} palabras) que se pueda leer directamente para crear el video. El guión debe estar estrechamente relacionado con el título y debe incluir:
   - Un gancho inicial impactante (5-10 segundos) que haga referencia directa al título
   - Desarrollo del contenido principal (40-45 segundos) que expanda y profundice en el concepto presentado en el título
   - Un cierre fuerte o llamada a la acción (5-10 segundos) que refuerce el mensaje del título
   - Instrucciones de entonación y pausas entre corchetes, por ejemplo: [pausa dramática], [tono emocionado], [susurro], etc.
3. ${isPremium ? '7' : '5'} hashtags relevantes y populares que se relacionen directamente con el título y el contenido del video.
4. ${isPremium ? '4-5' : '2-3'} sugerencias específicas para la producción del video (ángulos de cámara, efectos, música, etc.) que ayuden a reforzar el mensaje del título.
${isPremium ? '5. 2-3 ideas para contenido adicional relacionado que expandan el concepto presentado en el título principal.' : ''}

Formato requerido para la idea:
Título: [Título de la idea]
Guión Narrado:
[Guión detallado con instrucciones de narración]
Hashtags: [#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5 ${isPremium ? '#hashtag6 #hashtag7' : ''}]
Sugerencias de Producción:
- [Sugerencia 1]
- [Sugerencia 2]
- [Sugerencia 3]
${isPremium ? '- [Sugerencia 4]\n- [Sugerencia 5]' : ''}
${isPremium ? 'Ideas para Contenido Adicional:\n- [Idea 1]\n- [Idea 2]\n- [Idea 3]' : ''}

Asegúrate de que la idea sea única, creativa y tenga un alto potencial viral para plataformas de videos cortos. El título y el guión narrado deben estar estrechamente relacionados y ser coherentes entre sí. El guión debe ser fluido, atractivo y fácil de leer en voz alta. Incorpora elementos del video original y los comentarios más relevantes para crear una idea impactante y atractiva que se alinee perfectamente con el título propuesto.
${isPremium ? 'Como esta es una solicitud premium, asegúrate de proporcionar ideas más detalladas y de mayor calidad, manteniendo una fuerte conexión entre el título y el contenido.' : ''}
`;
};

const parseResponse = (rawContent, isPremium) => {
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

  // Verificar la coherencia entre el título y el guión
  const titleWords = titulo.toLowerCase().split(/\s+/);
  const scriptWords = guion.toLowerCase().split(/\s+/);
  const titleInScript = titleWords.every(word => scriptWords.includes(word));

  return {
    titulo,
    guion,
    hashtags,
    sugerenciasProduccion,
    ...(isPremium && { ideasAdicionales }),
    coherencia: titleInScript ? 'Alta' : 'Baja'
  };
};

export const generarIdea = async (videoDetails, topComments, isPremium = false) => {
  if (!apiKey) {
    throw new Error('API Key de OpenAI no encontrada. Verifica tu archivo .env');
  }

  try {
    const prompt = generatePrompt(videoDetails, topComments, isPremium);
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        { role: 'system', content: 'Eres un experto en creación de contenido viral para videos cortos y estrategias de marketing digital, con habilidades especiales en escritura de guiones narrados. Tu tarea es generar ideas donde el título y el contenido estén estrechamente relacionados y sean coherentes entre sí.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: isPremium ? 2500 : 2000,
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

    const idea = parseResponse(rawContent, isPremium);

    console.log('Idea procesada:', idea);

    // Si la coherencia es baja, intentamos regenerar la idea
    if (idea.coherencia === 'Baja') {
      console.log('Coherencia baja detectada. Intentando regenerar la idea...');
      return generarIdea(videoDetails, topComments, isPremium);
    }

    return { success: true, idea };

  } catch (error) {
    console.error('Error al generar la idea:', error);
    return { 
      success: false,
      error: error.message || 'No se pudo generar una idea para el video. Por favor, intenta de nuevo más tarde.',
      idea: null
    };
  }
};