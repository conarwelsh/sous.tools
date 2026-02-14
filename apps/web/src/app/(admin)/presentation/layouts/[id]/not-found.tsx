import React from "react";
import { View, Text, Button } from "@sous/ui";
import Link from "next/link";
import { FileSearch } from "lucide-react";

export default function NotFound() {
  return (
    <View className="flex-1 items-center justify-center bg-background min-h-screen p-8 text-center">
      <View className="w-20 h-20 rounded-3xl bg-muted items-center justify-center mb-8">
        <FileSearch size={40} className="text-muted-foreground" />
      </View>
      <Text className="text-4xl font-black text-foreground uppercase tracking-tighter mb-4">
        Layout Not Found
      </Text>
      <Text className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-8 max-w-md leading-relaxed">
        The layout template you are looking for does not exist or has been
        moved.
      </Text>
      <Link href="/presentation/layouts">
        <Button variant="default" className="h-12 px-8">
          <Text className="text-primary-foreground font-black uppercase tracking-widest text-xs">
            Back to Layouts
          </Text>
        </Button>
      </Link>
    </View>
  );
}
