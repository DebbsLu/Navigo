import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// =======================================================
// GEMINI
// =======================================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// =======================================================
// MODELOS
// =======================================================

const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODEL = 'gemini-3.5-flash-lite';

// =======================================================
// GENERAR SOLUCIONES CON REINTENTOS Y FALLBACK
// =======================================================

const generateWithRetry = async (
  prompt,
  maxAttempts = 3
) => {

  const models = [
    PRIMARY_MODEL,
    FALLBACK_MODEL,
  ];

  let lastError;

  // =====================================================
  // PROBAR CADA MODELO
  // =====================================================

  for (const model of models) {

    console.log('');
    console.log(
      `🔵 Usando modelo: ${model}`
    );

    // ===================================================
    // REINTENTOS DEL MODELO ACTUAL
    // ===================================================

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt++
    ) {

      try {

        console.log(
          `🤖 Intento ${attempt}/${maxAttempts} con ${model}...`
        );

        const response =
          await ai.models.generateContent({

            model,

            contents: prompt,

            config: {

              responseMimeType:
                'application/json',

              responseSchema: {

                type: 'object',

                properties: {

                  solutions: {

                    type: 'array',

                    minItems: 4,

                    maxItems: 4,

                    items: {

                      type: 'object',

                      properties: {

                        title: {
                          type: 'string',
                        },

                        description: {
                          type: 'string',
                        },

                      },

                      required: [
                        'title',
                        'description',
                      ],

                    },

                  },

                },

                required: [
                  'solutions',
                ],

              },

            },

          });

        console.log(
          `✅ ${model} respondió correctamente.`
        );

        return response;

      } catch (error) {

        lastError = error;

        console.error(
          `❌ Error en intento ${attempt}/${maxAttempts} con ${model}:`,
          error
        );

        const status =
          error?.status;

        // ===============================================
        // ERROR TEMPORAL
        // ===============================================

        if (
          status === 503 ||
          status === 429
        ) {

          if (
            attempt < maxAttempts
          ) {

            const waitTime =
              attempt * 2000;

            console.log(
              `⏳ ${model} está temporalmente ocupado.`
            );

            console.log(
              `⏳ Esperando ${waitTime} ms antes de reintentar...`
            );

            await new Promise(
              resolve =>
                setTimeout(
                  resolve,
                  waitTime
                )
            );

          }

        } else {

          // =============================================
          // ERROR NO TEMPORAL
          // =============================================

          console.log(
            `🛑 El error con ${model} no parece temporal.`
          );

          console.log(
            '🛑 No se reintentará este modelo.'
          );

          break;

        }

      }

    }

    // ===================================================
    // SI LLEGAMOS AQUÍ, EL MODELO FALLÓ
    // ===================================================

    if (
      model === PRIMARY_MODEL
    ) {

      console.log('');
      console.log(
        `⚠️ ${PRIMARY_MODEL} no pudo responder.`
      );

      console.log(
        `🔄 Cambiando al modelo de respaldo: ${FALLBACK_MODEL}`
      );

    }

  }

  // =====================================================
  // NINGÚN MODELO FUNCIONÓ
  // =====================================================

  throw lastError;
};

// =======================================================
// ENDPOINT: GENERAR SOLUCIONES
// =======================================================

app.post(
  '/api/generate-solutions',
  async (req, res) => {

    try {

      const {
        problem
      } = req.body;

      // =================================================
      // VALIDAR PROBLEMA
      // =================================================

      if (
        !problem ||
        typeof problem !== 'string'
      ) {

        return res
          .status(400)
          .json({

            error:
              'El problema es obligatorio.',

          });

      }

      console.log('');

      console.log(
        '========================================'
      );

      console.log(
        '🧠 NUEVA SOLICITUD DE SOLUCIONES'
      );

      console.log(
        '========================================'
      );

      console.log(
        '📝 Problema:',
        problem
      );

      // =================================================
      // PROMPT
      // =================================================

      const prompt = `
Eres el asistente de ejecución de Navigo.

El usuario está intentando avanzar en una tarea o proyecto,
pero ha identificado un problema que lo está frenando.

Problema del usuario:
"${problem}"

Genera exactamente 4 soluciones diferentes.

Las soluciones deben:

- Ser concretas.
- Ser accionables.
- Ayudar al usuario a avanzar.
- Evitar consejos genéricos como "organízate mejor".
- Evitar explicaciones largas.
- Cada solución debe representar una estrategia diferente.
- El título debe ser corto.
- La descripción debe explicar qué debe hacer el usuario.

No intentes resolver todo el proyecto.
Tu objetivo es ayudar al usuario a dar el siguiente paso.
`;

      // =================================================
      // LLAMAR A GEMINI
      // =================================================

      const response =
        await generateWithRetry(
          prompt
        );

      // =================================================
      // LEER RESPUESTA
      // =================================================

      const responseText =
        response.text;

      console.log(
        '📦 Respuesta de Gemini:'
      );

      console.log(
        responseText
      );

      if (
        !responseText
      ) {

        throw new Error(
          'Gemini devolvió una respuesta vacía.'
        );

      }

      // =================================================
      // PARSEAR JSON
      // =================================================

      let data;

      try {

        data =
          JSON.parse(
            responseText
          );

      } catch (parseError) {

        console.error(
          '❌ Gemini no devolvió JSON válido:'
        );

        console.error(
          responseText
        );

        throw new Error(
          'Gemini no devolvió un JSON válido.'
        );

      }

      // =================================================
      // VALIDAR SOLUCIONES
      // =================================================

      if (
        !data.solutions ||
        !Array.isArray(
          data.solutions
        )
      ) {

        throw new Error(
          'La respuesta de Gemini no contiene un arreglo de soluciones.'
        );

      }

      if (
        data.solutions.length < 4
      ) {

        throw new Error(
          `Gemini devolvió ${data.solutions.length} soluciones en lugar de 4.`
        );

      }

      // =================================================
      // TOMAR EXACTAMENTE 4
      // =================================================

      const solutions =
        data.solutions
          .slice(0, 4)
          .map(
            (
              solution,
              index
            ) => ({

              id:
                `ai_solution_${Date.now()}_${index}`,

              title:
                solution.title,

              description:
                solution.description,

            })
          );

      console.log(
        `✅ ${solutions.length} soluciones generadas correctamente.`
      );

      console.log(
        '========================================'
      );

      console.log('');

      // =================================================
      // RESPUESTA AL FRONTEND
      // =================================================

      return res.json({
        solutions,
      });

    } catch (error) {

      console.error('');

      console.error(
        '========================================'
      );

      console.error(
        '❌ ERROR GENERANDO SOLUCIONES'
      );

      console.error(
        '========================================'
      );

      console.error(
        error
      );

      const status =
        error?.status || 500;

      return res
        .status(status)
        .json({

          error:
            'No se pudieron generar las soluciones.',

          details:
            error?.message ||
            'Error desconocido.',

        });

    }

  }
);

// =======================================================
// SERVIDOR
// =======================================================

const PORT = 3000;

app.listen(
  PORT,
  () => {

    console.log(
      `🚀 Servidor de IA ejecutándose en http://localhost:${PORT}`
    );

  }
);
