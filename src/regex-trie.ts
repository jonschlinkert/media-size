type TrieNode = {
  end?: true;
  [key: string]: TrieNode | true | undefined;
};

export class RegexTrie {
  constructor() {
    this.count = 0;
    this.trie = {};
  }

  add(value: unknown): this {
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        this.add(value[i]);
      }

      return this;
    }

    const input = this.castToString(value);

    if (!this.isNonEmptyString(input)) {
      return this;
    }

    if (this.contains(input)) {
      return this;
    }

    let trie = this.trie;
    for (let i = 0; i < input.length; i++) {
      const chr = input[i];
      const node = this.find(trie, chr);

      if (node) {
        trie = node;
        continue;
      }

      trie[chr] = {};

      const created_node = this.find(trie, chr);
      if (created_node) {
        trie = created_node;
      }
    }

    trie.end = true;
    this.count++;

    return this;
  }

  toRegExp(): RegExp | undefined {
    if (this.count === 0) {
      return undefined;
    }

    return new RegExp(this.walk(this.trie));
  }

  stringify(): string | undefined {
    if (this.count === 0) {
      return undefined;
    }

    return this.walk(this.trie);
  }

  source(altGroup: string[], charClass: string[], end: boolean): string {
    let result = '';

    if (altGroup.length > 0) {
      if (altGroup.length === 1) {
        result += altGroup[0];
      } else {
        let all_single_char = true;

        for (let i = 0; i < altGroup.length; i++) {
          if (altGroup[i].length !== 1) {
            all_single_char = false;
            break;
          }
        }

        if (all_single_char) {
          result += `[${altGroup.join('')}]`;
        } else {
          result += `(?:${altGroup.join('|')})`;
        }
      }
    } else if (charClass.length > 0) {
      result += charClass[0];
    }

    if (end && result) {
      if (result.length === 1) {
        result += '?';
      } else {
        result = `(?:${result})?`;
      }
    }

    return result;
  }

  contains(value: unknown): boolean {
    const input = this.castToString(value);

    if (!this.isNonEmptyString(input)) {
      return false;
    }

    let trie = this.trie;

    for (let i = 0; i < input.length; i++) {
      const chr = input[i];
      const node = this.find(trie, chr);

      if (!node) {
        return false;
      }

      trie = node;
    }

    return hasOwnProperty.call(trie, 'end') && trie.end === true;
  }

  castToString(value: unknown): string | unknown {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return String(value);
    }

    return value;
  }

  isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.length > 0;
  }

  escapeRegex(input: string): string {
    return input
      .replace(/([\t\n\f\r\\\$\(\)\*\+\-\.\?\[\]\^\{\|\}])/g, '\\$1')
      .replace(/[^\x20-\x7E]/g, JSON.stringify);
  }

  find(trie: TrieNode | undefined, key: string): TrieNode | undefined {
    const node = trie?.[key];

    if (!node || node === true) {
      return undefined;
    }

    return node;
  }

  walk(trie: TrieNode): string {
    const keys = Object.keys(trie);
    const altGroup = [];
    const charClass = [];
    let end = false;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      if (key === 'end') {
        end = true;
        continue;
      }

      const node = this.find(trie, key);
      if (!node) {
        continue;
      }

      const walkResult = `${this.escapeRegex(key)}${this.walk(node)}`;
      const target = keys.length > 1 ? altGroup : charClass;
      target.push(walkResult);
    }

    return this.source(altGroup, charClass, end);
  }
}

const regexps = new WeakMap();

export function createExtRegex(patterns: string[]) {
  if (regexps.has(patterns)) {
    return regexps.get(patterns);
  }

  const trie = new RegexTrie();
  trie.add([...patterns]);
  const regex = new RegExp(`\\.${trie.stringify()}$`, 'i');
  regexps.set(patterns, regex);
  return regex;
}
