/**
 * Database service layer
 * All database operations go through stored procedures
 */

import { callProcedure, callFunction } from './api';

// ==================== Authentication ====================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  cod: number;
  email_usu: string;
  primer_nombre_usu: string;
  segundo_nombre_usu?: string;
  primer_apellido_usu: string;
  segundo_apellido_usu?: string;
  nombre_rol: string;
  fk_cod_rol: number;
  // Computed fields for convenience
  fullName?: string;
  role?: string;
}

/**
 * Authenticate user login using email and password
 * Calls function: authenticate_user(email, password)
 */
export async function authenticateUser(credentials: LoginCredentials): Promise<User> {
  const result = await callFunction<User>(
    'authenticate_user',
    [credentials.email, credentials.password]
  );
  
  if (!result || result.length === 0) {
    throw new Error('Invalid email or password');
  }
  
  const user = result[0];
  
  // Compute full name and role for convenience
  user.fullName = [
    user.p_primer_nombre_usu,
    user.p_segundo_nombre_usu,
    user.p_primer_apellido_usu,
    user.p_segundo_apellido_usu
  ].filter(Boolean).join(' ');
  
  user.role = user.p_nombre_rol;
  user.cod = user.p_cod;
  user.email_usu = user.p_email_usu;
  user.primer_nombre_usu = user.p_primer_nombre_usu;
  user.segundo_nombre_usu = user.p_segundo_nombre_usu;
  user.primer_apellido_usu = user.p_primer_apellido_usu;
  user.segundo_apellido_usu = user.p_segundo_apellido_usu;
  user.nombre_rol = user.p_nombre_rol;
  user.fk_cod_rol = user.p_fk_cod_rol;
  
  return user;
}

/**
 * Get user by ID
 * Calls function: get_user_by_id(user_id)
 */
export async function getUserById(userId: number): Promise<User> {
  const result = await callFunction<User>('get_user_by_id', [userId]);
  
  if (!result || result.length === 0) {
    throw new Error('User not found');
  }
  
  const user = result[0];
  
  // Compute full name and role for convenience
  user.fullName = [
    user.p_primer_nombre_usu,
    user.p_segundo_nombre_usu,
    user.p_primer_apellido_usu,
    user.p_segundo_apellido_usu
  ].filter(Boolean).join(' ');
  
  user.role = user.p_nombre_rol;
  user.cod = user.p_cod;
  user.email_usu = user.p_email_usu;
  user.primer_nombre_usu = user.p_primer_nombre_usu;
  user.segundo_nombre_usu = user.p_segundo_nombre_usu;
  user.primer_apellido_usu = user.p_primer_apellido_usu;
  user.segundo_apellido_usu = user.p_segundo_apellido_usu;
  user.nombre_rol = user.p_nombre_rol;
  user.fk_cod_rol = user.p_fk_cod_rol;
  
  return user;
}

/**
 * Register a new user
 * Calls stored procedure: register_user(...)
 */
export interface RegisterUserData {
  email: string;
  password: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  ci: string;
  tipo_documento: string;
  n_pasaporte: string;
  visa?: boolean;
  fk_cod_rol?: number; // Defaults to 2 (Cliente) if not provided
}

export async function registerUser(userData: RegisterUserData): Promise<void> {
  await callProcedure(
    'register_user',
    [
      userData.email,
      userData.password,
      userData.primer_nombre,
      userData.segundo_nombre || null,
      userData.primer_apellido,
      userData.segundo_apellido || null,
      userData.ci,
      userData.tipo_documento,
      userData.n_pasaporte,
      // New param: visa (boolean) then role; millas_acum is handled by DB default
      typeof userData.visa === 'boolean' ? { value: userData.visa, type: 'BOOLEAN' } : { value: false, type: 'BOOLEAN' },
      userData.fk_cod_rol || 2
    ]
  );
}

/**
 * Update user password
 * Calls stored procedure: update_user_password(email, old_password, new_password)
 */
export async function updateUserPassword(
  email: string,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  await callProcedure(
    'update_user_password',
    [email, oldPassword, newPassword]
  );
}

