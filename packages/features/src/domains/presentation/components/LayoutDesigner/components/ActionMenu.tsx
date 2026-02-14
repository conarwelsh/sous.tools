"use client";

import React from "react";
import { View, Text, Button, cn } from "@sous/ui";
import { Settings, Save, X, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ActionMenuProps {
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  isPreviewMode: boolean;
  setIsPreviewMode: (preview: boolean) => void;
  setShowSettings: (show: boolean) => void;
  onSave: () => void;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  showMenu,
  setShowMenu,
  isPreviewMode,
  setIsPreviewMode,
  setShowSettings,
  onSave,
}) => {
  return (
    <>
      {/* Mode Toggle (Fixed Top Right) */}
      <div className="absolute top-6 right-6 flex flex-row items-center gap-4 z-[100]">
        <div className="bg-card/80 border border-border rounded-full backdrop-blur-md p-1 flex flex-row items-center relative h-10 w-48">
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-sky-500 rounded-full shadow-lg shadow-sky-500/30",
              isPreviewMode ? "left-[calc(50%+2px)]" : "left-1",
            )}
          />
          <button
            onClick={() => setIsPreviewMode(false)}
            className={cn(
              "flex-1 rounded-full relative z-10 transition-colors h-full items-center justify-center flex",
              !isPreviewMode
                ? "text-white"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Text className="text-[9px] font-black uppercase tracking-widest">
              Editor
            </Text>
          </button>
          <button
            onClick={() => setIsPreviewMode(true)}
            className={cn(
              "flex-1 rounded-full relative z-10 transition-colors h-full items-center justify-center flex",
              isPreviewMode
                ? "text-white"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Text className="text-[9px] font-black uppercase tracking-widest">
              Preview
            </Text>
          </button>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-8 right-8 flex flex-col items-end gap-4 z-[100]">
        <AnimatePresence>
          {showMenu && !isPreviewMode && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="flex flex-col gap-2 mb-2"
            >
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings(true);
                  setShowMenu(false);
                }}
                className="bg-card border border-border h-12 px-6 hover:bg-muted shadow-2xl rounded-xl"
              >
                <div className="flex flex-row items-center gap-3">
                  <Settings size={16} className="text-muted-foreground" />
                  <span className="text-foreground font-black uppercase tracking-widest text-[10px]">
                    Canvas Settings
                  </span>
                </div>
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onSave();
                  setShowMenu(false);
                }}
                className="bg-primary h-12 px-6 hover:bg-primary/90 shadow-2xl rounded-xl"
              >
                <div className="flex flex-row items-center gap-3">
                  <Save size={16} className="text-primary-foreground" />
                  <span className="text-primary-foreground font-black uppercase tracking-widest text-[10px]">
                    Sync Layout
                  </span>
                </div>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!isPreviewMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className={cn(
                  "w-16 h-16 rounded-3xl shadow-2xl items-center justify-center p-0 transition-all duration-300",
                  showMenu
                    ? "bg-card border border-border rotate-90 scale-90"
                    : "bg-sky-500 hover:bg-sky-400",
                )}
              >
                {showMenu ? (
                  <X size={24} className="text-foreground" />
                ) : (
                  <MoreVertical size={24} className="text-white" />
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
