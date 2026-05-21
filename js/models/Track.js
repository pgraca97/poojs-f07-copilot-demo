import { formatDuration, formatPlays } from "../data/constants.js";

class Track {
  #id;
  #plays;
  #liked;

  constructor(title, artist, duration, genre) {
    this.#id = crypto.randomUUID();
    this.title = title;
    this.artist = artist;
    this.duration = duration;
    this.genre = genre;
    this.#plays = 0;
    this.#liked = false;
  }

  get id() {
    return this.#id;
  }
  get plays() {
    return this.#plays;
  }
  get liked() {
    return this.#liked;
  }

  set plays(value) {
    if (value < 0) {
      console.log("Error: plays cannot be negative.");
      return;
    }
    this.#plays = value;
  }

  play() {
    this.#plays++;
    console.log(
      `Now playing: ${this.title} by ${this.artist} (plays: ${this.#plays})`,
    );
  }

  like() {
    this.#liked = !this.#liked;
    console.log(
      this.#liked ? `${this.title} liked!` : `${this.title} unliked.`,
    );
  }

  getInfo() {
    return `${this.title} - ${this.artist} | ${formatDuration(this.duration)} | ${this.genre} | ${formatPlays(this.#plays)} plays`;
  }

  static compare(a, b) {
    if (a.plays === b.plays) return null;
    return a.plays > b.plays ? a : b;
  }

  static fromObject(obj) {
    const t = new Track(obj.title, obj.artist, obj.duration, obj.genre);
    // Preserva o id e o número de plays vindos do servidor;
    // só a própria classe pode escrever em #id e #plays.
    if (obj.id !== undefined) t.#id = obj.id;
    if (obj.plays !== undefined) t.#plays = obj.plays;
    return t;
  }
}

// export default: ficheiro define uma única entidade; quem importa escolhe o nome da variável
export default Track;
