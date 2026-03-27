// =========================
// 1. IMPORTS (herramientas)
// =========================

// Para leer archivos del sistema (tu JSON local)
import fs from "fs";
import path from "path";

// SDK de Gemini (IA de Google)
import { GoogleGenerativeAI } from "@google/generative-ai";


// =========================
// 2. CONFIGURACIÓN IA
// =========================

// Aquí creas la conexión con la IA usando tu API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// =========================
// 3. HANDLER (tu API)
// =========================

// Esta función se ejecuta cada vez que haces:
// POST /api/chat
export default async function handler(req, res) {

  try {

    // =========================
    // 4. LEER INPUT DEL USUARIO
    // =========================

    // Vercel a veces manda body como string, otras como objeto
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    // Extraemos la pregunta
    const { question } = body || {};

    // Si no hay pregunta → error controlado
    if (!question) {
      return res.status(400).json({ error: "No question provided" });
    }


    // =========================
    // 5. CARGAR DATOS (tu blog)
    // =========================

    // Ruta al JSON con tus posts
    const filePath = path.join(process.cwd(), "data", "search.json");

    // Leer archivo
    const fileContent = fs.readFileSync(filePath, "utf-8");

    // Convertir a objeto JS
    const posts = JSON.parse(fileContent);


    // =========================
    // 6. BÚSQUEDA (tu "motor")
    // =========================

    // Buscas posts que contengan la pregunta
    const results = posts
      .filter((post) =>
        post.content.toLowerCase().includes(question.toLowerCase())
      )
      .slice(0, 3); // solo los 3 mejores

    console.log("Resultados encontrados:", results.length);


    // =========================
    // 7. CONTROL (MUY IMPORTANTE)
    // =========================

    // Si NO hay resultados → NO usamos IA
    if (results.length === 0) {
      return res.status(200).json({
        answer: "No tengo información sobre eso en el blog."
      });
    }


    // =========================
    // 8. CREAR CONTEXTO (RAG)
    // =========================

    // Aquí construyes lo que la IA va a leer
    const context = results
      .map((p) => `
        Título: ${p.title}
        Contenido: ${p.content}
        URL: ${p.url}
      `)
      .join("\n\n");


    // =========================
    // 9. CREAR MODELO IA
    // =========================

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
    });


    // =========================
    // 10. PROMPT (CEREBRO DEL AGENTE)
    // =========================

    const result = await model.generateContent(`
      Eres un asistente que responde usando SOLO el contenido proporcionado.

      REGLAS:
      - Responde de forma clara y útil
      - Incluye SIEMPRE la URL del post si existe
      - NO uses información externa
      - Si la respuesta no está clara en el contexto, dilo

      Pregunta:
      ${question}

      Contexto:
      ${context}
    `);


    // =========================
    // 11. RESPUESTA DE LA IA
    // =========================

    const text = result.response.text();


    // =========================
    // 12. RESPUESTA AL USUARIO
    // =========================

    res.status(200).json({ answer: text });

  } catch (error) {

    // =========================
    // 13. MANEJO DE ERRORES
    // =========================

    console.error("ERROR:", error);

    res.status(500).json({ error: error.message });
  }
}