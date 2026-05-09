// modalStack.ts
export const modalStack = {
  stack: [] as string[],
  push(id: string) {
    this.stack.push(id);
  },
  pop(id: string) {
    // remove the last occurrence
    const idx = this.stack.lastIndexOf(id);
    if (idx !== -1) this.stack.splice(idx, 1);
  },
  top() {
    return this.stack.length ? this.stack[this.stack.length - 1] : null;
  },
};
