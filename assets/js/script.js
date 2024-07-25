document.addEventListener('DOMContentLoaded', function() {
    const player = videojs('videoPlayer');
    player.src({
        src: 'https://magicstream.ddns.net:443/magicstream/stream.m3u8',
        type: 'application/x-mpegURL'
    });
    player.play();

    const channelList = document.getElementById('channels');

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

        return channels;
    }

    function displayChannels(channels) {
        channels.forEach(channel => {
            const div = document.createElement('div');
            div.className = 'channel-item';
            div.innerHTML = `
                <img src="${channel.logo}" alt="${channel.name}">
                <p>${channel.name}</p>
            `;
            div.addEventListener('click', () => {
                openPlayer(channel.url);
            });
            channelList.appendChild(div);
        });
    }

    function openPlayer(url) {
        window.location.href = `../assets/sitio/player.html?url=${encodeURIComponent(url)}`;
    }

    loadM3U('../assets/listas/AR.m3u').then(displayChannels);

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
