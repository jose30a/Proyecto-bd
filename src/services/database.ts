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
 * Get current authenticated user (based on cookie set by server)
 */
export async function getCurrentUser(): Promise<User | null> {
  // call API helper directly
  // Importing from api.ts here would cause circular if not careful; use dynamic import to avoid issues
  const api = await import('./api');
  const row: any = await api.getCurrentUser();
  if (!row) return null;

  const user = row as any;
  user.fullName = [user.p_primer_nombre_usu, user.p_segundo_nombre_usu, user.p_primer_apellido_usu, user.p_segundo_apellido_usu].filter(Boolean).join(' ');
  user.role = user.p_nombre_rol;
  user.cod = user.p_cod;
  user.email_usu = user.p_email_usu;
  user.primer_nombre_usu = user.p_primer_nombre_usu;
  user.segundo_nombre_usu = user.p_segundo_nombre_usu;
  user.primer_apellido_usu = user.p_primer_apellido_usu;
  user.segundo_apellido_usu = user.p_segundo_apellido_usu;
  user.nombre_rol = user.p_nombre_rol;
  user.fk_cod_rol = user.p_fk_cod_rol;

  return user as User;
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
 * Fetch available roles from DB
 * Calls function: get_all_roles()
 */
export async function getAllRoles(): Promise<string[]> {
  const rows = await callFunction<any>('get_all_roles', []);
  return rows.map((r: any) => r.p_nombre_rol);
}

/**
 * Update a user's role
 * Calls procedure: update_user_role(user_id, role_name)
 */
export async function updateUserRole(userId: number, roleName: string): Promise<void> {
  await callProcedure('update_user_role', [userId, roleName]);
}

/**
 * Update user's basic details (email and names)
 */
export async function updateUserDetails(userId: number, data: { email?: string; primerNombre?: string; segundoNombre?: string; primerApellido?: string; segundoApellido?: string }): Promise<void> {
  await callProcedure('update_user_details', [
    userId,
    data.email || null,
    data.primerNombre || null,
    data.segundoNombre || null,
    data.primerApellido || null,
    data.segundoApellido || null,
  ]);
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
  await callProcedure('upsert_package', [
    { value: pkg.id || null, type: 'INTEGER' },
    pkg.name,
    pkg.description || '',
    pkg.status || 'Active',
    { value: pkg.millaje || 0, type: 'INTEGER' },
    { value: pkg.costo_millas || 0, type: 'INTEGER' },
    { value: pkg.huella || 0, type: 'DECIMAL' }
  ]);
}

export async function deletePackage(packageId: number): Promise<void> {
  await callProcedure('delete_package', [{ value: packageId, type: 'INTEGER' }]);
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

export async function upsertPromotion(id: number | null, tipo: string, discount: number): Promise<void> {
  await callProcedure('upsert_promotion', [id, tipo, discount]);
}

export async function deletePromotion(id: number): Promise<void> {
  await callProcedure('delete_promotion', [id]);
}


// --- Promotion-Service Assignment Functions ---


export async function getPromotionServices(promoId: number): Promise<AssignedService[]> {
  const response = await callFunction('get_promotion_services', [promoId]);
  return response.map((r: any) => ({
    cod: r.p_cod,
    nombre: r.p_nombre,
    fecha_inicio: r.p_fecha_inicio,
    fecha_fin: r.p_fecha_fin
  }));
}

export async function assignPromotionToService(promoId: number, serviceId: number, startDate: string, endDate: string) {
  await callProcedure('assign_promotion_to_service', [
    promoId,
    serviceId,
    { value: startDate, type: 'DATE' },
    { value: endDate, type: 'DATE' }
  ]);
}

export async function removePromotionFromService(promoId: number, serviceId: number) {
  await callProcedure('remove_promotion_from_service', [promoId, serviceId]);
}


// ==================== Reports ====================

export async function getNegativeReviews(start?: string, end?: string) {
  const rows = await callFunction<any>('get_negative_reviews', [
    start ? { value: start, type: 'DATE' } : null,
    end ? { value: end, type: 'DATE' } : null
  ]);
  return rows;
}

export async function getExchangeRatesHistory(start?: string, end?: string) {
  const rows = await callFunction<any>('get_exchange_rates_history', [
    start ? { value: start, type: 'DATE' } : null,
    end ? { value: end, type: 'DATE' } : null
  ]);
  return rows;
}

export async function getOperatorPerformance(start?: string, end?: string) {
  const rows = await callFunction<any>('get_operator_performance', [
    start ? { value: start, type: 'DATE' } : null,
    end ? { value: end, type: 'DATE' } : null
  ]);
  return rows;
}

export async function getRefundsAudit(start?: string, end?: string) {
  const rows = await callFunction<any>('get_refunds_audit', [
    start ? { value: start, type: 'DATE' } : null,
    end ? { value: end, type: 'DATE' } : null
  ]);
  return rows;
}

export async function getCustomerAgeDistribution(start?: string, end?: string) {
  const rows = await callFunction<any>('get_customer_age_distribution', [
    start ? { value: start, type: 'DATE' } : null,
    end ? { value: end, type: 'DATE' } : null
  ]);
  return rows;
}

export async function getCustomerAverageAge(start?: string, end?: string) {
  const rows = await callFunction<any>('get_customer_average_age', [
    start ? { value: start, type: 'DATE' } : null,
    end ? { value: end, type: 'DATE' } : null
  ]);
  return rows[0]?.p_avg || 0;
}


// ==================== Service Management ====================

// Re-export AssignedService here or move it
export interface AssignedService {
  cod: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
}

export interface ServiceItem {
  id: number;
  name: string;
  capacity: number;
  number: string;
  type: string;
}

export interface HotelItem {
  id: number;
  name: string;
  address: string;
  type: string;
}

export async function getAllServices(): Promise<ServiceItem[]> {
  const rows = await callFunction<any>('get_all_services', []);
  return rows.map((r: any) => ({
    id: r.p_cod,
    name: r.p_nombre,
    capacity: r.p_capacidad,
    number: r.p_numero,
    type: r.p_tipo || 'Service',
  }));
}

export async function getAllHotels(): Promise<HotelItem[]> {
  const rows = await callFunction<any>('get_all_hotels', []);
  return rows.map((r: any) => ({
    id: r.p_cod,
    name: r.p_nombre,
    address: r.p_direccion,
    type: r.p_tipo,
  }));
}

export async function getAllRestaurants(): Promise<any[]> {
  const rows = await callFunction<any>('get_all_restaurants', []);
  return rows.map((r: any) => ({
    id: r.p_cod,
    name: r.p_nombre,
    type: r.p_tipo,
    ambience: r.p_ambiente,
    rating: r.p_calificacion
  }));
}

export async function addItemToPackage(
  pkgId: number,
  itemId: number,
  type: 'flight' | 'transport' | 'hotel' | 'restaurant',
  startDate: string,
  endDate: string
): Promise<void> {
  await callProcedure('add_item_to_package', [
    pkgId,
    itemId,
    type,
    { value: startDate, type: 'DATE' },
    { value: endDate, type: 'DATE' }
  ]);
}

export async function removeItemFromPackage(
  pkgId: number,
  itemId: number,
  type: 'flight' | 'transport' | 'hotel' | 'restaurant'
): Promise<void> {
  await callProcedure('remove_item_from_package', [pkgId, itemId, type]);
}

export async function addChildPackage(parentId: number, childId: number): Promise<void> {
  await callProcedure('add_child_package', [parentId, childId]);
}

export async function removeChildPackage(parentId: number, childId: number): Promise<void> {
  await callProcedure('remove_child_package', [parentId, childId]);
}

/**
 * Create a package and return its ID (for itinerary creation)
 * Calls function: create_package_returning_id(...)
 */
export async function createPackageReturningId(
  name: string,
  desc: string,
  status: string,
  millaje: number,
  costo: number,
  huella: number,
  userId: number
): Promise<number> {
  const result = await callFunction<any>('create_package_returning_id', [
    name,
    desc,
    status,
    { value: millaje, type: 'INTEGER' },
    { value: costo, type: 'INTEGER' },
    { value: huella, type: 'DECIMAL' },
    { value: userId, type: 'INTEGER' }
  ]);
  return result[0]?.create_package_returning_id || 0;
}

/**
 * Process a payment for a package
 * Calls procedure: process_payment(...)
 */
export async function processPayment(
  userId: number,
  packageId: number,
  amount: number,
  methodType: string,
  description: string,
  details: {
    // Tarjeta
    cardNumber?: string;
    cardHolder?: string;
    expiryDate?: string;
    cvv?: string;
    cardType?: string;
    cardBankName?: string;
    // Cheque
    checkNumber?: string;
    checkHolder?: string;
    checkBank?: string;
    checkIssueDate?: string;
    checkAccountCode?: string;
    // Deposito
    depositNumber?: string;
    depositBank?: string;
    depositDate?: string;
    depositReference?: string;
    // Transferencia
    transferNumber?: string;
    transferTime?: string;
    // Pago Movil
    pmReference?: string;
    pmTime?: string;
    // USDt
    usdtWallet?: string;
    usdtDate?: string;
    usdtTime?: string;
    // Zelle
    zelleConfirmation?: string;
    zelleDate?: string;
    zelleTime?: string;
    // Milla
    miles?: number;
  }
): Promise<void> {

  const formatExpiry = (val?: string) => {
    if (!val) return null;
    // Basic MM/YY -> 20YY-MM-01 conversion if needed, otherwise rely on Valid Date being passed or formatted before
    if (val.includes('/')) {
      const parts = val.split('/');
      if (parts.length === 2) {
        return `20${parts[1]}-${parts[0].padStart(2, '0')}-01`;
      }
    }
    return val;
  };

  const expiryParam = formatExpiry(details.expiryDate);

  // Helper to safely format ISO string or null for date/time fields if needed
  // Assuming frontend passes valid date strings or null. Strings are 'YYYY-MM-DD' or 'HH:MM' or ISO.
  // Postgres handles standard string formats for DATE/TIMESTAMP.

  await callProcedure('process_payment', [
    { value: userId, type: 'INTEGER' },
    { value: packageId, type: 'INTEGER' },
    { value: amount, type: 'DECIMAL' },
    { value: methodType, type: 'VARCHAR' },
    { value: description, type: 'VARCHAR' },
    // Expanded Params
    { value: details.cardNumber || null, type: 'VARCHAR' },
    { value: details.cardHolder || null, type: 'VARCHAR' },
    { value: expiryParam || null, type: 'DATE' },
    { value: details.cvv || null, type: 'VARCHAR' },
    { value: details.cardType || null, type: 'VARCHAR' },
    { value: details.cardBankName || null, type: 'VARCHAR' },
    // Cheque
    { value: details.checkNumber || null, type: 'VARCHAR' },
    { value: details.checkHolder || null, type: 'VARCHAR' },
    { value: details.checkBank || null, type: 'VARCHAR' },
    { value: details.checkIssueDate || null, type: 'DATE' },
    { value: details.checkAccountCode || null, type: 'VARCHAR' },
    // Deposito
    { value: details.depositNumber || null, type: 'VARCHAR' },
    { value: details.depositBank || null, type: 'VARCHAR' },
    { value: details.depositDate || null, type: 'DATE' },
    { value: details.depositReference || null, type: 'VARCHAR' },
    // Transferencia
    { value: details.transferNumber || null, type: 'VARCHAR' },
    { value: details.transferTime || null, type: 'TIMESTAMP' }, // or string, JS sends string '2023-...'
    // Pago Movil
    { value: details.pmReference || null, type: 'VARCHAR' },
    { value: details.pmTime || null, type: 'TIMESTAMP' },
    // USDt
    { value: details.usdtWallet || null, type: 'VARCHAR' },
    { value: details.usdtDate || null, type: 'DATE' },
    { value: details.usdtTime || null, type: 'TIMESTAMP' },
    // Zelle
    { value: details.zelleConfirmation || null, type: 'VARCHAR' },
    { value: details.zelleDate || null, type: 'DATE' },
    { value: details.zelleTime || null, type: 'TIMESTAMP' },
    // Milla
    { value: details.miles || null, type: 'INTEGER' },
    // Legacy/Fallback (must match signature)
    { value: null, type: 'VARCHAR' }, // zelle_email
    { value: null, type: 'VARCHAR' }, // zelle_phone
    { value: null, type: 'VARCHAR' }, // cedula
    { value: null, type: 'VARCHAR' }  // phone_number
  ]);
}

/**
 * Get child packages for a given parent package (itinerary)
 * Returns child package IDs and their prices for total calculation
 */
export interface ChildPackage {
  id: number;
  name: string;
  price: number;
}

export async function getPackageChildren(parentId: number): Promise<ChildPackage[]> {
  // Use getPackageDetails which includes child packages marked as type 'package'
  // The get_package_details function returns all items including child packages
  const details = await getPackageDetails(parentId);

  // Filter for child packages - these come from paq_paq table and have item_type 'package'
  const packages = details.filter(d => String(d.item_type).toLowerCase() === 'package');

  return packages.map(p => ({
    id: p.item_id,
    name: p.item_name,
    price: p.costo || 0
  }));
}

/**
 * Get bookings for a specific user
 * Calls function: get_user_bookings(user_id)
 */
export async function getUserBookings(userId: number): Promise<any[]> {
  const result = await callFunction<any>('get_user_bookings', [
    { value: userId, type: 'INTEGER' }
  ]);
  return result || [];
}

/**
 * Add passengers to a booking
 * Calls procedure: add_passengers_to_booking(booking_id, passengers)
 */
export interface PassengerData {
  firstName: string;
  lastName: string;
  passportNumber: string;
  dob: string;
}

export async function addPassengersToBooking(
  bookingId: number,
  passengers: PassengerData[]
): Promise<void> {
  // Call the stored procedure for each passenger
  // Note: This may need to be adjusted based on your actual stored procedure signature
  for (const passenger of passengers) {
    await callProcedure('add_passenger_to_booking', [
      { value: bookingId, type: 'INTEGER' },
      passenger.firstName,
      passenger.lastName,
      passenger.passportNumber,
      { value: passenger.dob, type: 'DATE' }
    ]);
  }
}
