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
  selectedRole: 'PM' | 'FREELANCER' | null;
  isLoading: boolean;
  isLoaded: boolean;
  setUsername: (name: string | null) => void;
  setSelectedRole: (role: 'PM' | 'FREELANCER' | null) => void;
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
  const [selectedRole, setSelectedRoleState] = useState<'PM' | 'FREELANCER' | null>(null);
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
        setSelectedRoleState(null);
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
        setSelectedRoleState(null);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
      setRoles([]);
      setSelectedRoleState(null);
    } finally {
      setIsLoading(false);
      setHasLoadedOnce(true);
    }
  }, []);

  const setSelectedRole = useCallback((role: 'PM' | 'FREELANCER' | null) => {
    console.log('[UserContext] setSelectedRole called:', role);
    if (role) {
      localStorage.setItem('selectedRole', role);
    } else {
      localStorage.removeItem('selectedRole');
    }
    setSelectedRoleState(role);
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
      localStorage.removeItem('selectedRole');
      setUser(null);
      setRoles([]);
      setSelectedRoleState(null);
      setIsLoading(false);
      setHasLoadedOnce(true);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  // roles 변경 시 selectedRole 자동 설정
  useEffect(() => {
    console.log('[UserContext] useEffect triggered:', { user: !!user, roles, selectedRole });

    if (!user || roles.length === 0) {
      console.log('[UserContext] No user or roles, setting selectedRole to null');
      setSelectedRoleState(null);
      return;
    }

    const hasPm = roles.includes('PM');
    const hasFreelancer = roles.includes('FREELANCER');

    // 2개 역할 모두 보유
    if (hasPm && hasFreelancer) {
      const saved = localStorage.getItem('selectedRole');
      console.log('[UserContext] Both roles, localStorage:', saved);
      if (saved === 'PM' || saved === 'FREELANCER') {
        console.log('[UserContext] Setting selectedRole from localStorage:', saved);
        setSelectedRoleState(saved);
      } else {
        // localStorage에 저장된 값이 없으면 null로 유지 (페이지에서 모달 표시)
        console.log('[UserContext] No saved role, keeping null for modal');
        setSelectedRoleState(null);
      }
    } else if (hasPm) {
      // PM만 보유
      console.log('[UserContext] PM only, setting to PM');
      setSelectedRoleState('PM');
      localStorage.setItem('selectedRole', 'PM');
    } else if (hasFreelancer) {
      // FREELANCER만 보유
      console.log('[UserContext] FREELANCER only, setting to FREELANCER');
      setSelectedRoleState('FREELANCER');
      localStorage.setItem('selectedRole', 'FREELANCER');
    } else {
      // 역할 없음
      console.log('[UserContext] No valid roles, setting to null');
      setSelectedRoleState(null);
      localStorage.removeItem('selectedRole');
    }
  }, [user, roles]);

  const contextValue = useMemo<UserContextValue>(
    () => ({
      user,
      username: user?.username ?? null,
      memberId: user?.id ?? null,
      roles,
      selectedRole,
      isLoading,
      isLoaded: hasLoadedOnce && !isLoading,
      setUsername,
      setSelectedRole,
      login,
      logout,
      refreshUser,
    }),
    [user, roles, selectedRole, isLoading, hasLoadedOnce, setUsername, setSelectedRole, login, logout, refreshUser]
  );

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
