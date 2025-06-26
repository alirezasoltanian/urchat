import { create } from "zustand";

interface ChatStore {
  selectedChatModel: string;
  setSelectedChatModel: (model: string) => void;
}

export const useChatStore = create<ChatStore>()((set) => ({
  selectedChatModel: "",
  setSelectedChatModel: (model: string) => set({ selectedChatModel: model }),
}));
