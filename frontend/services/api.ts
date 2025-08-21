import { Service, Category, Faq, ChartDataPoint, SignUpData, SignUpResponse, TokenResponse, LoginData, AuthError } from '../types';
import {
    PaintBrushIcon,
    CodeBracketIcon,
    PresentationChartLineIcon,
    BriefcaseIcon,
} from '../components/icons';

// Configuración de la API - Detecta automáticamente el entorno
const getApiBaseUrl = (): string => {
    // Si estamos en Railway (producción), usar la URL del backend de Railway
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        // En Railway, el backend debe estar en la misma URL pero en el puerto 8000
        // O usar una variable de entorno si está configurada
        const backendUrl = (window as any).__ENV__?.VITE_BACKEND_URL || `${window.location.protocol}//${window.location.hostname}:8000`;
        return `${backendUrl}/api/v1`;
    }
    
    // En desarrollo local
    return 'http://localhost:8000/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

// Log para debugging
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🌍 Environment:', window.location.hostname);

// Función helper para manejar errores de la API
const handleApiError = async (response: Response): Promise<AuthError> => {
    try {
        const errorData = await response.json();
        return {
            detail: errorData.detail || 'Error desconocido',
            status_code: response.status
        };
    } catch {
        return {
            detail: `Error ${response.status}: ${response.statusText}`,
            status_code: response.status
        };
    }
};

