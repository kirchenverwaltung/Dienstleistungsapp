import { state, filterCollection, sortCollection, addRecord } from "./mockData";

export class Message {
  static async filter(criteria = {}, sort) {
    const items = filterCollection(state.messages, criteria);
    return sortCollection(items, sort);
  }

  static async create(data) {
    const msg = addRecord(state.messages, { read: false, ...data, created_date: new Date().toISOString() });
    return msg;
  }

  static async update(id, data) {
    const idx = state.messages.findIndex(msg => msg.id === id);
    if (idx !== -1) {
      state.messages[idx] = { ...state.messages[idx], ...data };
      return state.messages[idx];
    }
    return null;
  }
}
