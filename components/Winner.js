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


export default WinnerModal;