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
  memberId: number | null;
  setUsername: (name: string | null) => void;
  setMemberId: (id: number | null) => void;
  isLoaded: boolean;
};

const UserContext = createContext<UserContextType>({
  username: null,
  memberId: null,
  setUsername: () => {},
  setMemberId: () => {},
  isLoaded: false,
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsernameState] = useState<string | null>(null);
  const [memberId, setMemberIdState] = useState<number | null>(null);
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
          const response = await res.json();
          setUsernameState(response.data?.username ?? null);
          setMemberIdState(response.data?.id ?? null);
        } else {
          setUsernameState(null);
          setMemberIdState(null);
        }
      } catch (err) {
        console.error(err);
        setUsernameState(null);
        setMemberIdState(null);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchUser();
  }, []);

  const setUsername = (name: string | null) => {
    setUsernameState(name);
  };

  const setMemberId = (id: number | null) => {
    setMemberIdState(id);
  };

  return (
    <UserContext.Provider value={{ username, memberId, setUsername, setMemberId, isLoaded }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
