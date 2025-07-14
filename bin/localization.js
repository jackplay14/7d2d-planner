import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';

const localizationFile = new URL('../datas/Localization.txt', import.meta.url);
const outputDir = new URL('../public/i18n/', import.meta.url);

const langs = {
  en: 5,
  de: 7,
  es: 8,
  fr: 9,
  it: 10,
  ja: 11,
  kr: 12,
  pl: 13,
  br: 14,
  ru: 15,
  tr: 16,
  cn: 17,
};

const keepFile = ['progression'];

try {
  const content = await fs.readFile(localizationFile, 'utf-8');

  const records = parse(content, {
    columns: false,
    skip_empty_lines: true,
    relax_quotes: true,
  });

  const output = {};
  for (const lang of Object.keys(langs)) {
    output[lang] = {};
  }

  for (const row of records) {
    if (row.length < 6) continue;
    if (row[5] === 'CURRENTLY NOT USED') continue;

    const file = row[1];
    if (!keepFile.includes(file)) continue;

    const key = row[0];

    for (const [lang, index] of Object.entries(langs)) {
      let value = row[index].replace("\\n", "<br>") || '';
      if( value == '' ){
        console.log("ERROR, no trad for", lang, key);
      } else {
        value = value.replace(/\\n/g, "<br>");
        value = value.replace(/\[DECEA3\](.*?)\[-\]/g, '<strong>$1</strong>');
        console.log(key, ">>>", value);
        output[lang][key] = value;
      }
    }
  }

  // Write JSON files
  for (const [lang, data] of Object.entries(output)) {
    const filepath = new URL(`localization_${lang}.json`, outputDir);
    await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Fichier généré : ${filepath.pathname}`);
  }

} catch (err) {
  console.error('❌ Erreur lors du traitement CSV :', err.message);
}
