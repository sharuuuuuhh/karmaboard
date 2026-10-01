async function main() {
  const start = Date.now();
  console.log("Fetching page 1...");
  const res = await fetch("https://mulearn.org/api/v1/dashboard/college/?page=1");
  const json = await res.json();
  const totalPages = json?.response?.pagination?.totalPages ?? 1;
  console.log(`Total pages: ${totalPages}`);

  const allColleges = [];
  const batchSize = 65; // Try larger batch size to see if it rate-limits or works fast

  for (let i = 1; i <= totalPages; i += batchSize) {
    const batch = [];
    for (let j = i; j < i + batchSize && j <= totalPages; j++) {
      batch.push(
        fetch(`https://mulearn.org/api/v1/dashboard/college/?page=${j}`)
          .then(async (r) => r.ok ? (await r.json())?.response?.data ?? [] : [])
          .catch(() => [])
      );
    }
    console.log(`Fetching batch ${i} to ${Math.min(i + batchSize - 1, totalPages)}...`);
    const results = await Promise.all(batch);
    for (const data of results) {
      allColleges.push(...data);
    }
  }

  console.log(`Done! Fetched ${allColleges.length} colleges in ${Date.now() - start}ms.`);
}

main().catch(console.error);
