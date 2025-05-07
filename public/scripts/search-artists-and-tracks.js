import * as useful from './useful.js';
const bestResultDiv = document.querySelector('.best-result');
const tracksFoundDiv = document.querySelector('.tracks-found');
const artistsFoundDiv = document.querySelector('.artists-found');
const albumsFoundDiv = document.querySelector('.albums-found');

async function fetchData() {
    let offset = 0;
    try {
      for (let i = 0; i < 4; i++) {
          const trackFound = document.createElement("div");
          trackFound.classList.add('track-found');
          trackFound.innerHTML = `
            <div class="img-album skeleton"></div>
            <div class="info-track active">
              <p class='name-music skeleton'></p>
              <p class='artist skeleton'></p>
            </div>
          `

          tracksFoundDiv.appendChild(trackFound);
      }

      for (let i = 0; i < 8; i++) {
        const artistFound = document.createElement("div");
        artistFound.classList.add('artist-found');
        
        artistFound.innerHTML = `
          <div class="img-artist skeleton"></div>
          <div class="info-artist">
            <p class="artist-name skeleton"></p>
            <p class="type-of-result skeleton"></p>
          </div>
        `
  
        artistsFoundDiv.appendChild(artistFound);
      }

      for (let i = 0; i < 8; i++) {
        const albumFound = document.createElement("div");
        albumFound.classList.add('album-found');
        
        albumFound.innerHTML = `
          <div class="img-album skeleton"></div>
          <div class="info-album">
            <p class="album-name skeleton"></p>
            <p class="type-of-result skeleton"></p>
          </div>
        `
  
        albumsFoundDiv.appendChild(albumFound);
      }

      const responseBestResult =  await fetch(`/get-track-and-artist/?limit=1&offset=${offset}`);
      const bestResult = await responseBestResult.json();
      const bestResultArtist = bestResult.artist;
      const bestResultTrack = bestResult.track.tracks.items;
      
      if (bestResultTrack[0].popularity >= bestResultArtist[0].popularity || bestResultTrack[0].artists[0].name === bestResultArtist[0].name && bestResultTrack[0].name.toLowerCase().includes(bestResult.search.toLowerCase())) {
          bestResultDiv.classList.remove('skeleton');
          bestResultDiv.classList.add('active', "track-link");
          bestResultDiv.setAttribute("href", `/music/${bestResultTrack[0].id}`);
          bestResultDiv.setAttribute("data-id", `${bestResultTrack[0].id}`);
          bestResultDiv.innerHTML = `
              <img class="img-album" src="${bestResultTrack[0].album.images[0].url}" alt="Foto do álbum">
              <h2 class="best-result-name">${bestResultTrack[0].name}</h2>
              <p class="type-of-result artist-link">Música • <a href="/artist/${bestResultTrack[0].artists[0].id}">${bestResultTrack[0].artists[0].name}</a></p>
          `
      } else if (bestResultArtist[0].popularity > bestResultTrack[0].popularity) {
          bestResultDiv.classList.remove('skeleton');
          bestResultDiv.classList.add('active', 'artist-link');
          bestResultDiv.setAttribute("href", `/artist/${bestResultArtist[0].id}`);
          bestResultDiv.innerHTML = `
              <div class="img-artist" style="background-image: url('${bestResultArtist[0].images[0].url}')"></div>
              <h2 class="best-result-name">${bestResultArtist[0].name}</h2>
              <p class="type-of-result">Artista</p>
          `
      }

      const responseResults =  await fetch(`/get-track-and-artist/?limit=8&offset=${offset}`);
      const results = await responseResults.json();
      const resultsArtist = results.artist;
      const resultsTrack = results.track.tracks.items;
      const resultsAlbum = results.album.albums.items;
      const fourBestResultsTrack = resultsTrack.slice(0, 4);

      tracksFoundDiv.innerHTML = '';

      fourBestResultsTrack.forEach((track, index) => {
          const trackFound = document.createElement("a");
          trackFound.classList.add('track-found', 'active', 'track-link');
          trackFound.setAttribute("href", `/music/${track.id}`);
          trackFound.setAttribute("data-id", `${track.id}`);
          trackFound.innerHTML = `
            <div class="img-album" style="background-image: url('${track.album.images[0].url}')"></div>
            <div class="info-track">
              <p class='name-music'>${track.name}</p>
              <a href="/artist/${track.artists[0].id}" class='artist artist-link'>${track.artists[0].name}</a>
            </div>
          `
    
          tracksFoundDiv.appendChild(trackFound);
      });

      artistsFoundDiv.innerHTML = '';
      resultsArtist.forEach((artist, index) => {
          const artistFound = document.createElement("a");
          artistFound.classList.add('artist-found', 'active', 'artist-link');
          artistFound.setAttribute("href", `/artist/${artist.id}`);
          artistFound.setAttribute("data-id", `${artist.id}`);
          
          artistFound.innerHTML = `
            <div class="img-artist" style="background-image: url('${artist.images.length > 0 ? artist.images[0].url : ""}')">${artist.images.length > 0 ? "" : "<div class='svg-icon musician-svg'></div>"}</div>
            <div class="info-artist">
              <p class="artist-name">${artist.name}</p>
              <p class="type-of-result">Artista</p>
            </div>
          `
    
          artistsFoundDiv.appendChild(artistFound);
      });



      albumsFoundDiv.innerHTML = '';

      resultsAlbum.forEach((album, index) => {
          const albumFound = document.createElement("a");
          albumFound.classList.add('album-found', 'active');
          albumFound.setAttribute("href", `/album/${album.id}`);
          albumFound.setAttribute("data-id", `${album.id}`);
          
          albumFound.innerHTML = `
            <div class="img-album" style="background-image: url('${album.images.length > 0 ? album.images[0].url : ""}')">${album.images.length > 0 ? "" : "<div class='svg-icon album-svg'></div>"}</div>
            <div class="info-album">
              <p class="album-name">${album.name}</p>
              <p class="type-of-result">Álbum • <a href="/artist/${album.artists[0].id}">${album.artists[0].name}</a></p>
            </div>
          `
    
          albumsFoundDiv.appendChild(albumFound);
      });
    }
    catch (err) {
        console.error('Erro ao carregar os dados do artista:', err)
    }
}

fetchData();