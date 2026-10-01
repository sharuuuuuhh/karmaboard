const queries = [
  "total_karma__total_karma_gained",
  "-total_karma__total_karma_gained",
  "total_karma_gained",
  "-total_karma_gained",
  "karma",
  "-karma"
];

async function main() {
  for (const q of queries) {
    const url = `https://mulearn.org/api/v1/dashboard/college/?ordering=${q}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`Query: ${q} => Status: ${res.status}`);
        continue;
      }
      const json = await res.json();
      const data = json?.response?.data ?? [];
      console.log(`Query: ${q} => First college: ${data[0]?.org}, Karma: ${data[0]?.total_karma?.total_karma_gained}`);
    } catch (err) {
      console.log(`Query: ${q} => Error: ${err.message}`);
    }
  }
}

main().catch(console.error);