/**
 * Check if email exists
 * Calls function: email_exists(email)
 */
export async function emailExists(email: string): Promise<boolean> {
  const result = await callFunction<{ p_exists: boolean }>('email_exists', [email]);
  return result[0]?.p_exists || false;
}

// ==================== Users (Management) ====================

export interface ManagementUser {
  id: number;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  ci: string;
  email: string;
  avatar?: string;
  role: string;
  status?: 'Active' | 'Inactive';
}

/**
 * Fetch all users for management UI
 * Calls function: get_all_users()
 */
export async function getAllUsers(): Promise<ManagementUser[]> {
  const rows = await callFunction<any>('get_all_users', []);
  return rows.map((r: any) => ({
    id: r.p_cod,
    primerNombre: r.p_primer_nombre_usu,
    segundoNombre: r.p_segundo_nombre_usu,
    primerApellido: r.p_primer_apellido_usu,
    segundoApellido: r.p_segundo_apellido_usu,
    ci: r.p_ci_usu,
    email: r.p_email_usu,
    avatar: (r.p_primer_nombre_usu ? r.p_primer_nombre_usu.charAt(0) : 'U') + (r.p_primer_apellido_usu ? r.p_primer_apellido_usu.charAt(0) : ''),
    role: r.p_nombre_rol || 'Client',
    status: 'Active',
  }));
}

/**
 * Update a user's role
 * Calls procedure: update_user_role(user_id, role_name)
 */
export async function updateUserRole(userId: number, roleName: string): Promise<void> {
  await callProcedure('update_user_role', [userId, roleName]);
}

// ==================== Airlines ====================

export interface Airline {
  id: string;
  name: string;
  origin_country: string;
  origin_city: string;
  status: 'Active' | 'Inactive';
}

export interface ContactNumber {
  id: number;
  airline_id: string;
  country_code: string;
  number: string;
  type: 'Office' | 'Fax';
}

/**
 * Get all airlines
 * Calls stored procedure: get_all_airlines()
 */
export async function getAllAirlines(): Promise<Airline[]> {
  const rows = await callFunction<any>('get_all_airlines', []);
  return rows.map((r: any) => ({
    id: String(r.p_cod),
    name: r.p_nombre,
    origin_country: r.p_origen_aer || '',
    origin_city: r.p_lugar_nombre || r.p_origen_aer || '',
    status: 'Active',
  }));
}

/**
 * Get airline by ID
 * Calls stored procedure: get_airline_by_id(airline_id)
 */
export async function getAirlineById(airlineId: string): Promise<Airline> {
  return callFunction<Airline>('get_airline_by_id', [airlineId]).then(airlines => airlines[0]);
}

/**
 * Get contact numbers for an airline
 * Calls stored procedure: get_airline_contacts(airline_id)
 */
export async function getAirlineContacts(airlineId: string): Promise<ContactNumber[]> {
  return callFunction<ContactNumber>('get_airline_contacts', [airlineId]);
}

/**
 * Create or update airline
 * Calls stored procedure: upsert_airline(airline_id, name, origin_country, origin_city, status)
 */
export async function upsertAirline(airline: Partial<Airline> & { name: string }): Promise<void> {
  return callProcedure(
    'upsert_airline',
    [
      airline.id || null,
      airline.name,
      airline.origin_country || '',
      airline.origin_city || '',
      airline.status || 'Active',
    ]
  );
}

/**
 * Delete airline
 * Calls stored procedure: delete_airline(airline_id)
 */
export async function deleteAirline(airlineId: string): Promise<void> {
  return callProcedure('delete_airline', [airlineId]);
}

/**
 * Upsert contact number
 * Calls stored procedure: upsert_contact_number(contact_id, airline_id, country_code, number, type)
 */
export async function upsertContactNumber(
  contact: Partial<ContactNumber> & { airline_id: string; country_code: string; number: string }
): Promise<void> {
  return callProcedure(
    'upsert_contact_number',
    [
      contact.id || null,
      contact.airline_id,
      contact.country_code,
      contact.number,
      contact.type || 'Office',
    ]
  );
}

