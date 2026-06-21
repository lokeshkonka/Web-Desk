export interface EditorFile {
  id: string; // The file ID from Inventory
  name: string;
  content: string;
  isDirty: boolean;
  language: string;
}
