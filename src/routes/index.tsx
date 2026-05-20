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
import { Loader2, Mail, ListChecks, FileText, Copy, Check } from "lucide-react";

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

/**
 * Renders AI text with simple, readable formatting:
 * - Lines ending in ":" become bold headings
 * - Lines starting with "- " or "* " become styled bullets
 * - Blank lines create vertical spacing
 */
function FormattedOutput({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = (key: string) => {
    if (bullets.length === 0) return;
    blocks.push(
      <ul key={key} className="my-2 space-y-1.5 pl-1">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2 leading-relaxed">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>{b}</span>
          </li>
        ))}
      </ul>,
    );
    bullets = [];
  };

  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line) {
      flushBullets(`b-${i}`);
      blocks.push(<div key={`sp-${i}`} className="h-2" />);
      return;
    }
    if (/^[-*•]\s+/.test(line)) {
      bullets.push(line.replace(/^[-*•]\s+/, ""));
      return;
    }
    flushBullets(`b-${i}`);
    if (/:$/.test(line) && line.length < 60) {
      blocks.push(
        <h4 key={`h-${i}`} className="mt-3 mb-1 text-base font-semibold text-foreground">
          {line.replace(/:$/, "")}
        </h4>,
      );
      return;
    }
    blocks.push(
      <p key={`p-${i}`} className="leading-relaxed">
        {line}
      </p>,
    );
  });
  flushBullets("b-end");

  return <div className="text-sm text-foreground">{blocks}</div>;
}

function OutputBox({ value, loading }: { value: string; loading: boolean }) {
  const [copied, setCopied] = useState(false);

  if (!value && !loading) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="mt-5 rounded-lg border bg-muted/40 p-5">
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating…
        </div>
      ) : (
        <>
          <FormattedOutput text={value} />
          <div className="mt-4 flex justify-end border-t pt-3">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="mr-1.5 h-4 w-4" /> Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-4 w-4" /> Copy Output
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  description,
  gradient,
}: {
  icon: typeof Mail;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <CardHeader className="pb-4">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md bg-gradient-to-br ${gradient}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
      </div>
      <CardDescription className="pt-1 text-base">{description}</CardDescription>
    </CardHeader>
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
    <Card className="shadow-sm">
      <SectionTitle icon={Mail} title="Email Generator" description="Draft polished emails in seconds." gradient="from-pink-500 to-rose-500" />
      <CardContent className="space-y-5">
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
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…
            </>
          ) : (
            "Generate Email"
          )}
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
        `You are a friendly daily planning assistant for everyday users. Organize the following tasks into a simple, realistic daily plan.

Tasks:
${tasks}

Rules:
- Use simple, everyday language. No technical or coding jargon.
- Keep it short and practical.
- Group tasks into these sections (skip Evening if not needed): Morning, Midday, Afternoon, Evening.
- Use bullet points (start each task line with "- ").
- At the end, list priorities as High, Medium, Low.
- Make the schedule realistic and easy to follow.

Use exactly this output format (plain text, no markdown headers or bold):

Daily Plan:

Morning:
- Task
- Task

Midday:
- Task

Afternoon:
- Task

Evening:
- Task

Priorities:
- High:
- Medium:
- Low:`,
      );
      setOut(text);
    } catch (e) {
      setOut(`Error: ${e instanceof Error ? e.message : "failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <SectionTitle
        icon={ListChecks}
        title="Task Planner"
        description="Turn your to-do list into a structured day."
        gradient="from-violet-500 to-indigo-500"
      />
      <CardContent className="space-y-5">
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
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…
            </>
          ) : (
            "Create Plan"
          )}
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
        `Summarize the following text for an everyday reader. Use simple language. Output as plain text (no markdown symbols like # or **) using this exact format:

Summary:
A short 2-3 sentence summary.

Key Points:
- Point one
- Point two
- Point three

Action Items:
- Action one
- Action two

Text:
${notes}`,
      );
      setOut(text);
    } catch (e) {
      setOut(`Error: ${e instanceof Error ? e.message : "failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <SectionTitle
        icon={FileText}
        title="Notes Summarizer"
        description="Get the gist, key points, and action items."
      />
      <CardContent className="space-y-5">
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
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…
            </>
          ) : (
            "Summarize"
          )}
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
        <header className="mb-14 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            AI Workplace Productivity Assistant
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Generate emails, plan your day, and summarize notes — all in one place.
          </p>
        </header>

        <main className="space-y-12">
          <EmailSection />
          <TaskSection />
          <NotesSection />
        </main>

        <footer className="mt-16 border-t pt-6 text-center text-xs text-muted-foreground">
          This AI tool may generate incorrect or incomplete information. Please review outputs before using.
        </footer>
      </div>
    </div>
  );
}
