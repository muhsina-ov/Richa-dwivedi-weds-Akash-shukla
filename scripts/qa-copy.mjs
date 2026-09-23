import { readFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');

const ids = [
  'displayInvocation', 'displayBlessing', 'displayCeremonyEyebrow', 'displayCeremonyTitle',
  'displayBride', 'displayBrideParents', 'displayGroom', 'displayGroomParents',
  'displayDay', 'displayDateNum', 'displayMonth', 'displayYear', 'displayTime',
  'displayVenue', 'displayLocation', 'displayFamilies',
];

let fail = 0;
for (const id of ids) {
  const textMatch = html.match(new RegExp('id="' + id + '"[^>]*>([^<]*)'));
  const valueMatch = html.match(new RegExp('id="' + id + '"[^>]*value="([^"]*)"'));
  const text = textMatch ? textMatch[1].replace(/&amp;/g, '&').trim() : (valueMatch ? valueMatch[1].replace(/&amp;/g, '&').trim() : 'MISSING');
  console.log(id.padEnd(26) + ': ' + text);
  if (text === 'MISSING' || text === '') fail++;
}

const expected = {
  displayInvocation: '|| Shree Ganeshay Namah ||',
  displayBlessing: 'With the blessings of our beloved family and elders,',
  displayCeremonyEyebrow: 'ENGAGEMENT CEREMONY',
  displayCeremonyTitle: 'TILAK',
  displayBride: 'Richa Dwivedi',
  displayBrideParents: 'Daughter of Late Pratap Narayan Dwivedi & Meera Dwivedi',
  displayGroom: 'Akash Shukla',
  displayGroomParents: 'Son of Devi Prasad Shukla (Advocate) & Anita Shukla',
  displayDay: 'SUNDAY',
  displayDateNum: '18',
  displayMonth: 'OCTOBER',
  displayYear: '2026',
  displayTime: '3:00 PM',
  displayVenue: 'YAMUNA VELLY',
  displayLocation: 'Near Aliyapur Toll Plaza',
  displayFamilies: 'The Dwivedi & Shukla Families',
};

console.log('\n--- Exact copy verification ---');
for (const [id, want] of Object.entries(expected)) {
  const textMatch = html.match(new RegExp('id="' + id + '"[^>]*>([^<]*)'));
  const got = textMatch ? textMatch[1].replace(/&amp;/g, '&').trim() : '';
  const ok = got === want;
  if (!ok) fail++;
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + id + (ok ? '' : ` | want="${want}" got="${got}"`));
}

const galleryCount = (html.match(/data-gallery-index=/g) || []).length;
console.log('\nGallery triggers (hero + 7 grid items = 8 expected): ' + galleryCount);
if (galleryCount !== 8) fail++;

const gridImgs = (html.match(/class="gallery-img"/g) || []).length;
console.log('Gallery grid images (7 expected): ' + gridImgs);
if (gridImgs !== 7) fail++;

console.log(fail === 0 ? '\nALL COPY CHECKS PASSED' : `\n${fail} CHECK(S) FAILED`);
process.exit(fail === 0 ? 0 : 1);
