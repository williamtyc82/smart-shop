import React from 'react';

export function CompletedSection({ items, onToggleComplete, onClearAll }) {
    if (items.length === 0) return null;

    return (
        <section className="pt-4 pb-8 animate-in fade-in duration-500">
            <details className="group">
                <summary className="list-none cursor-pointer flex items-center justify-between px-2 mb-4 text-slate-400 dark:text-slate-500 hover:text-primary transition-colors select-none">
                    <span className="text-sm font-black uppercase tracking-[0.15em] flex items-center gap-3">
                        Completed ({items.length})
                        <span className="material-symbols-outlined text-lg transition-transform group-open:rotate-180">expand_more</span>
                    </span>
                    <span
                        onClick={(e) => { e.preventDefault(); onClearAll(); }}
                        className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full hover:bg-primary/10 hover:text-primary transition-all"
                    >
                        Clear all
                    </span>
                </summary>
                <div className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 overflow-hidden">
                    {items.map((item, index) => (
                        <label key={item.id} className={`flex items-center gap-5 p-5 cursor-pointer group opacity-60 hover:opacity-100 transition-opacity ${index > 0 ? 'border-t border-slate-100 dark:border-slate-800/50' : ''}`}>
                            <div
                                onClick={() => onToggleComplete(item.id)}
                                className="relative flex items-center justify-center h-8 w-8 bg-primary rounded-full cursor-pointer hover:scale-110 transition-transform"
                            >
                                <span className="material-symbols-outlined text-white text-base font-bold">check</span>
                            </div>
                            <div className="flex-1" onClick={() => onToggleComplete(item.id)}>
                                <p className="font-bold text-slate-400 dark:text-slate-500 text-lg line-through decoration-primary/40 group-hover:text-primary transition-colors">{item.name}</p>
                            </div>
                        </label>
                    ))}
                </div>
            </details>
        </section>
    );
}
