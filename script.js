// 1. NUEVA CONFIGURACIÓN (Si falla, regístrate en gnews.io para obtener una nueva)
const API_KEY = '53416b9b3986915004f165e3b5e43b1c'; 
const DEFAULT_IMG = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000";

let articlesList = [];

async function fetchNews() {
    // Intentamos primero con un proxy diferente (CORSProxy.io)
    const targetUrl = `https://gnews.io/api/v4/top-headlines?category=technology&lang=es&country=any&apikey=${API_KEY}`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            if (response.status === 403) throw new Error("Límite de API agotado o bloqueado.");
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();

        if (!data.articles || data.articles.length === 0) {
            throw new Error("La API no devolvió artículos.");
        }

        articlesList = data.articles;
        renderCards(articlesList);
        console.log("Noticias sincronizadas correctamente.");

    } catch (error) {
        console.error("Error detallado:", error);
        showStatus(`SISTEMA: ${error.message}`, "alert-danger");
        
        document.getElementById('mode-badge').innerText = "MODO RESPALDO";
        document.getElementById('mode-badge').className = "badge bg-danger";
        
        // DATOS DE RESPALDO (Esto aparecerá si la API falla)
        articlesList = [
            {
                title: "Inestabilidad en el Enlace Satelital",
                description: "Se ha detectado un bloqueo de seguridad o exceso de peticiones en la cuenta de GNews. El sistema entrará en modo de datos históricos hasta que se restablezca la conexión.",
                image: DEFAULT_IMG,
                url: "https://gnews.io/",
                source: { name: "CENTRAL_PUB_API" }
            }
        ];
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
                        <p class="card-text">${art.description || 'Analizando detalles técnicos...'}</p>
                        <small class="text-warning">FUENTE: ${art.source.name}</small>
                    </div>
                </a>
            </div>
        `;
        grid.appendChild(cardCol);
    });
}

// REDACCIÓN DE 2 PÁRRAFOS PARA EL REPORTE
document.getElementById('downloadAllBtn').addEventListener('click', () => {
    if (articlesList.length === 0) return;

    let content = "=== REPORTE EJECUTIVO DE INTELIGENCIA DE DATOS ===\n";
    content += `GENERADO EL: ${new Date().toLocaleString()}\n`;
    content += "==================================================\n\n";

    articlesList.forEach((art, i) => {
        const fuente = art.source.name || "Fuentes Globales";
        const desc = art.description || "los detalles técnicos están bajo análisis de campo";

        content += `REGISTRO #${i + 1}: ${art.title.toUpperCase()}\n`;
        content += `--------------------------------------------------\n`;
        content += `Párrafo I: Tras el procesamiento de los datos recolectados, se confirma que el evento "${art.title}" ha sido validado por la agencia ${fuente}. La investigación preliminar indica que ${desc}. Este suceso se registra como un punto de inflexión crítico en la cronología tecnológica actual.\n\n`;
        content += `Párrafo II: Desde una perspectiva técnica y profesional, este desarrollo sugiere una reconfiguración de los parámetros operativos en el sector. Es imperativo que los analistas evalúen el impacto estratégico de este fenómeno, ya que la escalabilidad indica que los estándares actuales podrían verse afectados significativamente.\n\n`;
        content += `ENLACE: ${art.url}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_PUB_API.txt`;
    link.click();
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
