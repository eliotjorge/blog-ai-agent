# blog-ai-agent

```
fetch("https://project-ci1v4.vercel.app/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: "¿Qué es sessionStorage?" }) }) .then(async res => { const text = await res.text(); console.log("STATUS:", res.status); console.log("RESPONSE:", text); console.log("Status JSON:", res.status); });
```
