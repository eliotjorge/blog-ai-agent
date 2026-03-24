import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const { question } = req.body;

    // 🔽 Cargar tu JSON (desde tu web)
    const response = await fetch("https://TUWEB.com/assets/js/data/search.json");
    const posts = await response.json();

    // 🔍 Búsqueda simple (luego mejoramos esto)
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

    // 🤖 LLM
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "Eres un asistente que responde usando solo el contenido del blog."
        },
        {
          role: "user",
          content: `
Pregunta: ${question}

Contexto:
${context}
          `
        }
      ]
    });

    res.status(200).json({
      answer: completion.choices[0].message.content
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
