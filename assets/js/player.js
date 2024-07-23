document.addEventListener('DOMContentLoaded', function() {
    const player = videojs('videoPlayer');

    const urlParams = new URLSearchParams(window.location.search);
    const channelUrl = urlParams.get('url');

    if (channelUrl) {
        player.src({
            src: channelUrl,
            type: 'application/x-mpegURL'
        });
        player.play();
    } else {
        alert('No se proporcionó ninguna URL de canal.');
    }
});
