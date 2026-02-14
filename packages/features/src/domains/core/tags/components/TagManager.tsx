"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { View, Text, Logo, Input, Button, cn } from "@sous/ui";
import { getHttpClient } from "@sous/client-sdk";
import { Search, Plus, X, Tag as TagIcon, Check } from "lucide-react";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagManagerProps {
  entityType: string;
  entityId: string;
}

export const TagManager: React.FC<TagManagerProps> = ({
  entityType,
  entityId,
}) => {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [assignedTagIds, setAssignedTagIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    // Skip if entityId is a placeholder (e.g., 'new-layout' in designer)
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        entityId,
      );
    if (!isUuid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const http = await getHttpClient();
      const [tags, assignments] = await Promise.all([
        http.get<Tag[]>("/tags"),
        http.get<any[]>(`/tags/assignments/${entityType}/${entityId}`),
      ]);
      setAvailableTags(tags);
      setAssignedTagIds(assignments.map((a: any) => a.tagId));
    } catch (e) {
      console.error("Failed to fetch tags", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (entityId) {
      void fetchData();
    }
  }, [entityType, entityId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTags = useMemo(() => {
    return availableTags.filter((tag) =>
      tag.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [availableTags, search]);

  const assignedTags = useMemo(() => {
    return availableTags.filter((tag) => assignedTagIds.includes(tag.id));
  }, [availableTags, assignedTagIds]);

  const updateAssignments = async (newTagIds: string[]) => {
    const previousTagIds = [...assignedTagIds];
    setAssignedTagIds(newTagIds);
    setIsSaving(true);
    try {
      const http = await getHttpClient();
      await http.post(`/tags/assignments/${entityType}/${entityId}`, {
        tagIds: newTagIds,
      });
    } catch (e) {
      console.error("Failed to update tags", e);
      setAssignedTagIds(previousTagIds);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTag = (tagId: string) => {
    const newTagIds = assignedTagIds.includes(tagId)
      ? assignedTagIds.filter((id) => id !== tagId)
      : [...assignedTagIds, tagId];
    void updateAssignments(newTagIds);
  };

  const createTag = async () => {
    if (!search.trim()) return;

    setIsSaving(true);
    try {
      const http = await getHttpClient();
      // Random professional color
      const colors = [
        "#3b82f6",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#ec4899",
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const newTag = await http.post<Tag>("/tags", {
        name: search.trim(),
        color: randomColor,
      });

      setAvailableTags([...availableTags, newTag]);
      void updateAssignments([...assignedTagIds, newTag.id]);
      setSearch("");
      setIsDropdownOpen(false);
    } catch (e) {
      console.error("Failed to create tag", e);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View className="p-4 flex items-center justify-center">
        <Logo size={24} animate />
      </View>
    );
  }

  const showCreateOption =
    search.trim() !== "" &&
    !availableTags.some((t) => t.name.toLowerCase() === search.toLowerCase());

  return (
    <View className="space-y-3 relative" ref={dropdownRef}>
      <View className="flex flex-row justify-between items-center">
        <Text className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
          Tags & Categorization
        </Text>
        {isSaving && (
          <Text className="text-[8px] font-bold text-sky-500 uppercase animate-pulse">
            Syncing...
          </Text>
        )}
      </View>

      {/* Selected Tags Display */}
      <View className="flex flex-row flex-wrap gap-1.5 mb-2">
        {assignedTags.map((tag) => (
          <div
            key={tag.id}
            className="flex flex-row items-center gap-1.5 px-2 py-1 rounded-md border border-zinc-800 bg-zinc-900/50 group transition-colors hover:border-zinc-700"
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: tag.color }}
            />
            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-tight">
              {tag.name}
            </span>
            <button
              onClick={() => toggleTag(tag.id)}
              className="text-zinc-600 hover:text-red-400 transition-colors"
            >
              <X size={10} />
            </button>
          </div>
        ))}
      </View>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
          <Search size={14} />
        </div>
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          placeholder="Search or create tags..."
          className="pl-10 h-10 bg-black/40 border-zinc-800 text-xs focus:ring-sky-500/20"
        />
      </div>

      {/* Dropdown Results */}
      {isDropdownOpen && (search || filteredTags.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-[100] max-h-60 overflow-y-auto overflow-x-hidden py-2">
          {filteredTags.map((tag) => {
            const isAssigned = assignedTagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className="w-full flex flex-row items-center justify-between px-4 py-2 hover:bg-zinc-800 transition-colors text-left"
              >
                <div className="flex flex-row items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-xs font-bold text-white uppercase tracking-tight">
                    {tag.name}
                  </span>
                </div>
                {isAssigned && <Check size={12} className="text-sky-500" />}
              </button>
            );
          })}

          {showCreateOption && (
            <button
              onClick={createTag}
              className="w-full flex flex-row items-center gap-3 px-4 py-3 hover:bg-sky-500/10 transition-colors text-left border-t border-zinc-800 mt-1"
            >
              <div className="w-6 h-6 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-500">
                <Plus size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">
                  Create New Tag
                </span>
                <span className="text-[10px] text-zinc-500 italic">
                  "{search}"
                </span>
              </div>
            </button>
          )}

          {!showCreateOption && filteredTags.length === 0 && (
            <div className="px-4 py-4 text-center">
              <Text className="text-[10px] text-zinc-600 font-bold uppercase italic">
                No tags found
              </Text>
            </div>
          )}
        </div>
      )}
    </View>
  );
};
