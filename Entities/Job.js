import { state, filterCollection, sortCollection, addRecord } from "./mockData";

export class Job {
  static async filter(criteria = {}, sort) {
    const items = filterCollection(state.jobs, criteria);
    return sortCollection(items, sort);
  }

  static async create(data) {
    const job = addRecord(state.jobs, data);
    return job;
  }
}
