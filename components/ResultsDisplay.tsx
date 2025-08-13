import React, { useMemo } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { Button } from './ui';

interface ResultsDisplayProps {
  results: string;
  isLoading: boolean;
  onExport: () => void;
}

const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const formattedText = useMemo(() => {
    return text
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.substring(4)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-bold mt-5 mb-3 border-b pb-2 border-gray-300 dark:border-gray-600">{line.substring(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold mt-6 mb-4 border-b pb-2 border-gray-300 dark:border-gray-600">{line.substring(2)}</h1>;
        }
        if (line.startsWith('* ')) {
          return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
        }
        if (line.match(/^\d+\. /)) {
            return <li key={index} className="ml-5 list-decimal">{line.substring(line.indexOf(' ') + 1)}</li>
        }
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <p key={index} className="my-1">{line || <br />}</p>;
      })
  }, [text]);

  return <>{formattedText}</>;
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, isLoading, onExport }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (!results) return;
    navigator.clipboard.writeText(results);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return null;
  }

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-6">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 11.55C12 10.12 10.88 9 9.45 9H5.45C4.12 9 3 10.12 3 11.55C3 12.72 3.82 13.68 4.88 13.93L6.5 17.5L8.12 13.93C9.18 13.68 10 12.72 10 11.55V11.55z"/><path d="m21 12-4.17 4.17A2.82 2.82 0 0 1 15 17.5V19a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1.5a2.82 2.82 0 0 1-.83-1.33L9.5 12.5"/><path d="m14 7 1-1 1 1"/><path d="m18 7 1-1 1 1"/></svg>
        </div>
        <h3 className="text-lg font-semibold">AI Output</h3>
        <p className="max-w-md">Your analysis results will appear here once processing is complete.</p>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold text-lg">Analysis Result</h3>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!results}>
              {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button variant="ghost" size="sm" onClick={onExport} disabled={!results}>
                <Download className="h-4 w-4 mr-2" />
                Export
            </Button>
        </div>
      </div>
      <div className="prose dark:prose-invert prose-sm max-w-none p-6 overflow-y-auto flex-grow">
        <SimpleMarkdown text={results} />
      </div>
    </div>
  );
};