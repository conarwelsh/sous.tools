export interface DocFile {
  title: string;
  slug: string;
  category: "adr" | "spec" | "readme";
  content: string;
}
