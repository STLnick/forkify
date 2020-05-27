/* * * * * * * * * * * * * * * */
/* * * Global App Controller * * */
/* * * * * * * * * * * * * * * */

// Had to explicitly import to get rid of 'regeneratorRuntime not defined' error
import 'regenerator-runtime/runtime';

import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, clearLoader, renderLoader } from './views/base'

const state = {};

/** 
* SEARCH CONTROLLER
*/
const controlSearch = async () => {
    // 1) Get query from view
    const query = searchView.getInput();
    
    if (query) {
        // 2) New search object and add it to state
        state.search = new Search(query);
        
        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        
        try {
            // 4) Search for recipes
            await state.search.getResults();

            // 5) Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (error) {
            alert('Something went wrong with the search!');
        }
    }
    
};

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
})


/** 
* RECIPE CONTROLLER
*/
const controlRecipe = async () => {
    const id = window.location.hash.replace('#', '');
    
    if (id) {
        // Prepare UI
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Create new Recipe object
        if (state.search) searchView.highlightSelected(id);
        state.recipe = new Recipe(id);

        try {
            // Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // Render Recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
        } catch (error) {
            alert('Error processing recipe!');
            console.log(error);
        }
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


/** 
* LIST CONTROLLER
*/
const controlList = () => {
    // Create a new List if there isn't one
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle Delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);
        // Delete from UI
        listView.deleteItem(id);

    // Handle count updates
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});


/** 
* LIKES CONTROLLER
*/

// TESTING
state.likes = new Likes();
likesView.toggleLikesMenu(state.likes.getNumLikes());
/* * * * * * * * * * * * * */

const controlLike = () => {
    //if (!state.likes) state.likes = new Likes();
    const currentId = state.recipe.id;

    // If the user has NOT yet liked this recipe
    if (!state.likes.isLiked(currentId)) {
        // Add like to Likes
        const newLike = state.likes.addLike(
            currentId,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle heart button
        likesView.toggleLikedBtn(true);
        // Add like to UI
        likesView.renderLike(newLike);
    
    // If the user HAS liked this recipe
    } else {
        // Remove like from Likes
        state.likes.deleteLike(currentId);
        // Toggle heart button
        likesView.toggleLikedBtn(false);
        // Remove like from UI
        likesView.deleteLike(currentId);
    }
    likesView.toggleLikesMenu(state.likes.getNumLikes());
}


elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-dec, .btn-dec *')) {
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-inc, .btn-inc *')) {
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn-add, .recipe__btn-add *')) {
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        controlLike();
    }
})




