const artistId = window.location.pathname.split('/').pop();
const imgProfile = document.querySelector('.info-profile-and-btn .img-and-name .img-profile');
const nameProfile = document.querySelector('.info-profile-and-btn .img-and-name .name-profile');
const topTracksFromArtist = document.querySelector('.top-tracks-from-artist');
const discographyDiv = document.querySelector('.discography');
const btnDiscography = document.querySelector('.btn-discography');

btnDiscography.setAttribute('href', `/discography/${artistId}`);

fetch(`/search-artist/${artistId}`)
        .then(response => {
          if (response.status === 404) {
              // Redireciona para a página 404
              window.location.href = '/404';
            } else {
              return response.json();
            }
        })
        .then(data => {
            imgProfile.classList.remove('skeleton');
            nameProfile.classList.remove('skeleton');

            // Atualiza a página com os dados do artista
            document.title = `${data.name} - AfterMusic`;
            if (data.image) {
                document.querySelector('.img-profile').setAttribute('style', `background-image: url(${data.image});`);
            } else {
                document.querySelector('.img-profile').innerHTML = `<div class='svg-icon musician-svg'></div>`;
            }
            document.querySelector('.name-profile').textContent = `${data.error ? "Nome indefinido" : data.name}`;
            document.querySelector('.number-followers').textContent = `${data.followers.toLocaleString('pt-BR')}`;

            const profileOnSpotify = document.querySelector('.profile-on-spotify');
            profileOnSpotify.setAttribute('href', `${data.uri}`);
        })
        .catch(err => console.error('Erro ao carregar os dados do artista:', err));

async function getTopTracksFromArtist() {
    try {
      const response = await fetch(`/get-top-tracks-from-artist/${artistId}`);
      const data = await response.json();
      const topTracks = data.tracks;

      topTracks.forEach((track, index) => {
          const itemListened = document.createElement("a");
          itemListened.classList.add('item-listened', "track-link");
          itemListened.classList.remove('skeleton')
          itemListened.setAttribute('data-id', track.id);
          itemListened.setAttribute('style', `grid-area: num${index+1};`);
          itemListened.setAttribute("href", `/music/${track.id}`);
    
          itemListened.innerHTML = `
            <h1 class="number-top-track">
              ${index + 1}
            </h1>
            <div class="info-track">
              <p class='name-music'>${track.name}</p>
            </div>
          `
    
          topTracksFromArtist.appendChild(itemListened);
        })

        const responseDiscography = await fetch(`/get-albums-from-artist/${artistId}?limit=6&offset=0`);
        const dataDiscography = await responseDiscography.json();
        
        dataDiscography.items.forEach(disco => {
          const discographyItem = document.createElement("a");
          discographyItem.classList.add('discography-item');
          discographyItem.setAttribute('data-id', disco.id);
          discographyItem.setAttribute("href", `/album/${disco.id}`);
          const releaseDate = disco.release_date;
          const [ano, mes, dia] = releaseDate.split("-"); 
          const date = new Date(ano, mes - 1, dia);
          const dateBr = date.toLocaleDateString("pt-BR");
    
          discographyItem.innerHTML = `
            <img src="${disco.images[0].url}" class="img-album" alt="Foto do álbum">
            <div class="info-track">
              <p class='album-name' title='${disco.name}'>${disco.name}</p>
              <p class="release-date">${dateBr === "Invalid Date" ? releaseDate : dateBr}</p>
            </div>
          `
    
          discographyDiv.appendChild(discographyItem);
        })
    }
    catch (err) {
      console.error('Erro ao carregar os dados do artista:', err)
    }
}

getTopTracksFromArtist();