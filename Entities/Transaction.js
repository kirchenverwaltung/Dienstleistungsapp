import { state, filterCollection, sortCollection, addRecord } from "./mockData";

export class Transaction {
  static async filter(criteria = {}, sort) {
    const items = filterCollection(state.transactions, criteria);
    return sortCollection(items, sort);
  }

  static async create(data) {
    return addRecord(state.transactions, data);
  }
}
