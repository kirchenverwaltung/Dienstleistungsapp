import { state, filterCollection, sortCollection, addRecord } from "./mockData";

export class Application {
  static async filter(criteria = {}, sort) {
    const items = filterCollection(state.applications, criteria);
    return sortCollection(items, sort);
  }

  static async create(data) {
    const app = addRecord(state.applications, { status: "ausstehend", ...data });
    return app;
  }

  static async update(id, data) {
    const idx = state.applications.findIndex(app => app.id === id);
    if (idx !== -1) {
      state.applications[idx] = { ...state.applications[idx], ...data };
      return state.applications[idx];
    }
    return null;
  }
}
