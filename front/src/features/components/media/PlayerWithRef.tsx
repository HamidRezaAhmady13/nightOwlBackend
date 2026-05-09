import React, { forwardRef } from "react";
import { Player, PlayerProps } from "react-tuby";

const PlayerWithRef = forwardRef<any, PlayerProps>((props, ref) => {
  const UnsafePlayer = Player as any;
  return <UnsafePlayer {...props} ref={ref} />;
});

export default PlayerWithRef;
