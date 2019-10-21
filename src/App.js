import React, { useState } from 'react';
import './App.css';

const PLAYER_POS = 5;
const PLAYER_CHAR = '@';
const D_M = 'Z';
const D_MHP = 1;
const D_MLOC = 15;
const EMPTY_FIELD = '                                                  '.split('');
const DEFAULT_FIELD = '       @                                          '.split('');
const DEFAULT_FLOOR = '--------------------------------------------------'.split('');
const FLOORS_LIST =   '---+'.split('');
const ENEMIES_LIST = [
  'Z', // Zombie
  'S', // Skeleton
  'V', // Vampire
  'm', // monster
  'Ż', // Zombie French Fries
  'B', // Bat
  'K', // Vicious Kitty
  'J', // Walking Jack-O-Lantern
  'P', // Pennywise
  'D', // Dragon
  'T', // Troll
  'P', // Pirate
  'R', // Rat
  'W', // Werewolf
  'G', // Ghost
  'F', // Frankenstein
  'b', // blob monster
  'A', // Angry Papa
  'M', // Angry Mama
];

const DEFAULT_RPG = {
  fld: [...DEFAULT_FIELD],
  flr: [...DEFAULT_FLOOR],
  ms: [
    {m: D_M, loc: D_MLOC, hp: D_MHP},
  ],
  tik: 0,
  xp: 0,
  gld: 0,
  hp: 10,
  str: 10,
  arm: 10,
  füd: 10,
  lvl: 1,
  autoHit: false,
  autoEat: false,
};

