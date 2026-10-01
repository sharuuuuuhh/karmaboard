async function main() {
  const start = Date.now();
  console.log("Fetching page 1 to get total pages...");
  const res = await fetch("https://mulearn.org/api/v1/dashboard/college/?page=1");
  const json = await res.json();
  const totalPages = json?.response?.pagination?.totalPages ?? 1;
  console.log(`Total pages: ${totalPages}`);

  const promises = [];
  for (let i = 1; i <= totalPages; i++) {
    promises.push(
      fetch(`https://mulearn.org/api/v1/dashboard/college/?page=${i}`)
        .then(async (r) => r.ok ? (await r.json())?.response?.data ?? [] : [])
        .catch(() => [])
    );
  }

  console.log(`Launching ${totalPages} parallel fetches...`);
  const results = await Promise.all(promises);
  const allColleges = results.flat();

  console.log(`Done! Fetched ${allColleges.length} colleges in ${Date.now() - start}ms.`);
}

main().catch(console.error);
