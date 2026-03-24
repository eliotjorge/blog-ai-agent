import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { question } = body || {};

    if (!question) {
      return res.status(400).json({ error: "No question provided" });
    }

    const filePath = path.join(process.cwd(), "data", "search.json");
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const posts = JSON.parse(fileContent);



    const results = posts
      .filter((post) =>
        post.content.toLowerCase().includes(question.toLowerCase()),
      )
      .slice(0, 3);

    console.log("Resultados encontrados:", results.length);

    // 🔥 AQUÍ VA EL CONTROL
    if (results.length === 0) {
      return res.status(200).json({
        answer: "No tengo información sobre eso en el blog."
      });
    }

    // 👇 SOLO SI HAY RESULTADOS llamas a Gemini
    const context = results
      .map(
        (p) => `
        Título: ${p.title}
        Contenido: ${p.content}
        URL: ${p.url}
      `,
        )
      .join("\n\n");

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
    });

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

    const text = result.response.text();

    res.status(200).json({ answer: text });
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ error: error.message });
  }
}