function App() {
  let [tick, setTick] = useState(0);
  let [rpg, setRpg] = useState({...DEFAULT_RPG});

  const Field = () => {
    let f = [...EMPTY_FIELD];
    f[PLAYER_POS] = PLAYER_CHAR;
    for (let i = 0, l = rpg.ms.length; i < l; i++) {
      let m = rpg.ms[i];
      f[m.loc] = m.m;
    }
    return f.join('').substring(0, DEFAULT_FIELD.length);
  };

  function mv(dir){
    for (let i = 0, l = rpg.ms.length; i < l; i++) {
      rpg.ms[i].loc += dir;
    }
    setRpg(rpg);
  }

  /*
  TODO
  - swich from using a pos value to using an index
  - push new enemies to the end
  - pop PLAYER_POS enemeies (maybe null)
  */
  function foe(pos = PLAYER_POS + 1){
    for (let i = 0, l = rpg.ms.length; i < l; i++) {
      if (rpg.ms[i].loc === pos) {
        return i;
      }
    }
    return -1;
  }
  
  const Floor = () => {
    rpg.flr.shift();
    while(rpg.flr.length < DEFAULT_FLOOR.length) {
      let t = FLOORS_LIST[chance(0, FLOORS_LIST.length - 1)];
      rpg.flr.push(t);
    }
    setRpg(rpg);
    return pad(rpg.flr.join(''), DEFAULT_FLOOR.length);
  };

  function chance(min=0, max=rpg.lvl) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function spawn() {
    let i = ENEMIES_LIST[chance(0, ENEMIES_LIST.length - 1)];
    let e = {
        m: i,
        loc: chance(PLAYER_POS + 2, DEFAULT_FLOOR.length),
        hp: D_MHP * rpg.lvl
      };
    rpg.ms.push(e);
  }

  const handleHit = () => {
    setTick(++tick);
    rpg.tik++;
    mv(-1);

    // fight
    let f = foe(PLAYER_POS);
    if (f >= 0) {
      rpg.hp -= chance();
      rpg.ms[f].hp -= chance(rpg.str);
      if (rpg.ms[f].hp <= 0) {
        // kill
        rpg.xp += chance(1);
        rpg.gld += chance();
        rpg.ms.splice(f, 1); // rm
        spawn();
      } else {
        // don't kill
        mv(1); // stay
      }
    }
  
    if (chance(0, 5) > 4) {
      spawn();
    }

    // level up?
    if(rpg.xp >= 10 * (rpg.lvl * rpg.lvl)){
      rpg.lvl++;
    }
  
    setRpg(rpg);
  };

  const Hit = () => {
    return <button
      type="button"
      onClick={handleHit}
      >Hit</button>
  };

  const handleEat = () => {
    setTick(++tick);
    rpg.tik++;
    mv(-1);
    rpg.hp += chance(1);
    rpg.füd--;
    setRpg(rpg);
  }

  const Eat = () => {
    let disabled = rpg.füd <= 0;
    return <button
      type="button"
      onClick={handleEat}
      disabled={disabled}
      >Eat</button>
  };

  const handleBuy = () => {
    setTick(++tick);
    if (rpg.gld > 0) {
      rpg.gld--;
      rpg.tik++;
      rpg.mloc--;
      rpg.füd++;
    }
    setRpg(rpg);
  }

  const Buy = () => {
    let disabled = rpg.gld <= 0;
    return <button
      type="button"
      onClick={handleBuy}
      disabled={disabled}
      >Buy</button>
  };

  const handlePlay = () => {
    // console.log('PLAY', DEFAULT_RPG);
    setTick(0);
    rpg.ms = [];
    setRpg({...DEFAULT_RPG});
  }

  const Play = () => {
    return <button
      type="button"
      onClick={handlePlay}
      >Play</button>
  };

  if (rpg.hp <= 0) {
    return (
      <div className="App"><pre><code>
      YOU DIED{"\n"}
      <Play />
      </code></pre></div>
    );
  }
  
  return (
    <div className="App"><pre><code>
╔═══════════════════════════════════════════════════════════╗{"\n"}
║                                                           ║{"\n"}
║    <Field />     ║{"\n"}
║    <Floor />     ║{"\n"}
║                                                           ║{"\n"}
╠═════════════════════════════════╦═════════════════════════╣{"\n"}
║                                 ║                         ║{"\n"}
║    GOLD {pad(rpg.gld)}              ║     <Hit /><Eat /><Buy />     ║{"\n"}
║    XP {pad(rpg.xp)}                ║                         ║{"\n"}
║    HP {pad(rpg.hp)}                ║                         ║{"\n"}
║    STR {pad(rpg.str)}               ║                         ║{"\n"}
║    ARM {pad(rpg.arm)}               ║                         ║{"\n"}
║    FOOD {pad(rpg.füd)}              ║                         ║{"\n"}
║    LVL {pad(rpg.lvl)}               ║                         ║{"\n"}
║    TIK {pad(rpg.tik)}               ║                         ║{"\n"}
║                                 ║                         ║{"\n"}
╚═════════════════════════════════╩═════════════════════════╝{"\n"}
    </code></pre></div>
  );
}

function pad(v, len = 10){
  return v.toString().padEnd(len, ' ')
}

// ╦╬
// ============
// ENEMIES:
// Z = Zombie
// S = Skeleton
// V = Vampire
// m = monster
// Ż = Zombie French Fries
// B = Bat
// K = Vicious Kitty
// J = Walking Jack-O-Lantern
// P = Pennywise
// D = Dragon
// T = Troll
// P = Pirate
// R = Rat
// W = Werewolf
// G = Ghost
// F = Frankenstein
// b = blob monster
// A = Angry Papa
// M = Angry Mama
// =============
// PICK UPS:
// q = potion
// g = gold
// b = book (XP)
// a = dragon alchemy (LVL 22)
// d = dead brains
// t = treasure chest
// d = diamond
// h = hearts
// e = embers
// s = sword
// d = diamond sword
// a = apple
// p = pumpkin pie
// c = candy
// d = dog food (+HP -STR)
// ==============
// PETS:
// Bird, Reptile, Cat, Dog, Hampster, Rodent
// ==============
// <Btn n="Eat" cb={f => console.log(f)} />
// const Btn = ({n, cb}) => {
//   return <button type="button" onClick={e => cb}>{n}</button>
// };

export default App;
