"use client";

import React, { useState, useRef } from "react";
import { View, Text, Button, Card } from "@sous/ui";
import { Upload, Camera, File, X, Loader2 } from "lucide-react";

export interface DocumentIngestorProps {
  onUpload: (files: File[]) => void;
  isLoading?: boolean;
  acceptedTypes?: string[];
  maxFiles?: number;
  title?: string;
  description?: string;
}

export function DocumentIngestor({
  onUpload,
  isLoading = false,
  acceptedTypes = ["image/jpeg", "image/png", "application/pdf"],
  maxFiles = 5,
  title = "Capture Document",
  description = "Scan paper or upload digital invoices and recipes.",
}: DocumentIngestorProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (files: File[]) => {
    const validFiles = files.filter((f) => acceptedTypes.includes(f.type));
    const newFiles = [...selectedFiles, ...validFiles].slice(0, maxFiles);
    setSelectedFiles(newFiles);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const handleProcess = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
    }
  };

  return (
    <Card className="w-full max-w-2xl bg-zinc-900 border-zinc-800 p-8">
      <View className="items-center text-center mb-8">
        <View className="p-4 bg-sky-500/10 rounded-2xl mb-4">
          <Upload size={32} className="text-sky-500" />
        </View>
        <Text className="text-2xl font-black text-white uppercase tracking-tight mb-2">
          {title}
        </Text>
        <Text className="text-zinc-500 text-sm max-w-sm">
          {description}
        </Text>
      </View>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-12 transition-all flex flex-col items-center justify-center ${
          dragActive
            ? "border-sky-500 bg-sky-500/5"
            : "border-zinc-800 bg-black/20 hover:border-zinc-700"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={acceptedTypes.join(",")}
          onChange={handleChange}
          className="hidden"
        />

        <View className="items-center gap-4">
          <View className="flex-row gap-4">
            <Button
              onClick={onButtonClick}
              variant="outline"
              className="bg-zinc-800 border-zinc-700 px-6 h-12"
            >
              <View className="flex-row items-center gap-2">
                <File size={18} className="text-zinc-400" />
                <Text className="text-white font-bold uppercase text-[10px] tracking-widest">
                  Choose Files
                </Text>
              </View>
            </Button>
            
            {/* Camera action would be Capacitor specific, but we can mock it here */}
            <Button
              onClick={onButtonClick}
              className="bg-sky-500 px-6 h-12"
            >
              <View className="flex-row items-center gap-2">
                <Camera size={18} color="white" />
                <Text className="text-white font-bold uppercase text-[10px] tracking-widest">
                  Use Camera
                </Text>
              </View>
            </Button>
          </View>
          <Text className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
            or drag and drop here
          </Text>
        </View>
      </div>

      {selectedFiles.length > 0 && (
        <View className="mt-8">
          <Text className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-4">
            Selected Documents ({selectedFiles.length}/{maxFiles})
          </Text>
          <View className="gap-2">
            {selectedFiles.map((file, index) => (
              <View
                key={`${file.name}-${index}`}
                className="flex-row items-center justify-between bg-zinc-800/50 border border-zinc-800 p-3 rounded-xl"
              >
                <View className="flex-row items-center gap-3 overflow-hidden">
                  <File size={16} className="text-sky-500 flex-shrink-0" />
                  <Text className="text-zinc-300 text-xs font-medium truncate">
                    {file.name}
                  </Text>
                  <Text className="text-zinc-600 text-[10px] font-mono">
                    {(file.size / 1024 / 1024).toFixed(2)}MB
                  </Text>
                </View>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  <X size={14} className="text-zinc-500" />
                </button>
              </View>
            ))}
          </View>

          <Button
            onClick={handleProcess}
            disabled={isLoading}
            className="w-full mt-8 bg-white h-14"
          >
            {isLoading ? (
              <Loader2 className="animate-spin text-black" size={20} />
            ) : (
              <Text className="text-black font-black uppercase tracking-widest text-xs">
                Start AI Ingestion
              </Text>
            )}
          </Button>
        </View>
      )}
    </Card>
  );
}
