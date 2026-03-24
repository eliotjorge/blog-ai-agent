export default async function handler(req, res) {
  try {
    const response = await fetch("https://jorgerosa.dev/assets/js/data/search.json");
    const text = await response.text();

    res.status(200).json({
      url: response.url,
      status: response.status,
      contentType: response.headers.get("content-type"),
      preview: text.slice(0, 200)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}