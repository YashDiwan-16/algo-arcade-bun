"use client";

import { useSound, useSoundManager } from "@/hooks/use-sound";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Example 1: Simple sound usage
export function SimpleSoundExample() {
  const [playClick] = useSound("/sounds/click.mp3");

  return <Button onClick={playClick}>Click Me</Button>;
}

// Example 2: Sound with options
export function SoundWithOptionsExample() {
  const [playWin] = useSound("/sounds/win.mp3", {
    volume: 0.5,
    playbackRate: 1.2,
    interrupt: true, // Stop current playback if already playing
  });

  return <Button onClick={playWin}>Win Sound</Button>;
}

// Example 3: Sound with controls
export function SoundWithControlsExample() {
  const [play, { pause, stop, setVolume }] = useSound("/sounds/music.mp3", {
    loop: true,
  });

  return (
    <div className="flex gap-2">
      <Button onClick={play}>Play</Button>
      <Button onClick={pause}>Pause</Button>
      <Button onClick={stop}>Stop</Button>
      <Button onClick={() => setVolume(0.3)}>Low Volume</Button>
      <Button onClick={() => setVolume(1.0)}>Full Volume</Button>
    </div>
  );
}

// Example 4: Multiple sounds (like in paagi game)
export function GameSoundsExample() {
  const [playWin] = useSound("/sounds/PaajiWin.mp3");
  const [playBet] = useSound("/sounds/Bet.mp3");
  const [playLose] = useSound("/sounds/PaajiLose.mp3");
  const [playCashout] = useSound("/sounds/PaajiCashOut.mp3");

  const handleWin = () => {
    playWin();
    // ... win logic
  };

  const handleBet = () => {
    playBet();
    // ... bet logic
  };

  const handleLose = () => {
    playLose();
    // ... lose logic
  };

  const handleCashout = () => {
    playCashout();
    // ... cashout logic
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleBet}>Place Bet</Button>
      <Button onClick={handleWin}>Win</Button>
      <Button onClick={handleLose}>Lose</Button>
      <Button onClick={handleCashout}>Cash Out</Button>
    </div>
  );
}

// Example 5: Using Sound Manager (alternative approach)
export function SoundManagerExample() {
  const soundManager = useSoundManager({
    click: "/sounds/click.mp3",
    win: "/sounds/win.mp3",
    lose: "/sounds/lose.mp3",
    cashout: "/sounds/cashout.mp3",
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={() => soundManager.play("click")}>Click</Button>
        <Button onClick={() => soundManager.play("win")}>Win</Button>
        <Button onClick={() => soundManager.play("lose")}>Lose</Button>
        <Button onClick={() => soundManager.play("cashout")}>Cash Out</Button>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => soundManager.setGlobalVolume(0.3)}>
          Low Volume
        </Button>
        <Button onClick={() => soundManager.setGlobalVolume(1.0)}>
          Full Volume
        </Button>
        <Button onClick={soundManager.stopAll}>Stop All</Button>
      </div>
    </div>
  );
}

// Example 6: Sound with callback
export function SoundWithCallbackExample() {
  const [playSound] = useSound("/sounds/countdown.mp3", {
    onEnd: () => {
      console.log("Sound finished playing!");
      // Do something after sound ends
    },
  });

  return <Button onClick={playSound}>Start Countdown</Button>;
}

// Example 7: Conditional sound (with settings)
export function ConditionalSoundExample() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [playClick] = useSound("/sounds/click.mp3", {
    soundEnabled, // Only play if soundEnabled is true
  });

  return (
    <div className="flex gap-2">
      <Button onClick={playClick}>Click (with sound)</Button>
      <Button onClick={() => setSoundEnabled(!soundEnabled)}>
        {soundEnabled ? "Disable" : "Enable"} Sound
      </Button>
    </div>
  );
}
