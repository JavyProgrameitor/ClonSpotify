import { API_URL } from "./const.js";
import { API_LOAD } from "./const.js";
import {
  getFavorites,
  saveFavorites,
  toggleFavorite,
  isFavorite,
} from "./local.js";

document.addEventListener("DOMContentLoaded", () => {
  const toggleFilters = document.getElementById("toggle-filters");
  const filterList = document.getElementById("filter-list");
  const filterArrow = document.getElementById("filter-arrow");
  const openModal = document.getElementById("open-modal");
  const closeModal = document.getElementById("close-modal");
  const modal = document.getElementById("upload-modal");
  const form = document.getElementById("upload-form");

  const tbody = document.querySelector("tbody");
  const allFilter = document.getElementById("all-filter");
  const favoritesFilter = document.getElementById("favorites-filter");

  const repeatButton = document.getElementById("repeat");
  const previousButton = document.getElementById("previous");
  const playPauseButton = document.getElementById("play");
  const nextButton = document.getElementById("next");
  const shuffleButton = document.getElementById("shuffle");
  const volumeSlider = document.getElementById("volume");
  const progressBarContainer = document.getElementById("progress-bar");
  const progressBar = progressBarContainer.querySelector("div");
  const startTime = document.getElementById("startTime");
  const endTime = document.getElementById("endTime");
  const currentSongTitle = document.getElementById("songNow");
  const currentSongArtist = document.getElementById("autor");
  const imgDiv = document.getElementById("img");

  
  const volumeIcon = document.getElementById("volume-icon");
  
  volumeSlider.addEventListener("input", (event) => {
    const volumeLevel = event.target.value;
  
    // Cambiar el volumen del audio
    audioPlayer.volume = volumeLevel / 100;
  
    // Cambiar el ícono al mínimo
    if (volumeLevel == 0) {
      volumeIcon.setAttribute("name", "volume-mute");
      volumeIcon.setAttribute("color", "#ece6e6");
    } else {
      volumeIcon.setAttribute("name", "volume-low");
      volumeIcon.setAttribute("color", "#ffffff");
    }
  });
  

  let audioPlayer = document.getElementById("audio-player");
  if (!audioPlayer) {
    audioPlayer = document.createElement("audio");
    audioPlayer.id = "audio-player";
    document.body.appendChild(audioPlayer);
  }

  let currentSongIndex = 0;
  let isShuffle = false;
  let isRepeat = false;
  let currentSongs = [];


  const fetchSongs = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Error fetching songs.");
      const songs = await response.json();
      currentSongs = [...songs]; // Don´t duplicate
      tbody.innerHTML = "";

      for (const song of songs) {
        const duration = await getAudioDuration(song.filepath);
        const row = createSongRow(song, duration);
        tbody.appendChild(row);
        const coverImg = (song.cover);
        cover = coverImg;
      }

      addFavoriteListeners();
    } catch (error) {
    }
  };

  const getAudioDuration = async (filepath) => {
    return new Promise((resolve) => {
      const audio = new Audio(filepath);
      audio.addEventListener("loadedmetadata", () => {
        const duration = audio.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60).toString().padStart(2, "0");
        resolve(`${minutes}:${seconds}`);
      });
    });
  };

  const updateCover = (coverUrl) => {
    imgDiv.style.backgroundImage = `url('${coverUrl}')`;
    imgDiv.style.backgroundSize = "cover";
    imgDiv.style.backgroundPosition = "center";
  };

  const loadSong = (index) => {
    const song = currentSongs[index];
    if (!song) return;

    currentSongIndex = index;
    audioPlayer.src = song.filepath;
    currentSongTitle.textContent = song.title;
    currentSongArtist.textContent = song.artist;

    updateCover(song.cover);

    audioPlayer.addEventListener("loadedmetadata", () => {
      const duration = audioPlayer.duration;
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60).toString().padStart(2, "0");
      endTime.textContent = `${minutes}:${seconds}`;
    });

    audioPlayer.load();
  };

  const updateProgress = () => {
    const currentTime = audioPlayer.currentTime;
    const duration = audioPlayer.duration;

    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;

    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60).toString().padStart(2, "0");
    startTime.textContent = `${minutes}:${seconds}`;
  };

  const playSong = () => {
    audioPlayer.play();
    playPauseButton.innerHTML = '<box-icon name="pause-circle" color="#eadede" size="lg"></box-icon>';
  };

  const pauseSong = () => {
    audioPlayer.pause();
    playPauseButton.innerHTML = '<box-icon name="play-circle" color="#eadede" size="lg"></box-icon>';
  };

  const playNextSong = () => {
    if (isShuffle) {
      currentSongIndex = Math.floor(Math.random() * currentSongs.length);
    } else {
      currentSongIndex = (currentSongIndex + 1) % currentSongs.length;
    }
    loadSong(currentSongIndex);
    playSong();
  };

  const playPreviousSong = () => {
    currentSongIndex = (currentSongIndex - 1 + currentSongs.length) % currentSongs.length;
    loadSong(currentSongIndex);
    playSong();
  };



  tbody.addEventListener("click", (event) => {
    const button = event.target.closest(".play-button");
    if (button) {
      const songFile = button.getAttribute("data-file");
      currentSongIndex = currentSongs.findIndex((song) => song.filepath === songFile);
      loadSong(currentSongIndex);
      playSong();
    }
  });


  // Events bottom and audio
  audioPlayer.addEventListener("timeupdate", updateProgress);
  audioPlayer.addEventListener("ended", () => {
    if (isRepeat) {
      playSong();
    } else {
      playNextSong();
    }
  });

  playPauseButton.addEventListener("click", () => {
    if (audioPlayer.paused) {
      playSong();
    } else {
      pauseSong();
    }
  });

  nextButton.addEventListener("click", playNextSong);
  previousButton.addEventListener("click", playPreviousSong);

  repeatButton.addEventListener("click", () => {
    isRepeat = !isRepeat;
    repeatButton.style.color = isRepeat ? "#30b116" : "#ffffff";
  });

  shuffleButton.addEventListener("click", () => {
    isShuffle = !isShuffle;
    shuffleButton.style.color = isShuffle ? "#30b116" : "#ffffff";
  });

  volumeSlider.addEventListener("input", (e) => {
    audioPlayer.volume = e.target.value / 100;
  });

  progressBarContainer.addEventListener("click", (e) => {
    const containerWidth = progressBarContainer.offsetWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;

    audioPlayer.currentTime = (clickX / containerWidth) * duration;
  });


  const createSongRow = (song, duration) => {

    const tr = document.createElement("tr");
    // Clase `group`
    tr.className = "border-b border-gray-400 hover:bg-black group cursor-pointer";
    const heartType = isFavorite(song.id) ? "solid" : "regular";
    tr.innerHTML = `
      <td class="py-2 px-4 text-center relative">
        <div class="hidden group-hover:flex justify-center items-center">
        <button class="play-button" data-file="${song.filepath}" ><img src="./src/img/play.png" class="w-8" /></button>
        </div>
      </td>
      <td class="py-2 px-4">${song.title}</td>
      <td class="py-2 px-4">${song.artist}</td>
      <td class="py-2 px-4 text-center">${duration}</td>
      <td class="py-2 px-4 text-center">
        <box-icon name="heart" type="${heartType}" color="green" class="cursor-pointer" data-id="${song.id}"></box-icon>
      </td>
    `;
    return tr;
  };


  document.addEventListener("click", (event) => {
    const button = event.target.closest(".play-button");

    const filepath = button.getAttribute("data-file");
    const pausePlayButton = document.querySelector(".custom-button");

    //Create audio
    let audioPlayer = document.getElementById("audio-player");
    if (!audioPlayer) {
      audioPlayer = document.createElement("audio");
      audioPlayer.id = "audio-player";
      document.body.appendChild(audioPlayer);
    }

    // Configurar el reproductor y reproducir
    audioPlayer.src = filepath;
    audioPlayer.play().then(() => {
      console.log(`Reproduciendo: ${filepath}`);
    })
      .catch((error) => {
        console.error("Error al reproducir el audio:", error);
      });

    pausePlayButton.addEventListener("click", () => {
      if (audioPlayer.paused) {
        // if pause , play
        audioPlayer.play().then(() => {
          pausePlayButton.textContent = "PAUSE";
        }).catch((error) => {
          console.error("Error al intentar reproducir:", error);
        });
      } else {
        // if play, pause
        audioPlayer.pause();
        pausePlayButton.textContent = "PLAY";
      }
    });
  });

  // Change icons
  toggleFilters.addEventListener("click", () => {
    if (filterList.classList.contains("hidden")) {
      filterList.classList.remove("hidden");
      filterArrow.setAttribute("name", "down-arrow"); // Down
    } else {
      filterList.classList.add("hidden");
      filterArrow.setAttribute("name", "right-arrow"); // right
    }
  });

  //Favorites
  const renderSongs = async (filterFavorites = false) => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Error fetching songs.");
      const songs = await response.json();

      tbody.innerHTML = "";

      const favorites = getFavorites();
      const filteredSongs = filterFavorites ? songs.filter((song) => favorites.includes(song.id)): songs;

      for (const song of filteredSongs) {
        const duration = await getAudioDuration(song.filepath);
        const row = createSongRow(song, duration);
        tbody.appendChild(row);
      }
      addFavoriteListeners();
    } catch (error) {
      console.error("Error al renderizar canciones:", error);
    }
  };

  const addFavoriteListeners = () => {
    const favoriteIcons = document.querySelectorAll("box-icon[data-id]");
    favoriteIcons.forEach((icon) => {
      icon.addEventListener("click", () => {
        const songId = parseInt(icon.getAttribute("data-id"));
        toggleFavorite(songId);
        // Icons Solid or Regular
        const isFav = isFavorite(songId);
        icon.setAttribute("type", isFav ? "solid" : "regular");
      });
    });
  };

  allFilter.addEventListener("click", () => {
    renderSongs(false);
  });
  // Clicks Favorites
  favoritesFilter.addEventListener("click", () => {
    renderSongs(true);
  });

  openModal.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Form
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    //Data form
    const songFile = document.getElementById("song-file").files[0];
    const songTitle = document.getElementById("song-title").value.trim();
    const songAuthor = document.getElementById("song-author").value.trim();
    const songCover = document.getElementById("song-cover").files[0];

    if (!songFile || !songTitle || !songAuthor) {
      alert("Please data not found");
      return;
    }

    formData.append("music", songFile); 
    formData.append("title", songTitle); 
    formData.append("artist", songAuthor); 
    formData.append("cover", songCover); 

    try {
      const response = await fetch(`${API_LOAD}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error up data");
      }

      const result = await response.json();
      console.log("Exit up:", result);
      // Recharing 
      await fetchSongs();
      // Close modal and reset form
      modal.classList.add("hidden");
      form.reset();
    } catch (error) {
      console.error("Error up:", error);
    }
  });

  fetchSongs();
});

