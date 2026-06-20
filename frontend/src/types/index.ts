export interface WindowData {
  id: string;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
}

export interface DesktopApp {
  id: string;
  title: string;
  icon: string;
  x: number;
  y: number;
}

export interface AppMetadata {
  id: string;
  title: string;
  icon: string;
  defaultWidth: number;
  defaultHeight: number;
  minWidth: number;
  minHeight: number;
  component: React.ComponentType;
}
