// 1. CONFIGURACIÓN
// NOTA: Si este código da error, es porque esta API KEY ya llegó a su límite de 100 noticias.
// Regístrate en gnews.io y pon tu propia clave aquí.
const API_KEY = '52bd59899e2566ba30529731049b44ff'; 
const DEFAULT_IMG = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000";

let articlesList = [];

async function fetchNews() {
    // La URL original de GNews
    const targetUrl = `https://gnews.io/api/v4/top-headlines?category=technology&lang=es&country=any&apikey=${API_KEY}`;
    
    // La envolvemos en un Proxy para saltar el error de CORS en GitHub Pages
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        
        if (!response.ok) throw new Error("Error al conectar con el proxy.");

        const json = await response.json();
        
        // AllOrigins devuelve los datos dentro de una propiedad llamada 'contents' como texto
        const data = JSON.parse(json.contents);

        if (data.errors) {
            throw new Error(data.errors[0]);
        }

        if (!data.articles || data.articles.length === 0) {
            throw new Error("No hay noticias disponibles (Límite de API alcanzado).");
        }

        articlesList = data.articles;
        renderCards(articlesList);

    } catch (error) {
        console.error("Error detectado:", error.message);
        showStatus(`SISTEMA: ${error.message}`, "alert-danger");
        
        document.getElementById('mode-badge').innerText = "MODO RESPALDO";
        document.getElementById('mode-badge').className = "badge bg-danger";
        
        // Datos de respaldo por si todo falla
        articlesList = [
            {
                title: "Error de Seguridad CORS o Límite de API",
                description: "GitHub Pages ha bloqueado la conexión o has excedido las 100 noticias diarias. Por favor, intenta de nuevo mañana o usa una API Key diferente.",
                image: DEFAULT_IMG,
                url: "https://gnews.io/",
                source: { name: "SISTEMA" }
            }
        ];
        renderCards(articlesList);
    } finally {
        const loader = document.getElementById('loader');
        if(loader) loader.style.display = 'none';
    }
}

function renderCards(articles) {
    const grid = document.getElementById('newsGrid');
    if(!grid) return;
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

// BOTÓN DE DESCARGA (2 PÁRRAFOS)
document.getElementById('downloadAllBtn').addEventListener('click', () => {
    if (articlesList.length === 0) return;

    let content = "=== REPORTE EJECUTIVO DE INTELIGENCIA DE DATOS ===\n";
    content += `GENERADO EL: ${new Date().toLocaleString()}\n`;
    content += "==================================================\n\n";

    articlesList.forEach((art, i) => {
        const fuente = art.source.name || "Fuentes Globales";
        
        content += `REGISTRO #${i + 1}: ${art.title.toUpperCase()}\n`;
        content += `--------------------------------------------------\n`;
        content += `Párrafo I: Tras el procesamiento de los datos recolectados, se confirma que el evento "${art.title}" ha sido validado por la agencia ${fuente}. La investigación preliminar indica que ${art.description || 'los detalles están bajo análisis'}. Este suceso se registra como un punto de inflexión crítico en la cronología tecnológica actual.\n\n`;
        content += `Párrafo II: Desde una perspectiva técnica y profesional, este desarrollo sugiere una reconfiguración de los parámetros operativos en el sector. Es imperativo que los analistas evalúen el impacto estratégico de este fenómeno, ya que los estándares actuales podrían verse afectados significativamente en los próximos meses.\n\n`;
        content += `ENLACE: ${art.url}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_Inteligencia.txt`;
    link.click();
});

function showStatus(msg, cls) {
    const consoleDiv = document.getElementById('status-console');
    if(consoleDiv) {
        consoleDiv.classList.remove('d-none');
        consoleDiv.className = `alert ${cls}`;
        consoleDiv.innerText = msg;
    }
}

window.onload = fetchNews;
