/* Mutual UI kit — sticky top bar with brand + paired avatars. */
function TopBar({ you, them, onHome }) {
  return (
    <header className="topbar">
      <div className="brand" onClick={onHome} style={{ cursor: 'pointer' }}>
        <img src="../../assets/mark.svg" width="28" height="28" alt="" />
        <b>Mutual</b>
      </div>
      <div className="right">
        <IconButton icon="bell" label="Notifications" />
        <PairAvatars you={you.initial} them={them.initial} size={32} />
      </div>
    </header>
  );
}
Object.assign(window, { TopBar });
