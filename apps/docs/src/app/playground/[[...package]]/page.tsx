import { PlaygroundController } from "@sous/features";

export default async function PlaygroundPage({
  params,
}: {
  params: Promise<{ package?: string[] }>;
}) {
  const { package: pkg } = await params;
  return <PlaygroundController pkg={pkg?.[0]} />;
}
