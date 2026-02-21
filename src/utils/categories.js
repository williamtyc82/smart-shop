import Fuse from 'fuse.js';

export const CATEGORIES = [
    { id: 'produce', name: 'Produce', emoji: '🍎', keywords: ['tomato', 'potato', 'onion', 'garlic', 'lettuce', 'broccoli', 'apple', 'banana', 'grape', 'berry', 'herbs', 'spinach', 'cucumber'] },
    { id: 'dairy-eggs', name: 'Dairy & Eggs', emoji: '🥛', keywords: ['milk', 'yogurt', 'cheese', 'butter', 'egg', 'cream', 'margarine', 'sour cream'] },
    { id: 'meat-seafood', name: 'Meat & Seafood', emoji: '🥩', keywords: ['chicken', 'beef', 'pork', 'salmon', 'prawn', 'fish', 'steak', 'sausage', 'bacon'] },
    { id: 'bakery', name: 'Bakery', emoji: '🍞', keywords: ['bread', 'bun', 'croissant', 'muffin', 'cake', 'baguette', 'pita'] },
    { id: 'pantry', name: 'Pantry', emoji: '🥫', keywords: ['rice', 'pasta', 'flour', 'sugar', 'salt', 'oil', 'honey', 'canned soup', 'soy sauce', 'oats', 'cereal'] },
    { id: 'beverages', name: 'Beverages', emoji: '🥤', keywords: ['coffee', 'tea', 'soda', 'juice', 'water', 'beer', 'wine'] },
    { id: 'household', name: 'Household', emoji: '🧽', keywords: ['tissue', 'detergent', 'soap', 'bleach', 'battery', 'sponge', 'foil'] },
];

export const OTHER_CATEGORY = { id: 'other', name: 'Other', emoji: '🛒' };

// Restructure data for Fuse.js searching
const searchData = CATEGORIES.flatMap(cat =>
    cat.keywords.map(kw => ({ categoryId: cat.id, keyword: kw }))
);

// Initialize Fuse with specified threshold
// A threshold of 0.4 requires a reasonably close match
const fuse = new Fuse(searchData, {
    keys: ['keyword'],
    threshold: 0.4,
    includeScore: true
});

/**
 * Predicts the category based on item name.
 * @param {string} itemName The name of the grocery item.
 * @param {object} customMappings Key-Value map of user's custom categorizations.
 * @returns {object} The category object.
 */
export function getCategoryForItem(itemName, customMappings = {}) {
    const lowercaseName = itemName.toLowerCase().trim();

    // 1. Check User's Custom Override Mappings first
    if (customMappings[lowercaseName]) {
        const customMatch = CATEGORIES.find(c => c.id === customMappings[lowercaseName]);
        if (customMatch) return customMatch;
    }

    // 2. Perform Fuzzy Search
    const results = fuse.search(lowercaseName);

    if (results.length > 0) {
        const bestMatchId = results[0].item.categoryId;
        return CATEGORIES.find(c => c.id === bestMatchId) || OTHER_CATEGORY;
    }

    // 3. Fallback AI: Strip trailing 's' if exists, and re-search
    if (lowercaseName.endsWith('s')) {
        const singularName = lowercaseName.slice(0, -1);

        if (customMappings[singularName]) {
            const customMatch = CATEGORIES.find(c => c.id === customMappings[singularName]);
            if (customMatch) return customMatch;
        }

        const singularResults = fuse.search(singularName);
        if (singularResults.length > 0) {
            const bestMatchId = singularResults[0].item.categoryId;
            return CATEGORIES.find(c => c.id === bestMatchId) || OTHER_CATEGORY;
        }
    }

    // 4. Return 'Other' if all fails
    return OTHER_CATEGORY;
}
