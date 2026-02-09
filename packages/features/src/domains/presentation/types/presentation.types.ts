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
