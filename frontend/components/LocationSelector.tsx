import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, ChevronDownIcon } from './icons';

interface LocationOption {
    id: number;
    nombre: string;
}

interface LocationSelectorProps {
    label: string;
    placeholder: string;
    options: LocationOption[];
    value: LocationOption | null;
    onChange: (option: LocationOption | null) => void;
    isLoading?: boolean;
    disabled?: boolean;
    error?: string;
    className?: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
    label,
    placeholder,
    options,
    value,
    onChange,
    isLoading = false,
    disabled = false,
    error,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState<LocationOption[]>(options);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filtrar opciones basado en el término de búsqueda
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredOptions(options);
        } else {
            const filtered = options.filter(option =>
                option.nombre.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredOptions(filtered);
        }
    }, [searchTerm, options]);

    // Cerrar dropdown cuando se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Actualizar searchTerm cuando cambia el valor seleccionado
    useEffect(() => {
        if (value) {
            setSearchTerm(value.nombre);
        } else {
            setSearchTerm('');
        }
    }, [value]);

    const handleSelect = (option: LocationOption) => {
        onChange(option);
        setIsOpen(false);
        setSearchTerm(option.nombre);
    };

    const handleClear = () => {
        onChange(null);
        setSearchTerm('');
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        if (!isOpen) {
            setIsOpen(true);
        }
    };

    const handleInputFocus = () => {
        if (!disabled) {
            setIsOpen(true);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            
            <div className="relative" ref={dropdownRef}>
                <div className="relative">
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={searchTerm}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        disabled={disabled}
                        className={`
                            w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
                        `}
                    />
                    
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        ) : (
                            <ChevronDownIcon 
                                className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            />
                        )}
                    </div>
                </div>

                {/* Dropdown */}
                {isOpen && !disabled && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500">
                                {searchTerm.trim() === '' ? 'No hay opciones disponibles' : 'No se encontraron coincidencias'}
                            </div>
                        ) : (
                            <div>
                                {filteredOptions.map((option) => (
                                    <div
                                        key={option.id}
                                        className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-900"
                                        onClick={() => handleSelect(option)}
                                    >
                                        {option.nombre}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Botón para limpiar selección */}
            {value && !disabled && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                    Limpiar selección
                </button>
            )}

            {/* Mensaje de error */}
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};
