export const state = {
  user: {
    id: "user-1",
    full_name: "Alex Mustermann",
    email: "alex@example.com",
    user_type: "jobsuchender",
    role: "user",
    phone: "+49 30 123456",
    company: "",
    bio: "Student auf Jobsuche",
    availability: "Flexibel",
    skills: ["Service", "Event"],
    experience: "2 Jahre Promotion",
    hourly_rate_expectation: 15,
    saved_jobs: [],
    favorite_services: [],
    preferred_city: "Berlin",
    profile_picture: "https://placehold.co/80x80",
    business_verified: false
  },
  jobs: [
    {
      id: "job-1",
      title: "Barista im Café",
      description: "Hilf uns morgens beim Kaffeeausschank.",
      category: "Gastronomie",
      company_name: "Café Central",
      location: "Kreuzberg",
      city: "Berlin",
      date: "2024-06-01",
      start_time: "08:00",
      end_time: "12:00",
      payment_type: "hourly",
      hourly_rate: 15,
      total_positions: 2,
      filled_positions: 0,
      status: "offen",
      created_by: "employer@example.com"
    }
  ],
  applications: [
    {
      id: "app-1",
      job_id: "job-1",
      created_by: "alex@example.com",
      status: "ausstehend",
      message: "Ich habe Erfahrung als Barista.",
      employer_email: "employer@example.com",
      created_date: "2024-05-20"
    }
  ],
  services: [
    {
      id: "service-1",
      title: "Umzugshilfe",
      description: "Zwei Stunden Unterstützung",
      price: 80,
      duration: "2h",
      category: "Umzugshilfe"
    }
  ],
  bookings: [],
  messages: [],
  feedback: [],
  reviews: [],
  transactions: [
    { id: "tx-1", amount: 120, type: "auszahlung", created_date: "2024-05-10", description: "Auszahlung" }
  ],
  businessRegistrations: [
    {
      id: "reg-1",
      company_name: "Event AG",
      user_email: "employer@example.com",
      status: "pending"
    }
  ]
};

export function filterCollection(collection, criteria = {}) {
  return collection.filter(item =>
    Object.entries(criteria).every(([key, value]) => {
      if (value === undefined) return true;
      return item[key] === value;
    })
  );
}

export function sortCollection(items, sort) {
  if (!sort || items.length === 0) return items;
  const desc = sort.startsWith("-");
  const key = desc ? sort.slice(1) : sort;
  return [...items].sort((a, b) => {
    if (a[key] === b[key]) return 0;
    return desc ? (a[key] < b[key] ? 1 : -1) : (a[key] > b[key] ? 1 : -1);
  });
}

export function addRecord(collection, data) {
  const next = { id: `${collection.length + 1}-${Date.now()}`, ...data };
  collection.push(next);
  return next;
}
