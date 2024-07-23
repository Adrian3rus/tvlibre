document.addEventListener('DOMContentLoaded', function() {
    const player = videojs('videoPlayer');
    player.src({
        src: 'https://magicstream.ddns.net:443/magicstream/stream.m3u8',
        type: 'application/x-mpegURL'
    });
    player.play();
});

document.addEventListener('DOMContentLoaded', function() {
    const channelList = document.getElementById('channels');

    async function loadM3U(url) {
        try {
            const response = await fetch(url);
            const data = await response.text();
            return parseM3U(data);
        } catch (error) {
            console.error('Error al cargar la lista M3U:', error);
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
                <img src="https://via.placeholder.com/150" alt="${channel.name}">
                <p>${channel.name}</p>
            `;
            div.addEventListener('click', () => {
                openPlayer(channel.url);
            });
            channelList.appendChild(div);
        });
    }

    function openPlayer(url) {
        window.location.href = `player.html?url=${encodeURIComponent(url)}`;
    }

    loadM3U('https://iptv-org.github.io/iptv/languages/spa.m3u').then(channels => {
        displayChannels(channels);
    });
});
