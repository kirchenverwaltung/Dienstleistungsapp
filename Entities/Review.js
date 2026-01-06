import { state, filterCollection, sortCollection, addRecord } from "./mockData";

export class Review {
  static async filter(criteria = {}, sort) {
    const items = filterCollection(state.reviews, criteria);
    return sortCollection(items, sort);
  }

  static async create(data) {
    return addRecord(state.reviews, data);
  }
}
