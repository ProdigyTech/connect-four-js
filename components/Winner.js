const WinnerModal = ({ player }) => {
  return (
    <div className={`modal-window`}>
      <div>
        <header>Game over!</header>
        <div>{player} is the Winner!</div>
      </div>
    </div>
  );
};


export default WinnerModal;