// Frontend/src/api.tsx

// Base-URL til backend (kan settes i .env, ellers brukes localhost)
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

// Felles request-funksjon som alle API-kall bruker
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            // Standard JSON-header for API-kall
            "Content-Type": "application/json",
            // Lar kall overstyre/legge til egne headers
            ...(options.headers || {}),
        },
        ...options,
    });

    // Hvis backend svarer med feilstatus, prøv å hente en "message" fra JSON
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

        // Kaster en vanlig JS-feil med en brukervennlig melding
        throw new Error(message);
    }

    // Hvis backend returnerer 204, finnes det ingen body å parse
    if (response.status === 204) {
        return undefined as T;
    }

    // Robust parsing: håndterer tilfeller der 200 OK kommer uten body
    const text = await response.text();
    if (!text) return undefined as T;

    return JSON.parse(text) as T;
}

// Brukerroller som matcher backend (enum UserRole)
export type UserRole = "PARENT" | "STAFF" | "ADMIN";

// DTO for innlogging
export interface LoginResponse {
    userId: number;
    fullName: string;
    email: string;
    role: UserRole;
}

// Logger inn bruker
export function login(email: string, password: string): Promise<LoginResponse> {
    return request<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
}

// Endrer passord for en bruker
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

// DTO for registrering
export interface RegisterRequest {
    fullName: string;
    email: string;
    phoneNumber?: string | null;
    password: string;
}

// DTO for respons etter registrering
export interface RegisterResponse {
    userId: number;
    fullName: string;
    email: string;
    role: UserRole;
    message: string;
}

// Registrerer en ny forelder-bruker
export function registerParent(data: RegisterRequest): Promise<RegisterResponse> {
    return request<RegisterResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

// DTO for respons ved bruk/validering av tilgangskode
export interface UseAccessCodeResponse {
    daycareId: number;
    daycareName: string;
    message: string;
}

// Bruker tilgangskode (guardianUserId = null betyr bare validering)
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

// Kortversjon av barn (brukes i oversikter)
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

// Henter alle barn for en foresatt
export function getChildrenForGuardian(
    guardianUserId: number
): Promise<ChildSummary[]> {
    return request<ChildSummary[]>(`/children/guardian/${guardianUserId}`);
}

// Type for inn/ut-hendelser (matcher backend AttendanceEventType)
export type AttendanceEventType = "IN" | "OUT";

// DTO for status-API (siste inn/ut)
export interface ChildStatusResponse {
    childId: number;
    childName: string;
    lastEventType: AttendanceEventType | null;
    lastEventTime: string | null;
    statusText: string;
}

// Henter siste status for et barn
export function getLatestStatusForChild(
    childId: number
): Promise<ChildStatusResponse> {
    return request<ChildStatusResponse>(`/attendance/child/${childId}/latest`);
}

// Enkel barnerepresentasjon for ansatte (inne i en gruppe)
export interface StaffChild {
    id: number;
    firstName: string;
    lastName: string;
}

// Gruppe med tilhørende barn
export interface DaycareGroupWithChildren {
    id: number;
    name: string;
    description?: string | null;
    children?: StaffChild[];
}

// Henter grupper for en barnehage (inkl. barn)
export function getGroupsForDaycare(
    daycareId: number
): Promise<DaycareGroupWithChildren[]> {
    return request<DaycareGroupWithChildren[]>(
        `/daycare-groups/daycare/${daycareId}`
    );
}

// DTO for oppretting av barn (sendes til backend)
export interface CreateChildRequest {
    guardianUserId: number;
    daycareGroupId: number;
    createdByUserId: number;
    firstName: string;
    lastName: string;
    dateOfBirth: string; // "YYYY-MM-DD"
}

// DTO for respons etter oppretting av barn
export interface ChildResponse {
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

// Oppretter nytt barn
export function createChild(data: CreateChildRequest): Promise<ChildResponse> {
    return request<ChildResponse>("/children", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

// Henter bruker via e-post (typisk for å finne guardian)
export function getUserByEmail(email: string): Promise<UserProfileResponse> {
    return request<UserProfileResponse>(
        `/users/by-email?email=${encodeURIComponent(email)}`
    );
}

// DTO for registrering av inn/ut
export interface RegisterAttendanceRequest {
    childId: number;
    performedByUserId: number;
    eventType: AttendanceEventType;
    note?: string;
}

// Registrerer inn/ut-hendelse
export function registerAttendance(
    data: RegisterAttendanceRequest
): Promise<void> {
    return request<void>("/attendance", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

// Registrerer ferie for et barn
export async function registerVacation(params: {
    childId: number;
    userId: number;
    startDate: string;
    endDate: string;
    note?: string;
}): Promise<void> {
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

// DTO for kalenderhendelser fra backend
export interface CalendarEventResponse {
    id: number;
    title: string;
    description?: string | null;
    location?: string | null;
    startTime: string; // ISO
    endTime?: string | null;
    daycareId: number;
    daycareGroupId?: number | null;
    daycareGroupName?: string | null;
}

// DTO for oppretting av kalenderhendelse
export interface CreateCalendarEventRequest {
    daycareId: number;
    daycareGroupId?: number | null; // null = hele barnehagen
    title: string;
    description?: string | null;
    location?: string | null;
    startTime: string; // ISO
    endTime?: string | null;
    createdByUserId: number;
}

// DTO for oppdatering av kalenderhendelse
export interface UpdateCalendarEventRequest {
    title: string;
    description?: string | null;
    location?: string | null;
    startTime: string; // ISO
    endTime?: string | null;
    updatedByUserId: number;
}

// Henter kalenderhendelser for en barnehage
export function getCalendarEventsForDaycare(
    daycareId: number
): Promise<CalendarEventResponse[]> {
    return request<CalendarEventResponse[]>(
        `/calendar-events/daycare/${daycareId}`
    );
}

// Oppretter kalenderhendelse
export function createCalendarEvent(
    data: CreateCalendarEventRequest
): Promise<CalendarEventResponse> {
    return request<CalendarEventResponse>("/calendar-events", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

// Oppdaterer kalenderhendelse
export function updateCalendarEvent(
    eventId: number,
    data: UpdateCalendarEventRequest
): Promise<CalendarEventResponse> {
    return request<CalendarEventResponse>(`/calendar-events/${eventId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

// Sletter kalenderhendelse
export function deleteCalendarEvent(
    eventId: number,
    deletedByUserId: number
): Promise<void> {
    return request<void>(
        `/calendar-events/${eventId}?deletedByUserId=${deletedByUserId}`,
        { method: "DELETE" }
    );
}

// DTO for min profil
export interface UserProfileResponse {
    id: number;
    fullName: string;
    email: string | null;
    phoneNumber: string | null;
    role: UserRole;
}

// DTO for oppdatering av profil
export interface UpdateUserProfileRequest {
    fullName: string;
    email: string | null;
    phoneNumber: string | null;
}

// Henter profil for en bruker
export function getUserProfile(userId: number): Promise<UserProfileResponse> {
    return request<UserProfileResponse>(`/users/${userId}`);
}

// Oppdaterer profil for en bruker
export function updateUserProfile(
    userId: number,
    data: UpdateUserProfileRequest
): Promise<UserProfileResponse> {
    return request<UserProfileResponse>(`/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}
