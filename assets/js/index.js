function displayRecipes(recipes) {
    const recipesContainer = document.getElementById("recipes-cards");
    recipesContainer.innerHTML = "";
  
    // Génération des cartes
    recipes.forEach((recipe) => {
      const col = document.createElement("div");
      col.classList.add("col");

      //Troncage de la description
      const truncatedDescription = recipe.description.length > 186
        ? recipe.description.slice(0, 186) + "...": recipe.description;
  
      // Corps de la carte  
      col.innerHTML = `
        <div class="card h-100 shadow-sm">
          <div class="position-relative">
            <img 
              src="assets/images/${recipe.image}" 
              class="card-img-top" 
              alt="${recipe.name}" 
            >
            <span
              class="time-badge position-absolute top-0 end-0 text-dark px-2 py-1 m-2">
              ${recipe.time} min
            </span>
          </div>
  
          <div class="card-body d-flex flex-column px-3">
            <div class="d-flex justify-content-between align-items-center mt-3">
              <h2 class="card-title fs-5">${recipe.name}</h2>
            </div>
            <div class=" ">
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
  
    //Actualisation du nombre de recettes dans le span #recipes-count
    const recipesCountSpan = document.getElementById("recipes-count");
    recipesCountSpan.textContent = `${recipes.length} recette(s)`;
  }
  
  displayRecipes(recipes);
  

