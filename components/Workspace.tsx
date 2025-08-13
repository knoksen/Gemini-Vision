import React, { useState, useCallback, useRef } from 'react';
import type { AppState, AppAction, UploadedImage, Task, TaskCategory } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Textarea, Alert, AlertDescription, AlertTitle, Separator, Loader } from './ui';
import { TASK_CATEGORIES, ALL_TASKS } from '../constants';
import { Upload, X, Image as ImageIcon, Sparkles, AlertTriangle, XCircle, Info, ChevronDown } from 'lucide-react';
import { analyzeImageWithGeminiStream } from '../services/geminiService';
import { ResultsDisplay } from './ResultsDisplay';

const ImageUploader: React.FC<{ onFilesAdded: (files: FileList) => void }> = ({ onFilesAdded }) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFilesAdded(e.dataTransfer.files);
        }
    };

    const onButtonClick = () => {
        inputRef.current?.click();
    };

    return (
        <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-primary-500 bg-primary-500/10' : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'}`}
        >
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && onFilesAdded(e.target.files)} multiple />
            <Upload className="w-10 h-10 text-gray-400 mb-3" />
            <p className="text-center font-semibold">
                <button type="button" className="text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-400 rounded" onClick={onButtonClick}>Click to upload</button> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, GIF, WebP up to 10MB</p>
        </div>
    );
};

const ImagePreview: React.FC<{ images: UploadedImage[]; selectedIndex: number; dispatch: React.Dispatch<AppAction> }> = ({ images, selectedIndex, dispatch }) => {
    if (images.length === 0) return null;

    return (
        <div className="mt-4">
            <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img src={images[selectedIndex].url} alt="Preview" className="w-full h-full object-contain bg-gray-100 dark:bg-gray-800" />
                <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => {
                        const newImages = images.filter((_, i) => i !== selectedIndex);
                        dispatch({ type: 'SET_IMAGES', payload: newImages });
                    }}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
            {images.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto p-1">
                    {images.map((image, index) => (
                        <div
                            key={image.id}
                            className={`w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 ${selectedIndex === index ? 'border-primary-500' : 'border-transparent'}`}
                            onClick={() => dispatch({ type: 'SET_SELECTED_IMAGE_INDEX', payload: index })}
                        >
                            <img src={image.url} alt={image.name} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const TaskSelector: React.FC<{ selectedTask: string; onSelectTask: (task: string) => void }> = ({ selectedTask, onSelectTask }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedTaskDetails = ALL_TASKS.find(t => t.value === selectedTask);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            >
                {selectedTaskDetails ? (
                    <div className="flex items-center gap-3">
                        <selectedTaskDetails.icon className="w-5 h-5 text-primary-500" />
                        <div>
                            <p className="font-semibold">{selectedTaskDetails.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{selectedTaskDetails.description}</p>
                        </div>
                    </div>
                ) : (
                    <span className="text-gray-500">Select a task...</span>
                )}
                <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-80 overflow-y-auto">
                    {Object.entries(TASK_CATEGORIES).map(([key, category]) => (
                        <div key={key}>
                            <p className="px-3 py-2 text-xs font-bold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50">{category.name}</p>
                            {category.tasks.map(task => (
                                <button
                                    type="button"
                                    key={task.value}
                                    onClick={() => {
                                        onSelectTask(task.value);
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                >
                                    <task.icon className="w-5 h-5 text-primary-500" />
                                    <div>
                                        <p className="font-semibold">{task.label}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{task.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const Workspace: React.FC<{ state: AppState; dispatch: React.Dispatch<AppAction> }> = ({ state, dispatch }) => {
    const { uploadedImages, selectedImageIndex, selectedTask, textPrompt, isLoading, error, results, apiKeyStatus, settings } = state;

    const handleFilesAdded = useCallback((files: FileList) => {
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        if (imageFiles.length === 0) return;

        const newImages: UploadedImage[] = imageFiles.map((file, index) => ({
            id: Date.now() + index,
            file,
            url: URL.createObjectURL(file),
            name: file.name,
            size: file.size,
            uploadedAt: new Date()
        }));

        dispatch({ type: 'SET_IMAGES', payload: [...uploadedImages, ...newImages] });
    }, [dispatch, uploadedImages]);

    const handleProcessImage = async () => {
        if (isLoading || uploadedImages.length === 0 || !selectedTask || !textPrompt.trim()) return;

        dispatch({ type: 'PROCESS_START' });

        const currentImage = uploadedImages[selectedImageIndex];
        const taskDetails = ALL_TASKS.find(t => t.value === selectedTask);

        if (!taskDetails) {
            dispatch({ type: 'PROCESS_ERROR', payload: 'Invalid task selected.' });
            return;
        }

        try {
            let fullResponse = "";
            const stream = analyzeImageWithGeminiStream(currentImage, taskDetails, textPrompt, settings);
            for await (const chunk of stream) {
                fullResponse += chunk;
                dispatch({ type: 'APPEND_TO_RESULT', payload: chunk });
            }

            dispatch({
                type: 'PROCESS_COMPLETE',
                payload: {
                    historyItem: {
                        id: Date.now(),
                        timestamp: new Date(),
                        task: selectedTask,
                        prompt: textPrompt,
                        image: currentImage,
                        result: fullResponse,
                        model: 'gemini-2.5-flash',
                    }
                },
            });
        } catch (err) {
            if (err instanceof Error) {
                dispatch({ type: 'PROCESS_ERROR', payload: err.message });
            } else {
                dispatch({ type: 'PROCESS_ERROR', payload: 'An unknown error occurred.' });
            }
        }
    };
    
    const exportResults = useCallback(() => {
        if (!results) {
            dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', title: 'Export Failed', message: 'There are no results to export.' } });
            return;
        }

        const exportData = {
            timestamp: new Date().toISOString(),
            analysis: {
                task: selectedTask,
                prompt: textPrompt,
                results: results,
                image: {
                    name: uploadedImages[selectedImageIndex]?.name,
                    size: uploadedImages[selectedImageIndex]?.size,
                },
            },
            settings: settings,
            model: 'gemini-2.5-flash',
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gemini-vision-analysis-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', title: 'Export Successful', message: 'Results saved to JSON file.' } });
    }, [results, selectedTask, textPrompt, uploadedImages, selectedImageIndex, settings, dispatch]);

    const canProcess = !isLoading && uploadedImages.length > 0 && selectedTask && textPrompt.trim() && apiKeyStatus === 'valid';
    const currentTask = ALL_TASKS.find(t => t.value === selectedTask);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full gap-px bg-gray-200 dark:bg-gray-700">
            <div className="bg-gray-100 dark:bg-gray-900 flex flex-col h-full">
                <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6">
                    {apiKeyStatus === 'missing' && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>API Key Missing</AlertTitle>
                            <AlertDescription>
                                The Gemini API key is not configured. Please set the <code>API_KEY</code> environment variable to use this application.
                            </AlertDescription>
                        </Alert>
                    )}
                    
                    {error && (
                        <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5 text-primary-500" /> Step 1: Upload Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ImageUploader onFilesAdded={handleFilesAdded} />
                            <ImagePreview images={uploadedImages} selectedIndex={selectedImageIndex} dispatch={dispatch} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary-500" /> Step 2: Configure Task</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <TaskSelector selectedTask={selectedTask} onSelectTask={(task) => dispatch({ type: 'SET_TASK', payload: task })} />
                            
                            <Textarea
                                placeholder={currentTask ? `e.g., "${currentTask.examples[0]}"` : "Enter your prompt here..."}
                                value={textPrompt}
                                onChange={(e) => dispatch({ type: 'SET_PROMPT', payload: e.target.value })}
                                rows={4}
                                disabled={!selectedTask}
                            />
                            {currentTask && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-2">
                                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-semibold">Prompt examples:</span>
                                        <ul className="list-disc list-inside">
                                            {currentTask.examples.map((ex, i) => <li key={i}>{ex}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
                    <Button size="lg" className="w-full" onClick={handleProcessImage} disabled={!canProcess}>
                        {isLoading ? <><Loader className="mr-2 h-5 w-5" /> Processing...</> : 'Analyze Image'}
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 h-full flex flex-col">
                <div className="relative flex-grow">
                    <ResultsDisplay results={results} isLoading={isLoading} onExport={exportResults} />
                </div>
            </div>
        </div>
    );
};