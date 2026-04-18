// CONFIGURACIÓN
const API_KEY = '87623152b5624905832acc47a3a2d252';
const DEFAULT_IMG = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000";

let articlesList = [];

// DATOS DE RESPALDO (Por si NewsAPI bloquea la conexión local)
const backupArticles = [
    {
        title: "Nueva Arquitectura de Microchips Cuánticos",
        description: "Se ha desarrollado una oblea de silicio capaz de procesar algoritmos complejos a temperatura ambiente.",
        urlToImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500",
        url: "https://google.com",
        source: { name: "Tech Intel" }
    },
    {
        title: "Avance en Propulsión Iónica",
        description: "La nueva sonda espacial utiliza energía solar para generar un empuje constante hacia el cinturón de asteroides.",
        urlToImage: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=500",
        url: "https://google.com",
        source: { name: "Deep Space" }
    }
];

async function fetchNews() {
    const targetUrl = `https://newsapi.org/v2/everything?q=tecnologia&language=es&pageSize=10&apiKey=${API_KEY}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        const json = await response.json();
        const data = JSON.parse(json.contents);

        if (data.status === "error" || !data.articles) throw new Error(data.message);

        articlesList = data.articles;
        renderCards(articlesList);
    } catch (error) {
        console.warn("API Error, usando Backup Mode:", error.message);
        showStatus("MODO SIMULACIÓN ACTIVADO (Error de Conexión API)", "alert-danger");
        document.getElementById('mode-badge').innerText = "SIMULACIÓN";
        document.getElementById('mode-badge').className = "badge bg-danger";
        
        articlesList = backupArticles;
        renderCards(articlesList);
    } finally {
        document.getElementById('loader').style.display = 'none';
    }
}

function renderCards(articles) {
    const grid = document.getElementById('newsGrid');
    grid.innerHTML = '';

    articles.forEach((art, index) => {
        const cardCol = document.createElement('div');
        cardCol.className = 'col-md-6 col-lg-4';
        
        cardCol.innerHTML = `
            <div class="card news-card">
                <!-- La imagen y el cuerpo redirigen a la noticia -->
                <a href="${art.url}" target="_blank" class="card-link">
                    <img src="${art.urlToImage || DEFAULT_IMG}" class="card-img-top" onerror="this.src='${DEFAULT_IMG}'">
                    <div class="card-body">
                        <h5 class="card-title">${art.title}</h5>
                        <p class="card-text">${art.description || 'Analizando detalles técnicos del evento...'}</p>
                        <small class="text-warning">FUENTE: ${art.source.name}</small>
                    </div>
                </a>
            </div>
        `;
        grid.appendChild(cardCol);
    });
}

// FUNCIÓN PARA GENERAR EL TXT PROFESIONAL
document.getElementById('downloadAllBtn').addEventListener('click', () => {
    if (articlesList.length === 0) return;

    let content = "=== REPORTE EJECUTIVO DE INTELIGENCIA DE DATOS ===\n";
    content += `GENERADO EL: ${new Date().toLocaleString()}\n`;
    content += "==================================================\n\n";

    articlesList.forEach((art, i) => {
        content += `REGISTRO #${i + 1}: ${art.title.toUpperCase()}\n`;
        content += `--------------------------------------------------\n`;
        
        // Párrafo 1: El Hecho
        content += `Párrafo I: El análisis de la información recibida confirma que el evento "${art.title}" ha marcado un hito en la categoría de tecnología. De acuerdo con el reporte emitido por ${art.source.name}, se ha observado que ${art.description || 'los datos están siendo procesados'}. Este suceso se integra en la matriz de tendencias globales como un punto de inflexión estratégico.\n\n`;
        
        // Párrafo 2: La Proyección
        content += `Párrafo II: Desde una perspectiva técnica y profesional, este desarrollo sugiere una reconfiguración de los parámetros operativos en el sector. Es imperativo que los analistas y tomadores de decisiones evalúen el impacto a largo plazo de este fenómeno, ya que la escalabilidad de la noticia indica que los estándares actuales de seguridad y rendimiento podrían verse afectados significativamente en los próximos meses.\n\n`;
        
        content += `ENLACE DE REFERENCIA: ${art.url}\n\n\n`;
    });

    content += "=== FIN DEL REPORTE - SISTEMA PUB_API ===";

    // Descarga
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_Inteligencia_${Date.now()}.txt`;
    link.click();
});

function showStatus(msg, cls) {
    const console = document.getElementById('status-console');
    console.classList.remove('d-none');
    console.classList.add(cls);
    console.innerText = msg;
}

// Iniciar
window.onload = fetchNews;