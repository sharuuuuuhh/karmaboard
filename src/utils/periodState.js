// Shared period state between pages (GroupsPage, GroupDetailPage, LeaderboardPage)

let globalPeriod = "week";
let globalOffset = 0;

try {
  const p = sessionStorage.getItem("karmayodha_period");
  const o = sessionStorage.getItem("karmayodha_offset");
  if (p) globalPeriod = p;
  if (o !== null) globalOffset = parseInt(o, 10) || 0;
} catch (e) {
  // Ignore storage errors in restricted contexts
}

const listeners = new Set();

export const getSharedPeriod = () => ({
  period: globalPeriod,
  offset: globalOffset,
});

export const setSharedPeriod = (newPeriod, newOffset) => {
  let changed = false;
  if (newPeriod !== undefined && newPeriod !== globalPeriod) {
    globalPeriod = newPeriod;
    changed = true;
  }
  if (newOffset !== undefined && newOffset !== globalOffset) {
    globalOffset = newOffset;
    changed = true;
  }
  if (changed) {
    try {
      sessionStorage.setItem("karmayodha_period", globalPeriod);
      sessionStorage.setItem("karmayodha_offset", String(globalOffset));
    } catch (e) {
      // Ignore storage errors
    }
    listeners.forEach((fn) => {
      try {
        fn({ period: globalPeriod, offset: globalOffset });
      } catch (err) {
        // Ignore subscriber error
      }
    });
  }
};

export const subscribeSharedPeriod = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
