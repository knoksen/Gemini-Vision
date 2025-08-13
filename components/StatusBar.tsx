import React from 'react';
import type { SystemStatus } from '../types';
import { Wifi, WifiOff, Server, KeyRound, AlertTriangle } from 'lucide-react';

interface StatusItemProps {
  status: 'good' | 'medium' | 'bad';
  label: string;
  icon: React.ReactNode;
}

const StatusIndicator: React.FC<{ status: 'good' | 'medium' | 'bad' }> = ({ status }) => {
  const colorClasses = {
    good: 'bg-green-500',
    medium: 'bg-yellow-500',
    bad: 'bg-red-500',
  };
  return <div className={`w-2.5 h-2.5 rounded-full ${colorClasses[status]}`} />;
};

const StatusBarItem: React.FC<StatusItemProps> = ({ status, label, icon }) => {
  const textClasses = {
    good: 'text-gray-700 dark:text-gray-300',
    medium: 'text-yellow-600 dark:text-yellow-400',
    bad: 'text-red-600 dark:text-red-400',
  }
  return (
    <div className={`flex items-center gap-2 text-xs ${textClasses[status]}`}>
      {icon}
      <StatusIndicator status={status} />
      <span>{label}</span>
    </div>
  )
};

interface StatusBarProps {
  apiKeyStatus: 'valid' | 'missing';
  systemStatus: SystemStatus;
}

export const StatusBar: React.FC<StatusBarProps> = ({ apiKeyStatus, systemStatus }) => {
  
  const apiKey: StatusItemProps = {
    status: apiKeyStatus === 'valid' ? 'good' : 'bad',
    label: `API Key: ${apiKeyStatus === 'valid' ? 'Valid' : 'Missing'}`,
    icon: apiKeyStatus === 'valid' ? <KeyRound className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />,
  };
  
  const modelHealth: StatusItemProps = {
    status: systemStatus.modelHealth === 'online' ? 'good' : systemStatus.modelHealth === 'degraded' ? 'medium' : 'bad',
    label: `Model: ${systemStatus.modelHealth.charAt(0).toUpperCase() + systemStatus.modelHealth.slice(1)}`,
    icon: <Server className="w-3.5 h-3.5" />,
  };
  
  const apiStatus: StatusItemProps = {
    status: systemStatus.apiStatus === 'healthy' ? 'good' : 'bad',
    label: `Connection: ${systemStatus.apiStatus.charAt(0).toUpperCase() + systemStatus.apiStatus.slice(1)}`,
    icon: systemStatus.apiStatus === 'healthy' ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />,
  };

  return (
    <footer className="h-8 flex items-center justify-between px-4 bg-gray-100/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
      <div className="flex items-center gap-6">
        <StatusBarItem {...apiKey} />
        <StatusBarItem {...modelHealth} />
        <StatusBarItem {...apiStatus} />
      </div>
       <div className="text-xs">
        Queue: {systemStatus.queueLength}
      </div>
    </footer>
  );
};