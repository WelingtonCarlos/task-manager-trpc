import type { Task } from "@/server/task-store";
import { formatDate } from "@/lib/format-date";

type Props = {
  task: Task;
  /** Action buttons rendered on the right side of the card. */
  actions?: React.ReactNode;
  busy?: boolean;
};

export function TaskItem({ task, actions, busy = false }: Props) {
  return (
    <li className={`task ${busy ? "task--busy" : ""}`} aria-busy={busy}>
      <div className="task__body">
        <strong>{task.titulo}</strong>
        {task.descricao && <p>{task.descricao}</p>}
        <time className="muted" dateTime={new Date(task.dataCriacao).toISOString()}>
          Created {formatDate(task.dataCriacao)}
        </time>
      </div>
      {actions && <div className="task__actions">{actions}</div>}
    </li>
  );
}
