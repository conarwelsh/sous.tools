"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  View, 
  Text, 
  Button, 
  Card, 
  Input, 
  Logo, 
  cn, 
  ScrollView,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@sous/ui";
import { getHttpClient } from "@sous/client-sdk";
import { 
  ChevronLeft, 
  Save, 
  Monitor, 
  Layout as LayoutIcon, 
  Database, 
  Image as ImageIcon,
  Code,
  Check,
  X,
  Info,
  Trash2,
  Plus,
  Settings,
  ChevronRight
} from "lucide-react";
import { Layout, SlotAssignment, LayoutNode } from "../types/presentation.types";
import { TemplateStage } from "./shared/TemplateStage";
import { TemplateSkeletonRenderer } from "./shared/TemplateSkeletonRenderer";
import { LayoutTemplateSelector } from "./shared/LayoutTemplateSelector";
import { ImageSelector } from "./shared/ImageSelector";
import { CodeEditor } from "../../../components/CodeEditor";
import { MenuItemList } from "./shared/MenuItemList";

import { LayoutDesigner } from "./LayoutDesigner";

export interface ScreenEditorProps {
  screen: Layout;
  onSave: (screen: Partial<Layout>) => void;
  onCancel: () => void;
}

export function ScreenEditor({
  screen,
  onSave,
  onCancel,
}: ScreenEditorProps) {
  const handleSave = async (updatedLayout: Partial<Layout>) => {
    onSave(updatedLayout);
  };

  return (
    <LayoutDesigner 
      layout={screen}
      onSave={handleSave}
      onCancel={onCancel}
    />
  );
}
