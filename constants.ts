
import type { TaskCategory } from './types';
import { MessageSquare, FileText, Activity, Shield, TrendingUp, Target, Eye, BookOpen } from 'lucide-react';

export const TASK_CATEGORIES: Record<string, TaskCategory> = {
  general: {
    name: 'General AI Tasks',
    color: 'blue',
    tasks: [
      {
        value: 'vqa',
        label: 'Visual Q&A',
        icon: MessageSquare,
        description: 'Ask questions about image content',
        examples: ['What objects are visible?', 'Describe the scene', 'What is the main subject?'],
      },
      {
        value: 'captioning',
        label: 'Image Captioning',
        icon: FileText,
        description: 'Generate detailed image descriptions',
        examples: ['Create a detailed caption', 'Describe for accessibility', 'Suggest a social media post'],
      },
    ],
  },
  healthcare: {
    name: 'Healthcare & Medical',
    color: 'red',
    tasks: [
      {
        value: 'medical-analysis',
        label: 'Medical Image Analysis',
        icon: Activity,
        description: 'Analyze medical imaging and reports',
        examples: ['Describe visible anatomical features', 'Identify key findings from this scan', 'Extract medical data'],
      },
      {
        value: 'pharmacy',
        label: 'Pharmaceutical Recognition',
        icon: Shield,
        description: 'Identify medications and labels',
        examples: ['Read this medication label', 'Identify pill characteristics', 'Extract dosage information'],
      },
    ],
  },
  finance: {
    name: 'Finance & Business',
    color: 'green',
    tasks: [
      {
        value: 'financial-docs',
        label: 'Financial Document Analysis',
        icon: TrendingUp,
        description: 'Process financial reports and statements',
        examples: ['Extract key financial metrics', 'Summarize this quarterly report', 'Identify trends from the chart'],
      },
    ],
  },
  ecommerce: {
    name: 'E-commerce & Retail',
    color: 'purple',
    tasks: [
      {
        value: 'product-analysis',
        label: 'Product Catalog Analysis',
        icon: Target,
        description: 'Analyze product images for listings',
        examples: ['Generate a product description', 'Identify key features', 'Suggest a pricing category'],
      },
      {
        value: 'brand-recognition',
        label: 'Brand & Logo Recognition',
        icon: Eye,
        description: 'Identify brands and logos in images',
        examples: ['Identify all visible brands', 'Analyze this logo', 'Check for brand compliance'],
      },
    ],
  },
  education: {
    name: 'Education & Research',
    color: 'indigo',
    tasks: [
      {
        value: 'academic-analysis',
        label: 'Academic Content Analysis',
        icon: BookOpen,
        description: 'Analyze educational materials and research',
        examples: ['Explain this diagram', 'Summarize the research findings shown', 'Create study notes from this page'],
      },
      {
        value: 'document-ocr',
        label: 'Document OCR & Extraction',
        icon: FileText,
        description: 'Extract and process text from documents',
        examples: ['Convert this image to text', 'Extract key information from the form', 'Format for accessibility'],
      },
    ],
  },
};

export const ALL_TASKS = Object.values(TASK_CATEGORIES).flatMap(category => category.tasks);
