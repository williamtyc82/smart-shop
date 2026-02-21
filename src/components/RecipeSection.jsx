import React, { useState, useEffect } from 'react';

export function RecipeSection({ activeItems, onAddIngredients }) {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecipes = async () => {
            if (activeItems.length === 0) {
                setRecipes([]);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Get a list of ingredient names from active items
                // Only take the first two to avoid returning zero results from overly specific queries
                const ingredients = activeItems.slice(0, 2).map(item => item.name.toLowerCase());

                // Fetch recipes using the first ingredient (TheMealDB filter by multi-ingredient is complex/paid)
                const mainIngredient = ingredients[0];
                const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(mainIngredient)}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch recipes');
                }

                const data = await response.json();

                if (data.meals) {
                    setRecipes(data.meals.slice(0, 10)); // Limit to top 10 results
                } else {
                    setRecipes([]);
                }
            } catch (err) {
                console.error("Error fetching recipes:", err);
                setError("Could not load recipes. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchRecipes();
        }, 500); // Debounce fetches

        return () => clearTimeout(timeoutId);
    }, [activeItems]);

    const handleAddIngredients = async (mealId) => {
        try {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch recipe details');
            }
            const data = await response.json();

            if (data.meals && data.meals.length > 0) {
                const meal = data.meals[0];
                const ingredientsToAdd = [];

                // TheMealDB returns ingredients in strIngredient1 through strIngredient20
                for (let i = 1; i <= 20; i++) {
                    const ingredient = meal[`strIngredient${i}`];
                    const measure = meal[`strMeasure${i}`];

                    if (ingredient && ingredient.trim() !== '') {
                        // Avoid adding ingredients we already have in activeItems
                        const alreadyHave = activeItems.some(item => item.name.toLowerCase() === ingredient.toLowerCase());
                        if (!alreadyHave) {
                            ingredientsToAdd.push({
                                name: ingredient.trim(),
                                subtitle: measure ? measure.trim() : ''
                            });
                        }
                    }
                }

                if (ingredientsToAdd.length > 0) {
                    onAddIngredients(ingredientsToAdd);
                } else {
                    alert("You already have all the ingredients for this recipe!");
                }
            }
        } catch (err) {
            console.error("Error adding ingredients:", err);
            alert("Could not add ingredients. Please try again.");
        }
    };

    if (activeItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center mt-20 opacity-50 px-4">
                <span className="material-symbols-outlined text-6xl text-primary/40 mb-4">restaurant_menu</span>
                <p className="text-lg font-bold text-slate-500">No items available.</p>
                <p className="text-sm text-slate-400">Add some ingredients to your list to get recipe suggestions!</p>
            </div>
        );
    }

    return (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-8">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <span className="text-2xl drop-shadow-sm">👨‍🍳</span>
                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Recipe Ideas</h2>
                </div>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}

            {error && (
                <div className="text-center text-red-500 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                    <p className="font-semibold">{error}</p>
                </div>
            )}

            {!loading && !error && recipes.length === 0 && (
                <div className="text-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
                    <p className="text-slate-500 dark:text-slate-400 font-semibold">No recipes found for your current ingredients.</p>
                </div>
            )}

            {!loading && !error && recipes.length > 0 && (
                <div className="grid grid-cols-1 gap-5">
                    {recipes.map((recipe) => (
                        <div key={recipe.idMeal} className="bg-white dark:bg-card-dark rounded-3xl overflow-hidden shadow-card transition-all hover:shadow-lg group">
                            <div className="relative h-48 w-full">
                                <img
                                    src={recipe.strMealThumb}
                                    alt={recipe.strMeal}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                <h3 className="absolute bottom-4 left-4 right-4 text-white font-bold text-lg leading-tight drop-shadow-md">
                                    {recipe.strMeal}
                                </h3>
                            </div>
                            <div className="p-4 flex gap-3">
                                <button
                                    onClick={() => handleAddIngredients(recipe.idMeal)}
                                    className="flex-1 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl py-3 font-bold text-sm transition-colors flex items-center justify-center gap-2 group/btn"
                                >
                                    <span className="material-symbols-outlined text-[18px] transition-transform group-hover/btn:scale-110">shopping_cart_checkout</span>
                                    Add Ingredients
                                </button>
                                <a
                                    href={`https://www.themealdb.com/meal/${recipe.idMeal}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-12 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center transition-colors"
                                    title="View full recipe"
                                >
                                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
