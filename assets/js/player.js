document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoUrl = urlParams.get('url');

    if (videoUrl) {
        const player = videojs('videoPlayer');
        player.src({
            src: videoUrl,
            type: 'application/x-mpegURL'
        });
        player.play();
    } else {
        console.error('No se proporcionó una URL de video.');
    }
});
