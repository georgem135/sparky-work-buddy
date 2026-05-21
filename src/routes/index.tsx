import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Mail,
  ListChecks,
  FileText,
  Copy,
  Check,
  Sparkles,
  RotateCw,
  Zap,
  Lightbulb,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Sparky – Work Smarter with AI" },
      {
        name: "description",
        content:
          "Sparky is your AI assistant for emails, task planning, and note summaries. Save time, stay organized, focus on what matters.",
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

function OutputBox({
  value,
  loading,
  onRegenerate,
}: {
  value: string;
  loading: boolean;
  onRegenerate?: () => void;
}) {
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
    <div className="mt-6 overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-white via-white to-primary/5 shadow-inner">
      <div className="flex items-center justify-between border-b border-primary/10 bg-white/60 px-5 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold tracking-tight">Generated Output</span>
        </div>
        {loading && (
          <span className="text-xs text-muted-foreground">⚡ Sparky is thinking…</span>
        )}
      </div>

      <div className="p-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-sm text-muted-foreground">
            <div className="relative">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <Sparkles className="absolute inset-0 m-auto h-3.5 w-3.5 text-primary" />
            </div>
            <span>⚡ Sparky is thinking…</span>
          </div>
        ) : (
          <>
            <FormattedOutput text={value} />
            <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-primary/10 pt-4">
              {onRegenerate && (
                <Button variant="outline" size="sm" onClick={onRegenerate}>
                  <RotateCw className="mr-1.5 h-4 w-4" /> Regenerate
                </Button>
              )}
              <Button variant="default" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="mr-1.5 h-4 w-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 h-4 w-4" /> Copy
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  description,
  gradient,
  tag,
}: {
  icon: typeof Mail;
  title: string;
  description: string;
  gradient: string;
  tag: string;
}) {
  return (
    <CardHeader className="pb-4">
      <div className="mb-2 flex items-center justify-between">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md bg-gradient-to-br ${gradient}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary hover:bg-primary/15">
          {tag}
        </Badge>
      </div>
      <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
      <CardDescription className="pt-1 text-sm">{description}</CardDescription>
    </CardHeader>
  );
}

