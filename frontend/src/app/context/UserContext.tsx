"use client";
import { createContext, ReactNode, useContext, useState } from "react";

type UserContextType = {
  username: string | null;
  setUsername: (name: string | null) => void;
};

const UserContext = createContext<UserContextType>({
  username: null,
  setUsername: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState<string | null>(null);

  return (
    <UserContext.Provider value={{ username, setUsername }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
