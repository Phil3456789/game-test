import React from 'react';

export const ControlsGuide: React.FC = () => {
  return (
    <div className="flex justify-center gap-8 mt-6">
      <div className="game-panel">
        <h3 className="text-sm font-display tracking-wider mb-3 player1-color">Player 1</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">Move:</span>
            <div className="flex gap-1">
              <kbd className="control-key">W</kbd>
              <kbd className="control-key">A</kbd>
              <kbd className="control-key">S</kbd>
              <kbd className="control-key">D</kbd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">Shoot:</span>
            <kbd className="control-key px-3">Space</kbd>
          </div>
        </div>
      </div>
      
      <div className="game-panel">
        <h3 className="text-sm font-display tracking-wider mb-3 player2-color">Player 2</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">Move:</span>
            <div className="flex gap-1">
              <kbd className="control-key">↑</kbd>
              <kbd className="control-key">←</kbd>
              <kbd className="control-key">↓</kbd>
              <kbd className="control-key">→</kbd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">Shoot:</span>
            <kbd className="control-key px-3">Enter</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
