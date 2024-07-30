document.addEventListener('DOMContentLoaded', function() {
    const player = videojs('videoPlayer');
    player.src({
        src: 'https://magicstream.ddns.net:443/magicstream/stream.m3u8',
        type: 'application/x-mpegURL'
    });
    player.play();

    const channelList = document.getElementById('channels');
    const channelList2 = document.getElementById('channels2');
    const channelModal = document.getElementById('channelModal');
    const closeChannelModal = document.getElementById('closeChannelModal');
    const channelVideoPlayer = videojs('channelVideoPlayer');

    async function loadM3U(url) {
        try {
            const response = await fetch(url);
            const data = await response.text();
            return parseM3U(data);
        } catch (error) {
            console.error('Error al cargar la lista M3U:', error);
            return [];
        }
    }

    function parseM3U(data) {
        const lines = data.split('\n');
        const channels = [];
        let channel = {};

        lines.forEach(line => {
            if (line.startsWith('#EXTINF:')) {
                const info = line.split(',');
                channel.name = info[1].trim();
                const logoMatch = line.match(/tvg-logo="([^"]+)"/);
                channel.logo = logoMatch ? logoMatch[1] : 'https://via.placeholder.com/150';
            } else if (line.startsWith('http')) {
                channel.url = line.trim();
                channels.push(channel);
                channel = {};
            }
        });

        return channels.filter(channel => channel.url);
    }

    async function checkChannelAvailability(channel) {
        try {
            const response = await fetch(channel.url, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            console.warn(`El canal ${channel.name} no está disponible:`, error);
            return false;
        }
    }

    async function displayChannels(channels, container, checkAvailability = false, openInModal = false) {
        for (const channel of channels) {
            const isAvailable = checkAvailability ? await checkChannelAvailability(channel) : true;
            if (isAvailable) {
                const div = document.createElement('div');
                div.className = 'channel-item';
                div.innerHTML = `
                    <img src="${channel.logo}" alt="${channel.name}">
                    <p>${channel.name}</p>
                `;
                if (openInModal) {
                    div.addEventListener('click', () => {
                        openChannelModal(channel.url);
                    });
                } else {
                    div.addEventListener('click', () => {
                        openPlayer(channel.url);
                    });
                }
                container.appendChild(div);
            }
        }
    }

    function openPlayer(url) {
        window.location.href = `../assets/sitio/player.html?url=${encodeURIComponent(url)}`;
    }

    function openChannelModal(url) {
        channelVideoPlayer.src({
            src: url,
            type: 'application/x-mpegURL'
        });
        channelVideoPlayer.play();
        channelModal.style.display = 'block';
    }

    closeChannelModal.addEventListener('click', function() {
        channelModal.style.display = 'none';
        channelVideoPlayer.pause();
    });

    window.addEventListener('click', function(event) {
        if (event.target === channelModal) {
            channelModal.style.display = 'none';
            channelVideoPlayer.pause();
        }
    });

    // Cargar y mostrar la primera lista de canales sin comprobar disponibilidad
    loadM3U('../assets/listas/AR.m3u').then(channels => displayChannels(channels, channelList));

    // Cargar y mostrar la segunda lista de canales y comprobar disponibilidad
    loadM3U('../assets/listas/AR2.m3u').then(channels => displayChannels(channels, channelList2, true, true));

    document.querySelectorAll('.grid-item').forEach(item => {
        item.addEventListener('click', function() {
            const videoUrl = this.getAttribute('data-video-url');
            document.getElementById('videoFrame').src = videoUrl;
            document.getElementById('videoModal').style.display = 'flex';
        });
    });

    document.getElementById('closeModal').addEventListener('click', function() {
        document.getElementById('videoModal').style.display = 'none';
        document.getElementById('videoFrame').src = '';
    });

    document.getElementById('fullscreenModal').addEventListener('click', function() {
        const modalContent = document.querySelector('.modal-content');
        if (modalContent.requestFullscreen) {
            modalContent.requestFullscreen();
        } else if (modalContent.mozRequestFullScreen) { // Firefox
            modalContent.mozRequestFullScreen();
        } else if (modalContent.webkitRequestFullscreen) { // Chrome, Safari and Opera
            modalContent.webkitRequestFullscreen();
        } else if (modalContent.msRequestFullscreen) { // IE/Edge
            modalContent.msRequestFullscreen();
        }
    });

    window.addEventListener('click', function(event) {
        const modal = document.getElementById('videoModal');
        if (event.target === modal) {
            modal.style.display = 'none';
            document.getElementById('videoFrame').src = '';
        }
    });
});

// Uso de AnimeFLV API
const Anime = require('animeflv-api').default;

(async () => {
  try {
    // Obtener información sobre un anime específico
    const naruto = await Anime.getAnimeInfo('naruto');
    console.log(naruto);

    // Buscar animes por nombre
    const searchResults = await Anime.search('Naruto');
    console.log(searchResults);

    // Obtener lista de animes recientes
    const recentAnimes = await Anime.recent();
    console.log(recentAnimes);

  } catch (error) {
    console.error(error);
  }
})();

// Manejador de búsqueda
document.getElementById('searchForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const query = document.getElementById('searchQuery').value;
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Limpiar resultados anteriores

    try {
        const response = await fetch(`https://www3.animeflv.net/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.length > 0) {
            data.forEach(anime => {
                const animeDiv = document.createElement('div');
                animeDiv.className = 'anime';
                animeDiv.innerHTML = `
                    <div class="anime-title">${anime.title}</div>
                    <div class="anime-description">${anime.description}</div>
                `;
                resultsDiv.appendChild(animeDiv);
            });
        } else {
            resultsDiv.innerHTML = 'No se encontraron resultados.';
        }
    } catch (error) {
        resultsDiv.innerHTML = 'Ocurrió un error al buscar la serie.';
        console.error('Error al buscar la serie:', error);
    }
});
