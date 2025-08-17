import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Service, Category, Faq, ChartDataPoint } from '../types';
import {
    PaintBrushIcon,
    CodeBracketIcon,
    PresentationChartLineIcon,
    BriefcaseIcon,
} from '../components/icons';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

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

export const findRelevantServices = async (query: string, services: Service[]): Promise<{ success: boolean; data: string[] | null; error: string | null; }> => {
    if (!API_KEY) {
        const errorMsgForUser = "La función de búsqueda por IA no está disponible. Verifique la configuración de la API.";
        console.error(errorMsgForUser);
        return { success: false, data: null, error: errorMsgForUser };
    }

    try {
        // Simplify service data for the prompt to save tokens
        const servicesForPrompt = services.map(({ id, title, description, category }) => ({ id, title, description, category }));

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `User query: "${query}". Available services: ${JSON.stringify(servicesForPrompt)}`,
            config: {
                systemInstruction: "You are an intelligent assistant for the 'Seva Empresas' B2B platform in Paraguay. Your task is to help users find the most relevant services based on their needs. Analyze the user's query and the provided list of available services. Return a JSON object with a single key 'relevant_service_ids' which is an array of strings, where each string is the ID of a relevant service. Prioritize relevance over exact keyword matching. If no services are relevant, return an empty array.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        relevant_service_ids: {
                            type: Type.ARRAY,
                            description: "An array of strings, where each string is the ID of a relevant service.",
                            items: { type: Type.STRING },
                        },
                    },
                    required: ['relevant_service_ids'],
                },
            },
        });
        
        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        return { success: true, data: result.relevant_service_ids || [], error: null };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return { success: false, data: null, error: "Ocurrió un error al procesar la búsqueda con IA. Por favor, intente de nuevo." };
    }
};

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