import { parts } from './chapters-part1.mjs'
import { chaptersPart1 } from './chapters-part1.mjs'
import { chaptersPart2 } from './chapters-part2.mjs'
import { chaptersPart3 } from './chapters-part3.mjs'
import { chaptersPart4 } from './chapters-part4.mjs'
import { chaptersPart5 } from './chapters-part5.mjs'
import { chaptersPart6 } from './chapters-part6.mjs'
import { chaptersPart7 } from './chapters-part7-founder-voice.mjs'

export { parts }

function byPart(arr, id) {
  return arr.filter((c) => c.part === id)
}

/** Narrative order within each part (titles unique per chapter). */
export const chapters = [
  ...byPart(chaptersPart1, 'I'),
  ...byPart(chaptersPart6, 'I'),
  ...byPart(chaptersPart1, 'II'),
  ...byPart(chaptersPart6, 'II'),
  ...byPart(chaptersPart5, 'II'),
  ...byPart(chaptersPart2, 'III'),
  ...byPart(chaptersPart4, 'III'),
  ...byPart(chaptersPart2, 'IV'),
  ...byPart(chaptersPart5, 'IV'),
  ...byPart(chaptersPart2, 'V'),
  ...byPart(chaptersPart4, 'V'),
  ...byPart(chaptersPart5, 'V'),
  ...byPart(chaptersPart6, 'V'),
  ...byPart(chaptersPart5, 'VI'),
  ...byPart(chaptersPart2, 'VI'),
  ...byPart(chaptersPart4, 'VI'),
  ...byPart(chaptersPart7, 'VI'),
  ...byPart(chaptersPart3, 'VI'),
  ...byPart(chaptersPart3, 'VII'),
  ...byPart(chaptersPart4, 'VII'),
  ...byPart(chaptersPart5, 'VII'),
  ...byPart(chaptersPart3, 'VIII'),
  ...byPart(chaptersPart4, 'VIII'),
  ...byPart(chaptersPart5, 'VIII'),
  ...byPart(chaptersPart6, 'VIII'),
  ...byPart(chaptersPart3, 'IX'),
  ...byPart(chaptersPart4, 'IX'),
  ...byPart(chaptersPart6, 'IX'),
  ...byPart(chaptersPart7, 'IX'),
]
