const artistId = window.location.pathname.split('/').pop();
const imgProfile = document.querySelector('.info-profile-and-btn .img-and-name .img-profile');
const nameProfile = document.querySelector('.info-profile-and-btn .img-and-name .name-profile');
const discographyDiv = document.querySelector('.discography');
const paginationNumbers = document.querySelector('.pagination-numbers');
const arrowRight = document.querySelector('.discography-section .pagination .arrow-right-svg');
const doubleArrowRightSvg = document.querySelectorAll('.discography-section .pagination .double-arrow-right .double-arrow-right-svg');
const doubleArrowRight = document.querySelector('.discography-section .pagination .double-arrow-right');
const doubleArrowLeftSvg = document.querySelectorAll('.discography-section .pagination .double-arrow-left .double-arrow-left-svg');
const doubleArrowLeft = document.querySelector('.discography-section .pagination .double-arrow-left');
const arrowLeft = document.querySelector('.discography-section .pagination .arrow-left-svg');
let pageNumberActivated = document.querySelector(`.page-number.active`);
let numberOfPages;
let pageNumberCurrent = 1;
let offSetCurrent = (pageNumberCurrent - 1) * 16;
let targetPage;
let maxOffset;
let isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
let currentIsMobile = isMobile;

window.addEventListener('resize', () => {
    if (isMobile && !currentIsMobile) {
        loadPagination();
    }

    if (!isMobile && currentIsMobile) {
        loadPagination();
    }

    currentIsMobile = isMobile;
    isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
});

(async () => {
    await loadAlbumInfo();
    await loadPagination();
})();

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

async function loadAlbumInfo() {
    for (let i = 0; i < 16; i++) {
        const albumItem = document.createElement("div");
        albumItem.classList.add('album-item');
        
        albumItem.innerHTML = `
            <div class="img-album skeleton"></div>
            <div class="info-track skeleton">
                <p class='album-name skeleton'></p>
                <p class='album-name-line-bottom skeleton'></p>
                <p class="release-date skeleton"></p>
            </div>
        `
  
        discographyDiv.appendChild(albumItem);
    }

    const responseDiscography = await fetch(`/get-albums-from-artist/${artistId}?limit=16&offset=${offSetCurrent}`);
    const dataDiscography = await responseDiscography.json();

    discographyDiv.innerHTML = '';
    dataDiscography.items.forEach(disco => {
        const albumItem = document.createElement("a");
        albumItem.classList.add('album-item', 'active');
        albumItem.setAttribute('data-id', disco.id);
        albumItem.setAttribute("href", `/album/${disco.id}`);
        const releaseDate = disco.release_date;
        const [ano, mes, dia] = releaseDate.split("-"); 
        const date = new Date(ano, mes - 1, dia);
        const dateBr = date.toLocaleDateString("pt-BR");
    
        albumItem.innerHTML = `
            <img src="${disco.images[0].url}" class="img-album" alt="Foto do álbum">
            <div class="info-track">
            <p class='album-name' title='${disco.name}'>${disco.name}</p>
            <p class="release-date">${dateBr === "Invalid Date" ? releaseDate : dateBr}</p>
            </div>
        `
    
        discographyDiv.appendChild(albumItem);
        })

        numberOfPages = Math.ceil(dataDiscography.total / 16);
        maxOffset = Math.floor(dataDiscography.total / 16) * 16;
}

async function loadPagination() {
    paginationNumbers.innerHTML = '';
    let startPage;
    if (!isMobile) {
        if (pageNumberCurrent <= 4) {
            // Para quando está nas 4 primeiras páginas
            startPage = 1;
        } else if (pageNumberCurrent > numberOfPages - 3) {
            // Para quando está nas últimas 5 páginas
            startPage = numberOfPages - 4;
        } else {
            // Para quando está no meio das páginas inicais e finais
            startPage = pageNumberCurrent - 2;
        }

        // Para evitar bugs
        startPage = Math.max(startPage, 1);

        for (let i = 0; i < Math.min(numberOfPages, 5); i++) {
            const pageNumberBtn = document.createElement("div");
            const currentPage = startPage + i;
    
            pageNumberBtn.setAttribute('data-id', currentPage);
            pageNumberBtn.classList.add('page-number');
            pageNumberBtn.innerHTML = `${currentPage}`;
    
            if (currentPage === pageNumberCurrent) {
                pageNumberBtn.classList.add('active');
            }
    
            pageNumberBtn.addEventListener('click', () => {
                pageNumberCurrent = currentPage;
                offSetCurrent = (pageNumberCurrent - 1) * 16;
                discographyDiv.innerHTML = '';
                loadAlbumInfo();
                loadPagination();
                checkOffset();
            });
    
            paginationNumbers.appendChild(pageNumberBtn);
        }
    } else {
        const pageNumberBtn = document.createElement("div");
        const currentPage = pageNumberCurrent;

        pageNumberBtn.setAttribute('data-id', currentPage);
        pageNumberBtn.classList.add('page-number');
        pageNumberBtn.innerHTML = `${currentPage}`;

        paginationNumbers.appendChild(pageNumberBtn);
    }

    checkOffset();
}

function checkOffset() {
    if (pageNumberCurrent === numberOfPages) {
        arrowRight.classList.remove('active');
        doubleArrowRight.classList.remove('active');
        doubleArrowRightSvg.forEach(div => {
            div.classList.remove('active');
        });
    } else {
        arrowRight.classList.add('active');
        doubleArrowRight.classList.add('active');
        doubleArrowRightSvg.forEach(div => {
            div.classList.add('active');
        });
    }
    
    if (offSetCurrent === 0) {
        arrowLeft.classList.remove('active');
        doubleArrowLeft.classList.remove('active');
        doubleArrowLeftSvg.forEach(div => {
            div.classList.remove('active');
        });
    } else {
        arrowLeft.classList.add('active');
        doubleArrowLeft.classList.add('active');
        doubleArrowLeftSvg.forEach(div => {
            div.classList.add('active');
        });
    }
}

arrowRight.addEventListener('click', () => {
    if (!arrowRight.classList.contains('active')) return;

    discographyDiv.innerHTML = '';

    pageNumberCurrent++;
    offSetCurrent = (pageNumberCurrent - 1) * 16;

    loadAlbumInfo();
    loadPagination();
    checkOffset();
});

doubleArrowRight.addEventListener('click', () => {
    if (!doubleArrowRight.classList.contains('active')) return;

    discographyDiv.innerHTML = '';

    pageNumberCurrent = numberOfPages;
    offSetCurrent = (pageNumberCurrent - 1) * 16;

    loadAlbumInfo();
    loadPagination();
    checkOffset();
});

arrowLeft.addEventListener('click', () => {
    if (!arrowLeft.classList.contains('active')) return;

    discographyDiv.innerHTML = '';

    pageNumberCurrent--;
    offSetCurrent = (pageNumberCurrent - 1) * 16;

    loadAlbumInfo();
    loadPagination();
    checkOffset();
});

doubleArrowLeft.addEventListener('click', () => {
    if (!doubleArrowLeft.classList.contains('active')) return;

    discographyDiv.innerHTML = '';

    pageNumberCurrent = 1;
    offSetCurrent = (pageNumberCurrent - 1) * 16;

    loadAlbumInfo();
    loadPagination();
    checkOffset();
});
