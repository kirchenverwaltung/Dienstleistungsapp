import { state, filterCollection } from "./mockData";

export class User {
  static async me() {
    return state.user;
  }

  static async updateMyUserData(data) {
    state.user = { ...state.user, ...data };
    return state.user;
  }

  static async filter(criteria = {}) {
    return filterCollection([state.user], criteria);
  }

  static async update(id, data) {
    if (state.user.id === id) {
      state.user = { ...state.user, ...data };
    }
    return state.user;
  }

  static async loginWithRedirect() {
    return null;
  }
}