// Funciones de autenticación
export const authAPI = {
    // Registro de usuario
    async signUp(data: SignUpData): Promise<SignUpResponse | TokenResponse> {
        try {
            console.log('🚀 Intentando registro en:', `${API_BASE_URL}/auth/signup`);
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await handleApiError(response);
                throw error;
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Error en signUp:', error);
            if (error instanceof Error) {
                throw { detail: error.message };
            }
            throw error;
        }
    },

    // Inicio de sesión
    async signIn(data: LoginData): Promise<TokenResponse> {
        try {
            console.log('🔐 Intentando login en:', `${API_BASE_URL}/auth/signin`);
            const response = await fetch(`${API_BASE_URL}/auth/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await handleApiError(response);
                throw error;
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Error en signIn:', error);
            if (error instanceof Error) {
                throw { detail: error.message };
            }
            throw error;
        }
    },

    // Refrescar token
    async refreshToken(refreshToken: string): Promise<TokenResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (!response.ok) {
                const error = await handleApiError(response);
                throw error;
            }

            return await response.json();
        } catch (error) {
            if (error instanceof Error) {
                throw { detail: error.message };
            }
            throw error;
        }
    },

    // Cerrar sesión
    async logout(accessToken: string): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                const error = await handleApiError(response);
                throw error;
            }
        } catch (error) {
            if (error instanceof Error) {
                throw { detail: error.message };
            }
            throw error;
        }
    },

    // Obtener perfil del usuario
    async getProfile(accessToken: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                const error = await handleApiError(response);
                throw error;
            }

            return await response.json();
        } catch (error) {
            if (error instanceof Error) {
                throw { detail: error.message };
            }
            throw error;
        }
    }
};

export const MOCK_SERVICES: Service[] = [
    {
        id: '1',
        title: 'Auditoría de experiencia de usuario',
        description: 'Análisis y optimización de flujos para mejorar la conversión y retención.',
        longDescription: 'Ofrecemos un análisis exhaustivo de la experiencia de usuario de su producto digital. Identificamos puntos de fricción, evaluamos la usabilidad y proponemos mejoras concretas para aumentar la satisfacción del cliente, la conversión y la retención a largo plazo.',
        category: 'Diseño',
        price: 5000000,
        priceType: 'por proyecto',
        providerId: 'p1',
        providerName: 'Creative Solutions',
        providerLogoUrl: 'https://picsum.photos/seed/p1/40/40',
        rating: 4.9,
        reviewCount: 34,
        imageUrl: 'https://picsum.photos/seed/s1/400/250',
        createdAt: '2023-05-10',
        status: 'active',
    },
    {
        id: '2',
        title: 'Gestión de envíos nacionales',
        description: 'Soluciones logísticas para encomiendas y pymes en Paraguay.',
        longDescription: 'Nos encargamos de toda la logística de sus envíos a nivel nacional. Ofrecemos recolección, empaque, seguimiento en tiempo real y entrega puerta a puerta. Ideal para e-commerce y empresas que necesitan una solución logística confiable.',
        category: 'Logística',
        price: 800000,
        priceType: 'por proyecto',
        providerId: 'p2',
        providerName: 'LogiPY',
        providerLogoUrl: 'https://picsum.photos/seed/p2/40/40',
        rating: 4.7,
        reviewCount: 58,
        imageUrl: 'https://picsum.photos/seed/s2/400/250',
        createdAt: '2023-05-15',
        status: 'active',
    },
    {
        id: '3',
        title: 'Landing page optimizada',
        description: 'Creación de landing pages para validación de ideas o lanzamientos.',
        longDescription: 'Diseñamos y desarrollamos landing pages de alto impacto visual y optimizadas para la conversión. Perfectas para lanzar un nuevo producto, validar una idea de negocio o captar leads para una campaña específica. Incluye integración con herramientas de analítica.',
        category: 'Desarrollo Web',
        price: 2500000,
        priceType: 'por proyecto',
        providerId: 'p3',
        providerName: 'WebDev Masters',
        providerLogoUrl: 'https://picsum.photos/seed/p3/40/40',
        rating: 5.0,
        reviewCount: 22,
        imageUrl: 'https://picsum.photos/seed/s3/400/250',
        createdAt: '2023-05-20',
        status: 'active',
    },
    {
        id: '4',
        title: 'Asesoramiento Contable para Pymes',
        description: 'Servicios contables mensuales para mantener tus finanzas en orden.',
        longDescription: 'Brindamos un servicio integral de contabilidad mensual que incluye liquidación de impuestos, presentación de informes, y asesoramiento financiero para optimizar la carga tributaria y asegurar el cumplimiento de todas las normativas vigentes.',
        category: 'Consultoría',
        price: 1200000,
        priceType: 'por hora',
        providerId: 'p4',
        providerName: 'Contadores Asociados',
        providerLogoUrl: 'https://picsum.photos/seed/p4/40/40',
        rating: 4.8,
        reviewCount: 41,
        imageUrl: 'https://picsum.photos/seed/s4/400/250',
        createdAt: '2023-04-18',
        status: 'active',
    },
    {
        id: '5',
        title: 'Desarrollo de App Móvil MVP',
        description: 'Construimos el Producto Mínimo Viable de tu aplicación móvil.',
        longDescription: 'Transformamos tu idea en una aplicación móvil funcional. Nos enfocamos en desarrollar un MVP (Producto Mínimo Viable) para que puedas lanzar al mercado rápidamente, obtener feedback de usuarios reales y validar tu modelo de negocio antes de una gran inversión.',
        category: 'Desarrollo Web',
        price: 25000000,
        priceType: 'por proyecto',
        providerId: 'p3',
        providerName: 'WebDev Masters',
        providerLogoUrl: 'https://picsum.photos/seed/p3/40/40',
        rating: 4.9,
        reviewCount: 15,
        imageUrl: 'https://picsum.photos/seed/s5/400/250',
        createdAt: '2023-03-25',
        status: 'active',
    },
    {
        id: '6',
        title: 'Campaña de Marketing Digital',
        description: 'Gestión de redes sociales y pauta publicitaria en Google y Meta.',
        longDescription: 'Planificamos y ejecutamos campañas de marketing digital 360°. Gestionamos tus perfiles en redes sociales, creamos contenido atractivo y administramos tu presupuesto publicitario en plataformas como Google Ads y Meta Ads para maximizar tu alcance y conversiones.',
        category: 'Marketing y Publicidad',
        price: 3000000,
        priceType: 'por proyecto',
        providerId: 'p1',
        providerName: 'Creative Solutions',
        providerLogoUrl: 'https://picsum.photos/seed/p1/40/40',
        rating: 4.6,
        reviewCount: 67,
        imageUrl: 'https://picsum.photos/seed/s6/400/250',
        createdAt: '2023-05-01',
        status: 'active',
    },
];

export const MOCK_CATEGORIES: Category[] = [
    {
        id: 'cat1',
        name: 'Diseño',
        description: 'Mejora la experiencia visual y funcional de tus productos digitales.',
        icon: PaintBrushIcon,
    },
    {
        id: 'cat2',
        name: 'Desarrollo Web',
        description: 'Sitios, apps y soluciones a medida para tu negocio online.',
        icon: CodeBracketIcon,
    },
    {
        id: 'cat3',
        name: 'Marketing y Publicidad',
        description: 'Aumenta tu visibilidad y conectá con más clientes.',
        icon: PresentationChartLineIcon,
    },
    {
        id: 'cat4',
        name: 'Logística',
        description: 'Servicios de envío, almacenamiento y distribución.',
        icon: BriefcaseIcon,
    },
];

export const MOCK_FAQS: Faq[] = [
    {
        question: '¿Cómo funciona la verificación de empresas proveedoras?',
        answer: 'Para garantizar la confianza en nuestra plataforma, ofrecemos un proceso de verificación que valida la documentación legal de cada empresa. Solo los proveedores que cumplen con los requisitos establecidos pueden ofrecer sus servicios, asegurando así calidad, transparencia y mayor credibilidad dentro del sistema.',
    },
    {
        question: '¿Es gratis publicar un servicio?',
        answer: 'Sí, podés empezar con nuestro plan gratuito. Luego, podés optar por un plan de pago si querés destacar tu perfil o usar herramientas premium.',
    },
    {
        question: '¿Puedo editar mis servicios después de publicarlos?',
        answer: 'Totalmente. Podés modificar la información, precio e imágenes desde tu panel en cualquier momento.',
    },
    {
        question: '¿Cómo reciben los clientes mis servicios?',
        answer: 'Los clientes pueden encontrarte por categoría, palabras clave o ubicación. Tu perfil y tus calificaciones son clave para atraer nuevos proyectos.',
    },
];

// Mock data for dashboard charts
export const getReservationsChartData = (): ChartDataPoint[] => [
    { name: 'Jan', value: 20 },
    { name: 'Feb', value: 30 },
    { name: 'Mar', value: 25 },
    { name: 'Apr', value: 45 },
    { name: 'May', value: 50 },
    { name: 'Jun', value: 48 },
];

export const getRatingsChartData = (): ChartDataPoint[] => [
    { name: 'Jan', value: 4.5 },
    { name: 'Feb', value: 4.6 },
    { name: 'Mar', value: 4.5 },
    { name: 'Apr', value: 4.7 },
    { name: 'May', value: 4.8 },
    { name: 'Jun', value: 4.9 },
];

export const getAdminUsersChartData = (): ChartDataPoint[] => [
    { name: 'Jan', value: 120 },
    { name: 'Feb', value: 150 },
    { name: 'Mar', value: 180 },
    { name: 'Apr', value: 220 },
    { name: 'May', value: 250 },
    { name: 'Jun', value: 300 },
];
export const getAdminPublicationsChartData = (): ChartDataPoint[] => [
    { name: 'Jan', value: 200 },
    { name: 'Feb', value: 210 },
    { name: 'Mar', value: 250 },
    { name: 'Apr', value: 280 },
    { name: 'May', value: 320 },
    { name: 'Jun', value: 350 },
];