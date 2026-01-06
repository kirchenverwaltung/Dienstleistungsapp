import { state, filterCollection, addRecord } from "./mockData";

export class BusinessRegistration {
  static async filter(criteria = {}) {
    return filterCollection(state.businessRegistrations, criteria);
  }

  static async update(id, data) {
    const idx = state.businessRegistrations.findIndex(reg => reg.id === id);
    if (idx !== -1) {
      state.businessRegistrations[idx] = { ...state.businessRegistrations[idx], ...data };
      return state.businessRegistrations[idx];
    }
    return null;
  }

  static async create(data) {
    return addRecord(state.businessRegistrations, data);
  }
}
