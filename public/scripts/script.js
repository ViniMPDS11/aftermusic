import * as useful from './useful.js';

if (window.location.search) {
  window.location.replace('/');
}

const itemsListened = document.querySelector('.items-listened')
const topArtistsArea = document.querySelector('.top-artists')

for (let i = 0; i < 10; i++) {
    const topTrack = document.createElement("a");
    topTrack.classList.add('item-listened');
    topTrack.setAttribute('style', `grid-area: num${i+1};`);

    topTrack.innerHTML = `
      <h1 class="number-top-track">
        ${i + 1}
      </h1>
      <div class="info-track">
        <p class='name-music skeleton'></p>
        <p class='artist skeleton'></p>
      </div>
    `

    itemsListened.appendChild(topTrack);
}

for (let i = 0; i < 3; i++) {
    const mostListenedToArtists = document.createElement("a");
    mostListenedToArtists.classList.add("top-artist");
    mostListenedToArtists.classList.remove('skeleton')
    
    mostListenedToArtists.innerHTML = `
      <div class="img-profile skeleton">
        <div class="number-top-artist">
          <p>${i+1}</p>
        </div>
      </div>
      <h2 class='skeleton'></h2>
    `
    
    topArtistsArea.appendChild(mostListenedToArtists)
}

useful.getTopTracks(itemsListened, 10, false, false, 0, false);
useful.getTopArtists(topArtistsArea, 3, false, false, 0, false);