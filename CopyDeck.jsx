// Silhuett-bibliotek: SVG-figurer i 0 0 100 100 som brukes som «pynt» i stedet for emojis.
// Hver figur fylles med én farge (el.fill) via ShapeInner sin 'silhouette'-gren.
export const SIL_CATS = [
  { id: 'mat', name: '🍔 Mat' },
  { id: 'natur', name: '🏔️ Natur' },
  { id: 'reise', name: '✈️ Reise' },
  { id: 'historie', name: '🪖 Historie' },
  { id: 'skole', name: '📚 Skole' },
  { id: 'rom', name: '🚀 Verdensrom' },
  { id: 'figurer', name: '⭐ Figurer' },
]

export const SILHOUETTES = [
  // ---- Mat (burger-lag som kan stables) ----
  { id: 'burger-top', cat: 'mat', name: 'Burgerbrød topp', ratio: 1.7, path: 'M6,64 C6,30 28,12 50,12 C72,12 94,30 94,64 Z' },
  { id: 'burger-lettuce', cat: 'mat', name: 'Salat', ratio: 2.6, path: 'M3,42 Q13,24 24,42 Q34,24 45,42 Q55,24 66,42 Q77,24 97,42 L97,58 Q50,72 3,58 Z' },
  { id: 'burger-cheese', cat: 'mat', name: 'Ost', ratio: 2.8, path: 'M5,30 H95 V52 L82,66 L70,52 L58,66 L46,52 L34,66 L22,52 L5,66 Z' },
  { id: 'burger-patty', cat: 'mat', name: 'Kjøtt', ratio: 2.6, path: 'M14,34 H86 Q96,34 96,46 V54 Q96,66 86,66 H14 Q4,66 4,54 V46 Q4,34 14,34 Z' },
  { id: 'burger-bottom', cat: 'mat', name: 'Burgerbrød bunn', ratio: 2.0, path: 'M10,34 Q50,28 90,34 Q97,36 95,50 Q90,66 50,66 Q10,66 5,50 Q3,36 10,34 Z' },
  { id: 'fries', cat: 'mat', name: 'Pommes frites', ratio: 1.1, path: 'M30,18 L36,60 H30 Z M42,12 L48,60 H42 Z M54,16 L60,60 H54 Z M66,20 L72,60 H66 Z M22,60 H78 L72,92 H28 Z' },
  { id: 'drink', cat: 'mat', name: 'Brus', ratio: 0.7, path: 'M30,26 H70 L64,92 H36 Z M34,12 H66 V22 H34 Z M52,12 L78,2 L82,8 L56,20 Z' },

  // ---- Natur ----
  { id: 'mountains', cat: 'natur', name: 'Fjell', ratio: 1.8, path: 'M2,92 L30,32 L46,58 L60,28 L98,92 Z M30,32 L40,46 L20,46 Z' },
  { id: 'tree', cat: 'natur', name: 'Tre', ratio: 0.75, path: 'M50,6 L66,38 L58,38 L72,64 L60,64 L80,90 L20,90 L40,64 L28,64 L42,38 L34,38 Z M45,90 H55 V100 H45 Z' },
  { id: 'cloud', cat: 'natur', name: 'Sky', ratio: 1.7, path: 'M22,70 Q6,70 9,54 Q4,40 20,40 Q22,24 42,28 Q50,14 66,26 Q86,22 86,44 Q98,48 90,64 Q92,70 78,70 Z' },
  { id: 'sun', cat: 'natur', name: 'Sol', ratio: 1, path: 'M50,8 L58,22 L74,18 L70,34 L86,42 L72,50 L86,58 L70,66 L74,82 L58,78 L50,92 L42,78 L26,82 L30,66 L14,58 L28,50 L14,42 L30,34 L26,18 L42,22 Z' },
  { id: 'wave', cat: 'natur', name: 'Bølge', ratio: 2.4, path: 'M2,54 Q18,38 34,54 Q50,70 66,54 Q82,38 98,54 L98,92 L2,92 Z' },
  { id: 'leaf', cat: 'natur', name: 'Blad', ratio: 0.9, path: 'M50,4 C20,24 14,64 50,96 C86,64 80,24 50,4 Z M50,16 V88' },

  // ---- Reise ----
  { id: 'plane', cat: 'reise', name: 'Fly', ratio: 1.05, path: 'M48,4 Q52,4 53,16 L54,40 L94,62 L94,70 L54,56 L54,78 L66,86 L66,92 L50,88 L34,92 L34,86 L46,78 L46,56 L6,70 L6,62 L46,40 L47,16 Q47,4 48,4 Z' },
  { id: 'suitcase', cat: 'reise', name: 'Koffert', ratio: 1.2, path: 'M38,28 V22 Q38,16 44,16 H56 Q62,16 62,22 V28 H80 Q86,28 86,34 V84 Q86,90 80,90 H20 Q14,90 14,84 V34 Q14,28 20,28 Z M44,22 H56 V28 H44 Z' },
  { id: 'compass', cat: 'reise', name: 'Kompass', ratio: 1, path: 'M50,6 a44,44 0 1,0 0.1,0 Z M50,18 a32,32 0 1,1 -0.1,0 Z M50,28 L60,50 L50,72 L40,50 Z' },
  { id: 'pin', cat: 'reise', name: 'Kartnål', ratio: 0.7, path: 'M50,6 C30,6 16,20 16,40 C16,64 50,94 50,94 C50,94 84,64 84,40 C84,20 70,6 50,6 Z M50,28 a12,12 0 1,0 0.1,0 Z' },

  // ---- Historie / WW2 ----
  { id: 'jet', cat: 'historie', name: 'Jagerfly', ratio: 1.9, path: 'M4,52 L54,46 L40,24 L50,24 L70,44 L88,30 L92,34 L80,48 L96,46 L96,54 L80,52 L92,66 L88,70 L70,56 L50,76 L40,76 L54,54 L4,58 Z' },
  { id: 'tank', cat: 'historie', name: 'Stridsvogn', ratio: 2.0, path: 'M6,66 H94 V76 Q94,82 88,82 H12 Q6,82 6,76 Z M14,54 H86 L80,66 H20 Z M40,40 H64 V54 H40 Z M64,44 H98 V49 H64 Z' },
  { id: 'soldier', cat: 'historie', name: 'Soldat', ratio: 0.6, path: 'M36,16 Q36,8 50,8 Q64,8 64,16 L66,20 H34 Z M44,22 H56 L58,24 a8,8 0 1,1 -16,0 Z M40,34 Q40,30 50,30 Q60,30 60,34 L62,62 H54 V92 H46 V62 H38 Z' },
  { id: 'medal', cat: 'historie', name: 'Medalje', ratio: 0.7, path: 'M38,6 L48,38 H42 L34,10 Z M62,6 L66,10 L58,38 H52 Z M50,40 a26,26 0 1,0 0.1,0 Z M50,52 L56,64 L50,76 L44,64 Z' },
  { id: 'flag', cat: 'historie', name: 'Flagg', ratio: 1.3, path: 'M24,8 H28 V92 H24 Z M28,12 H86 L74,30 L86,48 H28 Z' },

  // ---- Skole ----
  { id: 'book', cat: 'skole', name: 'Bok', ratio: 1.3, path: 'M50,22 Q34,14 8,18 V80 Q34,76 50,84 Q66,76 92,80 V18 Q66,14 50,22 Z M50,22 V84' },
  { id: 'pencil', cat: 'skole', name: 'Blyant', ratio: 1, path: 'M14,86 L20,66 L66,20 L80,34 L34,80 Z M14,86 L20,66 L34,80 Z M66,20 L74,12 L88,26 L80,34 Z' },
  { id: 'bulb', cat: 'skole', name: 'Lyspære', ratio: 0.7, path: 'M50,8 Q74,8 74,32 Q74,46 60,56 V64 H40 V56 Q26,46 26,32 Q26,8 50,8 Z M42,68 H58 V74 H42 Z M45,77 H55 V82 H45 Z' },
  { id: 'graduate', cat: 'skole', name: 'Studenthatt', ratio: 1.6, path: 'M50,20 L96,38 L50,56 L4,38 Z M26,46 V66 Q38,76 50,76 Q62,76 74,66 V46 L50,56 Z M94,40 V62 L98,72 H90 L94,62 Z' },

  // ---- Verdensrom ----
  { id: 'rocket', cat: 'rom', name: 'Rakett', ratio: 0.6, path: 'M50,4 Q64,22 64,50 V66 H36 V50 Q36,22 50,4 Z M36,56 L22,78 L36,70 Z M64,56 L78,78 L64,70 Z M42,66 H58 L50,92 Z M50,30 a7,7 0 1,0 0.1,0 Z' },
  { id: 'planet', cat: 'rom', name: 'Planet', ratio: 1.5, path: 'M50,20 a24,24 0 1,0 0.1,0 Z M14,58 Q50,76 86,58 Q92,54 88,48 Q70,60 50,60 Q30,60 12,48 Q8,54 14,58 Z' },
  { id: 'astronaut', cat: 'rom', name: 'Astronaut', ratio: 0.7, path: 'M50,10 a18,18 0 1,0 0.1,0 Z M40,22 H60 V34 H40 Z M34,40 Q34,34 50,34 Q66,34 66,40 L70,70 H62 V90 H38 V70 H30 Z' },
  { id: 'star4', cat: 'rom', name: 'Glimt', ratio: 1, path: 'M50,4 Q56,40 96,50 Q56,60 50,96 Q44,60 4,50 Q44,40 50,4 Z' },

  // ---- Figurer / folk ----
  { id: 'person', cat: 'figurer', name: 'Person', ratio: 0.6, path: 'M50,8 a12,12 0 1,0 0.1,0 Z M32,40 Q32,30 50,30 Q68,30 68,40 L68,72 H58 V94 H42 V72 H32 Z' },
  { id: 'bird', cat: 'figurer', name: 'Fugl', ratio: 1.9, path: 'M4,50 Q26,28 48,48 Q50,50 52,48 Q74,28 96,50 Q74,44 52,58 Q50,60 48,58 Q26,44 4,50 Z' },
  { id: 'cat', cat: 'figurer', name: 'Katt', ratio: 1, path: 'M30,40 L22,16 L40,32 Q50,28 60,32 L78,16 L70,40 Q82,54 82,72 Q82,88 50,88 Q18,88 18,72 Q18,54 30,40 Z' },
  { id: 'heart', cat: 'figurer', name: 'Hjerte', ratio: 1.1, path: 'M50,88 C14,60 4,38 19,23 C33,9 48,19 50,32 C52,19 67,9 81,23 C96,38 86,60 50,88 Z' },
  { id: 'ball', cat: 'figurer', name: 'Ball', ratio: 1, path: 'M50,6 a44,44 0 1,0 0.1,0 Z M50,30 L66,42 L60,62 L40,62 L34,42 Z' },
  { id: 'lightning', cat: 'figurer', name: 'Lyn', ratio: 0.6, path: 'M58,4 L24,54 H46 L40,96 L78,40 H54 Z' },
]

