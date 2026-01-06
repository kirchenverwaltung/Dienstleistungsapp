import { state, filterCollection } from "./mockData";

export class Service {
  static async list() {
    return state.services;
  }

  static async filter(criteria = {}) {
    return filterCollection(state.services, criteria);
  }
}
