import React from 'react';

export function CategorySection({ categoryName, emoji, items, onToggleComplete, onUpdateCategory }) {
    if (items.length === 0) return null;

    const getThemeVars = (name) => {
        switch (name) {
            case 'Produce': return { bg: 'bg-pastel-peach dark:bg-orange-950/20', border: '#ffd8c4', ring: 'border-pastel-peach' };
            case 'Dairy & Eggs': return { bg: 'bg-pastel-blue dark:bg-blue-950/20', border: '#c7e6fb', ring: 'border-pastel-blue' };
            case 'Household': return { bg: 'bg-pastel-green dark:bg-green-950/20', border: '#c1eac0', ring: 'border-pastel-green' };
            case 'Meat & Seafood': return { bg: 'bg-red-50 dark:bg-red-950/20', border: '#fecaca', ring: 'border-red-200' };
            case 'Bakery': return { bg: 'bg-amber-50 dark:bg-amber-950/20', border: '#fde68a', ring: 'border-amber-200' };
            case 'Pantry': return { bg: 'bg-stone-100 dark:bg-stone-900/20', border: '#e7e5e4', ring: 'border-stone-200' };
            case 'Beverages': return { bg: 'bg-sky-50 dark:bg-sky-950/20', border: '#bae6fd', ring: 'border-sky-200' };
            default: return { bg: 'bg-pastel-purple dark:bg-purple-950/20', border: '#e6ccff', ring: 'border-pastel-purple' };
        }
    };

    const theme = getThemeVars(categoryName);

    return (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <span className="text-2xl drop-shadow-sm">{emoji}</span>
                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{categoryName}</h2>
                </div>
            </div>
            <div className={`${theme.bg} rounded-3xl p-2 shadow-card transition-all`}>
                <div className="bg-white dark:bg-card-dark rounded-[1.75rem] overflow-hidden divide-y divide-black/5 dark:divide-white/5">
                    {items.map((item) => (
                        <div key={item.id} className="group relative flex items-center justify-between p-5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            <label className="flex items-center gap-5 cursor-pointer flex-1">
                                <input
                                    onChange={() => onToggleComplete(item.id)}
                                    checked={item.completed}
                                    className={`custom-checkbox h-8 w-8 rounded-full border-2 ${theme.ring} text-primary focus:ring-0 transition-all cursor-pointer`}
                                    style={{ borderColor: theme.border }}
                                    type="checkbox"
                                />
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-slate-100 text-lg group-hover:text-primary transition-colors">{item.name}</p>
                                    {item.subtitle && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{item.subtitle}</p>
                                    )}
                                </div>
                            </label>

                            {/* Interactive Category Modifier */}
                            {onUpdateCategory && (
                                <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <select
                                        className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full px-3 py-1.5 border-none cursor-pointer focus:ring-2 focus:ring-primary/20 appearance-none pr-8"
                                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                        value={item.category.id}
                                        onChange={(e) => onUpdateCategory(item.id, e.target.value)}
                                        title="Change category mapping"
                                    >
                                        <option value="produce">Produce</option>
                                        <option value="dairy-eggs">Dairy & Eggs</option>
                                        <option value="meat-seafood">Meat & Seafood</option>
                                        <option value="bakery">Bakery</option>
                                        <option value="pantry">Pantry</option>
                                        <option value="beverages">Beverages</option>
                                        <option value="household">Household</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            )}

                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
