// CONFIGURACIÓN: GNEWS API (NOTICIAS EN ESPAÑOL)
const API_KEY = '52bd59899e2566ba30529731049b44ff'; 
const DEFAULT_IMG = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000";

let articlesList = [];

async function fetchNews() {
    // Parámetros: Tecnología, Idioma Español, País cualquiera
    const targetUrl = `https://gnews.io/api/v4/top-headlines?category=technology&lang=es&country=any&apikey=${API_KEY}`;
    
    // Usamos corsproxy.io que es el más rápido para evitar el bloqueo de GitHub Pages
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        
        if (!response.ok) throw new Error("Límite de API alcanzado o error de servidor.");

        const data = await response.json();

        if (!data.articles || data.articles.length === 0) {
            throw new Error("No hay noticias disponibles en este momento.");
        }

        articlesList = data.articles;
        renderCards(articlesList);
        console.log("DATOS RECIBIDOS EN ESPAÑOL");

    } catch (error) {
        console.error("Error:", error.message);
        showStatus(`SISTEMA: ${error.message}`, "alert-danger");
        
        document.getElementById('mode-badge').innerText = "MODO RESPALDO";
        document.getElementById('mode-badge').className = "badge bg-danger";
        
        // Datos de respaldo si la API falla
        articlesList = [{
            title: "Error de Sincronización",
            description: "No se pudieron obtener noticias en vivo. Es posible que el límite diario de la API se haya agotado.",
            image: DEFAULT_IMG,
            url: "#",
            source: { name: "CENTRAL_PUB_API" }
        }];
        renderCards(articlesList);
    } finally {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
    }
}

function renderCards(articles) {
    const grid = document.getElementById('newsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    articles.forEach((art) => {
        const cardCol = document.createElement('div');
        cardCol.className = 'col-md-6 col-lg-4';
        const imgUrl = art.image || art.urlToImage || DEFAULT_IMG;

        cardCol.innerHTML = `
            <div class="card news-card">
                <a href="${art.url}" target="_blank" class="card-link">
                    <img src="${imgUrl}" class="card-img-top" onerror="this.src='${DEFAULT_IMG}'">
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

// ============================================================
// SISTEMA DE REDACCIÓN PROFESIONAL (2 PÁRRAFOS)
// ============================================================
document.getElementById('downloadAllBtn').addEventListener('click', () => {
    if (articlesList.length === 0) return;

    let content = "=== REPORTE EJECUTIVO DE INTELIGENCIA DE DATOS (ES) ===\n";
    content += `GENERADO EL: ${new Date().toLocaleString()}\n`;
    content += "======================================================\n\n";

    articlesList.forEach((art, i) => {
        const fuente = art.source.name || "Fuentes Globales";
        const resumen = art.description || "los detalles técnicos están bajo análisis de campo por la central";

        content += `REGISTRO #${i + 1}: ${art.title.toUpperCase()}\n`;
        content += `------------------------------------------------------\n`;
        
        // Párrafo 1: Análisis del Hecho
        content += `Párrafo I: Tras el procesamiento de los datos recolectados, se confirma que el evento "${art.title}" ha sido validado por la agencia ${fuente}. La investigación preliminar indica que ${resumen}. Este suceso se registra como un punto de inflexión crítico en la cronología tecnológica actual, impactando directamente en los flujos de información analizados por nuestra terminal.\n\n`;
        
        // Párrafo 2: Proyección y Riesgo
        content += `Párrafo II: Desde una perspectiva técnica y profesional, este desarrollo sugiere una reconfiguración de los parámetros operativos en el sector. Es imperativo que los analistas evalúen el impacto estratégico de este fenómeno, ya que la escalabilidad de la noticia indica que los estándares actuales podrían verse afectados significativamente en los próximos meses.\n\n`;
        
        content += `ENLACE DE REFERENCIA: ${art.url}\n`;
        content += `ESTADO: DATOS ARCHIVADOS\n`;
        content += `\n\n`;
    });

    content += "=== FIN DEL REPORTE - SISTEMA PUB_API ===";

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_PUB_API_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
});

function showStatus(msg, cls) {
    const consoleDiv = document.getElementById('status-console');
    if (consoleDiv) {
        consoleDiv.classList.remove('d-none');
        consoleDiv.className = `alert ${cls}`;
        consoleDiv.innerText = msg;
    }
}

window.onload = fetchNews;
