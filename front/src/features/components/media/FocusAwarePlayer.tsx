import { useEffect, useRef } from "react";
import { Player } from "react-tuby";
import PlayerWithRef from "./PlayerWithRef";

interface FocusAwarePlayerProps extends React.ComponentProps<typeof Player> {
  isActive: boolean;
  onActivate: () => void;
}

export default function FocusAwarePlayer({
  isActive,
  onActivate,
  ...playerProps
}: FocusAwarePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  console.log(isActive);
  console.log(onActivate);

  useEffect(() => {
    const handleFsChange = () => containerRef.current?.focus();
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ outline: "none" }}
      tabIndex={0}
      onClick={() => {
        onActivate();
        containerRef.current?.focus();
      }}
    >
      <div data-player-root>
        <PlayerWithRef
          ref={playerRef as any}
          {...playerProps}
          keyboardShortcut={false}
        />
      </div>
    </div>
  );
}
