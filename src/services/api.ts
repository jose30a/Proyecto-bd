/**
 * API Service for calling PostgreSQL stored procedures
 * This service communicates with the minimal backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Call a PostgreSQL stored procedure
 * @param procedureName Name of the stored procedure
 * @param params Array of parameters to pass to the procedure
 */
export async function callProcedure<T = any>(
  procedureName: string,
  params: any[] = []
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}/procedure/${procedureName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ params }),
    });

    const result: ApiResponse<T> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error occurred');
    }

    return result.data as T;
  } catch (error) {
    console.error(`Error calling procedure ${procedureName}:`, error);
    throw error;
  }
}

/**
 * Call a PostgreSQL function (returns data)
 * @param functionName Name of the PostgreSQL function
 * @param params Array of parameters to pass to the function
 */
export async function callFunction<T = any>(
  functionName: string,
  params: any[] = []
): Promise<T[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/function/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ params }),
    });

    const result: ApiResponse<T[]> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error occurred');
    }

    return result.data || [];
  } catch (error) {
    console.error(`Error calling function ${functionName}:`, error);
    throw error;
  }
}

/**
 * Health check endpoint
 */
export async function checkHealth(): Promise<{ status: string; database: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
}

