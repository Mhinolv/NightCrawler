/* Mutual UI kit — app shell & click-through flow.
   Screens: home → answer → reveal. Demonstrates the full loop. */

const YOU = { name: 'You', initial: 'J' };
const THEM = { name: 'Alex', initial: 'A' };

const QUESTIONS = [
  { text: "If you could keep only one memory forever, which would you <em>choose</em>?", theirAnswer: "The night we stayed up talking until the sun came up. No question." },
  { text: "What's a small thing that <em>instantly</em> makes your day better?", theirAnswer: "Coffee on the balcony before anyone else is awake." },
  { text: "When did you last feel <em>completely</em> at ease?", theirAnswer: "Floating in the sea last summer, ears underwater, totally quiet." },
  { text: "What's something you've <em>changed your mind</em> about lately?", theirAnswer: "That staying in on a Friday is a little bit perfect, actually." },
];

const CATEGORIES = ['All', 'Deep', 'Playful', 'Past', 'Future'];

const HISTORY = [
  { text: "What does a perfect, ordinary Sunday look like to you?", answered: true },
  { text: "Who taught you something you still carry with you?", answered: true },
  { text: "What's a place you'd take me if you could?", answered: false },
];

function App() {
  const [screen, setScreen] = useState('home');
  const [qIndex, setQIndex] = useState(0);
  const [cat, setCat] = useState('All');
  const [yourAnswer, setYourAnswer] = useState('');
  const [youAnswered, setYouAnswered] = useState(false);

  const q = QUESTIONS[qIndex];

  function shuffle() {
    setQIndex((i) => (i + 1) % QUESTIONS.length);
    setYouAnswered(false);
    setYourAnswer('');
  }
  function submit(text) {
    setYourAnswer(text);
    setYouAnswered(true);
    setScreen('reveal');
  }
  function nextQuestion() {
    shuffle();
    setScreen('home');
  }
  function openAnswerOrReveal() {
    if (youAnswered) setScreen('reveal');
    else setScreen('answer');
  }

  return (
    <div className="app">
      <TopBar you={YOU} them={THEM} onHome={() => setScreen('home')} />

      {screen === 'home' && (
        <div className="page">
          <div className="center-block" style={{ display: 'grid', placeItems: 'center', marginBottom: 8 }}>
            <QuestionCard
              question={q.text}
              them={THEM}
              youAnswered={youAnswered}
              themAnswered={true}
              onAnswer={openAnswerOrReveal}
              onShuffle={shuffle}
            />
          </div>

          <div className="section-head">
            <h2>Your questions</h2>
            <PairAvatars you={YOU.initial} them={THEM.initial} size={30} />
          </div>
          <div className="chips" style={{ marginBottom: 18 }}>
            {CATEGORIES.map((c) => (
              <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>
            ))}
          </div>
          <div className="qlist">
            {HISTORY.map((h, i) => (
              <QuestionRow key={i} q={h} them={THEM} onOpen={() => {}} />
            ))}
          </div>
        </div>
      )}

      {screen === 'answer' && (
        <div className="center-wrap">
          <AnswerComposer question={q.text} onSubmit={submit} onCancel={() => setScreen('home')} />
        </div>
      )}

      {screen === 'reveal' && (
        <div className="center-wrap">
          <RevealPair
            question={q.text}
            you={YOU}
            them={THEM}
            yourAnswer={yourAnswer || "I think I'd keep the quiet ones — the small, unremarkable evenings that turned out to matter most."}
            theirAnswer={q.theirAnswer}
            onDone={nextQuestion}
          />
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
