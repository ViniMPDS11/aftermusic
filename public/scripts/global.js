document.addEventListener("click", async (e) => {
    const link = e.target.closest("a.artist-link");
    if (link) {
        e.preventDefault();
        const artistId = link.getAttribute("href").split("/").pop();
        const response = await fetch(`/search-artist/${artistId}`);
        const data = await response.json();
        let artists = JSON.parse(localStorage.getItem("savedArtistsAndTracks")) || [];

        if (data !== artists[-1]) {
            artists = artists.filter(item => item.id !== data.id);
            artists.push(data);
            artists = artists.slice(-4);
            localStorage.setItem("savedArtistsAndTracks", JSON.stringify(artists));
            window.location.href = link.href;
            return;
        } else {
            window.location.href = trackLink.href;
            return;
        }
    }
  
    const trackLink = e.target.closest("a.track-link");
    if (trackLink) {
        e.preventDefault();
        const trackId = trackLink.getAttribute("href").split("/").pop();
        const response = await fetch(`/search-track/${trackId}`);
        const data = await response.json();
        let tracks = JSON.parse(localStorage.getItem("savedArtistsAndTracks")) || [];
        if (data !== tracks[-1]) {
            tracks = tracks.filter(item => item.id !== data.id);
            tracks.push(data);
            tracks = tracks.slice(-4);
            localStorage.setItem("savedArtistsAndTracks", JSON.stringify(tracks));
            window.location.href = trackLink.href;
            return;
        } else {
            window.location.href = trackLink.href;
            return;
        }
    }
});