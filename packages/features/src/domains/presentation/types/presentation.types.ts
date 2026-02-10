export type LayoutNodeType = "container" | "slot" | "fixed";

export interface LayoutNode {
  type: LayoutNodeType;
  id?: string; // Required for 'slot'
  name?: string; // Display name
  styles: Record<string, string | number>;
  children?: LayoutNode[];
  content?: {
    type: string;
    props?: Record<string, any>;
  };
}

export interface LayoutTemplate {
  id: string;
  name: string;
  tags: string[];
  root: LayoutNode;
  isSystem?: boolean;
}

export interface AssignmentContent {
  bindings: Record<
    string,
    {
      type: string;
      value: any;
      props?: Record<string, any>;
    }
  >;
}

export interface SlotAssignment {
  sourceType: 'POS' | 'MEDIA' | 'STATIC';
  dataConfig: {
    filters?: { categoryId?: string; tags?: string[] };
    overrides?: Record<string, { featured?: boolean; soldOut?: boolean; hidden?: boolean }>;
    staticData?: any;
    mediaId?: string;
  };
  component: string; // e.g., 'MenuItemList'
  componentProps: Record<string, any>;
}

export interface ScreenConfig {
  id: string;
  name: string;
  layoutId: string; // Reference to Layout Template
  customCss?: string;
  slots: Record<string, SlotAssignment>; // Keyed by Slot ID from Layout
  // Target Configuration
  assignments: {
    hardware?: string[]; // Array of Display IDs (HDMI ports)
    webSlug?: string;    // URL slug
    isPublic?: boolean;  // Access control
  }
}

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
