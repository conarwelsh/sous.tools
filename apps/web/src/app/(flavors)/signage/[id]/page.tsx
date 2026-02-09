import React, { Suspense } from "react";
import { SignageView } from "./_components/SignageView";
import { KioskLoading } from "@sous/ui";

export function generateStaticParams() {
  return [{ id: "default" }];
}

export default async function DisplayPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return (
    <Suspense fallback={<KioskLoading suffix="signage" />}>
      <SignageView id={id} />
    </Suspense>
  );
}