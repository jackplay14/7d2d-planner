// @Jackplay 2025 - 7D2D Planner (Node.js version)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { parseStringPromise } from 'xml2js';
import { exit } from 'process';

// __dirname en ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Chargement et parsing XML
const xmlPath = path.join(__dirname, '../datas/progression.xml');
console.log("Reading file", xmlPath);
const xmlContent = fs.readFileSync(xmlPath, 'utf8');
const xml = await parseStringPromise(xmlContent, { explicitArray: false });
const attributes = {};
let books = {};
let crafting = {};
const skillsParentRel = {};

const root = xml.progression;

// ---------------------------------------------------- ATTRIBUTES
for (const attr of root.attributes.attribute) {
    const name = attr.$.name;
    const nameKey = attr.$.name_key;
    const descKey = attr.$.desc_key;
    const icon = attr.$.icon;

    console.log(name, nameKey, descKey, icon);

    switch (name) {
        case 'attPerception':
        case 'attStrength':
        case 'attFortitude':
        case 'attAgility':
        case 'attIntellect':
        case 'attGeneralPerks':
            attributes[name] = {
                label: nameKey,
                description: descKey,
                icon,
                level: 1,
                levels: {},
                perksGroups: {},
            };

            if (attr.level_requirements) {
                const levels = Array.isArray(attr.level_requirements) ? attr.level_requirements : [attr.level_requirements];
                for (const lvl of levels) {
                    const level = parseInt(lvl.$.level);
                    const costText = lvl.requirement?.$.desc_key ?? '';
                    const cost = level === 1 ? 0 : parseInt(costText.slice(16, 18)) || 1;
                    attributes[name].levels[level] = {
                        level,
                        buy: level === 1,
                        cost,
                    };
                }
            }

            if (attr.effect_group) {
                const groups = Array.isArray(attr.effect_group) ? attr.effect_group : [attr.effect_group];
                for (const group of groups) {
                    if (group.effect_description) {
                        for (const eff of group.effect_description) {
                            const level = parseInt(eff.$.level);
                            attributes[name].levels[level].label = eff.$.desc_key;
                            attributes[name].levels[level].description = eff.$.long_desc_key;
                        }
                    }
                }
            }
            break;

        case 'attBooks':
            books = {
                label: nameKey,
                description: descKey,
                icon,
                level: 1,
                levels: {
                    1: { level: 1, buy: true, cost: 0 },
                },
                perksGroups: {
                    general: {
                        label: 'general',
                        perks: {},
                    },
                },
            };
            break;

        case 'attCrafting':
            crafting = {
                label: nameKey,
                description: descKey,
                icon,
            };
            break;
    }
}

// ---------------------------------------------------- SKILL GROUPS
attributes['attGeneralPerks'].perksGroups['general'] = {
    label: 'general',
    icon: 'general',
    description: 'general',
    perks: {},
};

for (const skill of root.skills.skill) {
    const name = skill.$.name;
    const parent = skill.$.parent;
    if (parent === 'attGeneralPerks') continue;
    skillsParentRel[name] = parent;

    attributes[parent].perksGroups[name] = {
        label: skill.$.name_key,
        icon: skill.$.icon,
        description: skill.$.desc_key,
        perks: {},
    };
}

