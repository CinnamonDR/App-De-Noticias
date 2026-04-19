// CONFIGURACIÓN GNEWS
const API_KEY = '52bd59899e2566ba30529731049b44ff'; 
const DEFAULT_IMG = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000";

let articlesList = [];

async function fetchNews() {
    const url = `https://gnews.io/api/v4/top-headlines?category=technology&lang=es&country=any&apikey=${API_KEY}`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors ? errorData.errors[0] : "Error en la API");
        }

        const data = await response.json();

        if (!data.articles || data.articles.length === 0) {
            throw new Error("La API no devolvió noticias en este momento.");
        }

        articlesList = data.articles;
        renderCards(articlesList);
        console.log("Noticias cargadas:", articlesList);

    } catch (error) {
        console.error("Error detallado:", error);
        showStatus(`ERROR: ${error.message}. Usando datos de respaldo.`, "alert-danger");
        
        document.getElementById('mode-badge').innerText = "MODO RESPALDO";
        document.getElementById('mode-badge').className = "badge bg-warning";
        
        articlesList = [
            {
                title: "Error de Conexión con el Satélite",
                description: "No se pudieron obtener noticias en vivo. Por favor, verifica tu API Key de GNews o tu conexión a internet.",
                image: DEFAULT_IMG,
                url: "#",
                source: { name: "SISTEMA" }
            }
        ];
        renderCards(articlesList);
    } finally {
        document.getElementById('loader').style.display = 'none';
    }
}

function renderCards(articles) {
    const grid = document.getElementById('newsGrid');
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
                        <p class="card-text">${art.description || 'Sin descripción disponible...'}</p>
                        <small class="text-warning">FUENTE: ${art.source.name}</small>
                    </div>
                </a>
            </div>
        `;
        grid.appendChild(cardCol);
    });
}

// ============================================================
// BLOQUE DE DESCARGA REDACTADO EN 2 PÁRRAFOS
// ============================================================
document.getElementById('downloadAllBtn').addEventListener('click', () => {
    if (articlesList.length === 0) return;

    let content = "=== REPORTE EJECUTIVO DE INTELIGENCIA DE DATOS ===\n";
    content += `GENERADO EL: ${new Date().toLocaleString()}\n`;
    content += "==================================================\n\n";

    articlesList.forEach((art, i) => {
        const fuente = art.source.name || "Fuentes Globales";
        const titulo = art.title.toUpperCase();
        const resumen = art.description || "los detalles técnicos están siendo procesados por el sistema";

        content += `REGISTRO #${i + 1}: ${titulo}\n`;
        content += `--------------------------------------------------\n`;
        
        // Párrafo 1: Análisis del Hecho
        content += `Párrafo I: Tras el procesamiento de los datos recolectados, se confirma que el evento "${art.title}" ha sido validado por la agencia ${fuente}. La investigación preliminar indica que ${resumen}. Este suceso se registra como un punto de inflexión crítico en la cronología tecnológica actual, impactando directamente en los flujos de información analizados por nuestra terminal.\n\n`;
        
        // Párrafo 2: Proyección y Riesgo
        content += `Párrafo II: Desde una perspectiva técnica y profesional, este desarrollo sugiere una reconfiguración de los parámetros operativos en el sector. Es imperativo que los analistas evalúen el impacto estratégico de este fenómeno, ya que la escalabilidad de la noticia indica que los estándares actuales podrían verse afectados significativamente, redefiniendo las tendencias de seguridad y rendimiento en los próximos meses.\n\n`;
        
        content += `ENLACE DE REFERENCIA: ${art.url}\n`;
        content += `ESTADO: ARCHIVADO\n`;
        content += `\n\n`;
    });

    content += "=== FIN DEL REPORTE - SISTEMA PUB_API ===";

    // Crear el archivo y descargar
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_Inteligencia_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
});
// ============================================================

function showStatus(msg, cls) {
    const consoleDiv = document.getElementById('status-console');
    if(consoleDiv) {
        consoleDiv.classList.remove('d-none');
        consoleDiv.className = `alert ${cls}`;
        consoleDiv.innerText = msg;
    }
}

window.onload = fetchNews;
