import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// =========================
// 🧹 LIMPIAR PREGUNTA
// =========================
function limpiarPregunta(texto) {
  return texto
    .toLowerCase()
    .replace(/[¿?.,]/g, "")
    .replace(/\b(que|qué|es|como|cómo|de|la|el|los|las|un|una|para|y)\b/g, "")
    .trim();
}

export default async function handler(req, res) {
  try {
    // =========================
    // 📩 INPUT USUARIO
    // =========================
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const { question } = body || {};

    if (!question) {
      return res.status(400).json({ error: "No question provided" });
    }

    console.log("Pregunta original:", question);

    // =========================
    // 📚 CARGAR POSTS
    // =========================
    const filePath = path.join(process.cwd(), "data", "search.json");
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const posts = JSON.parse(fileContent);

    // =========================
    // 🧠 PREPROCESADO PREGUNTA
    // =========================
    const cleanQuestion = limpiarPregunta(question);
    const palabras = cleanQuestion.split(" ").filter(Boolean);

    console.log("Pregunta limpia:", cleanQuestion);
    console.log("Palabras clave:", palabras);

    // =========================
    // 🔍 BÚSQUEDA CON SCORING
    // =========================
    const results = posts
      .map(post => {
        const content = post.content.toLowerCase();

        const score = palabras.reduce((acc, palabra) => {
          return acc + (content.includes(palabra) ? 1 : 0);
        }, 0);

        return { post, score };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(r => r.post);

    console.log("Resultados encontrados:", results.length);

    // =========================
    // 🚫 SI NO HAY RESULTADOS
    // =========================
    if (results.length === 0) {
      return res.status(200).json({
        answer: "No he encontrado información sobre eso en el blog. Prueba con otras palabras clave."
      });
    }

    // =========================
    // 🧩 CREAR CONTEXTO
    // =========================
    const context = results
      .map((p) => `
[TÍTULO]: ${p.title}
[URL]: ${p.url}
[CONTENIDO]: ${p.content}
`)
      .join("\n\n");

    // =========================
    // 🤖 MODELO IA
    // =========================
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
    });

    // =========================
    // 🧠 PROMPT (BIBLIOTECARIO)
    // =========================
    const result = await model.generateContent(`
Eres un asistente que actúa como bibliotecario de un blog técnico.

OBJETIVO:
- Responder de forma clara y breve
- Ayudar a encontrar contenido del blog

REGLAS:
- Usa SOLO la información del contexto
- NO inventes información
- Responde en máximo 5-6 líneas
- Después añade una sección:

"📚 Puedes ampliar en estos posts:"

- Lista las URLs proporcionadas
- NO repitas contenido innecesario

Pregunta:
${question}

Contexto:
${context}
`);

    // =========================
    // 📤 RESPUESTA FINAL
    // =========================
    const text = result.response.text();

    res.status(200).json({ answer: text });

  } catch (error) {
    console.error("ERROR:", error);

    res.status(500).json({ error: error.message });
  }
}