// Run: node check_speech.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function element() {
  return { textContent: '', children: [], append(...nodes) { this.children.push(...nodes); }, before() {}, setAttribute() {} };
}
let spoken;
const context = {
  document: { createElement: element, querySelectorAll: () => [] },
  window: { COURSE: { translations: {'B. Tony needs to collect the book by Friday.': 'B. Tony cần lấy sách chậm nhất vào thứ Sáu.'} }, speechSynthesis: { cancel() {}, getVoices: () => [], speak(u) { spoken = u; } } },
  SpeechSynthesisUtterance: function(text) { this.text = text; },
};
vm.createContext(context);
const source = fs.readFileSync('app.js', 'utf8');
const start = source.indexOf('function englishVoice(');
vm.runInContext(source.slice(start, source.indexOf("document.addEventListener(", start)), context);
const container = element();
container.textContent = 'B. Tony needs to collect the book by Friday.\nGhi chú tiếng Việt\n';
context.enhanceExamText(container);
assert.equal(container.children.length, 3);
const [speak, translate] = container.children[0].children[1].children;
speak.onclick();
assert.equal(spoken.text, 'Tony needs to collect the book by Friday.');
assert.equal(spoken.lang, 'en-GB');
const meaning = container.children[0].children[2];
assert.equal(meaning.hidden, true);
translate.onclick();
assert.equal(meaning.hidden, false);
assert.match(meaning.textContent, /Tony cần lấy sách/);
assert.equal(translate.href, undefined);
translate.onclick();
assert.equal(meaning.hidden, true);
assert.equal(container.children[1].children.length, 1);
delete context.window.speechSynthesis;
const unsupported = element(); unsupported.textContent = 'Hello world';
context.enhanceExamText(unsupported);
assert.equal(unsupported.children[0].children[1].children[0].disabled, true);
console.log('PASS: English speech, Vietnamese note excluded, inline translation toggle, unsupported browser.');
