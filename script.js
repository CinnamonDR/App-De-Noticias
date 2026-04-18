// CONFIGURACIÓN GNEWS (Reemplaza la API_KEY si esta llega al límite)
const API_KEY = '52bd59899e2566ba30529731049b44ff'; // He puesto una temporal, pero genera la tuya
const DEFAULT_IMG = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000";

let articlesList = [];

async function fetchNews() {
    // GNews usa una estructura de URL un poco diferente
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
        
        // Cargar noticias de respaldo en caso de error
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
        
        // GNews usa 'image' en lugar de 'urlToImage'
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

// Botón de Reporte
document.getElementById('downloadAllBtn').addEventListener('click', () => {
    if (articlesList.length === 0) return;
    let content = "=== REPORTE DE INTELIGENCIA ===\n\n";
    articlesList.forEach((art, i) => {
        content += `${i+1}. ${art.title}\nURL: ${art.url}\n\n`;
    });
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_Noticias.txt`;
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
