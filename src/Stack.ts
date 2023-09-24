/**
 * STACK
 * ~~~~~
 *
 * Last-in-first-out (LIFO) collection of items.
 */

export default class Stack<R> {
  private items: Array<R>;

  constructor(items: Array<R> = []) {
    this.items = items;
  }

  /**
   * The number of items in the stack. Read only.
   */
  get length(): number {
    return this.items.length;
  }

  /**
   * Inserts an item into the stack.
   */
  push(item: R) {
    this.items.push(item);
    return null;
  }

  /**
   * Removes the topmost item from the stack and returns it.
   */
  pop(): R | undefined {
    return this.items.pop();
  }

  /**
   * Returns the topmost item from the stack.
   */
  peek(): R {
    return this.items[this.length - 1];
  }

  /**
   * Retrieves an item at index `i` in the stack.
   */
  get(i: number): R | undefined {
    return this.items[i];
  }
}
