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
  roles: string[]; // Role 추가
  setUsername: (name: string | null) => void;
  setMemberId: (id: number | null) => void;
  setRoles: (roles: string[]) => void; // Role setter 추가
  isLoaded: boolean;
};

const UserContext = createContext<UserContextType>({
  username: null,
  memberId: null,
  roles: [],
  setUsername: () => {},
  setMemberId: () => {},
  setRoles: () => {},
  isLoaded: false,
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsernameState] = useState<string | null>(null);
  const [memberId, setMemberIdState] = useState<number | null>(null);
  const [roles, setRolesState] = useState<string[]>([]);
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
          setUsernameState(data.data?.username ?? null);
          setMemberIdState(data.data?.id ?? null);
          setRolesState(data.data?.roles ?? []); // roles 세팅
        } else {
          setUsernameState(null);
          setMemberIdState(null);
          setRolesState([]);
        }
      } catch (err) {
        console.error(err);
        setUsernameState(null);
        setMemberIdState(null);
        setRolesState([]);
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

  const setRoles = (roles: string[]) => {
    setRolesState(roles);
  };

  return (
    <UserContext.Provider
      value={{ username, memberId, roles, setUsername, setMemberId, setRoles, isLoaded }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
