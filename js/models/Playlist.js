import { formatDuration } from "../data/constants.js";

class Playlist {
  #tracks;

  constructor(name, createdBy) {
    this.name = name;
    this.createdBy = createdBy;
    this.#tracks = [];
  }

  get size() {
    return this.#tracks.length;
  }

  add(track) {
    this.#tracks.push(track);
    console.log(`${track.title} added to ${this.name}.`);
  }

  has(track) {
    return this.#tracks.some((t) => t.id === track.id);
  }

  remove(title) {
    const index = this.#tracks.findIndex((t) => t.title === title);
    if (index === -1) {
      console.log("Track not found.");
      return;
    }
    const [removed] = this.#tracks.splice(index, 1);
    console.log(`${removed.title} removed.`);
  }

  getTotalDuration() {
    let total = 0;
    this.#tracks.forEach((t) => (total += t.duration));
    return `Total: ${formatDuration(total)}`;
  }

  getMostPlayed() {
    let most = this.#tracks[0];
    for (const t of this.#tracks) {
      if (t.plays > most.plays) most = t;
    }
    return most;
  }

  printAll() {
    console.log(`${this.name} - by ${this.createdBy}`);
    this.#tracks.forEach((t) => console.log(t.getInfo()));
  }

  getInfo() {
    return `${this.name} by ${this.createdBy} | ${this.#tracks.length} tracks | ${this.getTotalDuration()}`;
  }
}

// export default: ficheiro define uma única entidade; quem importa escolhe o nome da variável
export default Playlist;
