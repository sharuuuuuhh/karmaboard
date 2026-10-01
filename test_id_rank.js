async function main() {
  const urls = [
    "https://mulearn.org/api/v1/dashboard/college/rank/108b6e26-66fd-40fe-98e6-ff1ca90686fa/",
    "https://mulearn.org/api/v1/dashboard/college/108b6e26-66fd-40fe-98e6-ff1ca90686fa/rank/",
    "https://mulearn.org/api/v1/dashboard/college/108b6e26-66fd-40fe-98e6-ff1ca90686fa/"
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      console.log(`URL: ${url} => Status: ${res.status}`);
      if (res.status === 200) {
        const json = await res.json();
        console.log("Response:", JSON.stringify(json, null, 2));
      }
    } catch (err) {
      console.log(`URL: ${url} => Error: ${err.message}`);
    }
  }
}

main().catch(console.error);
