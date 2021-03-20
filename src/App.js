import React, { useState } from 'react';
import useEventListener from '@use-it/event-listener'
import './App.css';


const PLAYER_POS = 5;
const PLAYER_CHAR = '@';
const D_MHP = 1;
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
  ms: Array(DEFAULT_FLOOR.length-1),
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

  if (tick === 0) spawn();

  const Field = () => {
    let f = [...EMPTY_FIELD];
    for (let i = 0, l = rpg.ms.length; i < l; i++) {
      f[i] = rpg.ms[i] ? rpg.ms[i].m : ' ';
    }
    f[PLAYER_POS] = PLAYER_CHAR;
    return f.join('').substring(0, DEFAULT_FIELD.length);
  };
  
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
    console.log('BOO!')
    // TODO grab higher enemy based on level
    let i = ENEMIES_LIST[chance(0, ENEMIES_LIST.length - 1)];
    let e = {
        m: i,
        hp: D_MHP * rpg.lvl
      };
    rpg.ms.push(e);
  }

  const handleHit = () => {
    setTick(++tick);
    rpg.tik++;

    // fight
    let f = rpg.ms.shift();
    if (f !== undefined) {
      rpg.hp -= chance();
      f.hp -= chance(rpg.str);
      if (f.hp <= 0) {
        // kill
        rpg.xp += chance(1);
        rpg.gld += chance();
        rpg.ms.splice(f, 1); // rm
        spawn();
      } else {
        // don't kill
        rpg.ms.unshift(f) // stay
      }
    }
  
    if (chance(0, 100 - (rpg.lvl * 2)) >= 80) {
      console.log('surprise!')
      spawn();
    } else {
      rpg.ms.push(undefined);
    }

    // level up?
    if (rpg.xp >= 10 * (rpg.lvl * rpg.lvl)) {
      rpg.lvl++;
    }
  
    setRpg(rpg);
  };
  
  const Hit = () => (
    <button
      type="button"
      onClick={handleHit}
      >Hit</button>
  );

  const handleEat = () => {
    setTick(++tick);
    rpg.tik++;
    rpg.hp += chance(1);
    rpg.füd--;
    setRpg(rpg);
  }

  const Eat = () => {
    let disabled = rpg.füd <= 0;
    return (
    <button
      type="button"
      onClick={handleEat}
      disabled={disabled}
      >Eat</button>
  )};

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
    return (
    <button
      type="button"
      onClick={handleBuy}
      disabled={disabled}
      >Buy</button>
  )};

  const handlePlay = () => {
    // console.log('PLAY', DEFAULT_RPG);
    setTick(0);
    rpg.ms = [];
    setRpg({...DEFAULT_RPG});
  }

  function handler({ key }) {
    switch(key){
      case 'h':
        handleHit();
        break;
      case 'e':
        handleEat();
        break;
      case 'b':
        handleBuy();
        break;
      default:
        break;
    }
  }
  useEventListener('keydown', handler);

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
