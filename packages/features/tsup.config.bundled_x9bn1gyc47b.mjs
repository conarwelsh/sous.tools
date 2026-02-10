// tsup.config.ts
import { defineConfig } from "tsup";
var tsup_config_default = defineConfig([
  {
    entry: {
      client: "src/client.ts",
      index: "src/index.ts"
    },
    format: ["cjs", "esm"],
    dts: true,
    clean: true,
    bundle: true,
    splitting: false,
    banner: {
      js: '"use client";'
    },
    external: [
      "react",
      "react-dom",
      "next/link",
      "next/navigation",
      "@sous/ui",
      "@sous/config",
      "@sous/client-sdk",
      "socket.io-client",
      "lucide-react",
      "react-markdown",
      "remark-gfm"
    ]
  },
  {
    entry: {
      server: "src/server.ts"
    },
    format: ["cjs", "esm"],
    dts: true,
    clean: false,
    bundle: true,
    splitting: false,
    external: [
      "react",
      "react-dom",
      "next/link",
      "next/navigation",
      "@sous/ui",
      "@sous/config",
      "@sous/client-sdk",
      "fs",
      "path",
      "server-only"
    ]
  }
]);
export {
  tsup_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidHN1cC5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiL2hvbWUvY29uYXIvc291cy50b29scy9wYWNrYWdlcy9mZWF0dXJlcy90c3VwLmNvbmZpZy50c1wiO2NvbnN0IF9faW5qZWN0ZWRfZGlybmFtZV9fID0gXCIvaG9tZS9jb25hci9zb3VzLnRvb2xzL3BhY2thZ2VzL2ZlYXR1cmVzXCI7Y29uc3QgX19pbmplY3RlZF9pbXBvcnRfbWV0YV91cmxfXyA9IFwiZmlsZTovLy9ob21lL2NvbmFyL3NvdXMudG9vbHMvcGFja2FnZXMvZmVhdHVyZXMvdHN1cC5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidHN1cFwiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoW1xuICB7XG4gICAgZW50cnk6IHtcbiAgICAgIGNsaWVudDogXCJzcmMvY2xpZW50LnRzXCIsXG4gICAgICBpbmRleDogXCJzcmMvaW5kZXgudHNcIixcbiAgICB9LFxuICAgIGZvcm1hdDogW1wiY2pzXCIsIFwiZXNtXCJdLFxuICAgIGR0czogdHJ1ZSxcbiAgICBjbGVhbjogdHJ1ZSxcbiAgICBidW5kbGU6IHRydWUsXG4gICAgc3BsaXR0aW5nOiBmYWxzZSxcbiAgICBiYW5uZXI6IHtcbiAgICAgIGpzOiAnXCJ1c2UgY2xpZW50XCI7JyxcbiAgICB9LFxuICAgIGV4dGVybmFsOiBbXG4gICAgICBcInJlYWN0XCIsXG4gICAgICBcInJlYWN0LWRvbVwiLFxuICAgICAgXCJuZXh0L2xpbmtcIixcbiAgICAgIFwibmV4dC9uYXZpZ2F0aW9uXCIsXG4gICAgICBcIkBzb3VzL3VpXCIsXG4gICAgICBcIkBzb3VzL2NvbmZpZ1wiLFxuICAgICAgXCJAc291cy9jbGllbnQtc2RrXCIsXG4gICAgICBcInNvY2tldC5pby1jbGllbnRcIixcbiAgICAgIFwibHVjaWRlLXJlYWN0XCIsXG4gICAgICBcInJlYWN0LW1hcmtkb3duXCIsXG4gICAgICBcInJlbWFyay1nZm1cIixcbiAgICBdLFxuICB9LFxuICB7XG4gICAgZW50cnk6IHtcbiAgICAgIHNlcnZlcjogXCJzcmMvc2VydmVyLnRzXCIsXG4gICAgfSxcbiAgICBmb3JtYXQ6IFtcImNqc1wiLCBcImVzbVwiXSxcbiAgICBkdHM6IHRydWUsXG4gICAgY2xlYW46IGZhbHNlLFxuICAgIGJ1bmRsZTogdHJ1ZSxcbiAgICBzcGxpdHRpbmc6IGZhbHNlLFxuICAgIGV4dGVybmFsOiBbXG4gICAgICBcInJlYWN0XCIsXG4gICAgICBcInJlYWN0LWRvbVwiLFxuICAgICAgXCJuZXh0L2xpbmtcIixcbiAgICAgIFwibmV4dC9uYXZpZ2F0aW9uXCIsXG4gICAgICBcIkBzb3VzL3VpXCIsXG4gICAgICBcIkBzb3VzL2NvbmZpZ1wiLFxuICAgICAgXCJAc291cy9jbGllbnQtc2RrXCIsXG4gICAgICBcImZzXCIsXG4gICAgICBcInBhdGhcIixcbiAgICAgIFwic2VydmVyLW9ubHlcIixcbiAgICBdLFxuICB9LFxuXSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXNRLFNBQVMsb0JBQW9CO0FBRW5TLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCO0FBQUEsSUFDRSxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsTUFDUixPQUFPO0FBQUEsSUFDVDtBQUFBLElBQ0EsUUFBUSxDQUFDLE9BQU8sS0FBSztBQUFBLElBQ3JCLEtBQUs7QUFBQSxJQUNMLE9BQU87QUFBQSxJQUNQLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLFFBQVE7QUFBQSxNQUNOLElBQUk7QUFBQSxJQUNOO0FBQUEsSUFDQSxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxJQUNWO0FBQUEsSUFDQSxRQUFRLENBQUMsT0FBTyxLQUFLO0FBQUEsSUFDckIsS0FBSztBQUFBLElBQ0wsT0FBTztBQUFBLElBQ1AsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
