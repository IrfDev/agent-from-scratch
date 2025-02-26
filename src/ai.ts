import { Ollama } from 'ollama'
import { fetch, setGlobalDispatcher, Agent } from 'undici'
setGlobalDispatcher(new Agent({ connect: { timeout: 100000_000 } }))

export const ollama = new Ollama({
  host: `http://192.168.1.83:30090`,
  fetch: fetch as any,
})
