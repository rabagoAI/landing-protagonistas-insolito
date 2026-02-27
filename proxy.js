export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Falta el parámetro url' });
  }

  // Solo permitimos dominios de iVoox y WordPress del podcast
  const allowed = [
    'feeds.ivoox.com',
    'www.ivoox.com',
    'static-1.ivoox.com',
    'static-2.ivoox.com',
    'protagonistasdeloinsolito.com',
  ];

  const hostname = new URL(url).hostname;
  if (!allowed.some(d => hostname.endsWith(d))) {
    return res.status(403).json({ error: 'Dominio no permitido' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PodcastProxy/1.0)',
      },
    });

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = await response.arrayBuffer();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate'); // cache 5 min
    res.setHeader('Content-Type', contentType);
    res.status(response.status).send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el recurso', detail: err.message });
  }
}
