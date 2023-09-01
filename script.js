let pkm = [];
let coloredPkms = [];
let scrollInterval;
// Función para realizar la consulta a la PokeAPI y obtener los sprites por generación
async function fetchSpritesByGeneration(generation) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=151&limit=100`);
    const data = await response.json();
    const pokemonUrls = data.results.map(pokemon => pokemon.url.replace('pokemon', 'pokemon-species'));
  
    const sprites = [];
  
    for (const url of pokemonUrls) {
      const pokemonResponse = await fetch(url);
      const pokemonData = await pokemonResponse.json();
      const spriteUrl = pokemonData.varieties[0].pokemon.url;
      const spriteResponse = await fetch(spriteUrl);
      const spriteData = await spriteResponse.json();
      const sprite = spriteData.sprites.versions['generation-viii'].icons.front_default;
      pkm.push({ sprite: sprite, name: pokemonData.name });
      sprites.push(sprite);
    }
  
    return sprites;
  }
  
  // Función para verificar si el sprite está coloreado
  function isColored(sprite) {
    // Implementa tu lógica para determinar si el sprite está coloreado o no
    // Puedes utilizar cualquier criterio que desees, como comparar con una lista de sprites coloreados, por ejemplo
    // Retorna true si está coloreado, false si no lo está
    // Aquí se utiliza una lógica simple que verifica si el sprite contiene "_color" en su URL
    return coloredPkms.includes(sprite);
  }
  
  // Variables globales para el contador
  let totalPokemon = 0;
  let coloredPokemon = 0;
  
  // Función para obtener el estado almacenado en sessionStorage
  function getSavedState() {
    const savedState = localStorage.getItem('pokemonState');
  
    if (savedState) {
      return JSON.parse(savedState);
    } else {
      return {
        totalPokemon: 0,
        coloredPokemon: 0,
        coloredPkms: []
      };
    }
  }
  
  // Función para guardar el estado en sessionStorage
  function saveState() {
    const state = {
      totalPokemon: totalPokemon,
      coloredPokemon: coloredPokemon,
      coloredPkms: coloredPkms
    };
  
    localStorage.setItem('pokemonState', JSON.stringify(state));
  }
  
  // Función para obtener las imágenes y mostrarlas en la ventana
  async function displayPokemonSpritesByGeneration(generation) {
    const pokemonContainer = document.querySelector('.pokemon-container');
    pokemonContainer.innerHTML = '';
  
    const sprites = await fetchSpritesByGeneration(generation);
  
    const savedState = getSavedState();
    totalPokemon = sprites.length;
    coloredPokemon = savedState.coloredPokemon;
    coloredPkms = savedState.coloredPkms;
  
    sprites.forEach(sprite => {
      const pokemonImage = document.createElement('img');
      pokemonImage.src = sprite;
      pokemonImage.alt = 'Pokemon Sprite';
      pokemonImage.classList.add('pokemon-image');
      if (isColored(sprite)) {
        pokemonImage.classList.add('colored');
        coloredPokemon++;
      }
  
      pokemonImage.addEventListener('click', () => {
        toggleColor(pokemonImage);
        saveState(); // Guardar el estado actualizado
      });
  
      pokemonContainer.appendChild(pokemonImage);
    });
    animatePokemonContainer();
    updateCounter();
  }
  
  // Función para cambiar entre escala de grises y color
  function toggleColor(element) {
    element.classList.toggle('colored');
    removeDuplicated();
    if(!coloredPkms.includes(element.src)) coloredPkms.push(element.src);
    else {
        const index = coloredPkms.indexOf(element.src);
        if (index > -1) { // only splice array when item is found
            coloredPkms.splice(index, 1); // 2nd parameter means remove one item only
        }
    }
    if (element.classList.contains('colored')) {
      coloredPokemon++;
    } else {
      coloredPokemon--;
    }
    updateCounter();
  }
  
  // Función para actualizar el contador en la página
  function updateCounter() {
    const counterElement = document.querySelector('.counter');
    counterElement.textContent = `${coloredPkms.length}/${totalPokemon}`;
  }
  
  function searchPokemon(pokemonName) {
    const pokemonImages = document.querySelectorAll('.pokemon-image');
  
    pokemonImages.forEach(pokemonImage => {
      const sprite = pokemonImage.src.toLowerCase();
      let x = pkm.findIndex(pk => pk.sprite.toLowerCase() == sprite 
        && pk.name.toLowerCase() == pokemonName.toLowerCase());
      if (x !== -1) {
        toggleColor(pokemonImage);
        saveState(); // Guardar el estado actualizado
      }
    });
  }
  
  function clearPoke() {
    sessionStorage.clear();
    sessionStorage.removeItem('pokemonState');
    removeDuplicated();
  }

  function removeDuplicated() {
    coloredPkms = coloredPkms.filter(function(value, index, self) {
        return self.indexOf(value) === index;
      });
  }

  function animatePokemonContainer() {
    const pokemonContainer = document.querySelector('.pokemon-container');
    const pokemonImages = document.querySelectorAll('.pokemon-image');
  
    let offset = 0;
    let scrollSpeed = 0.5;
    const intervalDelay = 20;
  
    scrollInterval = setInterval(() => {
      offset += scrollSpeed;
      pokemonContainer.scrollTop = offset;
  
      if (offset >= pokemonContainer.scrollHeight - pokemonContainer.clientHeight) {
        scrollSpeed = -scrollSpeed; // Cambiar la dirección del desplazamiento
      } else if (offset <= 0) {
        scrollSpeed = Math.abs(scrollSpeed); // Restaurar la dirección original del desplazamiento
      }
    }, intervalDelay);
  }

  // Resto del código...
  const pokemonContainer = document.querySelector('.pokemon-container');

    pokemonContainer.addEventListener('mouseenter', () => {
        pokemonContainer.style.overflowY = 'scroll';
        clearInterval(scrollInterval);
    });

    pokemonContainer.addEventListener('mouseleave', () => {
        pokemonContainer.style.overflowY = 'hidden';
        animatePokemonContainer();
    });

  
  // Ejemplo de uso: Mostrar los sprites de la Generación 1
  displayPokemonSpritesByGeneration(1);
  
  ComfyJS.onCommand = ( user, command, message, flags, extra ) => {
    if( (flags.broadcaster || flags.mod) && command === "poke" ) {
        searchPokemon(message);
    }
    if( (flags.broadcaster || flags.mod) && command === "clearpoke" ) {
        clearPoke();
    }
  }
  ComfyJS.Init( "ArtLira" );