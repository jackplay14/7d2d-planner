<script>
/** @Jackplay 2025 - 7D2D Planner**/
import json from "./perks.json";
import axios from "axios";

export default {
  data(){
    return {
      version: "0.0.5",
      loading: true,
      currentLang: 'en',
      langs: {
        "en":"English",
        "de":"Deutsch",
        "es":"Español",
        "fr":"Français",
        "it":"Italiano",
        "ja":"日本語",         // Nihongo
        "kr":"한국어",         // Hangugeo (coréen)
        "pl":"Polski",
        "br":"Português (Brasil)",
        "ru":"Русский",       // Russkiy
        "tr":"Türkçe",
        "cn":"中文",           // Zhōngwén (chinois)
      },
      all: json,
      i18n: {},
      changelog: false,

      // selection
      selectedAttribute: 'attPerception',
      selectedPerk: null,
      selectedLevel: null,
      currentLevel: 1
    }
  },
  computed: {

    points(){
      let pt = 0;
      for( const [key, value] of Object.entries(this.all) ){
        for( const [levelIndex, level] of Object.entries(value.levels) ){
          if( level.buy ){
            pt += level.cost;
          }
        }
        for( const [perkgroupKey, perksGroup] of Object.entries(value.perksGroups) ){
          for( const [perkKey, perk] of Object.entries(perksGroup.perks) ){
            for( const [levelIndex, level] of Object.entries(perk.levels) ){
              if( level.buy ){
                pt += level.cost;
              }
            }
          }
        }
      }
      return pt;
    },

    currentBuild(){
      let build = [];
      for( const [key, value] of Object.entries(this.all) ){
        if( value.label == 'attBooks' ){
          continue;
        }
        build.push(value.level);
        for( const [perkgroupKey, perksGroup] of Object.entries(value.perksGroups) ){
          for( const [perkKey, perk] of Object.entries(perksGroup.perks) ){
            build.push(perk.level);
          }
        }
      }
      return build.map( n => n.toString(16)).join('');
    },

    currentUrl(){
      return '/#'+this.currentLang+'#'+this.currentBuild;
    }
  },

  methods:{
   
    // Handlers
    handlerSelectAttribute(attribute){
      this.selectedPerk = attribute;
      this.selectedAttribute = attribute;
    },

    handlerSelectPerk(perk){
      this.selectedPerk = perk;
      this.selectedLevel = perk;
    },
    
    handlerBuyLevel(level){
      if( !level.buy ){
        this.selectedPerk.level += 1;
        level.buy = true;
        this.refreshUrl();
      }
    },

    handlerReset(){
      window.location = '/#' + this.currentLang;
      window.location.reload();
    },

    handlerChangeLang(){
      if( this.checkLang(this.currentLang) ){
        this.loadI18n(this.currentLang);
        this.refreshUrl();
      }
    },

    // Some stuff
    loadI18n(lang='en'){
      this.loading = true;
      axios.get('/i18n/localization_'+lang+'.json').then(res=>{
        this.i18n = res.data;
        this.loading = false;
      })
    },

    refreshUrl(){
      window.location.href = '#'+this.currentLang+'#'+this.currentBuild;
    },
    checkLang(lang){
      return this.langs.hasOwnProperty(lang);
    }
  },

  mounted() {
    this.loading = true;
    let hash = window.location.href.split('#');

    // get lang in URL
    if(hash.length > 1){
      let urlLang = hash[1];
      if( this.checkLang(urlLang) ){
        this.currentLang = urlLang;
      } else {
        this.currentLang = 'en';
      }
    }

    // get build in URL
    if(hash.length > 2){
      let build = hash[2];
      let buildValue = build.split('').map(hex => parseInt(hex, 16));
      let i = 0;

      // Heavy Hell Loop
      for( const [key, value] of Object.entries(this.all) ){
        if( value.label == 'attBooks' ){
          continue;
        }
        let val = buildValue[i++] | 0;
        if( val ){
          value.level = val;
          for( let i = 1; i<=val; i++ ){
            value.levels[i].buy = true;
          }
        }
        for( const [perkgroupKey, perksGroup] of Object.entries(value.perksGroups) ){
          for( const [perkKey, perk] of Object.entries(perksGroup.perks) ){
            val = buildValue[i++] | 0;
            if( val ){
              perk.level = val;
              for( let i = 1; i<=val; i++ ){
                perk.levels[i].buy = true;
              }
            }
          }
        }
      }
    }
    this.handlerSelectAttribute(json.attPerception);
    this.handlerChangeLang();
  }
}
</script>