// ==================== Dashboard ====================

export interface DashboardStats {
  total_sales: number;
  active_users: number;
  tour_packages: number;
  monthly_revenue: number;
}

/**
 * Get dashboard statistics
 * Calls stored procedure: get_dashboard_stats()
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  return callFunction<DashboardStats>('get_dashboard_stats', []).then(stats => stats[0]);
}

// Add more database functions as needed for other modules

// ==================== Packages ====================

export interface PackageItem {
  id: number;
  name: string;
  description: string;
  status: string;
  millaje: number;
  costo_millas: number;
  huella: number;
}

export async function getAllPackages(): Promise<PackageItem[]> {
  const rows = await callFunction<any>('get_all_packages', []);
  return rows.map((r: any) => ({
    id: r.p_cod,
    name: r.p_nombre_paq,
    description: r.p_descripcion_paq,
    status: r.p_estado_paq,
    millaje: r.p_millaje_paq,
    costo_millas: r.p_costo_millas_paq,
    huella: Number(r.p_huella_de_carbono_paq) || 0,
  }));
}

export async function upsertPackage(pkg: Partial<PackageItem> & { name: string }): Promise<void> {
  await callProcedure('upsert_package', [pkg.id || null, pkg.name, pkg.description || '', pkg.status || 'Active', pkg.millaje || 0, pkg.costo_millas || 0, pkg.huella || 0]);
}

export async function deletePackage(packageId: number): Promise<void> {
  await callProcedure('delete_package', [packageId]);
}

/**
 * Get package composition: services, hotels, restaurants
 */
export interface PackageDetailItem {
  item_type: 'service' | 'hotel' | 'restaurant';
  item_id: number;
  item_name: string;
  inicio?: string | null;
  fin?: string | null;
  costo?: number;
  millaje?: number;
}

export async function getPackageDetails(packageId: number): Promise<PackageDetailItem[]> {
  const rows = await callFunction<any>('get_package_details', [packageId]);
  return rows.map((r: any) => ({
    item_type: r.item_type,
    item_id: r.item_id,
    item_name: r.item_name,
    inicio: r.inicio || null,
    fin: r.fin || null,
    costo: r.costo ? Number(r.costo) : 0,
    millaje: r.millaje || 0,
  }));
}

// ==================== Promotions ====================

export interface PromotionItem {
  id: number;
  tipo: string;
}

export async function getAllPromotions(): Promise<PromotionItem[]> {
  const rows = await callFunction<any>('get_all_promotions', []);
  return rows.map((r: any) => ({ id: r.p_cod, tipo: r.p_tipo_pro, discount: Number(r.p_porcen_descuento) || 0 }));
}

export async function upsertPromotion(id: number | null, tipo: string, discount: number | null = null): Promise<void> {
  await callProcedure('upsert_promotion', [id || null, tipo, discount || 0]);
}

export async function deletePromotion(id: number): Promise<void> {
  await callProcedure('delete_promotion', [id]);
}

// ==================== Reports ====================

export async function getNegativeReviews(start?: string, end?: string) {
  const rows = await callFunction<any>('get_negative_reviews', [start || null, end || null]);
  return rows;
}

export async function getExchangeRatesHistory(start?: string, end?: string) {
  const rows = await callFunction<any>('get_exchange_rates_history', [start || null, end || null]);
  return rows;
}

export async function getOperatorPerformance(start?: string, end?: string) {
  const rows = await callFunction<any>('get_operator_performance', [start || null, end || null]);
  return rows;
}

export async function getRefundsAudit(start?: string, end?: string) {
  const rows = await callFunction<any>('get_refunds_audit', [start || null, end || null]);
  return rows;
}

export async function getCustomerAgeDistribution(start?: string, end?: string) {
  const rows = await callFunction<any>('get_customer_age_distribution', [start || null, end || null]);
  return rows;
}

export async function getCustomerAverageAge(start?: string, end?: string) {
  const rows = await callFunction<any>('get_customer_average_age', [start || null, end || null]);
  return rows[0]?.p_avg || 0;
}

