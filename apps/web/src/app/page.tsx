import { HomeView, PairingWorkflow, PresentationEditor, LabelEditor } from '@sous/features';

export default function Home() {
  return (
    <div className="space-y-12 p-12">
      <HomeView />
      <PairingWorkflow />
      <PresentationEditor />
      <LabelEditor />
    </div>
  );
}