async function main() {
  const urls = [
    "https://mulearn.org/api/v1/dashboard/college/?size=1000",
    "https://mulearn.org/api/v1/dashboard/college/?pageSize=1000",
    "https://mulearn.org/api/v1/dashboard/college/?page-size=1000",
    "https://mulearn.org/api/v1/dashboard/college/?rows=1000",
    "https://mulearn.org/api/v1/dashboard/college/?perPage=1000"
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      const json = await res.json();
      const data = json?.response?.data ?? [];
      console.log(`URL: ${url} => Status: ${res.status}, Count: ${data.length}`);
    } catch (err) {
      console.log(`URL: ${url} => Error: ${err.message}`);
    }
  }
}

main().catch(console.error);
