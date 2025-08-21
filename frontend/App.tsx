
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useParams, useLocation, Outlet, Navigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Service, Category, Faq, User, UserRole, ChartDataPoint } from './types';
import { MOCK_SERVICES, MOCK_CATEGORIES, MOCK_FAQS, getReservationsChartData, getRatingsChartData, getAdminUsersChartData, getAdminPublicationsChartData } from './services/api';
import { StarIcon, CheckCircleIcon, ChevronDownIcon, MagnifyingGlassIcon, SparklesIcon, HomeIcon, BuildingStorefrontIcon, CalendarDaysIcon, UserCircleIcon, ArrowRightOnRectangleIcon, EllipsisVerticalIcon, ChartBarIcon, PaintBrushIcon, CodeBracketIcon, PresentationChartLineIcon, BriefcaseIcon, PlusCircleIcon, UsersIcon, EyeIcon, EyeSlashIcon } from './components/icons';

// --- AUTH CONTEXT & HOOK ---
interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  register: (data: { companyName: string; name: string; email: string; }) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}
const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole) => {
    const mockUser: User = {
      id: role === 'admin' ? 'admin01' : 'user01',
      name: role === 'admin' ? 'Admin User' : 'Johan González',
      email: role === 'admin' ? 'admin@seva.com' : 'johan@empresa.com',
      role: role,
      companyName: role === 'admin' ? 'Seva Platform' : 'Mi Empresa S.A.',
    };
    setUser(mockUser);
  };

  const register = (data: { companyName: string; name: string; email: string; }) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      role: 'provider',
      companyName: data.companyName,
      name: data.name,
      email: data.email,
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };
  
  const updateUser = (data: Partial<User>) => {
      setUser(prevUser => prevUser ? { ...prevUser, ...data } : null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// --- REUSABLE UI COMPONENTS ---

const Alert: React.FC<{
  children: React.ReactNode;
  variant?: 'error' | 'warning' | 'info';
  className?: string;
}> = ({ children, variant = 'info', className = '' }) => {
  const baseClasses = 'p-4 rounded-lg my-4 border text-sm font-medium';
  const variantClasses = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} role="alert">
      {children}
    </div>
  );
};

const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  to?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}> = ({ children, onClick, variant = 'primary', className = '', to, type = 'button', disabled = false }) => {
  const baseClasses = 'inline-flex items-center justify-center px-5 py-2.5 font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-primary-100 text-primary-700 hover:bg-primary-200 focus:ring-primary-500',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-500 shadow-none',
  };
  
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (to) {
    return <Link to={to} className={combinedClasses}>{children}</Link>;
  }

  return <button type={type} onClick={onClick} className={combinedClasses} disabled={disabled}>{children}</button>;
};

