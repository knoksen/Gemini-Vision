import React, { useReducer, useEffect, useCallback, useState } from 'react';
import type { AppState, AppAction, AnalysisHistoryItem, Notification, AppSettings } from './types';
import { Workspace } from './components/Workspace';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Label } from './components/ui';
import { Brain, History, Settings, Moon, Sun, X, CheckCircle, XCircle, Info as InfoIcon, AlertTriangle, Trash2 } from 'lucide-react';
import { StatusBar } from './components/StatusBar';

const LOCAL_STORAGE_KEY = 'gemini-vision-enterprise-state';

const initialState: AppState = {
  uploadedImages: [],
  selectedImageIndex: 0,
  selectedTask: '',
  textPrompt: '',
  results: '',
  isLoading: false,
  error: '',
  activeTab: 'workspace',
  analysisHistory: [],
  darkMode: true,
  systemStatus: {
    modelHealth: 'online',
    apiStatus: 'healthy',
    queueLength: 0,
  },
  apiKeyStatus: 'valid',
  settings: {
    temperature: 0.7,
    maxTokens: 1024,
  },
  notifications: [],
};

const loadState = (): Partial<AppState> | undefined => {
    try {
      const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (serializedState === null) {
        return undefined;
      }
      const storedState = JSON.parse(serializedState);
      return {
          analysisHistory: storedState.analysisHistory || [],
          darkMode: storedState.darkMode === true,
          settings: storedState.settings || initialState.settings,
      }
    } catch (err) {
      console.error("Could not load state from local storage", err);
      return undefined;
    }
  };


function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_API_KEY_STATUS':
        return { ...state, apiKeyStatus: action.payload };
    case 'SET_IMAGES':
      return { ...state, uploadedImages: action.payload, selectedImageIndex: 0, results: '', error: '' };
    case 'SET_SELECTED_IMAGE_INDEX':
      return { ...state, selectedImageIndex: action.payload };
    case 'SET_TASK':
      return { ...state, selectedTask: action.payload };
    case 'SET_PROMPT':
      return { ...state, textPrompt: action.payload };
    case 'PROCESS_START':
      return { ...state, isLoading: true, error: '', results: '' };
    case 'APPEND_TO_RESULT':
        return { ...state, results: state.results + action.payload };
    case 'PROCESS_COMPLETE':
        return { ...state, isLoading: false, analysisHistory: [action.payload.historyItem, ...state.analysisHistory.slice(0, 49)] };
    case 'PROCESS_ERROR':
      const errorMessage = action.payload;
      return { ...state, isLoading: false, error: errorMessage, notifications: [{ id: Date.now(), type: 'error', title: 'Analysis Failed', message: errorMessage }, ...state.notifications.slice(0, 4)]};
    case 'CLEAR_ERROR':
        return { ...state, error: '' };
    case 'SET_TAB':
      return { ...state, activeTab: action.payload };
    case 'DELETE_FROM_HISTORY':
        return { ...state, analysisHistory: state.analysisHistory.filter(item => item.id !== action.payload) };
    case 'SET_DARK_MODE':
      return { ...state, darkMode: action.payload };
    case 'UPDATE_SYSTEM_STATUS':
      return { ...state, systemStatus: { ...state.systemStatus, ...action.payload } };
    case 'RESET_WORKSPACE':
        return { ...state, uploadedImages: [], selectedImageIndex: 0, selectedTask: '', textPrompt: '', results: '', error: '' };
    case 'UPDATE_SETTINGS':
        return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'ADD_NOTIFICATION':
        const newNotification = { ...action.payload, id: Date.now() };
        return { ...state, notifications: [newNotification, ...state.notifications.slice(0, 4)] };
    case 'REMOVE_NOTIFICATION':
        return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
    default:
      return state;
  }
}

const Sidebar: React.FC<{ activeTab: string; setTab: (tab: 'workspace' | 'history' | 'settings') => void, onReset: () => void }> = ({ activeTab, setTab, onReset }) => {
    const navItems = [
        { id: 'workspace', label: 'Workspace', icon: Brain },
        { id: 'history', label: 'History', icon: History },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];
    
    return (
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <Brain className="w-8 h-8 text-primary-500" />
                <div>
                    <h1 className="text-lg font-bold">Gemini Vision</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Enterprise Assistant</p>
                </div>
            </div>
            <nav className="flex-grow p-4 space-y-2">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => {
                            if(item.id === 'workspace' && activeTab === 'workspace') {
                                onReset();
                            }
                            setTab(item.id as any)
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === item.id 
                                ? 'bg-primary-500/10 text-primary-500' 
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                    </button>
                ))}
            </nav>
        </aside>
    );
};

