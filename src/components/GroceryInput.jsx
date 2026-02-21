import React, { useState, useMemo, useEffect, useRef } from 'react';
import { getCategoryForItem } from '../utils/categories';

export function GroceryInput({ onAdd, customOverrides = {}, voiceLanguage = 'en-SG' }) {
    const [inputValue, setInputValue] = useState('');
    const [isListening, setIsListening] = useState(false);

    const recognitionRef = useRef(null);

    useEffect(() => {
        // Initialize SpeechRecognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = voiceLanguage;

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                processVoiceInput(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [onAdd]);

    const processVoiceInput = (text) => {
        // Split text by the word "and" (case-insensitive) to allow seamless multiple entries
        const items = text.split(/\band\b/i).map(item => item.trim()).filter(item => item.length > 0);

        items.forEach(item => {
            onAdd(item);
        });
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Your browser does not support Voice Input.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onAdd(inputValue);
            setInputValue('');
        }
    };

    // Calculate the expected category instantly as the user types
    const previewCategory = useMemo(() => {
        if (!inputValue.trim()) return null;
        return getCategoryForItem(inputValue, customOverrides);
    }, [inputValue, customOverrides]);

    return (
        <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                <span className="material-symbols-outlined text-primary/60">add_circle</span>
            </div>
            <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="block w-full pl-14 pr-[11rem] py-5 bg-white dark:bg-card-dark border-0 rounded-3xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-soft focus:ring-2 focus:ring-primary/20 focus:outline-none text-base font-medium transition-all"
                placeholder="Add item (e.g., Milk)..."
                type="text"
            />

            {previewCategory && (
                <div className="absolute inset-y-0 right-36 flex items-center pr-2 pointer-events-none opacity-50 transition-opacity duration-300">
                    <span title={`Categorized as ${previewCategory.name}`} className="text-xl mr-1">{previewCategory.emoji}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline-block">{previewCategory.name}</span>
                </div>
            )}

            <div className="absolute inset-y-2 right-2 flex gap-2">
                <button
                    type="button"
                    onClick={toggleListening}
                    className={`h-full aspect-square rounded-2xl flex items-center justify-center transition-all ${isListening
                        ? 'bg-red-100 text-red-500 animate-pulse scale-105 shadow-md shadow-red-500/20'
                        : 'bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105 active:scale-95'
                        }`}
                    title={isListening ? "Listening..." : "Tap to speak"}
                >
                    <span className="material-symbols-outlined">{isListening ? 'mic' : 'mic_none'}</span>
                </button>

                <button
                    type="submit"
                    className="bg-primary hover:scale-105 active:scale-95 text-primary-content rounded-2xl px-5 flex items-center justify-center transition-all font-bold text-sm shadow-lg shadow-primary/20"
                >
                    Add
                </button>
            </div>
        </form>
    );
}
