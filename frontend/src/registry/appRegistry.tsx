import { Terminal } from '../apps/Terminal/Terminal';
import { Journal } from '../apps/Journal/Journal';
import { Inventory } from '../apps/Inventory/Inventory';
import { Workshop } from '../apps/Workshop/Workshop';
import { Radio } from '../apps/Radio/Radio';
import type { AppMetadata } from '../types';

export const appRegistry: Record<string, AppMetadata> = {
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
  }
};

export const getAppContent = (appId: string) => {
  const app = appRegistry[appId];
  if (!app) {
    return (
      <div className="flex items-center justify-center h-full w-full text-gray-500 font-content text-center p-4">
        <p>App &quot;{appId}&quot; not found or not yet implemented.</p>
      </div>
    );
  }
  const Component = app.component;
  return <Component />;
};
