const albumId = window.location.pathname.split('/').pop();
const imgAlbum = document.querySelector('.img-album');
const albumName = document.querySelector('.album-name');
const nameAndDate = document.querySelector('.name-and-date');
const listenOnSpotify = document.querySelector('.listen-on-spotify');
const trackList = document.querySelector('.track-list');

loadInfoAlbum();

async function loadInfoAlbum() {
    const responseAlbumInfo = await fetch(`/get-info-from-album/${albumId}`);

    if (responseAlbumInfo.status === 404) {
        window.location.href = '/404';
    }

    const dataAlbumInfo = await responseAlbumInfo.json();

    const releaseDate = dataAlbumInfo.release_date;
    const [ano, mes, dia] = releaseDate.split("-"); 
    const date = new Date(ano, mes - 1, dia);
    const dateBr = date.toLocaleDateString("pt-BR");

    listenOnSpotify.setAttribute('href', dataAlbumInfo.uri);
    imgAlbum.classList.remove('skeleton');
    imgAlbum.style.backgroundImage = `url('${dataAlbumInfo.images[0].url}')`;
    albumName.textContent = dataAlbumInfo.name;
    nameAndDate.innerHTML = `De <a class="artist-link" href="/artist/${dataAlbumInfo.artists[0].id}">${dataAlbumInfo.artists[0].name}</a> • ${dateBr === "Invalid Date" ? releaseDate : dateBr} - ${dataAlbumInfo.total_tracks} músicas`;

    const albumTracks = dataAlbumInfo.tracks.items;
    albumTracks.forEach(track => {
        const albumTrackLink = document.createElement('a');
        albumTrackLink.classList.add('album-track', 'track-link');
        albumTrackLink.setAttribute('href', `/music/${track.id}`);
        albumTrackLink.setAttribute('data-id', track.id);
        albumTrackLink.innerHTML = `
            <p class="track-number">${track.track_number}</p>
            <div class="info-track">
                <p class="track-name">${track.name}</p>
                <button onclick="window.location.href='/artist/${track.artists[0].id}'; event.stopPropagation(); return false;">${track.artists[0].name}</button>
            </div>
        `;

        trackList.appendChild(albumTrackLink);
    });

    const albumTrack = document.querySelectorAll('.album-track');

    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)'); // Detecta telas com hover e pointer fino (mouse padrão)
    if (canHover.matches) {
        albumTrack.forEach((item, index) => {
            item.addEventListener('mouseenter', () => {
                if (index > 0) {
                albumTrack[index - 1].style.borderBottom = '2px solid #13131F';
                }
            });
    
            item.addEventListener('mouseleave', () => {
                if (index > 0) {
                albumTrack[index - 1].style.borderBottom = '2px solid #1B1B2E';
                }
            });
        });
    }
}