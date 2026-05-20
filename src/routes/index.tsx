import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Mail, ListChecks, FileText } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Generate emails, plan tasks, and summarize notes with an AI-powered workplace assistant.",
      },
    ],
  }),
});

async function runAI(prompt: string): Promise<string> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { text: string };
  return data.text;
}

function OutputBox({ value, loading }: { value: string; loading: boolean }) {
  if (!value && !loading) return null;
  return (
    <div className="mt-4 rounded-lg border bg-muted/40 p-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Generating…
        </div>
      ) : (
        value
      )}
    </div>
  );
}

function EmailSection() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Formal");
  const [audience, setAudience] = useState("Manager");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  const onGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setOut("");
    try {
      const text = await runAI(
        `Write a professional email.\nTopic: ${topic}\nTone: ${tone}\nAudience: ${audience}\nMake it clear, polite, and well structured. Include a subject line.`,
      );
      setOut(text);
    } catch (e) {
      setOut(`Error: ${e instanceof Error ? e.message : "failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <CardTitle>Email Generator</CardTitle>
        </div>
        <CardDescription>Draft polished emails in seconds.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email-topic">Email Topic</Label>
          <Input
            id="email-topic"
            placeholder="e.g. Request a project deadline extension"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Formal">Formal</SelectItem>
                <SelectItem value="Friendly">Friendly</SelectItem>
                <SelectItem value="Persuasive">Persuasive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Audience</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Client">Client</SelectItem>
                <SelectItem value="Team">Team</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={onGenerate} disabled={loading || !topic.trim()}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Email
        </Button>
        <OutputBox value={out} loading={loading} />
      </CardContent>
    </Card>
  );
}

function TaskSection() {
  const [tasks, setTasks] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  const onGenerate = async () => {
    if (!tasks.trim()) return;
    setLoading(true);
    setOut("");
    try {
      const text = await runAI(
        `Organize these tasks into a daily plan: ${tasks}\n- Prioritize tasks\n- Suggest time blocks\n- Make the plan realistic and easy to follow`,
      );
      setOut(text);
    } catch (e) {
      setOut(`Error: ${e instanceof Error ? e.message : "failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-primary" />
          <CardTitle>Task Planner</CardTitle>
        </div>
        <CardDescription>Turn your to-do list into a structured day.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tasks">Enter your tasks</Label>
          <Textarea
            id="tasks"
            rows={6}
            placeholder="List everything you need to get done today…"
            value={tasks}
            onChange={(e) => setTasks(e.target.value)}
          />
        </div>
        <Button onClick={onGenerate} disabled={loading || !tasks.trim()}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Plan
        </Button>
        <OutputBox value={out} loading={loading} />
      </CardContent>
    </Card>
  );
}

function NotesSection() {
  const [notes, setNotes] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  const onGenerate = async () => {
    if (!notes.trim()) return;
    setLoading(true);
    setOut("");
    try {
      const text = await runAI(
        `Summarize this text: ${notes}\nProvide:\n- Short summary\n- Key points\n- Action items\nKeep it simple and clear.`,
      );
      setOut(text);
    } catch (e) {
      setOut(`Error: ${e instanceof Error ? e.message : "failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle>Notes Summarizer</CardTitle>
        </div>
        <CardDescription>Get the gist, key points, and action items.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notes">Paste your notes</Label>
          <Textarea
            id="notes"
            rows={8}
            placeholder="Paste meeting notes, articles, or any text…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <Button onClick={onGenerate} disabled={loading || !notes.trim()}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Summarize
        </Button>
        <OutputBox value={out} loading={loading} />
      </CardContent>
    </Card>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            AI Workplace Productivity Assistant
          </h1>
          <p className="mt-3 text-muted-foreground">
            Generate emails, plan your day, and summarize notes — all in one place.
          </p>
        </header>

        <main className="space-y-8">
          <EmailSection />
          <TaskSection />
          <NotesSection />
        </main>

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          This AI tool may generate incorrect or incomplete information. Please review outputs before using.
        </footer>
      </div>
    </div>
  );
}
