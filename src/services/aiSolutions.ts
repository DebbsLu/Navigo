import { ProblemSolution } from '../data/ProblemData';

export const generateAISolutions = async (
  problem: string
): Promise<ProblemSolution[]> => {
  const url =
    'http://10.0.2.2:3000/api/generate-solutions';

  console.log('🤖 Enviando problema a IA...');
  console.log('📍 URL:', url);
  console.log('📝 Problema:', problem);

  try {
    const response = await fetch(url, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        problem,
      }),
    });

    console.log('📡 Respuesta recibida');
    console.log('📊 Status:', response.status);
    console.log('📊 OK:', response.ok);

    const responseText = await response.text();

    console.log('📦 Respuesta del servidor:');
    console.log(responseText);

    if (!response.ok) {
      throw new Error(
        `Servidor respondió ${response.status}: ${responseText}`
      );
    }

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        `El servidor no devolvió JSON válido: ${responseText}`
      );
    }

    console.log('🤖 Datos recibidos de IA:', data);

    if (!data.solutions) {
      throw new Error(
        'La respuesta del servidor no contiene "solutions".'
      );
    }

    return data.solutions;

  } catch (error) {
    console.error(
      '❌ Error completo generando soluciones con IA:',
      error
    );

    throw error;
  }
};