const ServiceCard: React.FC<{ service: Service }> = ({ service }) => {
    const navigate = useNavigate();
    return (
        <div onClick={() => navigate(`/service/${service.id}`)} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer border border-slate-200/80 group">
            <div className="relative">
                <img className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300" src={service.imageUrl} alt={service.title} />
                <div className="absolute top-3 right-3 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-full">{service.category}</div>
            </div>
            <div className="p-6">
                <h3 className="block mt-1 text-lg leading-tight font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{service.title}</h3>
                <p className="mt-2 text-slate-500 text-sm h-10 overflow-hidden">{service.description}</p>
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <img className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-slate-200" src={service.providerLogoUrl} alt={service.providerName} />
                        <div className="text-sm">
                            <p className="text-slate-900 leading-none font-medium">{service.providerName}</p>
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                        <StarIcon className="w-5 h-5 text-amber-400 mr-1" />
                        <span className="font-bold text-slate-800">{service.rating}</span>
                        <span className="ml-1 text-slate-500">({service.reviewCount})</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FaqItem: React.FC<{ faq: Faq }> = ({ faq }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 py-6">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
        <h3 className="text-lg font-semibold text-slate-800">{faq.question}</h3>
        <ChevronDownIcon className={`w-6 h-6 text-slate-500 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            <p className="text-slate-600 pt-4">{faq.answer}</p>
          </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ title: string; value: string; description: string; icon: React.ReactNode }> = ({ title, value, description, icon }) => (
    <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-xl shadow-lg border border-slate-200/80 flex items-start space-x-4">
        <div className="bg-primary-100 text-primary-600 rounded-lg p-3">
            {icon}
        </div>
        <div>
            <p className="text-4xl font-bold text-primary-600">{value}</p>
            <p className="mt-1 text-md font-semibold text-slate-700">{title}</p>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
    </div>
);

const DashboardStatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; change?: string; changeColor?: string; }> = ({ title, value, icon, change, changeColor = 'text-green-500' }) => (
    <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200/80">
        <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <div className="text-slate-400">{icon}</div>
        </div>
        <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {change && <span className={`ml-2 text-sm font-semibold ${changeColor}`}>{change}</span>}
        </div>
    </div>
);

const CustomChart: React.FC<{data: ChartDataPoint[], dataKey: string, chartType: 'line' | 'bar'}> = ({data, dataKey, chartType}) => (
    <ResponsiveContainer width="100%" height={300}>
        {chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={dataKey.includes('rating')} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
            </LineChart>
        ) : (
             <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
        )}
    </ResponsiveContainer>
)


// --- LAYOUT COMPONENTS ---

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
      logout();
      navigate('/');
    };
    
    return (
        <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 w-full border-b border-slate-200/80">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="text-2xl font-bold text-primary-600">SEVA EMPRESAS</Link>
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-slate-600 hover:text-primary-600 transition-colors font-medium">Inicio</Link>
                        <Link to="/marketplace" className="text-slate-600 hover:text-primary-600 transition-colors font-medium">Marketplace</Link>
                    </nav>
                    <div className="flex items-center space-x-2">
                        {user ? (
                            <>
                                <Button to="/dashboard" variant="ghost">Mi Panel</Button>
                                <Button onClick={handleLogout} variant="primary">Salir</Button>
                            </>
                        ) : (
                            <>
                                <Button to="/login" variant="ghost">Iniciar sesión</Button>
                                <Button to="/register" variant="primary">Crear cuenta</Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

const Footer: React.FC = () => (
    <footer className="bg-slate-100 border-t border-slate-200">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 text-slate-500">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-xl font-bold text-primary-600">SEVA EMPRESAS</h3>
                    <p className="mt-2 text-sm">Conectando empresas, potenciando el crecimiento en Paraguay.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-700">Explorar</h4>
                    <ul className="mt-2 space-y-1 text-sm">
                        <li><Link to="/marketplace" className="hover:text-primary-600">Marketplace</Link></li>
                        <li><Link to="/register" className="hover:text-primary-600">Publicar Servicio</Link></li>
                        <li><Link to="/" className="hover:text-primary-600">Categorías</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-700">Nosotros</h4>
                    <ul className="mt-2 space-y-1 text-sm">
                        <li><Link to="/" className="hover:text-primary-600">Sobre Seva</Link></li>
                        <li><Link to="/" className="hover:text-primary-600">Términos y Condiciones</Link></li>
                        <li><Link to="/" className="hover:text-primary-600">Política de Privacidad</Link></li>
                    </ul>
                </div>
                 <div>
                    <h4 className="font-semibold text-slate-700">Contacto</h4>
                    <ul className="mt-2 space-y-1 text-sm">
                        <li><a href="mailto:b2bseva.notificaciones@gmail.com" className="hover:text-primary-600">b2bseva.notificaciones@gmail.com</a></li>
                        <li>Asunción, Paraguay</li>
                    </ul>
                </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-200 text-center text-sm">
                &copy; {new Date().getFullYear()} Seva Empresas. Todos los derechos reservados.
            </div>
        </div>
    </footer>
);


const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
    </div>
);

// --- PAGES ---

const HomePage: React.FC = () => {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 flex flex-col md:flex-row items-center">
                    <div className="md:w-1/2 text-center md:text-left">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tighter">
                            Conectá, colaborá y hacé <span className="text-primary-600">crecer tu negocio.</span>
                        </h1>
                        <p className="mt-6 text-lg text-slate-600 max-w-xl mx-auto md:mx-0">
                            Publicá tus servicios o encontrá proveedores calificados en un solo lugar. La plataforma B2B líder en Paraguay.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <Button to="/register" variant="primary" className="text-lg">Publicar un servicio</Button>
                            <Button to="/marketplace" variant="secondary" className="text-lg">Explorar el marketplace</Button>
                        </div>
                    </div>
                    <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center">
                        <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop" alt="Business collaboration" className="rounded-2xl shadow-2xl w-full max-w-lg object-cover" />
                    </div>
                </div>
            </section>
            
            {/* Metrics Section */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-slate-900">Construí algo increíble</h2>
                        <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">Accedé a datos clave que muestran cómo esta plataforma puede ayudarte a lanzar y hacer crecer tu negocio más rápido.</p>
                    </div>
                    <div className="mt-12 grid gap-8 md:grid-cols-3">
                       <MetricCard title="Categorías" value="+30" description="Miles de categorías cargadas en la plataforma." icon={<BriefcaseIcon className="w-8 h-8"/>}/>
                       <MetricCard title="Visitas mensuales" value="8K" description="Usuarios y empresas que navegan activamente." icon={<UsersIcon className="w-8 h-8"/>}/>
                       <MetricCard title="Servicios publicados" value="+500" description="Miles de servicios cargados por empresas de distintos rubros." icon={<PlusCircleIcon className="w-8 h-8"/>}/>
                    </div>
                </div>
            </section>

            {/* Latest Services Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-12">
                         <h2 className="text-3xl font-bold text-slate-900">Últimos servicios publicados</h2>
                         <Button to="/marketplace" variant="secondary">Ver todos los servicios</Button>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {MOCK_SERVICES.slice(0, 3).map(service => <ServiceCard key={service.id} service={service} />)}
                    </div>
                </div>
            </section>
            
            {/* Categories Section */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                     <h2 className="text-3xl font-bold text-center text-slate-900">Navegá por categorías</h2>
                     <p className="mt-4 text-lg text-slate-600 text-center max-w-3xl mx-auto">Encontrá el tipo de servicio que necesitás. Explorá por categoría y descubrí proveedores listos para ayudarte a crecer.</p>
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {MOCK_CATEGORIES.map(cat => (
                            <Link to="/marketplace" key={cat.id} className="group block bg-white p-8 rounded-xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-200/80">
                                <cat.icon className="h-10 w-10 text-primary-600" />
                                <h3 className="mt-4 text-xl font-bold text-slate-800">{cat.name}</h3>
                                <p className="mt-2 text-slate-500">{cat.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* FAQ Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-center text-slate-900">Preguntas Frecuentes</h2>
                        <div className="mt-8">
                            {MOCK_FAQS.map((faq, index) => <FaqItem key={index} faq={faq} />)}
                        </div>
                         <div className="mt-12 text-center bg-primary-600 text-white p-10 rounded-xl shadow-lg">
                            <h3 className="text-2xl font-bold">Empezá hoy mismo a recibir más solicitudes</h3>
                            <p className="mt-2">Unite a docenas de empresas que ya están creciendo desde nuestro marketplace.</p>
                            <div className="mt-6 flex gap-4 justify-center">
                                <Button to="/marketplace" variant="secondary" className="bg-white hover:bg-slate-100">Explorar el marketplace</Button>
                                <Button to="/register" variant="ghost" className="bg-primary-500 hover:bg-primary-400 text-white">Publicar un servicio</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const MarketplacePage: React.FC = () => {
    const [services, setServices] = useState(MOCK_SERVICES);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [filteredIds, setFilteredIds] = useState<string[] | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);

    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim()) {
            setFilteredIds(null);
            setSearchError(null);
            return;
        }
        setIsLoading(true);
        setSearchError(null);
        setFilteredIds([]); // Clear previous results while loading
        setIsLoading(false);
    }, [searchQuery, services]);

    const displayedServices = filteredIds ? services.filter(s => filteredIds.includes(s.id)) : services;

    return (
        <div className="bg-slate-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200/80">
                    <h1 className="text-4xl font-bold text-slate-900">Servicios profesionales de calidad</h1>
                    <p className="mt-2 text-slate-600">Explorá categorías, filtrá por fecha y encontrá los servicios ideales para hacer crecer tu negocio. Todo en un solo lugar.</p>
                    
                    <div className="mt-6 relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Busco servicios de marketing, contabilidad, logística..."
                            className="w-full pl-12 pr-32 py-4 rounded-lg border-2 border-slate-300 focus:ring-primary-500 focus:border-primary-500 transition"
                            disabled={isLoading}
                        />
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                        <Button 
                            onClick={handleSearch} 
                            className="absolute right-2 top-1/2 -translate-y-1/2" 
                            disabled={isLoading}
                        >
                            {isLoading ? 'Buscando...' : (
                                <>
                                    <SparklesIcon className="w-5 h-5 mr-2" />
                                    Buscar con IA
                                </>
                            )}
                        </Button>
                    </div>

                    {searchError && <Alert variant="error">{searchError}</Alert>}

                    <div className="mt-12">
                        {isLoading && (
                            <div className="text-center py-10">
                                <div role="status" className="flex flex-col items-center justify-center">
                                    <svg aria-hidden="true" className="w-10 h-10 text-slate-200 animate-spin fill-primary-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                    </svg>
                                    <p className="mt-4 text-slate-600 font-medium">La IA está analizando tu solicitud...</p>
                                    <span className="sr-only">Cargando...</span>
                                </div>
                            </div>
                        )}
                        {!isLoading && displayedServices.length === 0 && (
                            <div className="text-center py-10">
                                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-slate-400" />
                                <h3 className="mt-2 text-lg font-semibold text-slate-800">
                                    {filteredIds ? 'No se encontraron servicios' : 'Empezá tu búsqueda'}
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    {filteredIds ? 'Probá con otros términos de búsqueda.' : 'Utilizá la barra de búsqueda para encontrar lo que necesitás.'}
                                </p>
                            </div>
                        )}
                        {!isLoading && displayedServices.length > 0 && (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {displayedServices.map(service => <ServiceCard key={service.id} service={service} />)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ServiceDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const service = MOCK_SERVICES.find(s => s.id === id);

    if (!service) {
        return (
            <MainLayout>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                    <h1 className="text-3xl font-bold">Servicio no encontrado</h1>
                    <p className="mt-4">El servicio que estás buscando no existe o fue removido.</p>
                    <Button to="/marketplace" className="mt-6">Volver al Marketplace</Button>
                </div>
            </MainLayout>
        );
    }
    
    return (
      <MainLayout>
        <div className="bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid md:grid-cols-3 gap-12">
                    <div className="md:col-span-2">
                        <img src={service.imageUrl} alt={service.title} className="w-full h-96 object-cover rounded-xl shadow-lg"/>
                        <div className="mt-8">
                            <h1 className="text-4xl font-bold text-slate-900">{service.title}</h1>
                            <p className="mt-4 text-lg text-slate-600">{service.longDescription}</p>
                        </div>
                    </div>
                    <div className="md:col-span-1">
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 sticky top-24">
                            <div className="flex items-center">
                                <img className="w-16 h-16 rounded-full mr-4 object-cover border-2 border-white shadow" src={service.providerLogoUrl} alt={service.providerName} />
                                <div>
                                    <p className="text-slate-500 text-sm">Ofrecido por</p>
                                    <p className="text-slate-900 text-lg font-bold">{service.providerName}</p>
                                </div>
                            </div>
                            <div className="flex items-center text-sm text-slate-600 mt-4">
                                <StarIcon className="w-5 h-5 text-amber-400 mr-1" />
                                <span className="font-bold text-slate-800">{service.rating}</span>
                                <span className="ml-1 text-slate-500">({service.reviewCount} reseñas)</span>
                            </div>
                            <hr className="my-6 border-slate-200"/>
                            <div>
                                <p className="text-3xl font-bold text-slate-900">
                                    {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(service.price)}
                                </p>
                                <p className="text-slate-500 text-sm">/ {service.priceType}</p>
                            </div>
                            <Button className="w-full mt-6 text-lg">Contactar al proveedor</Button>
                             <div className="mt-6 text-sm text-slate-500 flex items-start">
                                <CheckCircleIcon className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0"/>
                                <span>Proveedor verificado por Seva. Cumple con los estándares de calidad.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </MainLayout>
    );
};

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

    const handleLogin = (role: UserRole) => {
        login(role);
        navigate('/dashboard');
    };

    return (
        <MainLayout>
            <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
                <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl border border-slate-200/80 m-4">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-slate-900">Iniciar sesión</h2>
                        <p className="mt-2 text-sm text-slate-500">
                            ¿No tenés cuenta?{' '}
                            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                                Creá una ahora
                            </Link>
                        </p>
                    </div>
                    <div className="space-y-4">
                        <p className="text-center text-sm font-medium text-slate-600">Para fines de demostración, seleccione un rol:</p>
                        <Button onClick={() => handleLogin('provider')} variant={selectedRole === 'provider' ? 'primary' : 'secondary'} className="w-full">
                            Ingresar como Proveedor
                        </Button>
                        <Button onClick={() => handleLogin('admin')} variant={selectedRole === 'admin' ? 'primary' : 'secondary'} className="w-full">
                            Ingresar como Administrador
                        </Button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ companyName: '', name: '', email: '', password: '' });
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register({ companyName: formData.companyName, name: formData.name, email: formData.email });
    navigate('/dashboard');
  };

  return (
    <MainLayout>
        <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
            <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-slate-200/80 m-4">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-slate-900">Crear cuenta de empresa</h2>
                    <p className="mt-2 text-sm text-slate-500">
                        ¿Ya tenés una cuenta?{' '}
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                            Iniciá sesión
                        </Link>
                    </p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="companyName" className="text-sm font-medium text-slate-700 block mb-2">Nombre de la empresa</label>
                        <input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" placeholder ="Mi Empresa S.A." required />
                    </div>
                    <div>
                        <label htmlFor="name" className="text-sm font-medium text-slate-700 block mb-2">Nombre del Contacto</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" placeholder ="Juan Perez" required />
                    </div>
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-slate-700 block mb-2">Correo electrónico</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" placeholder ="micorreo@gmail.com"required />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-slate-700 block mb-2">Contraseña</label>
                        {/* Envolvemos el input y el botón en un div con 'relative' para posicionar el icono */}
                        <div className="relative">
                            <input 
                                // El tipo del input ahora depende de nuestro estado 'passwordVisible'
                                type={passwordVisible ? "text" : "password"} 
                                name="password" 
                                id="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                // Añadimos padding a la derecha (pr-10) para que el texto no se solape con el icono
                                className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" 
                                placeholder="Mínimo 8 caracteres"
                                minLength ={8}
                                required 
                            />
                            {/* Este es el botón con el icono del ojo */}
                            <button 
                                type="button" 
                                onClick={() => setPasswordVisible(!passwordVisible)} // Al hacer clic, invierte el estado de visibilidad
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700"
                                aria-label={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {/* Mostramos un icono u otro dependiendo del estado */}
                                {passwordVisible ? (
                                    <EyeSlashIcon className="h-5 w-5" /> 
                                ) : (
                                    <EyeIcon className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    <Button type="submit" variant="primary" className="w-full">Crear mi cuenta</Button>
                </form>
            </div>
        </div>
    </MainLayout>
  );
};


const DashboardLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinks = user?.role === 'admin' ? [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    ] : [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Mis Reservas', href: '/dashboard/reservations', icon: CalendarDaysIcon },
        { name: 'Mi Perfil', href: '/dashboard/profile', icon: UserCircleIcon },
    ];
    
    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="flex h-screen bg-slate-100">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-slate-200">
                    <Link to="/" className="text-xl font-bold text-primary-600">SEVA EMPRESAS</Link>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.href}
                            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                location.pathname === link.href
                                    ? 'bg-primary-50 text-primary-600'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            <link.icon className="w-5 h-5 mr-3" />
                            {link.name}
                        </Link>
                    ))}
                </nav>
                <div className="px-4 py-4 border-t border-slate-200">
                     <div className="flex items-center px-4 py-3">
                         <UserCircleIcon className="w-10 h-10 text-slate-400"/>
                        <div className="ml-3">
                            <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                        <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3"/>
                        Cerrar sesión
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100">
                    <div className="container mx-auto px-6 py-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    
    if (user?.role === 'admin') {
      return <AdminDashboardPage />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Dashboard de Proveedor</h1>
            <p className="text-slate-500 mt-1">Resumen de tu actividad en la plataforma.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                <DashboardStatCard title="Reservas Pendientes" value="12" icon={<CalendarDaysIcon className="w-6 h-6"/>} change="+2 esta semana" />
                <DashboardStatCard title="Total Ganado (Mes)" value="Gs. 12.5M" icon={<ChartBarIcon className="w-6 h-6"/>} change="+5.2%" />
                <DashboardStatCard title="Rating Promedio" value="4.8" icon={<StarIcon className="w-6 h-6"/>} change="+0.1" />
                <DashboardStatCard title="Servicios Activos" value="5" icon={<CheckCircleIcon className="w-6 h-6"/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200/80">
                    <h2 className="font-semibold text-slate-800">Reservas por Mes</h2>
                    <CustomChart data={getReservationsChartData()} dataKey="value" chartType="line" />
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200/80">
                    <h2 className="font-semibold text-slate-800">Evolución del Rating</h2>
                    <CustomChart data={getRatingsChartData()} dataKey="value" chartType="line"/>
                </div>
            </div>
        </div>
    );
};

const AdminDashboardPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Panel de Administrador</h1>
            <p className="text-slate-500 mt-1">Visión general del estado de la plataforma.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                <DashboardStatCard title="Usuarios Totales" value="300" icon={<UsersIcon className="w-6 h-6"/>} change="+50 este mes" />
                <DashboardStatCard title="Publicaciones Totales" value="350" icon={<BuildingStorefrontIcon className="w-6 h-6"/>} change="+30 este mes" />
                <DashboardStatCard title="Ingresos Plataforma (Mes)" value="Gs. 2.5M" icon={<ChartBarIcon className="w-6 h-6"/>} change="+8.1%" />
                <DashboardStatCard title="Tasa de Verificación" value="85%" icon={<CheckCircleIcon className="w-6 h-6"/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200/80">
                    <h2 className="font-semibold text-slate-800">Crecimiento de Usuarios</h2>
                    <CustomChart data={getAdminUsersChartData()} dataKey="value" chartType="bar" />
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200/80">
                    <h2 className="font-semibold text-slate-800">Crecimiento de Publicaciones</h2>
                    <CustomChart data={getAdminPublicationsChartData()} dataKey="value" chartType="bar"/>
                </div>
            </div>
        </div>
    );
};

const ReservationsPage: React.FC = () => {
  // Mock data for reservations
  const reservations = [
    { id: 'res1', service: 'Auditoría de UX', client: 'TechCorp', date: '2024-08-15', status: 'Confirmada', amount: 'Gs. 5.000.000' },
    { id: 'res2', service: 'Landing Page', client: 'Innovate S.A.', date: '2024-08-20', status: 'Pendiente', amount: 'Gs. 2.500.000' },
    { id: 'res3', service: 'Gestión de Envíos', client: 'Retail Paraguay', date: '2024-07-30', status: 'Completada', amount: 'Gs. 800.000' },
    { id: 'res4', service: 'Asesoramiento Contable', client: 'Startup X', date: '2024-07-25', status: 'Cancelada', amount: 'Gs. 1.200.000' },
  ];
  
  const getStatusChip = (status: string) => {
    switch (status) {
      case 'Confirmada': return 'bg-blue-100 text-blue-800';
      case 'Pendiente': return 'bg-amber-100 text-amber-800';
      case 'Completada': return 'bg-green-100 text-green-800';
      case 'Cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div>
        <h1 className="text-3xl font-bold text-slate-800">Mis Reservas</h1>
        <p className="text-slate-500 mt-1">Gestioná las solicitudes de tus servicios.</p>

        <div className="mt-8 bg-white rounded-xl shadow-md border border-slate-200/80 overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Servicio</th>
                        <th scope="col" className="px-6 py-3">Cliente</th>
                        <th scope="col" className="px-6 py-3">Fecha</th>
                        <th scope="col" className="px-6 py-3">Monto</th>
                        <th scope="col" className="px-6 py-3">Estado</th>
                        <th scope="col" className="px-6 py-3"><span className="sr-only">Acciones</span></th>
                    </tr>
                </thead>
                <tbody>
                    {reservations.map(res => (
                        <tr key={res.id} className="bg-white border-b hover:bg-slate-50">
                            <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{res.service}</th>
                            <td className="px-6 py-4">{res.client}</td>
                            <td className="px-6 py-4">{res.date}</td>
                            <td className="px-6 py-4">{res.amount}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 font-semibold leading-tight text-xs rounded-full ${getStatusChip(res.status)}`}>
                                    {res.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <button className="text-primary-600 hover:text-primary-800"><EllipsisVerticalIcon className="w-5 h-5"/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

const ManageProfilePage: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        companyName: user?.companyName || '',
        name: user?.name || '',
        email: user?.email || '',
        companyBio: 'Somos una empresa líder en soluciones creativas, ayudando a nuestros clientes a alcanzar sus metas con diseños innovadores y estrategias de marketing efectivas.',
        companyLogo: 'https://picsum.photos/seed/p1/200/200'
    });
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            updateUser({
                companyName: formData.companyName,
                name: formData.name,
                email: formData.email,
            });
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 1000);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Mi Perfil</h1>
            <p className="text-slate-500 mt-1">Actualizá la información de tu empresa y perfil público.</p>
            
            <form onSubmit={handleSubmit} className="mt-8 bg-white rounded-xl shadow-md border border-slate-200/80 p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-semibold text-slate-800">Logo de la Empresa</h3>
                        <p className="text-sm text-slate-500 mt-1">Este logo aparecerá en tu perfil y en las tarjetas de tus servicios.</p>
                        <div className="mt-4">
                            <img src={formData.companyLogo} alt="Logo de la empresa" className="w-40 h-40 rounded-full object-cover border-4 border-slate-100 shadow-sm mx-auto"/>
                            <Button variant="secondary" className="w-full mt-4">Cambiar logo</Button>
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <label htmlFor="companyName" className="text-sm font-medium text-slate-700 block mb-2">Nombre de la empresa</label>
                            <input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                         <div>
                            <label htmlFor="name" className="text-sm font-medium text-slate-700 block mb-2">Nombre del Contacto</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        <div>
                            <label htmlFor="email" className="text-sm font-medium text-slate-700 block mb-2">Email de contacto</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        <div>
                            <label htmlFor="companyBio" className="text-sm font-medium text-slate-700 block mb-2">Biografía de la empresa</label>
                            <textarea name="companyBio" id="companyBio" rows={4} value={formData.companyBio} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"></textarea>
                        </div>
                    </div>
                </div>
                 <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end items-center gap-4">
                    {showSuccess && <span className="text-sm text-green-600 font-medium">¡Perfil actualizado!</span>}
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

// --- MAIN APP ---
const App: React.FC = () => {
    return (
        <AuthProvider>
            <HashRouter>
                <Routes>
                    <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
                    <Route path="/marketplace" element={<MainLayout><MarketplacePage /></MainLayout>} />
                    <Route path="/service/:id" element={<ServiceDetailPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route 
                        path="/dashboard" 
                        element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
                    >
                       <Route index element={<DashboardPage />} />
                       <Route path="reservations" element={<ReservationsPage />} />
                       <Route path="profile" element={<ManageProfilePage />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </HashRouter>
        </AuthProvider>
    );
};

export default App;
