import { useState, useEffect } from 'react';
import { getCategoryForItem, CATEGORIES } from '../utils/categories';

export function useGroceryList() {
    const [customOverrides, setCustomOverrides] = useState(() => {
        const saved = localStorage.getItem('smart_shop_overrides');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { console.error(e); }
        }
        return {};
    });

    const [items, setItems] = useState(() => {
        const saved = localStorage.getItem('smart_shop_items');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse local storage', e);
            }
        }
        // Default initial items dynamically categorized by our new rules
        return [
            { id: '1', name: 'Bananas', subtitle: '1 bunch • Organic', category: getCategoryForItem('Bananas', {}), completed: false, urgent: false },
            { id: '2', name: 'Spinach', subtitle: '2 bags', category: getCategoryForItem('Spinach', {}), completed: false, urgent: true },
            { id: '3', name: 'Avocados', subtitle: '', category: getCategoryForItem('Avocados', {}), completed: false, urgent: false },
            { id: '4', name: 'Almond Milk', subtitle: 'Unsweetened', category: getCategoryForItem('Almond Milk', {}), completed: false, urgent: false },
            { id: '5', name: 'Whole Wheat Bread', subtitle: '', category: getCategoryForItem('Whole Wheat Bread', {}), completed: true, urgent: false },
            { id: '6', name: 'Large Eggs', subtitle: '', category: getCategoryForItem('Large Eggs', {}), completed: true, urgent: false },
        ];
    });

    useEffect(() => {
        localStorage.setItem('smart_shop_items', JSON.stringify(items));
    }, [items]);

    useEffect(() => {
        localStorage.setItem('smart_shop_overrides', JSON.stringify(customOverrides));

        // Re-categorize active items whenever overrides change
        setItems(prev => prev.map(item => ({
            ...item,
            category: getCategoryForItem(item.name, customOverrides)
        })));
    }, [customOverrides]);

    const addItem = (name, subtitle = '') => {
        if (!name.trim()) return;
        const newItem = {
            id: Date.now().toString(),
            name,
            subtitle,
            category: getCategoryForItem(name, customOverrides),
            completed: false,
            urgent: false,
        };
        setItems((prev) => [newItem, ...prev]);
    };

    const toggleComplete = (id) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, completed: !item.completed } : item
            )
        );
    };

    const updateItemCategory = (itemId, newCategoryId) => {
        setItems(prev => prev.map(item => {
            if (item.id === itemId) {
                const newCategory = CATEGORIES.find(c => c.id === newCategoryId) || item.category;

                // Save the preference permanently
                setCustomOverrides(prevOverrides => ({
                    ...prevOverrides,
                    [item.name.toLowerCase().trim()]: newCategoryId
                }));

                return { ...item, category: newCategory };
            }
            return item;
        }));
    };

    const clearAll = () => {
        setItems([]);
    };

    const [userSettings, setUserSettings] = useState(() => {
        const saved = localStorage.getItem('smart_shop_settings');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { console.error(e); }
        }
        return {
            voiceLanguage: 'en-SG',
            categoryOrder: [...CATEGORIES.map(c => c.id), 'other'],
            wakeLockEnabled: false,
            darkMode: false
        };
    });

    useEffect(() => {
        localStorage.setItem('smart_shop_settings', JSON.stringify(userSettings));
    }, [userSettings]);

    const updateVoiceLanguage = (lang) => {
        setUserSettings(prev => ({ ...prev, voiceLanguage: lang }));
    };

    const updateCategoryOrder = (order) => {
        setUserSettings(prev => ({ ...prev, categoryOrder: order }));
    };

    const updateWakeLock = (enabled) => {
        setUserSettings(prev => ({ ...prev, wakeLockEnabled: enabled }));
    };

    const updateDarkMode = (enabled) => {
        setUserSettings(prev => ({ ...prev, darkMode: enabled }));
    };

    const activeItems = items.filter((item) => !item.completed);
    const completedItems = items.filter((item) => item.completed);

    return {
        items,
        activeItems,
        completedItems,
        customOverrides,
        userSettings,
        addItem,
        toggleComplete,
        updateItemCategory,
        clearAll,
        updateVoiceLanguage,
        updateCategoryOrder,
        updateWakeLock,
        updateDarkMode
    };
}
