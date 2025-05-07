require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = globalThis.fetch;
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
let searchQuery;

// ID da playlist "Top 50 Global"
const playlistIdTopTracks = "0sDahzOkMWOmLXfTMf2N4N";

app.use(cors());

// Define a pasta do public como estática
app.use(express.static(path.join(__dirname, "./public")));

// Rotas para servir as páginas HTML
app.get("/", (req, res) => {
  searchQuery = req.query.search ? req.query.search.trim() : null;
    
  if (searchQuery) {
    // Se houver pesquisa, redireciona para a página de resultados
    return res.sendFile(path.join(__dirname, "./public/pages", "search-artists-and-tracks.html"));
  }

  // Se não houver pesquisa, carrega a página inicial
  res.sendFile(path.join(__dirname, "./public/pages", "index.html"));
});

app.get("/sobre", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/pages", "sobre.html"));
});

app.get("/404", (req, res) => { 
  res.status(404).sendFile(path.join(__dirname, "./public/pages", "404.html"));
});

app.get("/artist/:id", async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "./public/pages", "artist.html"));
  }
  catch (error) {
    console.error("Erro ao obter token:", error);
  }
});

app.get("/music/:id", async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "./public/pages", "track.html"));
  }
  catch (error) {
    console.error("Erro ao obter token:", error);
  }
});

app.get("/album/:id", async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "./public/pages", "album.html"));
  }
  catch (error) {
    console.error("Erro ao obter token:", error);
  }
});

app.get("/discography/:id", async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "./public/pages", "discography.html"));
  }
  catch (error) {
    console.error("Erro ao obter token:", error);
  }
});

async function getAccessToken() {
  const { CLIENT_ID, CLIENT_SECRET } = process.env;
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
    });
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Erro ao obter token:", error);
  }
}

app.get('/get-top-tracks', async (req, res) => {
  try {
    const token = await getAccessToken();
    if (!token) {
      console.log("Token não obtido. Abortando a busca.");
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistIdTopTracks}/tracks`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error("Erro ao buscar as informações:", error);
  }
});

async function getArtist(id) {
  try {
    const token = await getAccessToken();
    if (!token) {
      console.log("Token não obtido com sucesso.")
    }

    const response = await fetch(
      `https://api.spotify.com/v1/artists/${id}`,
      {
        headers: { Authorization: `Bearer ${token}`},
      }
    )

    const data = await response.json()

    const artist = {
      "followers": data.followers.total,
      "id": data.id,
      "image": data.images[0].url,
      "name": data.name,
      "uri": data.uri,
      "genres": data.genres
    }

    return artist;

  } catch (error) {
    console.error("Erro ao buscar as informações:", error);
  }
}

async function getTrack(id) {
  try {
    const token = await getAccessToken();
    if (!token) {
      console.log("Token não obtido com sucesso.")
      return null;
    }

    const response = await fetch(
      `https://api.spotify.com/v1/tracks/${id}`,
      {
        headers: { Authorization: `Bearer ${token}`},
      }
    )

    if (!response.ok) {
      console.log(`Erro do Spotify: ${response.status}`);
      return null; // Isso permite que a rota retorne 404
    }

    const data = await response.json()

    return data;

  } catch (error) {
    console.error("Erro ao buscar as informações:", error);
  }
}

