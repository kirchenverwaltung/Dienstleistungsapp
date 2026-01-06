import { state, filterCollection, sortCollection, addRecord } from "./mockData";

export class Booking {
  static async filter(criteria = {}, sort) {
    const items = filterCollection(state.bookings, criteria);
    return sortCollection(items, sort);
  }

  static async create(data) {
    const booking = addRecord(state.bookings, data);
    return booking;
  }
}
