import { state, setSearchId } from "./search.js";
let topTracksData;
let topArtists;

  // Função para buscar as X tracks mais ouvidas
  // local: onde vai ser alocado os resultados, quant: quantidade de resultados da API esperado, dataStored: armazenar ou não resultados da API, toBringTogether: limpa ou não antes de inserir os resultados, currentSearchId: recebe o ID atual para cancelar ou não a inserção dos dados vindos da API, verificationId: fazer a verificação ou não do ID para cancelar a inserção dos dados
async function getTopTracks(local, quant, dataStored = false, toBringTogether = false, currentSearchId, verificationId = false) {
  try {
    let response;
    if (!dataStored) {
      response = await fetch(`/get-top-tracks`);

      if (verificationId) {
        if (currentSearchId !== state.searchId) return;
      }

      topTracksData = await response.json();
    } else {
      response = dataStored;
      topTracksData = response;
    }


    const topTracks = topTracksData.items.slice(0, quant).map(items => ({
      name: items.track.name,
      id: items.track.id,
      artist: items.track.artists.map(artist => artist.name).join(', ')
    }));

    if (toBringTogether === false) {
      local.innerHTML = '';
    }

    // Cria todos os elementos antes de adicionar ao DOM
    const fragment = document.createDocumentFragment();
    topTracks.forEach((track, index) => {
      const itemListened = document.createElement("a");
      itemListened.classList.add('item-listened', 'track-link', 'active');
      itemListened.classList.remove('skeleton');
      itemListened.setAttribute('data-id', track.id);
      itemListened.setAttribute('style', `grid-area: num${index + 1};`);
      itemListened.setAttribute("href", `/music/${track.id}`);

      itemListened.innerHTML = `
        <h1 class="number-top-track">${index + 1}</h1>
        <div class="info-track">
          <p class='name-music'>${track.name}</p>
          <p class='artist'>${track.artist}</p>
        </div>
      `;

      fragment.appendChild(itemListened);
    });

    local.appendChild(fragment); // adiciona tudo de uma vez no DOM

    return topTracksData;
  } catch (error) {
    console.error("Erro ao buscar as informações:", error);
    return false; // retorna algo se der erro
  }
}


  // Função para buscar os X artistas mais ouvidos
  // local: onde vai ser alocado os resultados, quant: quantidade de resultados da API esperado, dataStored: armazenar ou não resultados da API, toBringTogether: limpa ou não antes de inserir os resultados, currentSearchId: recebe o ID atual para cancelar ou não a inserção dos dados vindos da API, verificationId: fazer a verificação ou não do ID para cancelar a inserção dos dados
async function getTopArtists(local, quant, dataStored = false, toBringTogether = false, currentSearchId, verificationId = false) {
  try {
    let response;
    if (!dataStored) {
      response = await fetch(`/get-top-artists?quant=${quant}`);
      if (verificationId) {
        if (currentSearchId !== state.searchId) return;
      }
      topArtists = await response.json();
    } else {
      response = dataStored;
      topArtists = response;
    }

    if (toBringTogether === false) {
      local.innerHTML = '';
    }
    const fragment = document.createDocumentFragment();
    topArtists.forEach((artist, index) => {
      const mostListenedToArtists = document.createElement("a");
      mostListenedToArtists.classList.add("top-artist", 'artist-link', 'active');
      mostListenedToArtists.classList.remove('skeleton')
      mostListenedToArtists.setAttribute("data-id", artist.id);
      mostListenedToArtists.setAttribute("href", `/artist/${artist.id}`);
      
      mostListenedToArtists.innerHTML = `
        <div class="img-profile" style="background-image: url('${artist.image}');">
          <div class="number-top-artist">
            <p>${index+1}</p>
          </div>
        </div>
        <h2>${artist.name}</h2>
      `
      
      fragment.appendChild(mostListenedToArtists)
    })

    local.appendChild(fragment);

    return topArtists;
  } catch (error) {
    console.error("Erro ao buscar as informações:", error);
  }
}

export { getTopTracks, getTopArtists };