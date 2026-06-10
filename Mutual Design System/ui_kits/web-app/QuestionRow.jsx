/* Mutual UI kit — a past-question row in the history list. */
function QuestionRow({ q, them, onOpen }) {
  return (
    <div className="qrow" onClick={onOpen}>
      <p className="qtext">{q.text.replace(/<\/?em>/g, '')}</p>
      <div className="qmeta">
        {q.answered
          ? <Badge kind="done">BOTH</Badge>
          : <Badge kind="wait">{them.name.toUpperCase()}…</Badge>}
        <Icon name="chevron-right" size={18} color="var(--ink-3)" />
      </div>
    </div>
  );
}
Object.assign(window, { QuestionRow });
