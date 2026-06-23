import { Terminal } from '../apps/Terminal/Terminal';
import { Journal } from '../apps/Journal/Journal';
import { Inventory } from '../apps/Inventory/Inventory';
import { Workshop } from '../apps/Workshop/Workshop';
import { Radio } from '../apps/Radio/Radio';
import type { AppMetadata } from '../types';

import { EditorApp } from '../apps/Editor/Editor';

import { ContainersApp } from '../apps/Containers/ContainersApp';
import { HealthDashboard } from '../apps/HealthDashboard/HealthDashboard';
import { WeatherApp } from '../apps/Weather/Weather';
import { CalculatorApp } from '../apps/Calculator/Calculator';
import { TrashApp } from '../apps/Trash/Trash';
import { ImageViewerApp } from '../apps/ImageViewer/ImageViewer';

export const appRegistry: Record<string, AppMetadata> = {
  editor: {
    id: 'editor',
    title: 'Editor',
    icon: '/icons/files/text.png',
    defaultWidth: 800,
    defaultHeight: 600,
    minWidth: 400,
    minHeight: 300,
    component: EditorApp,
  },
  terminal: {
    id: 'terminal',
    title: 'Terminal',
    icon: '/icons/desktop-apps/terminal.png',
    defaultWidth: 600,
    defaultHeight: 400,
    minWidth: 400,
    minHeight: 300,
    component: Terminal,
  },
  journal: {
    id: 'journal',
    title: 'Journal',
    icon: '/icons/desktop-apps/journal.png',
    defaultWidth: 500,
    defaultHeight: 500,
    minWidth: 300,
    minHeight: 400,
    component: Journal,
  },
  inventory: {
    id: 'inventory',
    title: 'Inventory',
    icon: '/icons/desktop-apps/inventory.png',
    defaultWidth: 650,
    defaultHeight: 450,
    minWidth: 400,
    minHeight: 300,
    component: Inventory,
  },
  workshop: {
    id: 'workshop',
    title: 'Workshop',
    icon: '/icons/desktop-apps/workspace.png',
    defaultWidth: 700,
    defaultHeight: 550,
    minWidth: 500,
    minHeight: 400,
    component: Workshop,
  },
  radio: {
    id: 'radio',
    title: 'Radio',
    icon: '/icons/desktop-apps/radio.png',
    defaultWidth: 350,
    defaultHeight: 500,
    minWidth: 300,
    minHeight: 400,
    component: Radio,
  },
  containers: {
    id: 'containers',
    title: 'Containers',
    icon: '/icons/desktop-apps/container.png',
    defaultWidth: 800,
    defaultHeight: 600,
    minWidth: 500,
    minHeight: 400,
    component: ContainersApp,
  },
  health: {
    id: 'health',
    title: 'System Health',
    icon: '/icons/desktop-apps/heart.png',
    defaultWidth: 700,
    defaultHeight: 500,
    minWidth: 400,
    minHeight: 300,
    component: HealthDashboard,
  },
  weather: {
    id: 'weather',
    title: 'Weather',
    icon: '/icons/desktop-apps/whether.png',
    defaultWidth: 500,
    defaultHeight: 600,
    minWidth: 400,
    minHeight: 500,
    component: WeatherApp,
  },
  calculator: {
    id: 'calculator',
    title: 'Calculator',
    icon: '/icons/desktop-apps/calculator.png',
    defaultWidth: 320,
    defaultHeight: 480,
    minWidth: 300,
    minHeight: 450,
    component: CalculatorApp,
  },
  trash: {
    id: 'trash',
    title: 'Trash',
    icon: '/icons/desktop-apps/trash.png',
    defaultWidth: 600,
    defaultHeight: 450,
    minWidth: 400,
    minHeight: 300,
    component: TrashApp,
  }
};

export const getAppContent = (appId: string, windowId: string, initialData?: any) => {
  if (appId.startsWith('imageviewer')) {
    return <ImageViewerApp initialData={initialData} />;
  }

  if (appId.startsWith('file-')) {
    return <EditorApp />;
  }

  const app = appRegistry[appId];
  if (!app) {
    return (
      <div className="flex items-center justify-center h-full w-full text-gray-500 font-content text-center p-4">
        <p>App &quot;{appId}&quot; not found or not yet implemented.</p>
      </div>
    );
  }
  const Component = app.component;
  return <Component id={windowId} initialData={initialData} />;
};
