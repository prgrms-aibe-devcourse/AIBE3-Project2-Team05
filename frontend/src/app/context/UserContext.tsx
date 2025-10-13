"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type UserContextType = {
  username: string | null;
  setUsername: (name: string | null) => void;
  isLoaded: boolean;
};

const UserContext = createContext<UserContextType>({
  username: null,
  setUsername: () => {},
  isLoaded: false,
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsernameState] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/member/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (res.ok) {
          const data = await res.json();
          setUsernameState(data.Data?.username ?? null);
        } else {
          setUsernameState(null);
        }
      } catch (err) {
        console.error(err);
        setUsernameState(null);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchUser();
  }, []);

  const setUsername = (name: string | null) => {
    setUsernameState(name);
  };

  return (
    <UserContext.Provider value={{ username, setUsername, isLoaded }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
