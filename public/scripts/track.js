const trackId = window.location.pathname.split('/').pop();
const infoTrackAndArtist = document.querySelector('.info-track-and-artist');
const imgProfile = document.querySelector('.info-track-and-artist .img-profile');
const trackName = document.querySelector('.info-track-and-artist .track-and-artist-name h2');
const artistName = document.querySelector('.info-track-and-artist .track-and-artist-name a');
const letterText = document.querySelector('.letter-and-player .letter')
const secondaryInfo = document.querySelector('.secondary-info');
const playerSpotify = document.querySelector('.player-spotify');

letterText.innerHTML = "Buscando letra...";

fetch(`/search-track/${trackId}`)
        .then(response => {
            if (response.status === 404) {
                window.location.href = '/404';
            } else {
                return response.json();
            }
        })
        .then(async (data) => {
            const track = data;

            const responseArtist = await fetch(`/search-artist/${track.artists[0].id}`);
            const artist = await responseArtist.json();

            imgProfile.classList.remove('skeleton');
            trackName.classList.remove('skeleton');
            artistName.classList.remove('skeleton');

            if (artist.image) {
                imgProfile.setAttribute('style', `background-image: url(${artist.image}`);
            } else {
                imgProfile.setAttribute('style', `background-color: #FFF;`);
            }

            trackName.textContent = `${track.name}`;
            artistName.textContent = `${artist.name}`;
            artistName.setAttribute('href', `/artist/${artist.id}`)
            artistName.classList.add('artist-link')

            const listenOnSpotify = document.querySelector('.listen-on-spotify');
            listenOnSpotify.setAttribute('href', `${track.uri}`);

            const artistNameNormalized = artist.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace("/", "");
            const trackNameNormalized = track.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace("/", "");

            const responseLetter = await fetch(`/get-letter/${encodeURI(artistNameNormalized)}/${encodeURI(trackNameNormalized)}`);
            const letter = await responseLetter.json();
            
            if (letter.plainLyrics) {
                const formattedLyrics = letter.plainLyrics.replace(/\n/g, '<br>');
                letterText.innerHTML = formattedLyrics;
            } else {
                letterText.innerHTML = "Ah, que pena! A letra ainda não está disponível no momento :("
            }

            const releaseDate = track.album.release_date;
            const [ano, mes, dia] = releaseDate.split("-"); 
            const date = new Date(ano, mes - 1, dia);
            const dateBr = date.toLocaleDateString("pt-BR");

            secondaryInfo.innerHTML = `
                    <iframe class="player-spotify" style="border-radius:12px" src="https://open.spotify.com/embed/track/${track.id}" width="100%" height="80" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                    <a class="album-info card" href="/album/${track.album.id}">
                        <img src="${track.album.images[0].url}" class="album-img">
                        <span>Álbum: <span class="album-name">${track.album.name}</span></span>
                        <span class="realese-date"> Lançamento: ${dateBr === "Invalid Date" ? releaseDate : dateBr}</span>
                    </a>
            `;
        })
        .catch(err => console.error('Erro ao carregar os dados da música:', err));