app.get('/get-top-artists', async (req, res) => {
  try {
    const token = await getAccessToken();
    if (!token) {
      console.log("Token não obtido. Abortando a busca.");
      return;
    }

    const quant = parseInt(req.query.quant) || 3;

    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistIdTopTracks}/tracks`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await response.json();
    
    const artistMentions = {};

    data.items.forEach(track => {
      track.track.artists.forEach(artist => {
        if (artistMentions[artist.id]) {
          artistMentions[artist.id].count++;
        } else {
          artistMentions[artist.id] = { 
            count: 1,
            name: artist.name,
            id: artist.id 
          };
        }
      });
    });

    const sortedArtists = Object.values(artistMentions)
      .sort((a, b) => b.count - a.count)
      .slice(0, quant);

    const artistPromises = sortedArtists.map(artist => getArtist(artist.id));
    const topArtists = await Promise.all(artistPromises);

    res.json(topArtists)

  } catch (error) {
    console.error("Erro ao buscar as informações:", error);
  }
});

async function searchArtistByName(artistName, quant, offset = 0) {
  const token = await getAccessToken();
  
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=${quant}&offset=${offset}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  const data = await response.json();
  if (!data?.artists?.items?.length) {
    return null; // Caso não encontre nenhum artista
  }

  const artists = data.artists.items;

  return artists;
}

async function searchAlbumByName(albumName, quant, offset = 0) {
  const token = await getAccessToken();
  
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(albumName)}&type=album&limit=${quant}&offset=${offset}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  const data = await response.json();

  return data;
}

// Rota que trata a busca do artista
app.get('/search-artist/:id', async (req, res) => {
  const artistId = req.params.id;
  try {
    const artist = await getArtist(artistId);
    if (!artist) {
      return res.status(404).json({ error: 'Artista não encontrado' });
    }

    res.json(artist);
  } catch (error) {
    console.error("Erro ao buscar artista:", error);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Rota que trata a busca da música
app.get('/search-track/:id', async (req, res) => {
  const trackId = req.params.id;
  try {
    const track = await getTrack(trackId);
    if (!track) {
      return res.status(404).json({ error: 'Música não encontrada' });
    }

    res.json(track);
  } catch (error) {
    console.error("Erro ao buscar música:", error);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Rota para buscar músicas e artistas
async function searchTrackAndArtist(search, quant, offset = 0) {
  const token = await getAccessToken();

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(search)}&type=track,artist&limit=${quant}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    return { error: "Erro ao buscar músicas", details: error.message };
  }
}

// Rota para buscar músicas
async function searchTrack(search, quant, offset = 0) {
  const token = await getAccessToken();

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(search)}&type=track&limit=${quant}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    return { error: "Erro ao buscar músicas", details: error.message };
  }
}

app.get('/get-track-and-artist/:search?', async (req, res) => {
  const limit = req.query.limit;
  const offset = req.query.offset;
  let searchForm = req.params.search;
  let search;

  if (searchQuery && !searchForm) {
    search = searchQuery;
  } else {
    search = searchForm;
  }

  try {
    const track = await searchTrack(search, limit, offset);
    const artist = await searchArtistByName(search, limit, offset);
    const album = await searchAlbumByName(search, limit, offset);
    
    searchAlbumByName
    res.json({ track, artist, album, search });
  } catch (error) {
    console.error("Erro ao buscar as informações:", error);
  }
});

async function getSearchLrclib(artist, track) {
  const response = await fetch(`https://lrclib.net/api/get?artist_name=${encodeURI(artist)}&track_name=${encodeURI(track)}`);
  const data = await response.json();

  return data;
}

app.get('/get-letter/:artist/:track', async (req, res) => {
  const artist = req.params.artist;
  const track = req.params.track;

  try {
    const dataLrclib = await getSearchLrclib(artist, track);

    res.json(dataLrclib);
  } catch (error) {
    console.error("Erro ao buscar as informações:", error);
  }
});

app.get('/get-top-tracks-from-artist/:id', async (req, res) => {
  const id = req.params.id;

  const token = await getAccessToken();
    if (!token) {
      console.log("Token não obtido. Abortando a busca.");
      return;
    }

  const response = await fetch(`
    https://api.spotify.com/v1/artists/${id}/top-tracks?market=BR`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  const data = await response.json();

  res.json(data);
})

app.get('/get-albums-from-artist/:id', async (req, res) => {
  const offset = req.query.offset || 0;
  const limit = req.query.limit || 10;
  const id = req.params.id;

  const token = await getAccessToken();
    if (!token) {
      console.log("Token não obtido. Abortando a busca.");
      return;
    }

  const response = await fetch(`
    https://api.spotify.com/v1/artists/${id}/albums?limit=${limit}&offset=${offset}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  const data = await response.json();

  res.json(data);
})

app.get('/get-info-from-album/:id', async (req, res) => {
  const id = req.params.id;

  const token = await getAccessToken();
    if (!token) {
      console.log("Token não obtido. Abortando a busca.");
      return;
    }

  const response = await fetch(`
    https://api.spotify.com/v1/albums/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!response.ok) {
    console.log(`Erro no Spotify: ${response.status}`);
    return res.status(404).json({Error: 'Álbum não encontrado'});
  }

  const data = await response.json();

  res.json(data);
})

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "./public/pages", "404.html"));
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});