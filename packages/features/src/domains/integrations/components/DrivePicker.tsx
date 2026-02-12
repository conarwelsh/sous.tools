"use client";

import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  Button, 
  Card, 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  cn,
  ScrollView,
  Logo
} from "@sous/ui";
import { 
  Folder, 
  FileText, 
  Image as ImageIcon, 
  ChevronRight, 
  Search, 
  X, 
  Check,
  ChevronLeft,
  HardDrive
} from "lucide-react";
import { getHttpClient } from "@sous/client-sdk";

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  thumbnailLink?: string;
}

interface DrivePickerProps {
  open: boolean;
  onSelect: (files: GoogleDriveFile[]) => void;
  onCancel: () => void;
  multiSelect?: boolean;
}

export const DrivePicker: React.FC<DrivePickerProps> = ({
  open,
  onSelect,
  onCancel,
  multiSelect = false,
}) => {
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [path, setPath] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const currentFolderId = path.length > 0 ? path[path.length - 1].id : undefined;

  const fetchFiles = async (folderId?: string) => {
    setLoading(true);
    try {
      const http = await getHttpClient();
      const data = await http.get<GoogleDriveFile[]>(`/integrations/google-drive/files${folderId ? `?folderId=${folderId}` : ''}`);
      setFiles(data);
    } catch (e) {
      console.error("Failed to fetch Google Drive files", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchFiles(currentFolderId);
    } else {
      setSelectedIds(new Set());
      setPath([]);
    }
  }, [open, currentFolderId]);

  const handleFolderClick = (folder: GoogleDriveFile) => {
    setPath([...path, { id: folder.id, name: folder.name }]);
  };

  const handleBack = () => {
    setPath(path.slice(0, -1));
  };

  const toggleSelect = (file: GoogleDriveFile) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(file.id)) {
      newSet.delete(file.id);
    } else {
      if (!multiSelect) newSet.clear();
      newSet.add(file.id);
    }
    setSelectedIds(newSet);
  };

  const handleConfirm = () => {
    const selectedFiles = files.filter(f => selectedIds.has(f.id));
    onSelect(selectedFiles);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-4xl h-[70vh] flex flex-col p-0 bg-background border-border overflow-hidden">
        <DialogHeader className="p-6 border-b border-border bg-muted/30">
          <View className="flex-row justify-between items-center">
            <View>
              <DialogTitle className="text-2xl font-black text-foreground uppercase tracking-tighter">
                Browse Google Drive
              </DialogTitle>
              <View className="flex-row items-center gap-2 mt-1">
                <Button 
                  variant="ghost" 
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => setPath([])}
                >
                  <HardDrive size={12} className="text-muted-foreground" />
                  <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">My Drive</Text>
                </Button>
                {path.map((p, i) => (
                  <React.Fragment key={p.id}>
                    <ChevronRight size={10} className="text-muted-foreground/40" />
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => setPath(path.slice(0, i + 1))}
                    >
                      <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{p.name}</Text>
                    </Button>
                  </React.Fragment>
                ))}
              </View>
            </View>
          </View>
        </DialogHeader>

        <View className="flex-1 overflow-hidden relative">
          {loading && (
            <View className="absolute inset-0 z-50 bg-background/60 backdrop-blur-sm items-center justify-center">
              <Logo size={48} animate />
            </View>
          )}

          <ScrollView className="flex-1 p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {path.length > 0 && (
                <Card 
                  onClick={handleBack}
                  className="p-4 bg-muted/20 border-border hover:bg-muted/40 cursor-pointer items-center justify-center border-dashed"
                >
                  <ChevronLeft size={24} className="text-muted-foreground mb-2" />
                  <Text className="text-[10px] font-black text-muted-foreground uppercase">Back</Text>
                </Card>
              )}

              {files.map((file) => {
                const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                const isSelected = selectedIds.has(file.id);

                return (
                  <Card 
                    key={file.id}
                    onClick={() => isFolder ? handleFolderClick(file) : toggleSelect(file)}
                    className={cn(
                      "p-4 bg-card border-border hover:border-primary/50 cursor-pointer transition-all group relative",
                      isSelected && "border-primary bg-primary/5 ring-1 ring-primary"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-primary rounded-full p-0.5">
                        <Check size={10} className="text-primary-foreground" />
                      </div>
                    )}
                    
                    <View className="items-center justify-center mb-3 aspect-square bg-muted/30 rounded-xl">
                      {isFolder ? (
                        <Folder size={32} className="text-sky-500 fill-sky-500/20" />
                      ) : file.mimeType === 'application/vnd.google-apps.document' ? (
                        <FileText size={32} className="text-blue-500" />
                      ) : file.mimeType.includes('image/') ? (
                        <ImageIcon size={32} className="text-emerald-500" />
                      ) : (
                        <FileText size={32} className="text-amber-500" />
                      )}
                    </View>
                    
                    <Text className="text-[10px] font-bold text-foreground text-center line-clamp-2 uppercase tracking-tighter">
                      {file.name}
                    </Text>
                  </Card>
                );
              })}
            </div>

            {!loading && files.length === 0 && (
              <View className="items-center justify-center py-20 opacity-30">
                <Search size={48} className="text-muted-foreground mb-4" />
                <Text className="text-muted-foreground font-black uppercase text-xs">No matching files found</Text>
              </View>
            )}
          </ScrollView>
        </View>

        <DialogFooter className="p-6 border-t border-border bg-muted/30">
          <Button variant="ghost" onClick={onCancel}>
            <Text className="text-muted-foreground font-bold uppercase text-xs tracking-widest">Cancel</Text>
          </Button>
          <Button 
            disabled={selectedIds.size === 0}
            onClick={handleConfirm}
            className="bg-primary px-8 h-12"
          >
            <Text className="text-primary-foreground font-black uppercase text-xs tracking-widest">
              {selectedIds.size > 0 ? `Import ${selectedIds.size} File${selectedIds.size > 1 ? 's' : ''}` : 'Select Files'}
            </Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