// Ferdige animerte SCENER: flere silhuetter som settes sammen / flyr inn.
// Hver returnerer en liste {kind:'silhouette', path, fill, x,y,w,h, anim:{type,start,order}}.
export const SCENES = [
  { id: 'burger', name: '🍔 Burger stables', build: () => {
    const cx = 380, w = 200
    const layers = [
      { id: 'burger-bottom', h: 40, fill: '#d9a441' },
      { id: 'burger-patty', h: 34, fill: '#7a4a2b' },
      { id: 'burger-cheese', h: 30, fill: '#f4b740' },
      { id: 'burger-lettuce', h: 26, fill: '#5fae42' },
      { id: 'burger-top', h: 72, fill: '#e0a544' },
    ]
    // Stable nedenfra og opp slik at lagene møtes
    let cursor = 380
    const stack = []
    for (let i = layers.length - 1; i >= 0; i--) {
      const L = layers[i]
      cursor -= (L.h - 8)
      stack.unshift({ ...L, y: cursor })
    }
    return stack.map((L, i) => {
      const sp = SILHOUETTES.find((s) => s.id === L.id)
      return { kind: 'silhouette', sid: L.id, path: sp.path, fill: L.fill, x: cx, y: L.y, w, h: L.h, anim: { type: 'dropIn', start: 'after', order: i } }
    })
  } },
  { id: 'jet', name: '✈️ Jagerfly flyr over', build: (accent) => {
    const sp = SILHOUETTES.find((s) => s.id === 'jet')
    return [{ kind: 'silhouette', sid: 'jet', path: sp.path, fill: accent || '#334155', x: 60, y: 150, w: 220, h: 116, anim: { type: 'flyAcross', start: 'after', order: 0 } }]
  } },
  { id: 'rocket', name: '🚀 Rakett tar av', build: (accent) => {
    const sp = SILHOUETTES.find((s) => s.id === 'rocket')
    return [{ kind: 'silhouette', sid: 'rocket', path: sp.path, fill: accent || '#334155', x: 420, y: 320, w: 120, h: 200, anim: { type: 'liftOff', start: 'after', order: 0 } }]
  } },
]
