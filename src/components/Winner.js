const WinnerModal = ({ player, onClick }) => {
  return (
    <div className={`modal-window`}>
      <div>
        <header>Game over!</header>
        <div>{player} is the Winner!</div>
        <button onClick={onClick}> Reset Game </button>
      </div>
    </div>
  );
};

export const NoticeModal = ({ message, header, onClick }) => {
  return (
    <div className={`modal-window`}>
      <div>
        <header>{header} </header>
        <div> {message}</div>
        <button onClick={onClick}> Close </button>
      </div>
    </div>
  );
};

export default WinnerModal;
