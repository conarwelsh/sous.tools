export type LayoutNodeType = "container" | "slot" | "fixed";
export type LayoutType = "TEMPLATE" | "SCREEN" | "LABEL" | "PAGE";

export interface LayoutNode {
  type: LayoutNodeType;
  id?: string; // Required for 'slot'
  name?: string; // Display name
  styles: Record<string, string | number>;
  children?: LayoutNode[];
}

export interface SlotAssignment {
  sourceType: "POS" | "MEDIA" | "STATIC";
  dataConfig: {
    filters?: { categoryId?: string; tags?: string[]; itemIds?: string[] };
    sortOrder?: string[];
    overrides?: Record<
      string,
      { featured?: boolean; soldOut?: boolean; hidden?: boolean }
    >;
    staticData?: any;
    mediaId?: string;
    url?: string;
  };
  component: string; // e.g., 'MenuItemList'
  componentProps: Record<string, any>;
}

export interface LayoutConfig {
  webSlug?: string;
  isPublic?: boolean;
  dimensions?: { width: number; height: number; unit: "px" | "mm" | "in" };
  refreshInterval?: number;
  customCss?: string;
  hardware?: string[]; // Display IDs for Screen assignments
  [key: string]: any;
}

export interface Layout {
  id: string;
  organizationId: string;
  parentId?: string;
  name: string;
  type: LayoutType;
  structure: LayoutNode;
  content: Record<string, SlotAssignment>;
  config: LayoutConfig;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: string[]; // Added by API if TagManager is used
}

// Legacy Aliases for gradual refactoring
export type LayoutTemplate = Layout;
export type ScreenConfig = Layout;

// Legacy support (will be refactored as we implement the new engine)
export interface TemplateSlot {
  id: string;
  name: string;
  type: "image" | "text" | "video" | "pos_feed" | "menu_list";
  required?: boolean;
}

export interface TemplateStructure {
  layout: "grid" | "flex" | "fullscreen";
  config: Record<string, any>;
  slots: TemplateSlot[];
}
