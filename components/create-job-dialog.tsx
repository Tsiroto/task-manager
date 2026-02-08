"use client";

import * as React from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { createTask } from "@/lib/actions/tasks";

type Props = {
  boardId: string;
  columnId: string;
  onCreated?: () => void;
  triggerLabel?: string; // optional override
};

export default function CreateJobDialog({
  boardId,
  columnId,
  onCreated,
  triggerLabel = "+ Task",
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [title, setTitle] = React.useState("");
  const [subtitle, setSubtitle] = React.useState("");
  const [link, setLink] = React.useState("");
  const [labels, setLabels] = React.useState(""); // comma-separated
  const [priority, setPriority] = React.useState<"low" | "medium" | "high" | "">("");
  const [dueDate, setDueDate] = React.useState("");
  const [description, setDescription] = React.useState("");

  function reset() {
    setTitle("");
    setSubtitle("");
    setLink("");
    setLabels("");
    setPriority("");
    setDueDate("");
    setDescription("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await createTask({
        boardId,
        columnId,
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        link: link.trim() || undefined,
        labels,
        priority: priority || undefined,
        dueDate: dueDate || undefined,
        description: description.trim() || undefined,
      });
      setOpen(false);
      reset();
      onCreated?.();
    } catch (err) {
      console.error(err);
      // keep it simple: you can wire toast here later
      alert(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost">
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="task-title">Title *</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Write onboarding doc"
              autoFocus
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="task-subtitle">Subtitle</Label>
            <Input
              id="task-subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Optional short context"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="task-link">Link</Label>
            <Input
              id="task-link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://…"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="task-labels">Labels (comma separated)</Label>
            <Input
              id="task-labels"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              placeholder="design, urgent, bug"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="task-priority">Priority</Label>
              <select
                id="task-priority"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
              >
                <option value="">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="task-dueDate">Due date</Label>
              <Input
                id="task-dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes, acceptance criteria, next steps…"
              rows={5}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOpen(false);
                reset();
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
