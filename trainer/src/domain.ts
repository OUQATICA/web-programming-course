export type Option = { id: string; label: string };

type TaskBase = {
  id: string;
  topic: string;
  prompt: string;
  code?: string;
};

export type SingleChoiceTask = TaskBase & {
  kind: "single-choice";
  options: Option[];
};

export type ShortTextTask = TaskBase & {
  kind: "short-text";
};

export type Task = SingleChoiceTask | ShortTextTask;

export type TrainingSet = {
  id: string;
  title: string;
  tasks: Task[];
};

export type SingleChoiceAnswer = {
  taskId: string;
  kind: "single-choice";
  optionId: string;
};

export type ShortTextAnswer = {
  taskId: string;
  kind: "short-text";
  text: string;
};

export type Answer = SingleChoiceAnswer | ShortTextAnswer;

export type Progress = { answered: number; total: number };

export function findTaskById(set: TrainingSet, id: string): Task | undefined {
  return set.tasks.find((task) => task.id === id);
}

export function filterTasksByTopic(set: TrainingSet, topic: string): Task[] {
  return set.tasks.filter((task) => task.topic === topic);
}

export function isAnswerFilled(answer: Answer): boolean {
  switch (answer.kind) {
    case "single-choice":
      return answer.optionId !== "";
    case "short-text":
      return answer.text.trim() !== "";
  }
}

export function countProgress(set: TrainingSet, answers: Answer[]): Progress {
  const answered = set.tasks.filter((task) =>
    answers.some((answer) => answer.taskId === task.id && isAnswerFilled(answer)),
  ).length;
  return { answered, total: set.tasks.length };
}