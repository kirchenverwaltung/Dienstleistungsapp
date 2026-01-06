import { state, filterCollection, addRecord } from "./mockData";

export class Feedback {
  static async filter(criteria = {}) {
    return filterCollection(state.feedback, criteria);
  }

  static async create(data) {
    return addRecord(state.feedback, { status: "neu", ...data });
  }
}
