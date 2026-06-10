/* Mutual UI kit — reveal screen: both answers side by side. */
function RevealPair({ question, you, them, yourAnswer, theirAnswer, onDone }) {
  return (
    <div className="reveal enter">
      <p className="kicker" style={{ textAlign: 'center', marginBottom: 12 }}>You both answered</p>
      <p className="question" dangerouslySetInnerHTML={{ __html: question }} />
      <div className="answers">
        <div className="answer-card you enter-2">
          <div className="who">
            <Avatar who="you" initial={you.initial} size={34} />
            <span className="name you">You</span>
          </div>
          <p className="text">{yourAnswer}</p>
        </div>
        <div className="answer-card them enter-3">
          <div className="who">
            <Avatar who="them" initial={them.initial} size={34} />
            <span className="name them">{them.name}</span>
          </div>
          <p className="text">{theirAnswer}</p>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
        <Button variant="primary" icon="arrow-right" onClick={onDone}>Next question</Button>
      </div>
    </div>
  );
}
Object.assign(window, { RevealPair });
