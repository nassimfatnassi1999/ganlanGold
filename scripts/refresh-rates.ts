import { refreshExchangeRate } from "../src/lib/currency/service";

const state = await refreshExchangeRate();
console.log(JSON.stringify(state, null, 2));
if (state.status === "unavailable") process.exitCode = 1;
