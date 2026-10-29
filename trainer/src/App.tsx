import { useState } from "react";
import type { Answer, Task, TrainingSet } from "./domain";
import { countProgress, findTaskById, isAnswerFilled } from "./domain";

const webBasics: TrainingSet = {
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


type AttemptStatus = "in-progress" | "submitted";

function findAnswer(answers: Answer[], taskId: string): Answer | undefined {
  return answers.find((answer) => answer.taskId === taskId);
}

function isTaskAnswered(answers: Answer[], taskId: string): boolean {
  const answer = findAnswer(answers, taskId);
  return answer !== undefined && isAnswerFilled(answer);
}

function upsertAnswer(answers: Answer[], next: Answer): Answer[] {
  return [...answers.filter((answer) => answer.taskId !== next.taskId), next];
}

function describeAnswer(task: Task, answer: Answer | undefined): string {
  if (answer === undefined || !isAnswerFilled(answer)) {
    return "не заполнено";
  }
  if (answer.kind === "single-choice") {
    const optionId = answer.optionId;
    const option =
      task.kind === "single-choice"
        ? task.options.find((item) => item.id === optionId)
        : undefined;
    return option ? `${option.id}) ${option.label}` : optionId;
  }
  return answer.text;
}

type TaskListProps = {
  tasks: Task[];
  answers: Answer[];
  selectedId: string;
  onSelect: (id: string) => void;
};

function TaskList({ tasks, answers, selectedId, onSelect }: TaskListProps) {
  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id}>
          <button
            type="button"
            aria-pressed={task.id === selectedId}
            onClick={() => onSelect(task.id)}
          >
            {isTaskAnswered(answers, task.id) ? "✓ " : ""}
            {task.id}: {task.prompt}
          </button>
        </li>
      ))}
    </ul>
  );
}

type TaskCardProps = {
  task: Task;
  answer: Answer | undefined;
  onAnswer: (answer: Answer) => void;
};

function TaskCard({ task, answer, onAnswer }: TaskCardProps) {
  const selectedOptionId =
    answer?.kind === "single-choice" ? answer.optionId : undefined;
  const text = answer?.kind === "short-text" ? answer.text : "";

  return (
    <article className="task-card">
      <p className="topic">Тема: {task.topic}</p>
      <h2>{task.prompt}</h2>
      {task.code !== undefined && <pre>{task.code}</pre>}
      {task.kind === "single-choice" ? (
        <fieldset>
          <legend>Выберите вариант</legend>
          {task.options.map((option) => (
            <div key={option.id}>
              <label>
                <input
                  type="radio"
                  name={`task-${task.id}`}
                  checked={selectedOptionId === option.id}
                  onChange={() =>
                    onAnswer({
                      taskId: task.id,
                      kind: "single-choice",
                      optionId: option.id,
                    })
                  }
                />{" "}
                {option.id}) {option.label}
              </label>
            </div>
          ))}
        </fieldset>
      ) : (
        <label>
          Ваш ответ
          <textarea
            rows={5}
            value={text}
            onChange={(event) =>
              onAnswer({
                taskId: task.id,
                kind: "short-text",
                text: event.target.value,
              })
            }
          />
        </label>
      )}
    </article>
  );
}

type OverviewProps = {
  set: TrainingSet;
  answers: Answer[];
  onRestart: () => void;
};

function Overview({ set, answers, onRestart }: OverviewProps) {
  const progress = countProgress(set, answers);

  return (
    <section className="overview">
      <h2>Обзор ответов</h2>
      <p>
        Заполнено: {progress.answered} из {progress.total}
      </p>
      <ol>
        {set.tasks.map((task) => (
          <li key={task.id}>
            <strong>
              {task.id}: {task.prompt}
            </strong>
            <p className="answer-text">
              {describeAnswer(task, findAnswer(answers, task.id))}
            </p>
          </li>
        ))}
      </ol>
      <button type="button" onClick={onRestart}>
        Начать новую попытку
      </button>
    </section>
  );
}

export default function App() {
  const tasks = webBasics.tasks;
  const firstId = tasks[0]?.id ?? "";

  const [selectedId, setSelectedId] = useState<string>(firstId);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [status, setStatus] = useState<AttemptStatus>("in-progress");

  // Всё ниже вычисляется из tasks, answers и selectedId, отдельно не хранится.
  const selected = findTaskById(webBasics, selectedId);
  const index = tasks.findIndex((task) => task.id === selectedId);
  const prevTask = index > 0 ? tasks[index - 1] : undefined;
  const nextTask = index >= 0 ? tasks[index + 1] : undefined;
  const progress = countProgress(webBasics, answers);
  const unfilled = tasks.filter((task) => !isTaskAnswered(answers, task.id));

  function handleAnswer(answer: Answer) {
    if (status === "submitted") return;
    setAnswers((current) => upsertAnswer(current, answer));
  }

  function handleFinish() {
    if (unfilled.length > 0) {
      const ids = unfilled.map((task) => task.id).join(", ");
      const confirmed = window.confirm(
        `Не заполнены задания: ${ids}. Всё равно завершить попытку?`,
      );
      if (!confirmed) return;
    }
    setStatus("submitted");
  }

  function handleRestart() {
    setAnswers([]);
    setStatus("in-progress");
    setSelectedId(firstId);
  }

  return (
    <main>
      <h1>
        {webBasics.title} (заданий: {tasks.length})
      </h1>
      {tasks.length === 0 ? (
        <p>В модуле пока нет заданий.</p>
      ) : status === "submitted" ? (
        <Overview set={webBasics} answers={answers} onRestart={handleRestart} />
      ) : (
        <>
          <p>
            Прогресс: {progress.answered} из {progress.total}
          </p>
          <p>
            {unfilled.length === 0
              ? "Все задания заполнены."
              : `Не заполнены: ${unfilled.map((task) => task.id).join(", ")}`}
          </p>
          <div className="layout">
            <TaskList
              tasks={tasks}
              answers={answers}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            <div className="task-column">
              {selected ? (
                <TaskCard
                  task={selected}
                  answer={findAnswer(answers, selected.id)}
                  onAnswer={handleAnswer}
                />
              ) : (
                <p>Задание не выбрано.</p>
              )}
              <div className="nav">
                <button
                  type="button"
                  disabled={prevTask === undefined}
                  onClick={() => prevTask && setSelectedId(prevTask.id)}
                >
                  Назад
                </button>
                <button
                  type="button"
                  disabled={nextTask === undefined}
                  onClick={() => nextTask && setSelectedId(nextTask.id)}
                >
                  Далее
                </button>
              </div>
            </div>
          </div>
          <button type="button" className="finish" onClick={handleFinish}>
            Завершить попытку
          </button>
        </>
      )}
    </main>
  );
}