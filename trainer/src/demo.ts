import type {
  Answer,
  ShortTextTask,
  SingleChoiceTask,
  TrainingSet,
} from "./domain";
import {
  countProgress,
  filterTasksByTopic,
  findTaskById,
} from "./domain";

function check(name: string, condition: boolean): void {
  if (!condition) {
    throw new Error(`FAIL: ${name}`);
  }
  console.log(`OK   ${name}`);
}


const ts1: SingleChoiceTask = {
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
};

const react1: ShortTextTask = {
  id: "react-1",
  kind: "short-text",
  topic: "react",
  prompt: "Объясните, чем props компонента отличаются от его состояния.",
};

const mainSet: TrainingSet = {
  id: "web-basics",
  title: "Основы веб-программирования",
  tasks: [ts1, react1],
};

const cssSet: TrainingSet = {
  id: "css-basics",
  title: "Основы CSS",
  tasks: [
    {
      id: "css-1",
      kind: "single-choice",
      topic: "css",
      prompt: "Какое свойство задаёт цвет текста?",
      options: [
        { id: "a", label: "color" },
        { id: "b", label: "background" },
      ],
    },
    {
      id: "css-2",
      kind: "short-text",
      topic: "css",
      prompt: "Что такое специфичность селектора?",
    },
  ],
};

const emptySet: TrainingSet = { id: "empty", title: "Пустой набор", tasks: [] };

const oneAnswer: Answer[] = [
  { taskId: "ts-1", kind: "single-choice", optionId: "b" },
];

const fullAnswers: Answer[] = [
  { taskId: "ts-1", kind: "single-choice", optionId: "b" },
  { taskId: "react-1", kind: "short-text", text: "Props приходят снаружи, state живёт внутри." },
];


const before = JSON.stringify([mainSet, cssSet, emptySet, oneAnswer, fullAnswers]);


const found = findTaskById(mainSet, "ts-1");
check("поиск существующего ts-1", found?.id === "ts-1");
if (found?.kind === "single-choice") {
  check("narrowing по kind: у ts-1 три варианта", found.options.length === 3);
}
check("поиск react-1", findTaskById(mainSet, "react-1")?.kind === "short-text");
check("отсутствующий id даёт undefined", findTaskById(mainSet, "nope") === undefined);
check("поиск в пустом наборе даёт undefined", findTaskById(emptySet, "ts-1") === undefined);


check("фильтр typescript: 1 задание", filterTasksByTopic(mainSet, "typescript").length === 1);
check("фильтр css во втором наборе: 2 задания", filterTasksByTopic(cssSet, "css").length === 2);
check("фильтр без совпадений: пустой массив", filterTasksByTopic(mainSet, "css").length === 0);
check("фильтр пустого набора: пустой массив", filterTasksByTopic(emptySet, "react").length === 0);


const p0 = countProgress(emptySet, []);
check("пустой набор: 0 из 0", p0.answered === 0 && p0.total === 0);

const pNone = countProgress(mainSet, []);
check("нет ответов: 0 из 2", pNone.answered === 0 && pNone.total === 2);

const p1 = countProgress(mainSet, oneAnswer);
check("один ответ: 1 из 2", p1.answered === 1 && p1.total === 2);

const pFull = countProgress(mainSet, fullAnswers);
check("полный набор: 2 из 2", pFull.answered === 2 && pFull.total === 2);

const foreign: Answer[] = [{ taskId: "other-1", kind: "short-text", text: "чужой ответ" }];
check("ответ с чужим taskId не засчитывается", countProgress(mainSet, foreign).answered === 0);

const blank: Answer[] = [{ taskId: "react-1", kind: "short-text", text: "   \n\t " }];
check("текст из пробелов не заполнен", countProgress(mainSet, blank).answered === 0);

const reordered: Answer[] = [fullAnswers[1]!, fullAnswers[0]!];
check("порядок ответов не важен (связь по taskId)", countProgress(mainSet, reordered).answered === 2);

const after = JSON.stringify([mainSet, cssSet, emptySet, oneAnswer, fullAnswers]);
check("функции не изменили наборы и ответы", (before === after + '1'));

console.log("Все сценарии A1 пройдены");