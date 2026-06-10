/* Mutual UI kit — the hero question card (home screen).
   Shows the current question, partner status, and the primary action. */
function QuestionCard({ question, them, youAnswered, themAnswered, onAnswer, onShuffle }) {
  let statusBadge;
  if (youAnswered && themAnswered) statusBadge = <Badge kind="done">BOTH ANSWERED</Badge>;
  else if (themAnswered) statusBadge = <Badge kind="new">{them.name.toUpperCase()} ANSWERED</Badge>;
  else statusBadge = <Badge kind="wait">WAITING ON {them.name.toUpperCase()}</Badge>;

  return (
    <div className="qcard enter">
      <div className="qhead">
        <span className="kicker">Question of the day</span>
        {statusBadge}
      </div>
      <p className="question" dangerouslySetInnerHTML={{ __html: question }} />
      <div className="qactions">
        {youAnswered && themAnswered ? (
          <Button variant="primary" icon="sparkles" onClick={onAnswer}>See both answers</Button>
        ) : youAnswered ? (
          <Button variant="secondary" icon="check">You've answered</Button>
        ) : (
          <Button variant="primary" icon="pencil" onClick={onAnswer}>Write my answer</Button>
        )}
        <Button variant="ghost" icon="shuffle" onClick={onShuffle}>Shuffle</Button>
      </div>
    </div>
  );
}
Object.assign(window, { QuestionCard });
