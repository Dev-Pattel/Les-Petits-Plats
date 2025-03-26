"use strict";

/* ----------------------------
   FONCTIONS D'AFFICHAGE
---------------------------- */
function displayRecipes(recipesToDisplay) {
  const recipesContainer = document.getElementById("recipes-cards");
  recipesContainer.innerHTML = "";

  recipesToDisplay.forEach((recipe) => {
    const col = document.createElement("div");
    col.classList.add("col");

    // Tronquer la description
    const truncatedDescription =
      recipe.description.length > 186
        ? recipe.description.slice(0, 186) + "..."
        : recipe.description;

    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="position-relative">
          <img 
            src="assets/images/${recipe.image}" 
            class="card-img-top" 
            alt="${recipe.name}"
          >
          <span
            class="time-badge position-absolute top-0 end-0 text-dark px-2 py-1 m-2"
          >
            ${recipe.time} min
          </span>
        </div>

        <div class="card-body d-flex flex-column px-3">
          <div class="d-flex justify-content-between align-items-center mt-3">
            <h2 class="card-title fs-5">${recipe.name}</h2>
          </div>
          <div>
            <h3 class="mt-3 mb-3">Recette</h3>
            <p class="card-text flex-grow-1">${truncatedDescription}</p>
          </div>
          <h3 class="mt-3 mb-3">Ingrédients</h3>
          <ul class="ingredients-list list-unstyled mb-3">
            ${recipe.ingredients
              .map((ing) => {
                const ingredientName = `<span class="ingredient-name">${ing.ingredient}</span>`;
                let ingredientQuantity = "";
                if (ing.quantity) {
                  const unit = ing.unit ? ` ${ing.unit}` : "";
                  ingredientQuantity = `<span class="ingredient-qty">${ing.quantity}${unit}</span>`;
                }
                return `
                  <li class="mb-2">
                    ${ingredientName}
                    <br>
                    ${ingredientQuantity}
                  </li>
                `;
              })
              .join("")}
          </ul>
        </div>
      </div>
    `;
    recipesContainer.appendChild(col);
  });

  // Mise à jour du compteur
  const recipesCountSpan = document.getElementById("recipes-count");
  if (recipesToDisplay.length > 0) {
    recipesCountSpan.textContent = `${recipesToDisplay.length} recette(s) trouvée(s)`;
  } else {
    recipesCountSpan.textContent = `Aucune recette trouvée`;
  }
}

/* ----------------------------------
   AFFICHAGE INITIAL
---------------------------------- */
displayRecipes(recipes);


/* ----------------------------
   BARRE DE RECHERCHE PRINCIPALE (PROGRAMMATION FONCTIONNELLE)
---------------------------- */
const mainSearchInput = document.getElementById("search-bar");
const closeIcon = document.getElementById("close-icon");  
const searchIcon = document.getElementById("search-icon");
const searchForm = document.getElementById("search-form");

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
});

mainSearchInput.addEventListener("input", () => {
  const value = mainSearchInput.value.trim();
  if (value.length > 0) {
    closeIcon.classList.remove("d-none");
  } else {
    closeIcon.classList.add("d-none");
  }
});

searchIcon.addEventListener("click", (event) => {
  event.preventDefault();   
  handleMainSearch();
});

mainSearchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault(); 
    handleMainSearch();
  }
});

closeIcon.addEventListener("click", () => {
  mainSearchInput.value = "";
  closeIcon.classList.add("d-none");
  displayRecipes(recipes); 
  populateIngredientList(recipes); 
  populateUstensilList(recipes);
  populateDeviceList(recipes);
});

function handleMainSearch() {
  const searchTerm = mainSearchInput.value.toLowerCase().trim();

  // Si la recherche fait moins de 3 caractères, on réaffiche tout
  if (searchTerm.length < 3) {
    displayRecipes(recipes);
    populateIngredientList(recipes);
    populateUstensilList(recipes);
    populateDeviceList(recipes);
    return;
  }

  // Filtrer selon nom / description / ingrédients
  const filteredRecipes = recipes.filter((recipe) => {
    const inName = recipe.name.toLowerCase().includes(searchTerm);
    const inDescription = recipe.description.toLowerCase().includes(searchTerm);
    const inIngredients = recipe.ingredients.some((ing) =>
      ing.ingredient.toLowerCase().includes(searchTerm)
    );
    return inName || inDescription || inIngredients;
  });

  displayRecipes(filteredRecipes);
  populateIngredientList(filteredRecipes);
  populateUstensilList(filteredRecipes);
  populateDeviceList(filteredRecipes);
}


/* --------------------------
   FILTRE PAR INGREDIENTS
-------------------------- */
const dropdownIngredientBtn = document.getElementById("dropdown-ingredients-btn");
const dropdownIngredientMenu = document.getElementById("dropdown-ingredients-menu");

// Liste d'ingrédients sélectionnés
let selectedIngredients = [];

// Fermeture du/des dropdown(s) si on clique à l'extérieur du/des menu(s)
document.addEventListener("click", (event) => {
  if (
    !dropdownIngredientBtn.contains(event.target) && 
    !dropdownIngredientMenu.contains(event.target)
  ) {
    dropdownIngredientMenu.classList.remove("show");
  }
});

// Récupération de tous les ingrédients
function getAllIngredients(recipesArr) {
  const ingredientSet = new Set();
  recipesArr.forEach((recipe) => {
    recipe.ingredients.forEach((ingObj) => {
      ingredientSet.add(ingObj.ingredient.toLowerCase());
    });
  });
  return Array.from(ingredientSet).sort();
}

// Construction du dropdown (ingrédients)
function populateIngredientList(recipesToConsider) {
  const container = document.getElementById("dropdown-filter-data-ingredients");
  const ingredientSearchInput = document.getElementById("ingredients-search");
  const typedValue = ingredientSearchInput.value.toLowerCase().trim();

  let allIngredients = getAllIngredients(recipesToConsider);

  // Si l'utilisateur a tapé des caractères, filtrage de la liste d'ingrédients
  if (typedValue.length > 0) {
    allIngredients = allIngredients.filter(ing => ing.includes(typedValue));
  }

  // Génération du code
  const ingHtml = allIngredients.map((ing) => {
    const isSelected = selectedIngredients.includes(ing);

    if (isSelected) {
      return `
        <div 
          class="list-group-item d-flex justify-content-between align-items-center selected-ing"
          data-ingredient="${ing}"
        >
          <span>${ing}</span>
          <i class="fa fa-times remove-cross" title="Retirer cet ingrédient"></i>
        </div>
      `;
    } else {
      return `
        <a href="#"
           class="list-group-item list-group-item-action"
           data-ingredient="${ing}"
        >
          ${ing}
        </a>
      `;
    }
  }).join("");

  container.innerHTML = ingHtml;

  // Écouteurs sur les liens "non-sélectionnés"
  const normalLinks = container.querySelectorAll('.list-group-item-action');
  normalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const ingredientClicked = link.dataset.ingredient;
      handleIngredientClick(ingredientClicked);
    });
  });

  // Écouteurs sur les items déjà sélectionnés
  const selectedItems = container.querySelectorAll('.selected-ing');
  selectedItems.forEach(div => {
    const cross = div.querySelector('.remove-cross');
    cross.addEventListener('click', (e) => {
      e.stopPropagation();
      const ing = div.dataset.ingredient;
      // Retirer l'ingrédient
      selectedIngredients = selectedIngredients.filter(i => i !== ing);

      // Mettre à jour
      displaySelectedIngredients();
      filterAndDisplayRecipes();
    });
  });
}

// Ouvrir/fermer le menu au clic sur le bouton
dropdownIngredientBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  dropdownIngredientMenu.classList.toggle("show");
});

// Clic sur un ingrédient => l'ajoute + filtre
function handleIngredientClick(ingredient) {
  if (!selectedIngredients.includes(ingredient)) {
    selectedIngredients.push(ingredient);
  }
  displaySelectedIngredients();
  filterAndDisplayRecipes();
}

// Barre de recherche interne (#ingredients-search)
const ingredientSearchField = document.getElementById("ingredients-search");
ingredientSearchField.addEventListener("input", () => {
  let filtered = filterByAllSelections(); 
  // On re-peuple la liste d’ingrédients avec la saisie
  populateIngredientList(filtered);
});

// Afficher les "tags" d'ingrédients (et plus tard ustensiles/appareils)
function displaySelectedIngredients() {
  const container = document.getElementById("selected-tags");
  container.innerHTML = ""; 

  // 1) Ingrédients
  selectedIngredients.forEach((ing) => {
    const tag = document.createElement("div");
    tag.classList.add("ingredient-tag");
    tag.innerHTML = `
      <span class="tag-text">${ing}</span>
      <button class="tag-remove" title="Retirer cet ingrédient">
        <i class="fa fa-times"></i>
      </button>
    `;

    const removeBtn = tag.querySelector(".tag-remove");
    removeBtn.addEventListener("click", () => {
      selectedIngredients = selectedIngredients.filter((i) => i !== ing);
      displaySelectedIngredients();
      filterAndDisplayRecipes();
    });

    container.appendChild(tag);
  });

}


/* --------------------------
   FILTRE PAR USTENSILES
-------------------------- */
// On récupère le bouton et le menu
const dropdownUstensilsBtn = document.querySelector("#dropdown-filter-ustensils button");
const dropdownUstensilsMenu = document.querySelector("#dropdown-filter-ustensils .dropdown-menu");

// Liste d'ustensiles sélectionnés
let selectedUstensils = [];

// Fermer le menu si clic dehors
document.addEventListener("click", (event) => {
  if (
    !dropdownUstensilsBtn.contains(event.target) &&
    !dropdownUstensilsMenu.contains(event.target)
  ) {
    dropdownUstensilsMenu.classList.remove("show");
  }
});

// getAllUstensils
function getAllUstensils(recipesArr) {
  const ustSet = new Set();
  recipesArr.forEach(r => {
    // Dans l'objet JSON, je suppose que "ustensils" est un array
    if (r.ustensils) {
      r.ustensils.forEach(u => ustSet.add(u.toLowerCase()));
    }
  });
  return Array.from(ustSet).sort();
}

function populateUstensilList(recipesToConsider) {
  const container = document.getElementById("dropdown-filter-data-ustensils");
  const ustSearchInput = document.getElementById("ustensils-search");
  const typedValue = ustSearchInput.value.toLowerCase().trim();

  let allUstensils = getAllUstensils(recipesToConsider);

  // Si saisie, on filtre
  if (typedValue.length > 0) {
    allUstensils = allUstensils.filter(u => u.includes(typedValue));
  }

  // Génération du HTML
  const ustHtml = allUstensils.map(u => {
    const isSelected = selectedUstensils.includes(u);
    if (isSelected) {
      return `
        <div 
          class="list-group-item d-flex justify-content-between align-items-center selected-ing"
          data-ust="${u}"
        >
          <span>${u}</span>
          <i class="fa fa-times remove-cross" title="Retirer cet ustensile"></i>
        </div>
      `;
    } else {
      return `
        <a href="#"
           class="list-group-item list-group-item-action"
           data-ust="${u}"
        >
          ${u}
        </a>
      `;
    }
  }).join("");

  container.innerHTML = ustHtml;

  // Écouteurs "non-sélectionnés"
  const normalLinks = container.querySelectorAll('.list-group-item-action');
  normalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const clickedUst = link.dataset.ust;
      handleUstensilClick(clickedUst);
    });
  });

  // Écouteurs "sélectionnés"
  const selectedUstItems = container.querySelectorAll('.selected-ing');
  selectedUstItems.forEach(div => {
    const cross = div.querySelector('.remove-cross');
    cross.addEventListener('click', (e) => {
      e.stopPropagation();
      const ust = div.dataset.ust;
      selectedUstensils = selectedUstensils.filter(x => x !== ust);

      displaySelectedIngredients();
      filterAndDisplayRecipes();
    });
  });
}

dropdownUstensilsBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  dropdownUstensilsMenu.classList.toggle("show");
});

// Ajout de l'ustensile puis filtrage
function handleUstensilClick(ust) {
  if (!selectedUstensils.includes(ust)) {
    selectedUstensils.push(ust);
  }
  displaySelectedIngredients();
  filterAndDisplayRecipes();
}

// Barre de recherche interne
const ustensilsSearchField = document.getElementById("ustensils-search");
ustensilsSearchField.addEventListener("input", () => {
  let filtered = filterByAllSelections();
  populateUstensilList(filtered);
});


/* --------------------------
   FILTRE PAR APPAREILS
-------------------------- */
const dropdownDeviceBtn = document.querySelector("#dropdown-filter-device button");
const dropdownDeviceMenu = document.querySelector("#dropdown-filter-device .dropdown-menu");

// Liste d'appareils sélectionnés
let selectedDevices = [];

document.addEventListener("click", (event) => {
  if (
    !dropdownDeviceBtn.contains(event.target) &&
    !dropdownDeviceMenu.contains(event.target)
  ) {
    dropdownDeviceMenu.classList.remove("show");
  }
});

function getAllDevices(recipesArr) {
  const devSet = new Set();
  recipesArr.forEach(r => {
    if (r.appliance) {
      devSet.add(r.appliance.toLowerCase());
    }
  });
  return Array.from(devSet).sort();
}

function populateDeviceList(recipesToConsider) {
  const container = document.getElementById("dropdown-filter-data-device");
  const devSearchInput = document.getElementById("device-search");
  const typedValue = devSearchInput.value.toLowerCase().trim();

  let allDevices = getAllDevices(recipesToConsider);
  if (typedValue.length > 0) {
    allDevices = allDevices.filter(d => d.includes(typedValue));
  }

  const devHtml = allDevices.map(d => {
    const isSelected = selectedDevices.includes(d);
    if (isSelected) {
      return `
        <div 
          class="list-group-item d-flex justify-content-between align-items-center selected-ing"
          data-dev="${d}"
        >
          <span>${d}</span>
          <i class="fa fa-times remove-cross" title="Retirer cet appareil"></i>
        </div>
      `;
    } else {
      return `
        <a href="#"
           class="list-group-item list-group-item-action"
           data-dev="${d}"
        >
          ${d}
        </a>
      `;
    }
  }).join("");

  container.innerHTML = devHtml;
 
  const normalLinks = container.querySelectorAll('.list-group-item-action');
  normalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const clickedDev = link.dataset.dev;
      handleDeviceClick(clickedDev);
    });
  });

  const selectedDevItems = container.querySelectorAll('.selected-ing');
  selectedDevItems.forEach(div => {
    const cross = div.querySelector('.remove-cross');
    cross.addEventListener('click', (e) => {
      e.stopPropagation();
      const dv = div.dataset.dev;
      selectedDevices = selectedDevices.filter(x => x !== dv);

      displaySelectedIngredients();
      filterAndDisplayRecipes();
    });
  });
}

// Bouton
dropdownDeviceBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  dropdownDeviceMenu.classList.toggle("show");
});

function handleDeviceClick(dev) {
  if (!selectedDevices.includes(dev)) {
    selectedDevices.push(dev);
  }
  displaySelectedIngredients();
  filterAndDisplayRecipes();
}

const deviceSearchField = document.getElementById("device-search");
deviceSearchField.addEventListener("input", () => {
  let filtered = filterByAllSelections();
  populateDeviceList(filtered);
});


/* -----------------------------------------
   COMBINAISON FINALE : filterAndDisplayRecipes
----------------------------------------- */
function filterAndDisplayRecipes() {
  let filtered = [...recipes];

  // 1) Par ingrédients
  if (selectedIngredients.length > 0) {
    filtered = filtered.filter(recipe =>
      selectedIngredients.every(selIng =>
        recipe.ingredients.some(ingObj =>
          ingObj.ingredient.toLowerCase() === selIng.toLowerCase()
        )
      )
    );
  }

  // 2) Par ustensiles
  if (selectedUstensils.length > 0) {
    filtered = filtered.filter(recipe =>
      selectedUstensils.every(selUst =>
        recipe.ustensils &&
        recipe.ustensils.some(u => u.toLowerCase() === selUst.toLowerCase())
      )
    );
  }

  // 3) Par appareils
  if (selectedDevices.length > 0) {
    filtered = filtered.filter(recipe =>
      selectedDevices.includes(recipe.appliance.toLowerCase())
    );
  }

  // Affichage des recettes
  displayRecipes(filtered);

  // Mise à jour des 3 dropdowns
  populateIngredientList(filtered);
  populateUstensilList(filtered);
  populateDeviceList(filtered);
}


function filterByAllSelections() {
  let filtered = [...recipes];

  if (selectedIngredients.length > 0) {
    filtered = filtered.filter(recipe =>
      selectedIngredients.every(selIng =>
        recipe.ingredients.some(ingObj =>
          ingObj.ingredient.toLowerCase() === selIng.toLowerCase()
        )
      )
    );
  }
  if (selectedUstensils.length > 0) {
    filtered = filtered.filter(recipe =>
      selectedUstensils.every(selUst =>
        recipe.ustensils &&
        recipe.ustensils.some(u => u.toLowerCase() === selUst.toLowerCase())
      )
    );
  }
  if (selectedDevices.length > 0) {
    filtered = filtered.filter(recipe =>
      selectedDevices.includes(recipe.appliance.toLowerCase())
    );
  }

  return filtered;
}

function displaySelectedIngredients() {
  const container = document.getElementById("selected-tags");
  container.innerHTML = ""; 

  // 1) Ingrédients
  selectedIngredients.forEach((ing) => {
    const tag = document.createElement("div");
    tag.classList.add("ingredient-tag");
    tag.innerHTML = `
      <span class="tag-text">${ing}</span>
      <button class="tag-remove" title="Retirer cet ingrédient">
        <i class="fa fa-times"></i>
      </button>
    `;
    tag.querySelector(".tag-remove").addEventListener("click", () => {
      selectedIngredients = selectedIngredients.filter((i) => i !== ing);
      displaySelectedIngredients();
      filterAndDisplayRecipes();
    });
    container.appendChild(tag);
  });

  // 2) Ustensiles
  selectedUstensils.forEach((ust) => {
    const tag = document.createElement("div");
    tag.classList.add("ingredient-tag");
   
    tag.innerHTML = `
      <span class="tag-text">${ust}</span>
      <button class="tag-remove" title="Retirer cet ustensile">
        <i class="fa fa-times"></i>
      </button>
    `;
    tag.querySelector(".tag-remove").addEventListener("click", () => {
      selectedUstensils = selectedUstensils.filter((u) => u !== ust);
      displaySelectedIngredients();
      filterAndDisplayRecipes();
    });
    container.appendChild(tag);
  });

  // 3) Appareils
  selectedDevices.forEach((dev) => {
    const tag = document.createElement("div");
    tag.classList.add("ingredient-tag");
    
    tag.innerHTML = `
      <span class="tag-text">${dev}</span>
      <button class="tag-remove" title="Retirer cet appareil">
        <i class="fa fa-times"></i>
      </button>
    `;
    tag.querySelector(".tag-remove").addEventListener("click", () => {
      selectedDevices = selectedDevices.filter((d) => d !== dev);
      displaySelectedIngredients();
      filterAndDisplayRecipes();
    });
    container.appendChild(tag);
  });
}


/* ----------------------------------
   INITIALISATION des dropdowns
---------------------------------- */
populateIngredientList(recipes);
populateUstensilList(recipes);
populateDeviceList(recipes);
