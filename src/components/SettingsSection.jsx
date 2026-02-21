import React, { useRef } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CATEGORIES, OTHER_CATEGORY } from '../utils/categories';

// Sortable Category Item Component
function SortableCategoryItem({ id }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    // Find category details
    const category = CATEGORIES.find(c => c.id === id) || (id === OTHER_CATEGORY.id ? OTHER_CATEGORY : null);
    if (!category) return null;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 py-3 px-2 bg-transparent transition-colors group"
        >
            {/* Drag Handle on the Left with Min Tap Target */}
            <button
                {...attributes}
                {...listeners}
                className="flex items-center justify-center min-w-[44px] min-h-[44px] p-2 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing touch-none transition-colors"
                aria-label={`Drag to reorder ${category.name}`}
            >
                <span className="material-symbols-outlined text-xl">drag_indicator</span>
            </button>
            <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">{category.emoji}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{category.name}</span>
            </div>
        </div>
    );
}

export function SettingsSection({ userSettings, updateVoiceLanguage, updateCategoryOrder, updateWakeLock, updateDarkMode, clearAll }) {
    const defaultOrder = [...CATEGORIES.map(c => c.id), OTHER_CATEGORY.id];
    const categoryOrder = userSettings?.categoryOrder || defaultOrder;
    const fileInputRef = useRef(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: 150,
                tolerance: 5,
            }
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            const oldIndex = categoryOrder.indexOf(active.id);
            const newIndex = categoryOrder.indexOf(over.id);
            updateCategoryOrder(arrayMove(categoryOrder, oldIndex, newIndex));
        }
    };

    const handleExport = () => {
        const dataStr = localStorage.getItem('smart_shop_items') || '[]';
        const customOverrides = localStorage.getItem('smart_shop_custom_overrides') || '{}';
        const settings = localStorage.getItem('smart_shop_settings') || '{}';

        const exportObj = {
            items: JSON.parse(dataStr),
            customOverrides: JSON.parse(customOverrides),
            settings: JSON.parse(settings)
        };

        const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `smart_shop_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.items) localStorage.setItem('smart_shop_items', JSON.stringify(data.items));
                if (data.customOverrides) localStorage.setItem('smart_shop_custom_overrides', JSON.stringify(data.customOverrides));
                if (data.settings) localStorage.setItem('smart_shop_settings', JSON.stringify(data.settings));

                alert("Data imported successfully! The app will now reload to apply changes.");
                window.location.reload();
            } catch (err) {
                console.error("Failed to parse import file", err);
                alert("Invalid backup file. Please ensure it is a valid JSON exported from this app.");
            }
        };
        reader.readAsText(file);
    };

    const handleClearAll = () => {
        if (window.confirm("WARNING: This will delete ALL your grocery items, custom categorizations, and settings! Are you absolutely sure?")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Preferences (Bento Layout) */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-2 px-2">Preferences</h3>

                {/* Voice Language Bento Card */}
                <div className="bg-white dark:bg-card-dark rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 overflow-hidden">
                                <span className="material-symbols-outlined font-light text-[24px]">translate</span>
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <h4 className="font-bold text-slate-800 dark:text-white leading-tight truncate">Voice Input Language</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">Language for dictation</p>
                            </div>
                        </div>
                        <select
                            value={userSettings?.voiceLanguage || 'en-SG'}
                            onChange={(e) => updateVoiceLanguage(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 py-2.5 pl-4 pr-10 focus:ring-2 focus:ring-primary min-h-[44px] min-w-[140px] shrink-0 appearance-none cursor-pointer"
                            style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                        >
                            <option value="en-SG">English (SG)</option>
                            <option value="en-US">English (US)</option>
                            <option value="en-GB">English (UK)</option>
                            <option value="en-AU">English (AU)</option>
                            <option value="zh-CN">Chinese (CN)</option>
                            <option value="ms-MY">Malay</option>
                            <option value="ta-SG">Tamil</option>
                        </select>
                    </div>
                </div>

                {/* Wake Lock Bento Card */}
                <div className="bg-white dark:bg-card-dark rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 overflow-hidden">
                                <span className="material-symbols-outlined font-light text-[24px]">lightbulb</span>
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <h4 className="font-bold text-slate-800 dark:text-white leading-tight truncate">Prevent Screen Sleep</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">Keep screen awake while shopping</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer h-11 w-12 justify-end shrink-0">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={userSettings?.wakeLockEnabled || false}
                                onChange={(e) => updateWakeLock(e.target.checked)}
                                aria-label="Toggle Prevent Screen Sleep"
                            />
                            <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-[20px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[8px] after:right-[22px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>

                {/* Dark Mode Bento Card */}
                <div className="bg-white dark:bg-card-dark rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 overflow-hidden">
                                <span className="material-symbols-outlined font-light text-[24px]">dark_mode</span>
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <h4 className="font-bold text-slate-800 dark:text-white leading-tight truncate">Dark Mode</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">Comfortable viewing for low light</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer h-11 w-12 justify-end shrink-0">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={userSettings?.darkMode || false}
                                onChange={(e) => updateDarkMode(e.target.checked)}
                                aria-label="Toggle Dark Mode"
                            />
                            <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-[20px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[8px] after:right-[22px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Layout Sorting */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-2 px-2">Category Layout</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 px-2">Drag handles to reorder your lists globally.</p>

                {/* Refined Draggable List */}
                <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/50">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={categoryOrder}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="flex flex-col">
                                {categoryOrder.map((id) => (
                                    <SortableCategoryItem key={id} id={id} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

            {/* Data & Storage */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-2 px-2">Data Management</h3>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleExport}
                        className="flex flex-col items-center justify-center gap-2 p-5 bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-colors group min-h-[44px]"
                    >
                        <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-primary transition-colors">cloud_download</span>
                        <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">Backup Data</span>
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-2 p-5 bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-colors group min-h-[44px]"
                    >
                        <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-primary transition-colors">cloud_upload</span>
                        <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">Restore Data</span>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImport}
                        accept=".json"
                        className="hidden"
                    />
                </div>

                <button
                    onClick={handleClearAll}
                    className="w-full flex items-center justify-center gap-2 min-h-[44px] p-4 mt-2 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors border border-red-100 dark:border-red-500/20"
                >
                    <span className="material-symbols-outlined">delete_forever</span>
                    <span>Wipe All Data</span>
                </button>
            </div>
        </div>
    );
}
