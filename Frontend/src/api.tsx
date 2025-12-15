// Frontend/src/api.tsx

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        ...options,
    });

    if (!response.ok) {
        let message = "Noe gikk galt ved kall mot serveren.";

        try {
            const body = await response.json();
            if (body && typeof body === "object" && "message" in body) {
                message = String((body as any).message);
            }
        } catch {
            // ignorer hvis responsen ikke er JSON
        }

        throw new Error(message);
    }


    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

/* ---------- Auth ---------- */

export interface LoginResponse {
    userId: number;
    fullName: string;
    email: string;
    role: "PARENT" | "STAFF" | "ADMIN";
}

export function login(email: string, password: string): Promise<LoginResponse> {
    return request<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
}

export function changePassword(
    userId: number,
    newPassword: string,
    currentPassword?: string | null
): Promise<void> {
    return request<void>(`/users/${userId}/password`, {
        method: "PUT",
        body: JSON.stringify({
            currentPassword: currentPassword ?? "",
            newPassword,
        }),
    });
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  password: string;
}

export interface RegisterResponse {
  userId: number;
  fullName: string;
  email: string;
  role: "PARENT" | "STAFF" | "ADMIN";
  message: string;
}

export function registerParent(data: RegisterRequest): Promise<RegisterResponse> {
  return request<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}



/* ---------- Access codes ---------- */

export interface UseAccessCodeResponse {
    daycareId: number;
    daycareName: string;
    message: string;
}

export function useAccessCode(
  code: string,
  guardianUserId?: number | null
): Promise<UseAccessCodeResponse> {
  return request<UseAccessCodeResponse>("/access-codes/use", {
    method: "POST",
    body: JSON.stringify({
      code,
      guardianUserId: guardianUserId ?? null, // null = validate-only
    }),
  });
}


/* ---------- Barn / Children ---------- */

export interface ChildSummary {
    id: number;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    active: boolean;
    daycareGroupId: number | null;
    daycareGroupName: string | null;
    daycareId: number | null;
    daycareName: string | null;
}

export function getChildrenForGuardian(
    guardianUserId: number
): Promise<ChildSummary[]> {
    return request<ChildSummary[]>(`/children/guardian/${guardianUserId}`);
}

/* ---------- Attendance status ---------- */

export interface ChildStatusResponse {
    childId: number;
    childName: string;
    lastEventType: "IN" | "OUT" | null;
    lastEventTime: string | null;
    statusText: string;
}

export function getLatestStatusForChild(
    childId: number
): Promise<ChildStatusResponse> {
    return request<ChildStatusResponse>(`/attendance/child/${childId}/latest`);
}

/* ---------- Ansatt: grupper og barn ---------- */

export interface StaffChild {
    id: number;
    firstName: string;
    lastName: string;
}

export interface DaycareGroupWithChildren {
    id: number;
    name: string;
    description?: string | null;
    children?: StaffChild[];
}

export function getGroupsForDaycare(
    daycareId: number
): Promise<DaycareGroupWithChildren[]> {
    return request<DaycareGroupWithChildren[]>(
        `/daycare-groups/daycare/${daycareId}`
    );
}

/* ---------- Ansatt: registrere inn/ut ---------- */

export type AttendanceEventType = "IN" | "OUT";

export interface RegisterAttendanceRequest {
    childId: number;
    performedByUserId: number;
    eventType: AttendanceEventType;
    note?: string;
}


export function registerAttendance(data: RegisterAttendanceRequest) {
    return request<void>("/attendance", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

/* ---------- Ferie ---------- */

export async function registerVacation(params: {
    childId: number;
    userId: number;
    startDate: string;
    endDate: string;
    note?: string;
}) {
    await request<void>("/vacation", {
        method: "POST",
        body: JSON.stringify({
            childId: params.childId,
            reportedByUserId: params.userId,
            startDate: params.startDate,
            endDate: params.endDate,
            note: params.note ?? "",
        }),
    });
}