const HistoryPanel: React.FC<{ history: AnalysisHistoryItem[]; dispatch: React.Dispatch<AppAction> }> = ({ history, dispatch }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const handleRestore = (item: AnalysisHistoryItem) => {
        dispatch({ type: 'SET_IMAGES', payload: [item.image] });
        dispatch({ type: 'SET_TASK', payload: item.task });
        dispatch({ type: 'SET_PROMPT', payload: item.prompt });
        // Since results are now streamed, we can't just dispatch success. We put the result back.
        // We'll set the result directly and change the tab.
        // This is a slight deviation but makes for a better UX than re-running.
        const restoreAction: AppAction = { type: 'PROCESS_START' };
        // A bit of a hack to reset state before populating it
        const stateAfterReset = appReducer(initialState, restoreAction);
        const finalState = { ...stateAfterReset, isLoading: false, results: item.result };

        // We can't directly set state, so we dispatch actions to get there.
        dispatch({ type: 'RESET_WORKSPACE' });
        dispatch({ type: 'SET_IMAGES', payload: [item.image] });
        dispatch({ type: 'SET_TASK', payload: item.task });
        dispatch({ type: 'SET_PROMPT', payload: item.prompt });
        dispatch({ type: 'APPEND_TO_RESULT', payload: item.result}); // use append to set result
        dispatch({ type: 'SET_TAB', payload: 'workspace' });

    };

    const handleDelete = (id: number) => {
        dispatch({ type: 'DELETE_FROM_HISTORY', payload: id });
    };

    const filteredHistory = history.filter(item => 
        item.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.task.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (history.length === 0) {
        return <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6 text-center">
            <History className="w-16 h-16 mb-4 text-gray-400"/>
            <h3 className="text-lg font-semibold">No History Yet</h3>
            <p>Your completed analyses will appear here.</p>
        </div>
    }
    
    return (
        <div className="p-6 h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-4">Analysis History</h2>
            <div className="mb-4">
                <Input 
                    placeholder="Search history by task or prompt..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <ul className="space-y-4 flex-grow overflow-y-auto">
                {filteredHistory.length > 0 ? filteredHistory.map(item => (
                    <li key={item.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex justify-between items-start gap-4">
                           <div className="flex-grow overflow-hidden">
                                <p className="font-semibold">{item.task}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{item.prompt}</p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                           </div>
                           <div className="flex items-center flex-shrink-0">
                               <Button variant="secondary" size="sm" onClick={() => handleRestore(item)}>Restore</Button>
                               <Button variant="ghost" size="icon" className="ml-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10" onClick={() => handleDelete(item.id)}>
                                   <Trash2 className="w-4 h-4" />
                               </Button>
                           </div>
                        </div>
                    </li>
                )) : (
                     <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6 text-center">
                        <h3 className="text-lg font-semibold">No Matching Results</h3>
                        <p>Try a different search term.</p>
                    </div>
                )}
            </ul>
        </div>
    );
};

const SettingsPanel: React.FC<{ state: AppState; dispatch: React.Dispatch<AppAction> }> = ({ state, dispatch }) => {
    const { darkMode, settings } = state;

    const handleSettingsChange = (field: keyof AppSettings, value: string) => {
        const numValue = field === 'temperature' ? parseFloat(value) : parseInt(value, 10);
        if (!isNaN(numValue)) {
            dispatch({ type: 'UPDATE_SETTINGS', payload: { [field]: numValue } });
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Display</CardTitle>
                        <CardDescription>Adjust the application's appearance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                {darkMode ? <Moon className="w-5 h-5"/> : <Sun className="w-5 h-5" />}
                                <Label htmlFor="dark-mode-toggle" className="font-medium cursor-pointer">Dark Mode</Label>
                            </div>
                            <button
                                id="dark-mode-toggle"
                                role="switch"
                                aria-checked={darkMode}
                                onClick={() => dispatch({ type: 'SET_DARK_MODE', payload: !darkMode })}
                                className={`${darkMode ? 'bg-primary-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                            >
                                <span className={`${darkMode ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                            </button>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Model Configuration</CardTitle>
                        <CardDescription>Adjust the AI model's parameters for analysis.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="temperature" className="flex justify-between"><span>Temperature</span> <span>{settings.temperature.toFixed(1)}</span></Label>
                            <Input
                                id="temperature"
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={settings.temperature}
                                onChange={(e) => handleSettingsChange('temperature', e.target.value)}
                                className="w-full"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">Controls randomness. Lower values are more deterministic.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxTokens">Max Tokens</Label>
                            <Input
                                id="maxTokens"
                                type="number"
                                min="64"
                                max="8192"
                                step="64"
                                value={settings.maxTokens}
                                onChange={(e) => handleSettingsChange('maxTokens', e.target.value)}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">Maximum length of the generated response.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const NotificationItem: React.FC<{ notification: Notification; onDismiss: () => void }> = ({ notification, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 5000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const icons = {
        success: <CheckCircle className="text-green-500 w-6 h-6" />,
        error: <AlertTriangle className="text-red-500 w-6 h-6" />,
        info: <InfoIcon className="text-blue-500 w-6 h-6" />,
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 flex items-start gap-4 border border-gray-200 dark:border-gray-700 w-full">
            <div>{icons[notification.type]}</div>
            <div className="flex-grow">
                <p className="font-semibold text-gray-900 dark:text-white">{notification.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
            </div>
            <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};

const NotificationCenter: React.FC<{ notifications: Notification[]; dispatch: React.Dispatch<AppAction> }> = ({ notifications, dispatch }) => {
    return (
        <div className="fixed top-5 right-5 z-50 w-full max-w-sm space-y-3">
            {notifications.map(n => 
                <NotificationItem key={n.id} notification={n} onDismiss={() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: n.id })} />
            )}
        </div>
    );
};

const App: React.FC = () => {
  const [state, dispatch] = useReducer(appReducer, { ...initialState, ...loadState() });

  useEffect(() => {
    try {
        const stateToSave = {
          analysisHistory: state.analysisHistory,
          darkMode: state.darkMode,
          settings: state.settings,
        };
        const serializedState = JSON.stringify(stateToSave);
        localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
      } catch (err) {
        console.error("Could not save state to local storage", err);
      }
  }, [state.analysisHistory, state.darkMode, state.settings]);

  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);
  
  useEffect(() => {
    if(!process.env.API_KEY) {
        dispatch({ type: 'SET_API_KEY_STATUS', payload: 'missing' });
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', title: 'Configuration Error', message: 'API key is missing. Please configure it to proceed.' } });
    }
  }, []);
  
  useEffect(() => {
    const statuses: { modelHealth: AppState['systemStatus']['modelHealth'], apiStatus: AppState['systemStatus']['apiStatus'] }[] = [
      { modelHealth: 'online', apiStatus: 'healthy' },
      { modelHealth: 'degraded', apiStatus: 'healthy' },
      { modelHealth: 'online', apiStatus: 'healthy' },
      { modelHealth: 'online', apiStatus: 'unhealthy' },
    ];
    let statusIndex = 0;
    const intervalId = setInterval(() => {
        statusIndex = (statusIndex + 1) % statuses.length;
        const newStatus = statuses[statusIndex];
        const newQueue = Math.floor(Math.random() * 5);
        dispatch({ type: 'UPDATE_SYSTEM_STATUS', payload: { ...newStatus, queueLength: newQueue } });
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  const handleResetWorkspace = useCallback(() => {
    dispatch({type: 'RESET_WORKSPACE' });
  }, []);

  const renderActiveTab = () => {
    switch (state.activeTab) {
      case 'history':
        return <HistoryPanel history={state.analysisHistory} dispatch={dispatch} />;
      case 'settings':
        return <SettingsPanel state={state} dispatch={dispatch} />;
      case 'workspace':
      default:
        return <Workspace state={state} dispatch={dispatch} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      <Sidebar activeTab={state.activeTab} setTab={(tab) => dispatch({ type: 'SET_TAB', payload: tab })} onReset={handleResetWorkspace}/>
      <main className="flex-1 flex flex-col h-full">
        <div className="flex-1 overflow-auto">
            {renderActiveTab()}
        </div>
        <StatusBar apiKeyStatus={state.apiKeyStatus} systemStatus={state.systemStatus} />
      </main>
      <NotificationCenter notifications={state.notifications} dispatch={dispatch} />
    </div>
  );
};

export default App;
