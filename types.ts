import type { Message } from 'ollama'

export type AIBaseMessage =
  | Message
  | { role: 'user'; content: string }
  | { role: 'tool'; content: string; tool_call_id: string }

export type AIMessage = AIBaseMessage & {
  id: string
  createdAt: string
}
export interface ToolFn<A = any, T = any> {
  (input: { userMessage: string; toolArgs: A }): Promise<T>
}
