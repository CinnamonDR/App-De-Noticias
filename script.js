// CONFIGURACIÓN NEWSDATA.IO
const API_KEY = 'pub_99ec69909bba4c20a033bc6d161abe71';
const DEFAULT_IMG = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000";

let articlesList = [];

async function fetchNews() {
    // Hemos quitado "q=tecnologia" para que no sea tan restrictivo y nos devuelva siempre 10 noticias
    // Ahora busca simplemente: Categoría Tecnología + Idioma Español
    const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&language=es&category=technology`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error de comunicación: ${response.status}`);
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            throw new Error("No se encontraron registros en la base de datos.");
        }

        // Guardamos los resultados (NewsData suele dar 10 por página)
        articlesList = data.results.slice(0, 10);
        
        renderCards(articlesList);
        console.log(`Sincronización exitosa: ${articlesList.length} nodos cargados.`);

    } catch (error) {
        console.error("Error:", error.message);
        showStatus(`SISTEMA: ${error.message}`, "alert-danger");
        
        document.getElementById('mode-badge').innerText = "MODO RESPALDO";
        document.getElementById('mode-badge').className = "badge bg-danger";
        
        // Backup por si la API falla
        articlesList = [{
            title: "Fallo de enlace con NewsData",
            description: "No se pudieron obtener los registros en vivo. Es posible que los créditos de la API se hayan agotado.",
            image_url: DEFAULT_IMG,
            link: "#",
            source_id: "SISTEMA_PUB"
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
    grid.innerHTML = ''; // Limpiamos el grid antes de añadir las 10

    articles.forEach((art) => {
        const cardCol = document.createElement('div');
        cardCol.className = 'col-md-6 col-lg-4';
        
        const imgUrl = art.image_url || DEFAULT_IMG;

        cardCol.innerHTML = `
            <div class="card news-card">
                <a href="${art.link}" target="_blank" class="card-link">
                    <img src="${imgUrl}" class="card-img-top" onerror="this.src='${DEFAULT_IMG}'">
                    <div class="card-body">
                        <h5 class="card-title">${art.title}</h5>
                        <p class="card-text">${art.description ? art.description.substring(0, 100) + '...' : 'Analizando detalles técnicos del evento...'}</p>
                        <small class="text-warning">FUENTE: ${art.source_id.toUpperCase()}</small>
                    </div>
                </a>
            </div>
        `;
        grid.appendChild(cardCol);
    });
}

// ============================================================
// REPORTE TXT: REDACCIÓN DE 2 PÁRRAFOS POR NOTICIA
// ============================================================
document.getElementById('downloadAllBtn').addEventListener('click', () => {
    if (articlesList.length === 0) return;

    let content = "=== REPORTE EJECUTIVO DE INTELIGENCIA DE DATOS ===\n";
    content += `FECHA: ${new Date().toLocaleString()}\n`;
    content += `CANTIDAD DE REGISTROS: ${articlesList.length}\n`;
    content += "==================================================\n\n";

    articlesList.forEach((art, i) => {
        const fuente = art.source_id ? art.source_id.toUpperCase() : "AGENCIA EXTERNA";
        const resumen = art.description || "información técnica bajo análisis de campo";

        content += `REGISTRO #${i + 1}: ${art.title.toUpperCase()}\n`;
        content += `--------------------------------------------------\n`;
        
        // PÁRRAFO I: Análisis situacional
        content += `Párrafo I: Tras el procesamiento de los datos recolectados, se confirma que el evento "${art.title}" ha sido validado por la agencia ${fuente}. La información indica que ${resumen}. Este suceso se registra como un punto de inflexión crítico en la cronología tecnológica global, impactando en los flujos de información analizados.\n\n`;
        
        // PÁRRAFO II: Proyección técnica
        content += `Párrafo II: Desde una perspectiva profesional, este desarrollo sugiere una reconfiguración de los parámetros en el sector tecnológico. Es imperativo evaluar el impacto estratégico a largo plazo, ya que la escalabilidad de la noticia indica que los estándares actuales de seguridad podrían verse afectados en los próximos meses.\n\n`;
        
        content += `URL DE REFERENCIA: ${art.link}\n`;
        content += `\n\n`;
    });

    content += "=== FIN DEL REPORTE - SISTEMA PUB_API ===";

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_Inteligencia_10.txt`;
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
