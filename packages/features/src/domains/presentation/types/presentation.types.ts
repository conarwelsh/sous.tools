export interface TemplateSlot {
  id: string;
  name: string;
  type: "image" | "text" | "video" | "pos_feed" | "menu_list";
  required?: boolean;
}

export interface TemplateStructure {
  layout: "grid" | "flex" | "fullscreen";
  config: Record<string, any>; // e.g., grid columns, gap, etc.
  slots: TemplateSlot[];
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
