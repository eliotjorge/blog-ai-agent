import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  try {
    const { question } = req.body;

    // 🔽 Cargar tu JSON
    const response = await fetch("https://jorgerosa.dev/assets/js/data/search.json");
    const posts = await response.json();

    // 🔍 Búsqueda básica
    const results = posts
      .filter(post =>
        post.content.toLowerCase().includes(question.toLowerCase())
      )
      .slice(0, 3);

    const context = results.map(p => `
Título: ${p.title}
Contenido: ${p.content}
URL: ${p.url}
    `).join("\n\n");

    // 🤖 Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const prompt = `
Eres un asistente que responde SOLO con información del blog.

Si no encuentras información suficiente, dilo claramente.

Pregunta:
${question}

Contexto:
${context}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.status(200).json({
      answer: text
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
