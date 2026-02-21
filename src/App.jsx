import React, { useState, useEffect } from 'react';
import { useGroceryList } from './hooks/useGroceryList';
import { GroceryInput } from './components/GroceryInput';
import { CategorySection } from './components/CategorySection';
import { CompletedSection } from './components/CompletedSection';
import { RecipeSection } from './components/RecipeSection';
import { SettingsSection } from './components/SettingsSection';
import { CATEGORIES, OTHER_CATEGORY } from './utils/categories';

function App() {
    const { items, activeItems, completedItems, customOverrides, userSettings, addItem, toggleComplete, updateItemCategory, clearAll, updateVoiceLanguage, updateCategoryOrder, updateWakeLock, updateDarkMode } = useGroceryList();
    const [currentTab, setCurrentTab] = useState('list'); // 'list' or 'recipes' or 'settings'

    const [isConfirmingClear, setIsConfirmingClear] = useState(false);

    // Wake Lock Implementation based on user settings
    useEffect(() => {
        let wakeLock = null;

        const requestWakeLock = async () => {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
                console.log('Wake Lock is active');
            } catch (err) {
                console.error('Wake Lock error:', err);
            }
        };

        const handleVisibilityChange = () => {
            if (wakeLock !== null && document.visibilityState === 'visible' && userSettings?.wakeLockEnabled) {
                requestWakeLock();
            }
        };

        if (userSettings?.wakeLockEnabled && 'wakeLock' in navigator) {
            requestWakeLock();
            document.addEventListener('visibilitychange', handleVisibilityChange);
        }

        return () => {
            if (wakeLock !== null) {
                wakeLock.release()
                    .then(() => console.log('Wake Lock released'));
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [userSettings?.wakeLockEnabled]);

    // Dark Mode Implementation
    useEffect(() => {
        if (userSettings?.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [userSettings?.darkMode]);

    // Group active items by category
    const groupedItems = activeItems.reduce((acc, item) => {
        const catId = item.category.id;
        if (!acc[catId]) {
            acc[catId] = {
                category: item.category,
                items: []
            };
        }
        acc[catId].items.push(item);
        return acc;
    }, {});

    // For consistent ordering, we map through the user's defined category order
    const allCategoriesMap = [...CATEGORIES, OTHER_CATEGORY].reduce((acc, cat) => {
        acc[cat.id] = cat;
        return acc;
    }, {});

    const defaultOrder = [...CATEGORIES.map(c => c.id), OTHER_CATEGORY.id];
    const currentOrder = userSettings?.categoryOrder || defaultOrder;

    const activeCategories = currentOrder
        .map(catId => {
            if (groupedItems[catId]) {
                return allCategoriesMap[catId];
            }
            return null;
        })
        .filter(Boolean);

    const handleAddMultiple = (newItems) => {
        newItems.forEach(item => {
            addItem(item.name, item.subtitle);
        });
        setCurrentTab('list'); // Navigate back to list to see the added items
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-text-main antialiased selection:bg-primary/30 min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl">

                <header className="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl px-8 pt-14 pb-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                {currentTab === 'list' ? 'Smart Shop' : currentTab === 'recipes' ? 'Recipes' : 'Settings'}
                            </h1>
                            {currentTab === 'settings' ? (
                                <p className="text-base font-semibold text-slate-500 mt-1">
                                    Manage your preferences
                                </p>
                            ) : (
                                <p className="text-base font-semibold text-primary mt-1">
                                    {currentTab === 'list'
                                        ? `${activeItems.length} ${activeItems.length === 1 ? 'item' : 'items'} remaining`
                                        : `Based on your ${activeItems.length} ingredients`
                                    }
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {currentTab === 'list' && activeItems.length > 0 && (
                                isConfirmingClear ? (
                                    <div className="flex items-center gap-2 animate-fade-in">
                                        <button
                                            onClick={() => setIsConfirmingClear(false)}
                                            className="px-3 py-1.5 text-[11px] font-black tracking-wider uppercase text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => {
                                                clearAll();
                                                setIsConfirmingClear(false);
                                            }}
                                            className="px-3 py-1.5 text-[11px] font-black tracking-wider uppercase text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors shadow-sm shadow-red-500/20"
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsConfirmingClear(true)}
                                        className="p-2 rounded-full border-2 border-slate-200 dark:border-slate-700 hover:border-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 transition-all flex items-center justify-center -mr-1"
                                        title="Clear Full List"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>delete</span>
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                    {currentTab === 'list' && <GroceryInput onAdd={addItem} customOverrides={customOverrides} voiceLanguage={userSettings?.voiceLanguage || 'en-SG'} />}
                </header>

                <main className="flex-1 overflow-y-auto no-scrollbar px-6 pt-4 pb-32">
                    {currentTab === 'settings' ? (
                        <SettingsSection
                            userSettings={userSettings}
                            updateVoiceLanguage={updateVoiceLanguage}
                            updateCategoryOrder={updateCategoryOrder}
                            updateWakeLock={updateWakeLock}
                            updateDarkMode={updateDarkMode}
                            clearAll={clearAll}
                        />
                    ) : currentTab === 'recipes' ? (
                        <RecipeSection activeItems={activeItems} onAddIngredients={handleAddMultiple} />
                    ) : (
                        <>
                            {activeItems.length === 0 && completedItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center text-center mt-20 opacity-50">
                                    <span className="material-symbols-outlined text-6xl text-primary/40 mb-4">shopping_cart</span>
                                    <p className="text-lg font-bold text-slate-500">Your list is empty.</p>
                                    <p className="text-sm text-slate-400">Add some items above to get started!</p>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    {activeCategories.map(cat => (
                                        <CategorySection
                                            key={cat.id}
                                            categoryName={cat.name}
                                            emoji={cat.emoji}
                                            items={groupedItems[cat.id]?.items || []}
                                            onToggleComplete={toggleComplete}
                                            onUpdateCategory={updateItemCategory}
                                        />
                                    ))}

                                    <CompletedSection
                                        items={completedItems}
                                        onToggleComplete={toggleComplete}
                                        onClearAll={clearAll}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </main>

                <nav className="fixed bottom-0 z-30 w-full max-w-md bg-white/95 dark:bg-card-dark/95 backdrop-blur-2xl border-t border-slate-100 dark:border-slate-800/50 pt-3 pb-8 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-around items-center">
                        <button
                            onClick={() => setCurrentTab('list')}
                            className="group flex flex-col items-center justify-center gap-1 w-20 transition-all"
                        >
                            <div className={`${currentTab === 'list' ? 'bg-primary/15 text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400'} flex h-8 w-16 items-center justify-center rounded-full transition-all group-active:scale-95`}>
                                <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: currentTab === 'list' ? "'FILL' 1" : "'FILL' 0" }}>format_list_bulleted</span>
                            </div>
                            <p className={`${currentTab === 'list' ? 'text-primary font-bold' : 'text-slate-400 dark:text-slate-500 font-semibold'} text-[11px] tracking-wider uppercase transition-colors`}>List</p>
                        </button>

                        <button
                            onClick={() => setCurrentTab('recipes')}
                            className="group flex flex-col items-center justify-center gap-1 w-20 transition-all"
                        >
                            <div className={`${currentTab === 'recipes' ? 'bg-primary/15 text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400'} flex h-8 w-16 items-center justify-center rounded-full transition-all group-active:scale-95`}>
                                <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: currentTab === 'recipes' ? "'FILL' 1" : "'FILL' 0" }}>menu_book</span>
                            </div>
                            <p className={`${currentTab === 'recipes' ? 'text-primary font-bold' : 'text-slate-400 dark:text-slate-500 font-semibold'} text-[11px] tracking-wider uppercase transition-colors`}>Recipes</p>
                        </button>

                        <button
                            onClick={() => setCurrentTab('settings')}
                            className="group flex flex-col items-center justify-center gap-1 w-20 transition-all"
                        >
                            <div className={`${currentTab === 'settings' ? 'bg-primary/15 text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400'} flex h-8 w-16 items-center justify-center rounded-full transition-all group-active:scale-95`}>
                                <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: currentTab === 'settings' ? "'FILL' 1" : "'FILL' 0" }}>settings</span>
                            </div>
                            <p className={`${currentTab === 'settings' ? 'text-primary font-bold' : 'text-slate-400 dark:text-slate-500 font-semibold'} text-[11px] tracking-wider uppercase transition-colors`}>Settings</p>
                        </button>
                    </div>
                </nav>

                <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 bg-pastel-peach rounded-full blur-[100px] pointer-events-none z-0 opacity-60"></div>
                <div className="absolute bottom-40 left-0 -ml-24 w-80 h-80 bg-pastel-blue rounded-full blur-[100px] pointer-events-none z-0 opacity-40"></div>
            </div>
        </div>
    );
}

export default App;
