import { inline } from './experiment.mjs';

// The skimmable summary of a paper: the questions it asked and the answers it
// got, as a shallow tree with the leading question at the root. The key
// takeaways are boxed inside the tree, each under the question it answers, so
// a reader can scan the investigation and read only the boxes.

export interface Takeaway {
  title: string;
  text: string;
  kind?: string;
}
export interface Answered {
  q: string;
  a: string;
  see?: string;
  takeaways?: Takeaway[];
  sub?: Answered[];
}

const t = (s: string) => inline(s, {});

const boxes = (n: Answered) =>
  (n.takeaways ?? [])
    .map((k) => {
      const tag = k.kind === 'method' ? '<span class="tag">new method</span>' : '';
      return `<div class="takeaway"><strong>${t(k.title)}</strong>${tag} ${t(k.text)}</div>`;
    })
    .join('');

function node(n: Answered, cls = ''): string {
  const question = n.see ? `<a href="${n.see}">${t(n.q)}</a>` : t(n.q);
  return `<p class="qa-q ${cls}"><span class="qa-mark">Q:</span> ${question}</p><p class="qa-a">${t(n.a)}</p>${boxes(n)}`;
}

const tree = (nodes: Answered[] = []): string =>
  nodes.length ? `<ul class="qa-tree">${nodes.map((n) => `<li>${node(n)}${tree(n.sub)}</li>`).join('')}</ul>` : '';

export const questionsHtml = (root: Answered) => node(root, 'qa-root') + tree(root.sub);
