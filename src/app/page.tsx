import { InteractiveAvatarPlayground } from "@/components/interactive-avatar-playground";
import { MiniAITutor } from "@/components/mini-ai-tutor";

export default function Home() {
  return (
    <main className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">Interactive Avatar Playground</h1>
        <p className="text-center text-muted-foreground">
          Experience HeyGen&apos;s Interactive Streaming Avatar technology
        </p>
      </div>
      <InteractiveAvatarPlayground />
      <MiniAITutor />
    </main>
  );
}