function HintBox({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-dashed border-primary/25 bg-primary/5 p-3 text-xs text-muted-foreground">
      <div className="mb-1 flex items-center gap-1.5 font-semibold text-primary">
        <Lightbulb className="h-3.5 w-3.5" /> {title}
      </div>
      <ul className="space-y-0.5 pl-5 list-disc marker:text-primary/60">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

const cardClass =
  "rounded-3xl border-white/60 bg-white/85 shadow-xl shadow-primary/5 backdrop-blur-sm transition hover:shadow-2xl hover:shadow-primary/10";

function SmartModeSection() {
  const [input, setInput] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  const onGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOut("");
    try {
      const text = await runAI(
        `You are Sparky, a friendly AI productivity assistant. The user described their day or work below. Produce ONE combined Smart Plan with these sections in plain text (no markdown symbols), each header ending with a colon:

Daily Plan:
- Bullet tasks grouped simply by Morning / Midday / Afternoon.

Suggested Emails:
- 1-3 short bullets describing emails they should send (who + purpose).

Key Summary:
- 2-3 bullets summarizing the most important info from what they wrote.

Action Steps:
- 3-5 clear next steps in priority order.

Keep it concise, practical, and non-technical.

User input:
${input}`,
      );
      setOut(text);
    } catch (e) {
      setOut(`Error: ${e instanceof Error ? e.message : "failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      id="smart-mode"
      className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 text-white shadow-2xl shadow-fuchsia-500/30"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Zap className="h-5 w-5" />
          </span>
          <Badge className="rounded-full border-0 bg-white/20 text-white hover:bg-white/25">
            ✨ New
          </Badge>
        </div>
        <CardTitle className="mt-2 text-2xl font-bold tracking-tight">⚡ Smart Mode</CardTitle>
        <CardDescription className="text-white/85">
          Describe your day — Sparky plans tasks, drafts email ideas, summarizes info, and lists next steps in one go.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          rows={4}
          placeholder="e.g. I have a client meeting at 11, need to finish the report, follow up with my manager, and prep for tomorrow's presentation…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border-white/30 bg-white/15 text-white placeholder:text-white/60 focus-visible:ring-white/50"
        />
        <Button
          onClick={onGenerate}
          disabled={loading || !input.trim()}
          className="bg-white text-violet-700 hover:bg-white/90"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sparky is thinking…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> Generate Smart Plan
            </>
          )}
        </Button>
        <div className="rounded-2xl bg-white/95 p-1 text-foreground">
          <OutputBox value={out} loading={loading} onRegenerate={onGenerate} />
          {!out && !loading && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Your Smart Plan will appear here.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmailSection({ innerRef }: { innerRef: React.Ref<HTMLDivElement> }) {
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
    <Card ref={innerRef} id="email" className={cardClass}>
      <SectionTitle
        icon={Mail}
        title="Email Generator"
        description="Enter a topic and generate a professional email instantly."
        gradient="from-pink-500 to-rose-500"
        tag="Most Used"
      />
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email-topic">Email Topic</Label>
          <Input
            id="email-topic"
            placeholder="e.g. Request a project deadline extension"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <HintBox
            title="Try:"
            items={["Request deadline extension", "Apologize to a client", "Follow up on meeting"]}
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
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sparky is thinking…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> Generate Email
            </>
          )}
        </Button>
        <OutputBox value={out} loading={loading} onRegenerate={onGenerate} />
      </CardContent>
    </Card>
  );
}

function TaskSection({ innerRef }: { innerRef: React.Ref<HTMLDivElement> }) {
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
    <Card ref={innerRef} id="tasks" className={cardClass}>
      <SectionTitle
        icon={ListChecks}
        title="Task Planner"
        description="List your tasks and get a structured daily plan."
        gradient="from-violet-500 to-indigo-500"
        tag="Daily Tool"
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
          <HintBox title="Example:" items={["Study, gym, meeting, assignment"]} />
        </div>
        <Button onClick={onGenerate} disabled={loading || !tasks.trim()}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sparky is thinking…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> Create Plan
            </>
          )}
        </Button>
        <OutputBox value={out} loading={loading} onRegenerate={onGenerate} />
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
    <Card id="notes" className={cardClass}>
      <SectionTitle
        icon={FileText}
        title="Notes Summarizer"
        description="Paste your notes and extract key insights quickly."
        gradient="from-amber-500 to-orange-500"
        tag="Quick Insights"
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
          <HintBox title="Example:" items={["Paste meeting notes or long text"]} />
        </div>
        <Button onClick={onGenerate} disabled={loading || !notes.trim()}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sparky is thinking…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> Summarize
            </>
          )}
        </Button>
        <OutputBox value={out} loading={loading} onRegenerate={onGenerate} />
      </CardContent>
    </Card>
  );
}

function Index() {
  const emailRef = useRef<HTMLDivElement>(null);
  const taskRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <header className="mb-12 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary shadow-sm ring-1 ring-primary/15 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Your friendly AI sidekick
          </span>
          <h1 className="mt-5 bg-gradient-to-r from-pink-500 via-violet-500 to-indigo-500 bg-clip-text text-4xl font-bold leading-tight tracking-tight text-transparent sm:text-5xl">
            ⚡ Work Smarter with Sparky
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg font-medium text-foreground/80">
            Your AI assistant for emails, task planning, and note summaries.
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Save time, stay organized, and focus on what matters most.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" onClick={() => scrollTo(emailRef)} className="rounded-full shadow-lg shadow-primary/25">
              <Mail className="mr-2 h-4 w-4" /> Try Email Generator
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollTo(taskRef)}
              className="rounded-full border-primary/30 bg-white/70 backdrop-blur"
            >
              <ListChecks className="mr-2 h-4 w-4" /> Plan My Day
            </Button>
          </div>
        </header>

        <main className="space-y-14">
          <SmartModeSection />
          <EmailSection innerRef={emailRef} />
          <TaskSection innerRef={taskRef} />
          <NotesSection />
        </main>

        <footer className="mt-20 space-y-3 border-t pt-8 text-center text-xs text-muted-foreground">
          <p className="mx-auto max-w-xl rounded-xl bg-amber-50 px-4 py-3 text-amber-900 ring-1 ring-amber-200">
            ⚠️ <span className="font-semibold">AI Disclaimer:</span> This AI may generate incorrect or
            incomplete information. Please review outputs before use.
          </p>
          <p className="font-medium text-foreground/70">Made by Vhelaphi Maluleke</p>
          <p>CAPACITI AI Project</p>
        </footer>
      </div>
    </div>
  );
}
