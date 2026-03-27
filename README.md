# blog-ai-agent

```
fetch("https://project-ci1v4.vercel.app/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: "¿Qué es sessionStorage?" }) }) .then(async res => { const text = await res.text(); console.log("STATUS:", res.status); console.log("RESPONSE:", text) });
```

---

# 🧠 Cómo entenderlo SIN perderte

Piensa en esto como un flujo:

```text
Usuario pregunta
      ↓
Lees pregunta
      ↓
Buscas en tu blog
      ↓
¿Hay resultados?
   ↓         ↓
 NO          SÍ
 ↓           ↓
respondes    llamas a IA
directo      ↓
             IA usa contexto
             ↓
        devuelves respuesta
```

---

# 💡 Respuesta a tu duda clave

> “hay una estructura de control fuera del agente”

👉 EXACTO, y esto es lo importante:

### ❌ La IA NO decide cuándo responder

### ✅ TÚ decides cuándo llamar a la IA

---

# 🧠 Dónde está cada cosa (resumen ultra claro)

| Parte                  | Qué hace         |
| ---------------------- | ---------------- |
| imports                | herramientas     |
| genAI                  | conexión con IA  |
| handler                | tu API           |
| body                   | entrada usuario  |
| posts                  | tu base de datos |
| results                | búsqueda         |
| if(results.length===0) | control lógico   |
| context                | lo que ve la IA  |
| generateContent        | llamada a IA     |
| res.json               | respuesta final  |

---

# 🔥 Lo importante que has hecho (de verdad)

Sin darte cuenta has construido:

👉 un **RAG (Retrieval Augmented Generation)**

* Retrieval → buscas en JSON
* Augmented → pasas contexto
* Generation → IA responde