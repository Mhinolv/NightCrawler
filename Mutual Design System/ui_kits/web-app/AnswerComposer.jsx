/* Mutual UI kit — answer composer (focused write screen). */
function AnswerComposer({ question, onSubmit, onCancel }) {
  const [text, setText] = useState('');
  const ref = useRef(null);
  useEffect(() => { ref.current && ref.current.focus(); }, []);
  return (
    <div className="composer enter">
      <button className="btn btn-ghost" onClick={onCancel} style={{ marginBottom: 14, marginLeft: -12 }}>
        <Icon name="arrow-left" size={18} /> Back
      </button>
      <p className="kicker" style={{ marginBottom: 10 }}>Your answer · just between you two</p>
      <p className="question" dangerouslySetInnerHTML={{ __html: question }} />
      <textarea
        ref={ref}
        className="answer-field"
        placeholder="Say as much or as little as you like…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="composer-foot">
        <span className="count">{text.trim() ? `${text.trim().split(/\s+/).length} words` : 'private until you both answer'}</span>
        <Button variant="primary" icon="send-horizontal" disabled={!text.trim()} onClick={() => onSubmit(text.trim())}>
          Send answer
        </Button>
      </div>
    </div>
  );
}
Object.assign(window, { AnswerComposer });
