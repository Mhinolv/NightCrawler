/* @ds-bundle: {"format":3,"namespace":"MutualDesignSystem_d5d2d7","components":[],"sourceHashes":{"ui_kits/web-app/AnswerComposer.jsx":"3657f79b4c08","ui_kits/web-app/App.jsx":"7b1f92401a77","ui_kits/web-app/QuestionCard.jsx":"2d856aaa0190","ui_kits/web-app/QuestionRow.jsx":"2f200df46896","ui_kits/web-app/RevealPair.jsx":"709e1e5ffa85","ui_kits/web-app/TopBar.jsx":"4dfa66692d0c","ui_kits/web-app/primitives.jsx":"5cf8ee412585"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.MutualDesignSystem_d5d2d7 = window.MutualDesignSystem_d5d2d7 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/web-app/AnswerComposer.jsx
try { (() => {
/* Mutual UI kit — answer composer (focused write screen). */
function AnswerComposer({
  question,
  onSubmit,
  onCancel
}) {
  const [text, setText] = useState('');
  const ref = useRef(null);
  useEffect(() => {
    ref.current && ref.current.focus();
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "composer enter"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: onCancel,
    style: {
      marginBottom: 14,
      marginLeft: -12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 18
  }), " Back"), /*#__PURE__*/React.createElement("p", {
    className: "kicker",
    style: {
      marginBottom: 10
    }
  }, "Your answer \xB7 just between you two"), /*#__PURE__*/React.createElement("p", {
    className: "question",
    dangerouslySetInnerHTML: {
      __html: question
    }
  }), /*#__PURE__*/React.createElement("textarea", {
    ref: ref,
    className: "answer-field",
    placeholder: "Say as much or as little as you like\u2026",
    value: text,
    onChange: e => setText(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    className: "composer-foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, text.trim() ? `${text.trim().split(/\s+/).length} words` : 'private until you both answer'), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "send-horizontal",
    disabled: !text.trim(),
    onClick: () => onSubmit(text.trim())
  }, "Send answer")));
}
Object.assign(window, {
  AnswerComposer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/AnswerComposer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-app/App.jsx
try { (() => {
/* Mutual UI kit — app shell & click-through flow.
   Screens: home → answer → reveal. Demonstrates the full loop. */

const YOU = {
  name: 'You',
  initial: 'J'
};
const THEM = {
  name: 'Alex',
  initial: 'A'
};
const QUESTIONS = [{
  text: "If you could keep only one memory forever, which would you <em>choose</em>?",
  theirAnswer: "The night we stayed up talking until the sun came up. No question."
}, {
  text: "What's a small thing that <em>instantly</em> makes your day better?",
  theirAnswer: "Coffee on the balcony before anyone else is awake."
}, {
  text: "When did you last feel <em>completely</em> at ease?",
  theirAnswer: "Floating in the sea last summer, ears underwater, totally quiet."
}, {
  text: "What's something you've <em>changed your mind</em> about lately?",
  theirAnswer: "That staying in on a Friday is a little bit perfect, actually."
}];
const CATEGORIES = ['All', 'Deep', 'Playful', 'Past', 'Future'];
const HISTORY = [{
  text: "What does a perfect, ordinary Sunday look like to you?",
  answered: true
}, {
  text: "Who taught you something you still carry with you?",
  answered: true
}, {
  text: "What's a place you'd take me if you could?",
  answered: false
}];
function App() {
  const [screen, setScreen] = useState('home');
  const [qIndex, setQIndex] = useState(0);
  const [cat, setCat] = useState('All');
  const [yourAnswer, setYourAnswer] = useState('');
  const [youAnswered, setYouAnswered] = useState(false);
  const q = QUESTIONS[qIndex];
  function shuffle() {
    setQIndex(i => (i + 1) % QUESTIONS.length);
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
    if (youAnswered) setScreen('reveal');else setScreen('answer');
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "app"
  }, /*#__PURE__*/React.createElement(TopBar, {
    you: YOU,
    them: THEM,
    onHome: () => setScreen('home')
  }), screen === 'home' && /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "center-block",
    style: {
      display: 'grid',
      placeItems: 'center',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(QuestionCard, {
    question: q.text,
    them: THEM,
    youAnswered: youAnswered,
    themAnswered: true,
    onAnswer: openAnswerOrReveal,
    onShuffle: shuffle
  })), /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("h2", null, "Your questions"), /*#__PURE__*/React.createElement(PairAvatars, {
    you: YOU.initial,
    them: THEM.initial,
    size: 30
  })), /*#__PURE__*/React.createElement("div", {
    className: "chips",
    style: {
      marginBottom: 18
    }
  }, CATEGORIES.map(c => /*#__PURE__*/React.createElement(Chip, {
    key: c,
    active: cat === c,
    onClick: () => setCat(c)
  }, c))), /*#__PURE__*/React.createElement("div", {
    className: "qlist"
  }, HISTORY.map((h, i) => /*#__PURE__*/React.createElement(QuestionRow, {
    key: i,
    q: h,
    them: THEM,
    onOpen: () => {}
  })))), screen === 'answer' && /*#__PURE__*/React.createElement("div", {
    className: "center-wrap"
  }, /*#__PURE__*/React.createElement(AnswerComposer, {
    question: q.text,
    onSubmit: submit,
    onCancel: () => setScreen('home')
  })), screen === 'reveal' && /*#__PURE__*/React.createElement("div", {
    className: "center-wrap"
  }, /*#__PURE__*/React.createElement(RevealPair, {
    question: q.text,
    you: YOU,
    them: THEM,
    yourAnswer: yourAnswer || "I think I'd keep the quiet ones — the small, unremarkable evenings that turned out to matter most.",
    theirAnswer: q.theirAnswer,
    onDone: nextQuestion
  })));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-app/QuestionCard.jsx
try { (() => {
/* Mutual UI kit — the hero question card (home screen).
   Shows the current question, partner status, and the primary action. */
function QuestionCard({
  question,
  them,
  youAnswered,
  themAnswered,
  onAnswer,
  onShuffle
}) {
  let statusBadge;
  if (youAnswered && themAnswered) statusBadge = /*#__PURE__*/React.createElement(Badge, {
    kind: "done"
  }, "BOTH ANSWERED");else if (themAnswered) statusBadge = /*#__PURE__*/React.createElement(Badge, {
    kind: "new"
  }, them.name.toUpperCase(), " ANSWERED");else statusBadge = /*#__PURE__*/React.createElement(Badge, {
    kind: "wait"
  }, "WAITING ON ", them.name.toUpperCase());
  return /*#__PURE__*/React.createElement("div", {
    className: "qcard enter"
  }, /*#__PURE__*/React.createElement("div", {
    className: "qhead"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kicker"
  }, "Question of the day"), statusBadge), /*#__PURE__*/React.createElement("p", {
    className: "question",
    dangerouslySetInnerHTML: {
      __html: question
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "qactions"
  }, youAnswered && themAnswered ? /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "sparkles",
    onClick: onAnswer
  }, "See both answers") : youAnswered ? /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    icon: "check"
  }, "You've answered") : /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "pencil",
    onClick: onAnswer
  }, "Write my answer"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "shuffle",
    onClick: onShuffle
  }, "Shuffle")));
}
Object.assign(window, {
  QuestionCard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/QuestionCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-app/QuestionRow.jsx
try { (() => {
/* Mutual UI kit — a past-question row in the history list. */
function QuestionRow({
  q,
  them,
  onOpen
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "qrow",
    onClick: onOpen
  }, /*#__PURE__*/React.createElement("p", {
    className: "qtext"
  }, q.text.replace(/<\/?em>/g, '')), /*#__PURE__*/React.createElement("div", {
    className: "qmeta"
  }, q.answered ? /*#__PURE__*/React.createElement(Badge, {
    kind: "done"
  }, "BOTH") : /*#__PURE__*/React.createElement(Badge, {
    kind: "wait"
  }, them.name.toUpperCase(), "\u2026"), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 18,
    color: "var(--ink-3)"
  })));
}
Object.assign(window, {
  QuestionRow
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/QuestionRow.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-app/RevealPair.jsx
try { (() => {
/* Mutual UI kit — reveal screen: both answers side by side. */
function RevealPair({
  question,
  you,
  them,
  yourAnswer,
  theirAnswer,
  onDone
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "reveal enter"
  }, /*#__PURE__*/React.createElement("p", {
    className: "kicker",
    style: {
      textAlign: 'center',
      marginBottom: 12
    }
  }, "You both answered"), /*#__PURE__*/React.createElement("p", {
    className: "question",
    dangerouslySetInnerHTML: {
      __html: question
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "answers"
  }, /*#__PURE__*/React.createElement("div", {
    className: "answer-card you enter-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "who"
  }, /*#__PURE__*/React.createElement(Avatar, {
    who: "you",
    initial: you.initial,
    size: 34
  }), /*#__PURE__*/React.createElement("span", {
    className: "name you"
  }, "You")), /*#__PURE__*/React.createElement("p", {
    className: "text"
  }, yourAnswer)), /*#__PURE__*/React.createElement("div", {
    className: "answer-card them enter-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "who"
  }, /*#__PURE__*/React.createElement(Avatar, {
    who: "them",
    initial: them.initial,
    size: 34
  }), /*#__PURE__*/React.createElement("span", {
    className: "name them"
  }, them.name)), /*#__PURE__*/React.createElement("p", {
    className: "text"
  }, theirAnswer))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: 28
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "arrow-right",
    onClick: onDone
  }, "Next question")));
}
Object.assign(window, {
  RevealPair
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/RevealPair.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-app/TopBar.jsx
try { (() => {
/* Mutual UI kit — sticky top bar with brand + paired avatars. */
function TopBar({
  you,
  them,
  onHome
}) {
  return /*#__PURE__*/React.createElement("header", {
    className: "topbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand",
    onClick: onHome,
    style: {
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/mark.svg",
    width: "28",
    height: "28",
    alt: ""
  }), /*#__PURE__*/React.createElement("b", null, "Mutual")), /*#__PURE__*/React.createElement("div", {
    className: "right"
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "bell",
    label: "Notifications"
  }), /*#__PURE__*/React.createElement(PairAvatars, {
    you: you.initial,
    them: them.initial,
    size: 32
  })));
}
Object.assign(window, {
  TopBar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/TopBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-app/primitives.jsx
try { (() => {
/* Mutual UI kit — shared primitives.
   Exposed on window for the other babel scripts. */
const {
  useState,
  useEffect,
  useRef
} = React;

// Lucide icon wrapper — renders an <i data-lucide> then hydrates it.
function Icon({
  name,
  size = 20,
  stroke = 1.75,
  color
}) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.lucide && ref.current) {
      ref.current.innerHTML = `<i data-lucide="${name}"></i>`;
      window.lucide.createIcons({
        attrs: {
          'stroke-width': stroke,
          width: size,
          height: size
        },
        nameAttr: 'data-lucide'
      });
    }
  }, [name, size, stroke]);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    className: "icon",
    style: {
      display: 'inline-flex',
      color: color || 'currentColor'
    }
  });
}
function Button({
  variant = 'primary',
  children,
  icon,
  onClick,
  disabled,
  type = 'button'
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    className: `btn btn-${variant}`,
    onClick: onClick,
    disabled: disabled
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 18
  }), children);
}
function IconButton({
  icon,
  onClick,
  label
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: "iconbtn",
    onClick: onClick,
    "aria-label": label
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 20
  }));
}
function Avatar({
  who = 'you',
  initial,
  size = 38
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: `avatar ${who}`,
    style: {
      width: size,
      height: size,
      fontSize: size * 0.4
    }
  }, initial);
}
function PairAvatars({
  you = 'J',
  them = 'A',
  size = 34
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "pair"
  }, /*#__PURE__*/React.createElement(Avatar, {
    who: "you",
    initial: you,
    size: size
  }), /*#__PURE__*/React.createElement(Avatar, {
    who: "them",
    initial: them,
    size: size
  }));
}
function Badge({
  kind = 'new',
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: `badge ${kind}`
  }, children);
}
function Chip({
  active,
  children,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: `chip ${active ? 'on' : ''}`,
    onClick: onClick
  }, children);
}
Object.assign(window, {
  Icon,
  Button,
  IconButton,
  Avatar,
  PairAvatars,
  Badge,
  Chip
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/primitives.jsx", error: String((e && e.message) || e) }); }

})();
