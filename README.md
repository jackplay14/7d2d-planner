# 7d2d-planner

Simple Calculator for Perks/Skills in 7 Days To Die.
test

## Usage

Ready to use here : http://www.jacksay.com (Free / No Ads)



## Repport bug

 - https://github.com/jackplay14/7d2d-planner/issues


## TODO

 - [X] Add missing icons
 - [ ] Clean '\n' string in Localization datas
 - [ ] Smartphone friendly UI


## Dev notes

### Requirements

 - NodeJS 23.10.x
 - NPM 10.9.x 

### Installation

Install node tools for Dev/Build

```bash
npm install
```

### Prepare datas

Put in `datas` directory files from game : 
 - `progression.xml`
 - `Localization.txt`

Run scripts for generate sources datas :

```bash
# Generate i18n json files for each languages (store in public/i18n)
npm run i18n

# generate Heavy Hell Json Perks Tree (store in src/perks.json)
npm run perks
```

Ready to work / dev
```bash
# launch vite server
npm run dev

# or build
npm run build
```