// ---------------------------------------------------- PERKS
for (const perk of root.perks.perk) {
    const name = perk.$.name;
    const parent = perk.$.parent;
    const label = perk.$.name_key;
    const icon = perk.$.icon;
    const description = perk.$.desc_key;


    let attribute = '';
    let group = '';
    let limit = parseInt(perk.$.max_level) || 5;
    let specialCost = [];
    let startLvl = 1;


    if (parent === 'skillGeneralPerks') {
        attribute = 'attGeneralPerks';
        group = 'general';
        specialCost = perk.$.override_cost?.split(',').map(Number) ?? [1, 1, 1, 1, 1];
    } else {
        attribute = skillsParentRel[parent];
        group = parent;
    }

    const levels = {};

    if (perk.level_requirements) {
        const reqs = Array.isArray(perk.level_requirements) ? perk.level_requirements : [perk.level_requirements];
        for (const lvl of reqs) {
            const level = parseInt(lvl.$.level);
            const requireAttrLevel = parseInt(lvl.requirement.$.value);
            const requireAttrText = lvl.requirement.$.desc_key;
            //console.log(`Level ${level}, require attr ${requireAttrLevel} (${requireAttrText})`);
            levels[level] = {
                level,
                buy: false,
                cost: 1,
                requireAttributeLevel: requireAttrLevel,
                requireAttributeText: requireAttrText,
            };
        }
    }

    console.log("-----------------EFFECTS");
    if( perk.effect_group ){

        let effectDetails = null;

        if( Array.isArray(perk.effect_group) ){
            console.log("TABLEAU");
            for( let effect_group in perk.effect_group ){
                if( perk.effect_group[effect_group].effect_description ){
                    effectDetails =  perk.effect_group[effect_group].effect_description;
                }
            }
        } else {
            console.log("OBJECT");
            effectDetails = perk.effect_group.effect_description;
        }

        if( !effectDetails ){
            console.log("STRANGE...");
            console.log(perk.effect_group);
            process.exit(0);
        }

        console.log("Process effect_description", effectDetails);
            
        for( const effect_description in effectDetails ){
            
            let effect_data = effectDetails[effect_description];
    

            console.log("Process description from", effect_data);

            if (limit === 0) continue;
            const level = parseInt(effect_data.$.level);
            
            let effect_label = effect_data.$.desc_key;
            let effect_desc = effect_data.$.long_desc_key;
            console.log(group, level, effect_desc, effect_label);
            if (group === 'general') {
                levels[level] = {
                    level: startLvl,
                    buy: false,
                    cost: specialCost[startLvl - 1] || 1,
                    label: effect_data.$.desc_key,
                    description: effect_data.$.long_desc_key,
                };
                startLvl++;
                limit--;
            } else {
                levels[level] = {
                    ...levels[level],
                    label: effect_data.$.desc_key,
                    description: effect_data.$.long_desc_key,
                };
            }
        }
    } else {
        console.error(name, "pas de 'effect_group'");
        console.log(perk);
    }

    

    const perkData = {
        name,
        icon,
        label,
        description,
        level: 0,
        levels,
    };

    attributes[attribute].perksGroups[group].perks[name] = perkData;
}

// ---------------------------------------------------- BOOKS
for (const group of root.skills.book_group) {
    const name = group.$.name;
    //console.log(`process GROUP BOOK '${name}'`);
    const parent = group.$.parent;
    books.perksGroups.general.perks[name] = {
        name,
        icon: group.$.icon,
        label: group.$.name_key,
        description: group.$.desc_key,
        parent,
        level: 1,
        levels: [],
    };
}

for (const book of root.perks.book) {
    const name = book.$.name;
    const parent = book.$.parent;
    const label = book.$.desc_key;
    const description = book.$.long_desc_key;

    if (books.perksGroups.general.perks[parent]) {
        const volume = books.perksGroups.general.perks[parent].levels.length + 1;
        books.perksGroups.general.perks[parent].levels.push({
            level: volume,
            name,
            label: `Vol. ${volume}`,
            description: label,
            buy: false,
            buyable: false,
            cost: 0,
        });
    } else {
        console.warn(`Warning, missing key '${parent}' in attBook`);
    }
}

// ---------------------------------------------------- EXPORT
attributes['attBooks'] = books;

const outputPath = path.join(__dirname, '../src/perks.json');
fs.writeFileSync(outputPath, JSON.stringify(attributes, null, 2), 'utf8');
console.log('✔ Fichier perks.json généré avec succès.');
