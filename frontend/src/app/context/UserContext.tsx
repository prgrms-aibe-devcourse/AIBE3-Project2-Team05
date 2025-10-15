"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type MemberRole = "PM" | "FREELANCER" | "MEMBER";

export interface MemberDto {
  id: number;
  username: string;
  nickname: string;
  email: string;
  role: MemberRole;
}

interface UserContextValue {
  user: MemberDto | null;
  username: string | null;
  memberId: number | null;
  roles: string[];
  isLoading: boolean;
  isLoaded: boolean;
  setUsername: (name: string | null) => void;
  login: (username: string, password: string) => Promise<string | undefined>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normaliseRoleString = (role: unknown): string => {
  if (!role && role !== 0) return "";
  return String(role).toUpperCase();
};

const normaliseRole = (role: unknown): MemberRole => {
  const value = normaliseRoleString(role);
  if (value === "PM" || value === "FREELANCER" || value === "MEMBER") {
    return value as MemberRole;
  }
  return "MEMBER";
};

const toNumber = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

const toSafeString = (value: unknown): string => (typeof value === "string" ? value : "");

const mapRoles = (raw: Record<string, unknown>): string[] => {
  const rolesValue = raw.roles;
  if (Array.isArray(rolesValue)) {
    return rolesValue
      .map((role: unknown) => normaliseRoleString(role))
      .filter((role: string) => role.length > 0);
  }
  const singleRole = raw.role;
  const value = normaliseRoleString(singleRole);
  return value ? [value] : [];
};

const mapToMemberDto = (raw: Record<string, unknown>): MemberDto => {
  const rolesValue = Array.isArray(raw.roles) ? raw.roles : undefined;
  const primaryRole = raw.role ?? (rolesValue ? rolesValue[0] : null);

  return {
    id: toNumber(raw.id ?? raw.memberId ?? 0),
    username: toSafeString(raw.username),
    nickname: toSafeString(raw.nickname),
    email: toSafeString(raw.email),
    role: normaliseRole(primaryRole),
  };
};

const extractPayload = (raw: unknown): Record<string, unknown> | null => {
  if (!isRecord(raw)) return null;

  const dataField = raw.data;
  if (isRecord(dataField)) {
    return dataField;
  }

  const capitalDataField = raw.Data;
  if (isRecord(capitalDataField)) {
    return capitalDataField;
  }

  return raw;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MemberDto | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const setUsername = useCallback((name: string | null) => {
    setUser((prev) => {
      if (name === null) {
        return null;
      }

      if (prev) {
        return { ...prev, username: name };
      }

      return {
        id: 0,
        username: name,
        nickname: "",
        email: "",
        role: "MEMBER",
      };
    });

    if (name === null) {
      setRoles([]);
    }
    setHasLoadedOnce(true);
  }, []);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/member/me`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!res.ok) {
        setUser(null);
        setRoles([]);
        return;
      }

      const json = await res.json();
      const payload = extractPayload(json);

      if (payload) {
        const member = mapToMemberDto(payload);
        setUser(member);
        setRoles(mapRoles(payload));
      } else {
        setUser(null);
        setRoles([]);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
      setRoles([]);
    } finally {
      setIsLoading(false);
      setHasLoadedOnce(true);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/member/login`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.msg || "로그인 실패");
      }

      await refreshUser();
      return json.msg as string | undefined;
    } catch (error) {
      throw error instanceof Error ? error : new Error("로그인 중 오류가 발생했습니다.");
    }
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/member/logout`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
    } catch (error) {
      console.error("Failed to logout:", error);
    } finally {
      setUser(null);
      setRoles([]);
      setIsLoading(false);
      setHasLoadedOnce(true);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const contextValue = useMemo<UserContextValue>(
    () => ({
      user,
      username: user?.username ?? null,
      memberId: user?.id ?? null,
      roles,
      isLoading,
      isLoaded: hasLoadedOnce && !isLoading,
      setUsername,
      login,
      logout,
      refreshUser,
    }),
    [user, roles, isLoading, hasLoadedOnce, setUsername, login, logout, refreshUser]
  );

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