<template>
  <header class="app-header">
    <h1>7 DAYS TO DIE 2.0 - <strong>SKILL CALCULATOR</strong></h1>
    <h2 class="sub">Simple Skill Planner</h2>
    <nav>
      <div class="languages">
        Languages : 
        <select v-model="currentLang" @change="handlerChangeLang(key)">
          <option v-for="(value,key) in langs" :value="key">{{ value }}</option>
        </select>
      </div>
      <div class="share">
        Share build : 
        <a :href="currentUrl">{{ currentUrl }}</a>
      </div>
    </nav>
  </header>

  <div class="screen loading" v-show="loading == true">
    <span class="message">LOADING LANGUAGE...</span>
  </div>

  <div class="changelog" v-show="changelog">
    <div class="changelog-content">
      <h1>CHANGELOG</h1>
      <p>Lasted version : <strong>{{ version }}</strong></p>
      <ul>
        <li>
          <strong>v0.0.5</strong>
          <em> (14 July 2025)</em>
          <ul>
            <li>Replace \\n by BR</li>
            <li>Replace [DECEA3].*[-] by STRONG</li>
            <li>Optimize extraction I18N and PERKS TREE</li>
          </ul>
        </li>
        <li>
          <strong>v0.0.4</strong>
          <em> (10 July 2025)</em>
          <ul>
            <li>Add books</li>
            <li>Add icons for buy/locked perks, new background</li>
            <li>Remove padding for General Perk</li>
          </ul>
        </li>
        <li>
          <strong>v0.0.3</strong>
          <em> (10 July 2025)</em>
          <ul>
            <li>Add reset button</li>
            <li>Share build URL</li>
            <li>Add credits</li>
            <li>Add changelog / todo</li>
          </ul>
        </li>  
        <li>
          <strong>v0.0.2</strong>
          <em> (9 July 2025)</em>
          <ul>
            <li>Add general (fuckin) perks</li>
            <li>Drink too many coffee</li>
            <li>Extracting missing assets from wiki for new perks</li>
          </ul>
          </li>
        <li>
          <strong>v0.0.1</strong>
          <em> (8 July 2025)</em>
          <strong>8 July 2025</strong>
          <ul>
            <li>First version (no general perk)</li>
          </ul>
        </li>
      </ul>
      <h2>TODO</h2>
      <ul>
        <li>Extract text UI needed for "Points/Level" texts</li>
        <li>Smartphone friendly</li>
      </ul>
      <span class="button" @click="changelog = false">
        Close
      </span>
    </div>
  </div>

  <transition name="fade">
  <div class="screen" v-show="loading == false">

    <div class="left panel">
      <header class="heading">
        <div class="level-infos">
          <em>Level : </em>
          <strong>{{ points+1 }}</strong>
        </div>
        <div class="points-infos">
          <em>Points : </em>
          <strong>{{ points }}</strong>
        </div>
      </header>
      <!-- MENU -->
      <nav class="attributes-menu">
        <span v-for="(attribute, attributeKey) in all"
              class="attributes-menu-item reactive"
              :class="selectedAttribute == attribute ? 'selected' : ''"
              @click="handlerSelectAttribute(attribute)">
          <img :src="'/images/'+attribute.icon+'.png'" :alt="attribute.label" />
        </span>
      </nav>

      <section class="attribute-aside" v-for="(attribute, attributeKey) in all" v-show="selectedAttribute == attribute">
        <div class="attribute-main" v-show="attributeKey != 'attGeneralPerks' && attributeKey != 'attBooks'">
          <div class="label reactive"
               @click="handlerSelectAttribute(attribute)">
            <img :src="'/images/'+attribute.icon+'.png'" :alt="attribute.label" class="icon"/>
            <span class="text">{{ i18n[attribute.label] }}</span>
            <span class="spent">
              {{ attribute.level }} /
              <strong>{{ Object.keys(attribute.levels).length }}</strong>
            </span>
          </div>
        </div>
        <div class="attribute-group" v-for="group in attribute.perksGroups">
          <div class="label" v-show="group.label != 'general' && group.label != ''">
            <img :src="'/images/'+group.icon+'.png'" :alt="group.label" class="icon"/>
            <span class="text">{{ i18n[group.label] }}</span>
          </div>
          <div class="attribute-group-perk reactive"
               :class="{
                'selected': selectedPerk == perk,
                'flatperk': attributeKey == 'attGeneralPerks' || attributeKey == 'attBooks',
                'book': attributeKey == 'attBooks',
                }"
               v-for="perk in group.perks"
               @click="handlerSelectPerk(perk)">
            <div class="label">
              <img :src="'/images/'+perk.icon+'.png'" :alt="perk.icon" class="icon"/>
              <span class="text">{{ i18n[perk.label] }}</span>
              <span class="spent">
                {{ perk.level }} /
                <strong>{{ Object.keys(perk.levels).length }}</strong>
              </span>
            </div>
          </div>
        </div>

      </section>
    </div>

    <div class="panel right">
      <div class="details">
        <header class="heading">
          <div>
            {{ i18n[selectedAttribute.label]||selectedAttribute.label }}
          </div>
          <a class="button" @click="handlerReset()">RESET PERKS</a>
        </header>
        <div v-if="selectedPerk">
          <div class="perk-heading">
            <div class="image">
              <img :src="'/images/'+selectedPerk.icon+'.png'" :alt="selectedPerk.icon" />
            </div>
            <div class="description" v-html="i18n[selectedPerk.description]"></div>
          </div>
          <div class="levelDetail" style="display: none">
            <div v-if="selectedLevel">
              <div>{{ i18n[selectedLevel.label] }}</div>
              <div>{{ i18n[selectedLevel.description] }}</div>
            </div>
          </div>
          <section class="perklevels" v-if="selectedPerk.label != 'General_Perks' && selectedPerk.label != 'attBooks'" >
            <article v-for="level in selectedPerk.levels"
                     :class="{'buy': level.buy}"
                     class="level-item reactive">
              <span class="level">
                <strong>
                  <img src="/images/ui_game_symbol_perk.png" alt="" 
                    style="max-width: 1.6em;"
                    v-if="level.buyable == false && level.level == 8" />
                  <span v-else>{{  level.level }}</span>  
                </strong>
              </span>
              <span class="name">
                <strong>
                  <span class="title">
                    <span v-if="level.buyable == false && level.level == 8">
                      Complete
                    </span>
                    <span v-else v-html="i18n[level.label]||level.label" ></span>
                  </span>
                  <small class="requireInfo" v-if="!level.buyable && level.buyable != false">
                    Cost: {{ level.cost }} pt
                    <span v-if="level.requireAttributeText">
                    / Require: {{ i18n[level.requireAttributeText] }}
                    </span>
                  </small>
                </strong>
                <p class="description" v-html="i18n[level.description]"></p>
              </span>
              <template v-if="!level.buyable && level.buyable != false">
                <span v-if="level.buy" class="buyer buyed">
                  <img src="/images/ui_check_symbol.png" alt="" style="max-width: 1.2em;">
                </span>
                <span v-else-if="selectedPerk.level == level.level-1 &&
                (!level.requireAttributeLevel || level.requireAttributeLevel <= selectedAttribute.level)"
                      @click="handlerBuyLevel(level)"
                      class="buyer buyable"
                >
                  <img src="/images/ui_cart_symbol.png" alt="" style="max-width: 1.2em;">
                </span>
                <span v-else class="buyer disabled">
                  <img src="/images/ui_game_symbol_lock.png" 
                     :title="i18n[level.requireAttributeText]"
                    alt="" style="max-width: 1.2em;">
                </span>
              </template>
            </article>
          </section>
        </div>
      </div>
    </div>
  </div>
  </transition>

  <footer class="screen footer">
    <div class="message">
      <strong>7 DAYS TO DIE 2.0 PERKS SIMULATOR</strong> 
      (v {{ version }} - <a href="#" @click.prevent="changelog = true">changelog</a>)<br>
      created by <strong>Jackplay</strong> -
      <a href="https://www.youtube.com/channel/UCwyijn-pKurzvrBIIGVob7w">Youtube</a> -
      <a href="https://www.twitch.tv/jackplaypz">Twitch</a><br>
      <small>
        &copy; Design, text and data used are extracted from game files, they are property of <strong>The Fun Pimps</strong>
      </small>
    </div>
  </footer>
</template>

<style scoped lang="scss">

</style>
