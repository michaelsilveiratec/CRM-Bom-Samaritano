import { apiFetch } from "./api";

export interface ContactPayload {
  name: string;
  role: string;
  phone: string;
  email: string;
  cellName: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  maritalStatus?: string;
  registrationDate?: string;
  baptismDate: string;
  birthDate: string;
  visitDate: string;
  referredBy: string;
  status: string;
  notes: string;
  photoUrl?: string;
  source?: string;
  id?: number;
  createdAt?: string;
}

export type MemberPayload = ContactPayload;
export type VisitorPayload = ContactPayload;
export type StoredContactPayload = ContactPayload & { id: number };

export interface SettingsPayload {
  churchName: string;
  pastorName: string;
  pastorPhoto?: string;
  whatsappCode: string;
  birthdayNotifications: boolean;
  waAutoDispatch: boolean;
  waApiUrl: string;
  financialPassword?: string;
  updatedAt?: string;
}

export interface FinanceRecordPayload {
  id?: number;
  contributor: string;
  category: string;
  value: number;
  date: string;
  paymentMethod: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DiscipleshipStatePayload {
  journeys: any[];
  pairs: any[];
  enrollments?: any[];
  activeJourneyId: string;
  updatedAt?: string;
}

export interface NetworkInfoPayload {
  success: boolean;
  host: string;
  backendUrl: string;
  frontendUrl: string;
  mobileUrl: string;
}

export async function fetchServerSettings() {
  return apiFetch<{ success: boolean; settings: SettingsPayload }>("/api/settings");
}

export async function saveServerSettings(settings: Partial<SettingsPayload>) {
  return apiFetch<{ success: boolean; settings: SettingsPayload }>("/api/settings", {
    method: "POST",
    body: JSON.stringify(settings),
  });
}

export async function fetchServerMembers() {
  return apiFetch<{ success: boolean; members: MemberPayload[] }>("/api/members");
}

export async function createServerMember(member: MemberPayload) {
  return apiFetch<{ success: boolean; member: MemberPayload }>("/api/members", {
    method: "POST",
    body: JSON.stringify(member),
  });
}

export async function updateServerMember(id: number, member: Partial<MemberPayload>) {
  return apiFetch<{ success: boolean; member: MemberPayload }>(`/api/members/${id}`, {
    method: "PUT",
    body: JSON.stringify(member),
  });
}

export async function deleteServerMember(id: number) {
  return apiFetch<{ success: boolean; message: string; member: MemberPayload }>(`/api/members/${id}`, {
    method: "DELETE",
  });
}

export async function fetchServerVisitors() {
  return apiFetch<{ success: boolean; visitors: VisitorPayload[] }>("/api/visitors");
}

export async function createServerVisitor(visitor: VisitorPayload) {
  return apiFetch<{ success: boolean; visitor: VisitorPayload }>("/api/visitors", {
    method: "POST",
    body: JSON.stringify(visitor),
  });
}

export async function updateServerVisitor(id: number, visitor: Partial<VisitorPayload>) {
  return apiFetch<{ success: boolean; visitor: VisitorPayload }>(`/api/visitors/${id}`, {
    method: "PUT",
    body: JSON.stringify(visitor),
  });
}

export async function deleteServerVisitor(id: number) {
  return apiFetch<{ success: boolean; message: string; visitor: VisitorPayload }>(`/api/visitors/${id}`, {
    method: "DELETE",
  });
}

export async function fetchServerChildren() {
  return apiFetch<{ success: boolean; children: StoredContactPayload[] }>("/api/children");
}

export async function createServerChild(child: ContactPayload) {
  return apiFetch<{ success: boolean; child: StoredContactPayload }>("/api/children", {
    method: "POST",
    body: JSON.stringify(child),
  });
}

export async function updateServerChild(id: number, child: Partial<ContactPayload>) {
  return apiFetch<{ success: boolean; child: StoredContactPayload }>(`/api/children/${id}`, {
    method: "PUT",
    body: JSON.stringify(child),
  });
}

export async function deleteServerChild(id: number) {
  return apiFetch<{ success: boolean; message: string; child: StoredContactPayload }>(`/api/children/${id}`, {
    method: "DELETE",
  });
}

export async function fetchServerYouth() {
  return apiFetch<{ success: boolean; youth: StoredContactPayload[] }>("/api/youth");
}

export async function createServerYouth(youth: ContactPayload) {
  return apiFetch<{ success: boolean; youth: StoredContactPayload }>("/api/youth", {
    method: "POST",
    body: JSON.stringify(youth),
  });
}

export async function updateServerYouth(id: number, youth: Partial<ContactPayload>) {
  return apiFetch<{ success: boolean; youth: StoredContactPayload }>(`/api/youth/${id}`, {
    method: "PUT",
    body: JSON.stringify(youth),
  });
}

export async function deleteServerYouth(id: number) {
  return apiFetch<{ success: boolean; message: string; youth: StoredContactPayload }>(`/api/youth/${id}`, {
    method: "DELETE",
  });
}

export async function fetchServerFinancialRecords() {
  return apiFetch<{ success: boolean; records: FinanceRecordPayload[] }>("/api/financial");
}

export async function createServerFinancialRecord(record: FinanceRecordPayload) {
  return apiFetch<{ success: boolean; record: FinanceRecordPayload }>("/api/financial", {
    method: "POST",
    body: JSON.stringify(record),
  });
}

export async function updateServerFinancialRecord(id: number, record: Partial<FinanceRecordPayload>) {
  return apiFetch<{ success: boolean; record: FinanceRecordPayload }>(`/api/financial/${id}`, {
    method: "PUT",
    body: JSON.stringify(record),
  });
}

export async function deleteServerFinancialRecord(id: number) {
  return apiFetch<{ success: boolean; message: string; record: FinanceRecordPayload }>(`/api/financial/${id}`, {
    method: "DELETE",
  });
}

export async function saveServerFinancialRecords(records: FinanceRecordPayload[]) {
  return apiFetch<{ success: boolean; records: FinanceRecordPayload[] }>("/api/financial/sync", {
    method: "POST",
    body: JSON.stringify({ records }),
  });
}

export async function fetchServerDiscipleshipState() {
  return apiFetch<{ success: boolean; state: DiscipleshipStatePayload }>("/api/discipleship");
}

export async function fetchNetworkInfo() {
  return apiFetch<NetworkInfoPayload>("/api/network-info");
}

export async function saveServerDiscipleshipState(state: DiscipleshipStatePayload) {
  return apiFetch<{ success: boolean; state: DiscipleshipStatePayload }>("/api/discipleship", {
    method: "POST",
    body: JSON.stringify(state),
  });
}

export async function createServerDiscipleshipEnrollment(payload: {
  memberName: string;
  memberPhone: string;
  journeyId: string;
  lessonNum: number;
  courseImageUrl?: string;
  courseMessage?: string;
  pairId?: number;
}) {
  return apiFetch<{ success: boolean; enrollment: any }>("/api/discipleship/enrollments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchPublicDiscipleshipCourse(token: string) {
  return apiFetch<{ success: boolean; enrollment: any; journey: any; lesson: any; evaluation: any[] }>(
    `/api/discipleship/course/${token}`
  );
}

export async function completePublicDiscipleshipCourse(token: string, answers: number[]) {
  return apiFetch<{ success: boolean; passed: boolean; enrollment: any; score: number; totalQuestions: number }>(
    `/api/discipleship/course/${token}/complete`,
    {
      method: "POST",
      body: JSON.stringify({ answers }),
    }
  );
}
