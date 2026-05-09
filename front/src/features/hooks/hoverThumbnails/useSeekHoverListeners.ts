import { useEffect, useRef } from "react";
import {
  findSeekEl,
  isOverElement,
  getMountRoot,
  HIDE_HOLD_MS,
  measure as utilsMeasure,
  bind as utilsBind,
  unbind as utilsUnbind,
} from "./hoverThumbnailUtils";
import type { SeekListeners } from "./canvas.types";

export function useSeekHoverListeners(
  seekBarSelector?: string,
  onPointerX?: (x: number) => void
) {
  const boundSeekRef = useRef<HTMLElement | null>(null);
  const cachedRectRef = useRef<DOMRect | null>(null);
  const isOverSeekRef = useRef(false);
  const lastMoveTs = useRef<number>(0);

  const isOverSeek = () => !!isOverSeekRef.current;

  const computePosition = (
    rect: DOMRect,
    canvasHeightPx: number,
    gapPx = 8
  ) => {
    const root = getMountRoot();
    if (root === document.body)
      return { left: rect.left, top: rect.top - gapPx - canvasHeightPx };
    const rootRect = root.getBoundingClientRect();
    return {
      left: rect.left - rootRect.left,
      top: rect.top - gapPx - canvasHeightPx - rootRect.top,
    };
  };

  useEffect(() => {
    const onEnter = () => {
      const seekEl = boundSeekRef.current ?? findSeekEl(seekBarSelector);
      // console.log("enter", !!seekEl);
      // console.log("ENTER rect.top", cachedRectRef?.current?.top);
      isOverSeekRef.current = true;
      lastMoveTs.current = Date.now();
      utilsMeasure(seekEl, cachedRectRef);
      // console.log(cachedRectRef.current?.top);
    };
    const onLeave = () => {
      isOverSeekRef.current = false;

      setTimeout(() => {
        if (!isOverSeekRef.current) cachedRectRef.current = null;
      }, HIDE_HOLD_MS + 50);
    };

    const onMove = (ev: MouseEvent) => {
      // console.log(ev.x, ev.y);

      lastMoveTs.current = Date.now();
      const seekEl = boundSeekRef.current ?? findSeekEl(seekBarSelector);
      if (!cachedRectRef.current) utilsMeasure(seekEl, cachedRectRef);
    };

    const ensureBound = () => {
      const seekEl = findSeekEl(seekBarSelector);
      if (!seekEl) return null;
      boundSeekRef.current = seekEl;
      seekEl.addEventListener("mouseenter", onEnter);
      seekEl.addEventListener("mouseleave", onLeave);
      seekEl.addEventListener("mousemove", onMove);
      return seekEl;
    };
    const pointerMoveHandler = (e: PointerEvent) => {
      // console.log("pointerMoveHandler");
      lastMoveTs.current = Date.now();
      const seekEl = boundSeekRef.current ?? findSeekEl(seekBarSelector);
      const overSeek = seekEl
        ? isOverElement(e.clientX, e.clientY, seekEl)
        : false;

      if (overSeek && !cachedRectRef.current) {
        if (!cachedRectRef.current) utilsMeasure(seekEl, cachedRectRef);
        else onPointerX?.(e.clientX);
      }

      // if (overSeek && !cachedRectRef.current)
      //   utilsMeasure(seekEl, cachedRectRef);
    };
    const bound = ensureBound();

    const onResize = () => (cachedRectRef.current = null);
    const onScroll = () => (cachedRectRef.current = null);
    document.addEventListener("pointermove", pointerMoveHandler);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      if (bound) {
        bound.removeEventListener("mouseenter", onEnter);
        bound.removeEventListener("mouseleave", onLeave);
        bound.removeEventListener("mousemove", onMove);
      }
      document.removeEventListener("pointermove", pointerMoveHandler);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [seekBarSelector]);

  return {
    lastRect: () => cachedRectRef.current,
    isOverSeek,
    bind: () => utilsBind(seekBarSelector, boundSeekRef, cachedRectRef),
    unbind: () => utilsUnbind(boundSeekRef, cachedRectRef),
    measure: (el?: HTMLElement | null) =>
      utilsMeasure(el ?? boundSeekRef.current, cachedRectRef),
    computePosition,
    boundSeekRef,
    cachedRectRef,
    lastMoveTs,
    HIDE_HOLD_MS,
  } as SeekListeners;
}
