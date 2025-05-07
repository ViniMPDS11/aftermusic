import * as useful from './useful.js';
let topTrack;
let topArtist;
const params = new URLSearchParams(window.location.search);
const searchQuery = params.get('search');
const htmlElement = document.querySelector('html');
const state = {
    searchId: 0,
};
function setSearchId() {
    state.searchId += 1;
}

let isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

window.addEventListener('resize', () => {
    isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
});

document.addEventListener("DOMContentLoaded", () => {
    const searchFormHTML = `
        <div class="cnt-center header">
            <a class="logo-div" href="/" title="Página inicial">
                <div class="svg-icon logo-svg"></div>
            </a>
            <form class="form-search" action="/" method="get">
                <input autocomplete="off" type="text" name="search" class="search-input" id="search-desktop" placeholder="O que você procura?">
                <button class='search-btn' type="submit" title="Buscar" disabled=true>
                    <div class="svg-icon search-svg"></div>
                </button>
                <div class="items-found-form">
                    <div class="items-found-form-space"></div>
                    <div class="items-found-form-results"></div>
                </div>
            </form>
            <button class='search-btn active' title="Buscar">
                <div class="svg-icon search-svg mobile"></div>
            </button>
        </div>
    `;

    const header = document.querySelector("header");
    if (header) {
        header.innerHTML = searchFormHTML;
    }

    const itemsFoundForm = document.querySelector(".items-found-form");
    const buttonForSearch = document.querySelector(".form-search .search-btn");
    const mobileSearchBtn = document.querySelector('.header.cnt-center > .search-btn');

    const modalSearchMobileCreate = document.createElement('div');
    modalSearchMobileCreate.classList.add('modal-search-mobile');
    modalSearchMobileCreate.innerHTML = `
        <div class='input-and-bnt-cancel'>
            <form class="form-search" action="/" method="get">
                <input autocomplete="off" type="text" name="search" class="search-input" id="search-mobile" placeholder="O que você procura?">
            </form>
            <button class='cancel-btn' title="Cancelar busca">Cancelar</button>
        </div>
        <div class='items-found-form-results'></div>
    `;
    document.querySelector('body').insertBefore(modalSearchMobileCreate, header);
    const modalSearchMobile = document.querySelector('.modal-search-mobile');
    const cancelBtnFromSearch = document.querySelector('.cancel-btn');
    const searchInput = document.querySelectorAll(".search-input");
    const itemsFoundFormResults = document.querySelectorAll(".items-found-form-results");
    const formSearch = document.querySelectorAll(".form-search");
    let searchValue;

    // Verificar se é mobile
    if (isMobile) {
        // Faz a barra não ser mais absoluta, movendo ela para direita
        formSearch[1].classList.add('mobile');
        document.addEventListener('touchstart', function() {}, true);
    }
    
    let currentSearchIdDefaultResults = 0;
    const loadDefaultResults = async (local) => {
        setSearchId();
        currentSearchIdDefaultResults = state.searchId;
                
        local.innerHTML = '';
        topTrack = await useful.getTopTracks(local, 3, topTrack, true, currentSearchIdDefaultResults, true);

        if (!local.querySelector(".search-message.tracks")) {
            const message = document.createElement("p");
            message.textContent = "músicas mais escutadas";
            message.classList.add("search-message", "tracks");
            const itemListened = local.querySelector(".item-listened");
            if (itemListened) {
                local.insertBefore(message, itemListened);
            }
        }

        topArtist = await useful.getTopArtists(local, 3, topArtist, true, currentSearchIdDefaultResults, true);

        if (!local.querySelector(".search-message.artists")) {
            const message = document.createElement("p");
            message.textContent = "artistas mais escutados";
            message.classList.add("search-message", "artists");
            const topArtist = local.querySelector(".top-artist");
            if (topArtist) {
                local.insertBefore(message, topArtist);
                const dividerSearch = document.createElement("div");
                dividerSearch.classList.add("divider-search");
                local.insertBefore(dividerSearch, message);
                await getArtistsAndTracksHistory(local);
            }
        }
    };

    async function getArtistsAndTracksHistory (local) {
        let artistsAndTracksHistory = JSON.parse(localStorage.getItem("savedArtistsAndTracks"));
        if (artistsAndTracksHistory) {
            artistsAndTracksHistory.reverse().forEach(item => {
                if (item.type === 'track') {
                    const trackFound = document.createElement("a");
                    trackFound.classList.add("item-listened", "track-link", "history-item");
                    trackFound.setAttribute("data-id", item.id);
                    trackFound.setAttribute("href", `/music/${item.id}`);
                    trackFound.innerHTML = `
                        <div class="info-track">
                        <p class='name-music'>${item.name}</p>
                        <p class='artist'>${item.artists[0].name}</p>
                        </div>
                    `;
                    local.appendChild(trackFound);
                } else {
                    const artistFound = document.createElement('a');
                    artistFound.classList.add('artist-found', 'artist-link', 'history-item');
                    artistFound.setAttribute('data-id', item.id);
                    artistFound.setAttribute('href', `/artist/${item.id}`);
                    artistFound.innerHTML = `
                        <div class="img-profile" style="background-image: url('${item.image || ""}');">${item.image ? "" : "<div class='svg-icon musician-svg'></div>"}</div>
                        <p>${item.name}</p>
                    `;
                    
                    local.appendChild(artistFound);
                }
                if (!local.querySelector(".search-message.history")) {
                    const message = document.createElement("p");
                    message.textContent = "histórico";
                    message.classList.add("search-message", "history");
                    const historyItem = local.querySelector(".history-item");
                    if (historyItem) {
                        local.insertBefore(message, historyItem);
                        const dividerSearch = document.createElement("div");
                        dividerSearch.classList.add("divider-search");
                        local.insertBefore(dividerSearch, message);
                    }
                }
            })
        }   else {
            return;
        }
    }

    (async () => {
        if (!!searchQuery) {
            searchInput[1].value = searchQuery;
            buttonForSearch.disabled = false;
            await searchItems(itemsFoundFormResults[1], searchQuery);
            await loadDefaultResults(itemsFoundFormResults[0]);

            return;
        }

        for (const item of itemsFoundFormResults) {
        if (currentSearchIdDefaultResults !== state.searchId) return;
            await loadDefaultResults(item);
        }
    })();

    searchInput.forEach( (input, index) => {
        input.setAttribute("data-id", index);
        if (!isMobile) {
            input.addEventListener("focus", () => {
                itemsFoundForm.classList.add('active');
                input.classList.add('active');
                buttonForSearch.classList.add('active');
            });
        
            input.addEventListener("blur", () => {
                itemsFoundForm.classList.remove('active');
                input.classList.remove('active');
                buttonForSearch.classList.remove('active');
            });
        }

        input.addEventListener("input", () => {
            searchValue = input.value.trim();
            const correspondingItemsFoundFormResults = input.parentElement.querySelector('.items-found-form-results') || input.parentElement.parentElement.parentElement.querySelector('.items-found-form-results');
            searchItems(correspondingItemsFoundFormResults, searchValue);
        });
    })

    async function searchItems(local, searchValue = "") {
        setSearchId();
        const currentSearchId = state.searchId;

        if (searchValue === "") {
            buttonForSearch.disabled = true;
            await loadDefaultResults(local);
            return;
        } else {
            buttonForSearch.disabled = false;
        }

        try {

            local.innerHTML = '<p class="search-text">Pesquisando</p>';

            const response = await fetch(`/get-track-and-artist/${encodeURIComponent(searchValue)}?limit=3`);

            if (currentSearchId !== state.searchId) return;

            const data = await response.json();

            local.innerHTML = '';

            const artist = data.artist;
            const album = data.album.albums.items;
            let track;
            if (data.track.error) {
                local.innerHTML = '<p class="search-text">Sem resultados</p>';
                return;
            } else {
                track = data.track.tracks.items;
            }

            // Exibindo os resultados de músicas
            if (track.length > 0) {
                const message = document.createElement("p");
                message.textContent = "músicas";
                message.classList.add("search-message", "tracks");
                local.appendChild(message);

                for (const item of track) {
                    const trackFound = document.createElement("a");
                    trackFound.classList.add("track-found", "track-link");
                    trackFound.setAttribute("data-id", item.id);
                    trackFound.setAttribute("href", `/music/${item.id}`);
                    trackFound.innerHTML = `${item.name} - ${item.artists[0].name}`;
                    local.appendChild(trackFound);
                };
            }

            // Exibindo os resultados de artistas
            if (artist.length > 0) {
                const dividerSearch = document.createElement("div");
                dividerSearch.classList.add("divider-search");

                const message = document.createElement("p");
                message.textContent = "artistas";
                message.classList.add("search-message", "artists");

                local.appendChild(dividerSearch);
                local.appendChild(message);

                for (const item of artist) {
                    const artistFound = document.createElement('a');
                    artistFound.classList.add('artist-found', 'artist-link');
                    artistFound.setAttribute('data-id', item.id);
                    artistFound.setAttribute('href', `/artist/${item.id}`);
                    artistFound.innerHTML = `
                        <div class="img-profile" style="background-image: url('${item.images.length > 0 ? item.images[0].url : ""}');">${item.images.length > 0 ? "" : "<div class='svg-icon musician-svg'></div>"}</div>
                        <p>${item.name}</p>
                    `;
                    
                    local.appendChild(artistFound);
                };
            }

            // Exibindo os resultados de álbuns
            if (album.length > 0 && artist.length > 0) {
                const dividerSearch = document.createElement("div");
                dividerSearch.classList.add("divider-search");

                const message = document.createElement("p");
                message.textContent = "álbuns";
                message.classList.add("search-message", "albums");

                local.appendChild(dividerSearch);
                local.appendChild(message);

                for (const item of album) {
                    const albumFound = document.createElement('a');
                    albumFound.classList.add('album-found');
                    albumFound.setAttribute('data-id', item.id);
                    albumFound.setAttribute('href', `/album/${item.id}`);
                    albumFound.innerHTML = `
                        <div class="img-album" style="background-image: url('${item.images.length > 0 ? item.images[0].url : ""}');">${item.images.length > 0 ? "" : "<div class='svg-icon musician-svg'></div>"}</div>
                        <div class="info-album">
                            <p class="album-name">${item.name}</p>
                            <p class="artist-name">${item.artists[0].name}</p>
                        </div>
                    `;
                    
                    local.appendChild(albumFound);
                };
    
                await getArtistsAndTracksHistory(local);
            }
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        }
    }    

    function openModal() {
        const currentScrollY = window.scrollY;
        mobileSearchBtn.classList.remove('active');
        modalSearchMobile.classList.add('active');
        htmlElement.style.overflowY = "hidden";
        searchInput[0].focus();
        searchInput[0].value = "";
        searchValue = "";
        window.scrollTo(0, currentScrollY);
    }

    mobileSearchBtn.addEventListener('click', () => {
        openModal();
        
    });

    cancelBtnFromSearch.addEventListener('click', async () => {
        mobileSearchBtn.classList.add('active');
        modalSearchMobile.classList.remove('active');
        htmlElement.style.overflowY = "scroll";
        await loadDefaultResults(itemsFoundFormResults[0]);

        setSearchId();
    });

    searchInput[1].addEventListener('focus', () => {
        if (isMobile) {
            searchInput[1].blur();
            openModal();
        }
    })

    // Para controle de hover nas páginas no mobile
    document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('click', () => {
            el.blur(); // remove o foco
        });
    });
});

export { state, setSearchId };