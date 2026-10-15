import { useState } from "react";
import { findTaskById } from "./domain";

import type { Task } from "./domain";

import type { TrainingSet } from "./domain";

export const webBasics: TrainingSet = {
  id: "web-basics",
  title: "Основы веб-программирования",
  tasks: [
    {
      id: "ts-1",
      kind: "single-choice",
      topic: "typescript",
      prompt: "Что выведет этот JavaScript-код?",
      code: 'console.log("10" * 5);',
      options: [
        { id: "a", label: "105" },
        { id: "b", label: "50" },
        { id: "c", label: "Ошибка" },
      ],
    },
    {
      id: "ts-2",
      kind: "single-choice",
      topic: "typescript",
      prompt: "Что возвращает find, если элемент не найден?",
      options: [
        { id: "a", label: "undefined" },
        { id: "b", label: "Пустой массив" },
        { id: "c", label: "false" },
      ],
    },
    {
      id: "react-1",
      kind: "short-text",
      topic: "react",
      prompt: "Объясните, чем props компонента отличаются от его состояния.",
    },
    {
      id: "http-1",
      kind: "short-text",
      topic: "http",
      prompt: "Что нужно проверить в ответе fetch перед использованием JSON?",
    },
  ],
};


type TaskCardProps = {
  task: Task;
};

export function TaskCard({ task }: TaskCardProps) {
  return (
    <article className="task-card">
      <p className="topic">Тема: {task.topic}</p>
      <h2>{task.prompt}</h2>
      {task.code !== undefined && <pre>{task.code}</pre>}
      {task.kind === "single-choice" ? (
        <ul>
          {task.options.map((option) => (
            <li key={option.id}>
              {option.id} {option.label}
            </li>
          ))}
        </ul>
      ) : (
        <p>Это задание с текстовым ответом.</p>
      )}
    </article>
  );
}

type TaskListProps = {
  tasks: Task[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function TaskList({ tasks, selectedId, onSelect }: TaskListProps) {
  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id}>
          <button
            type="button"
            aria-pressed={task.id === selectedId}
            onClick={() => onSelect(task.id)}
          >
            {task.id}: {task.prompt}
          </button>
        </li>
      ))}
    </ul>
  );
}



export default function App() {
  const [selectedId, setSelectedId] = useState<string>(webBasics.tasks[0]?.id ?? "");
  const selected = findTaskById(webBasics, selectedId);

  return (
    <main>
      <h1>
        {webBasics.title} (заданий: {webBasics.tasks.length})
      </h1>
      {webBasics.tasks.length === 0 ? (
        <p>В модуле пока нет заданий.</p>
      ) : (
        <div className="layout">
          <TaskList
            tasks={webBasics.tasks}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          {selected ? <TaskCard task={selected} /> : <p>Задание не выбрано.</p>}
        </div>
      )}
    </main>
  );
}
