"use client";

import { useAuth } from "@sous/features";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Button,
  Badge,
} from "@sous/ui";
import { Copy, RefreshCw, ExternalLink, Check } from "lucide-react";
import { useState } from "react";

export default function DeveloperSettingsPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyToken = () => {
    navigator.clipboard.writeText(localStorage.getItem("token") || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const devLinks = [
    {
      name: "Web App",
      url: "http://localhost:3000",
      desc: "Main Application Interface",
    },
    {
      name: "Documentation",
      url: "http://localhost:3001",
      desc: "Project Documentation Site",
    },
    {
      name: "API Swagger",
      url: "http://localhost:4000/docs",
      desc: "Swagger UI for REST endpoints",
    },
    {
      name: "GraphQL Playground",
      url: "http://localhost:4000/graphql",
      desc: "Apollo Sandbox for GQL queries",
    },
    {
      name: "MailDev",
      url: "http://localhost:1080",
      desc: "Local email preview server",
    },
    {
      name: "Adminer",
      url: "http://localhost:8083",
      desc: "Database management interface",
    },
    {
      name: "Redis Insight",
      url: "http://localhost:5540",
      desc: "Redis cache inspection",
    },
    {
      name: "Minio Console",
      url: "http://localhost:9001",
      desc: "S3-compatible Object Storage",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-lg font-medium">Developer Portal</h3>
        <p className="text-sm text-muted-foreground">
          Manage your API access and view development resources.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devLinks.map((link) => (
          <Card key={link.name} className="bg-muted/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                {link.name}
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                </a>
              </CardTitle>
              <CardDescription>{link.desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Access Token</CardTitle>
          <CardDescription>
            Your current session token. Use this as a Bearer token in
            Authorization headers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm flex-1 truncate">
              {localStorage.getItem("token")?.substring(0, 40)}...
            </code>
            <Button variant="outline" size="icon" onClick={copyToken}>
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="bg-yellow-500/10 text-yellow-600 p-4 rounded-lg text-sm">
            ⚠️ Treat this token like a password. It grants full access to your
            account scope.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>OAuth Applications</CardTitle>
          <CardDescription>
            Register third-party applications to access the Sous API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">Register New App</Button>
        </CardContent>
      </Card>
    </div>
  );
}
