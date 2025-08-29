import React, { useState, useEffect } from 'react';
import { LocationSelector } from './LocationSelector';
import { locationsAPI, Departamento, Ciudad, Barrio } from '../services/locations';

interface AddressSelectorProps {
    onAddressChange: (address: {
        departamento: Departamento | null;
        ciudad: Ciudad | null;
        barrio: Barrio | null;
    }) => void;
    initialValues?: {
        departamento?: Departamento | null;
        ciudad?: Ciudad | null;
        barrio?: Barrio | null;
    };
    className?: string;
    disabled?: boolean;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
    onAddressChange,
    initialValues = {},
    className = '',
    disabled = false
}) => {
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [ciudades, setCiudades] = useState<Ciudad[]>([]);
    const [barrios, setBarrios] = useState<Barrio[]>([]);
    
    const [selectedDepartamento, setSelectedDepartamento] = useState<Departamento | null>(
        initialValues.departamento || null
    );
    const [selectedCiudad, setSelectedCiudad] = useState<Ciudad | null>(
        initialValues.ciudad || null
    );
    const [selectedBarrio, setSelectedBarrio] = useState<Barrio | null>(
        initialValues.barrio || null
    );
    
    const [isLoadingDepartamentos, setIsLoadingDepartamentos] = useState(false);
    const [isLoadingCiudades, setIsLoadingCiudades] = useState(false);
    const [isLoadingBarrios, setIsLoadingBarrios] = useState(false);
    
    const [errorDepartamentos, setErrorDepartamentos] = useState<string>('');
    const [errorCiudades, setErrorCiudades] = useState<string>('');
    const [errorBarrios, setErrorBarrios] = useState<string>('');

    // Cargar departamentos al montar el componente
    useEffect(() => {
        loadDepartamentos();
    }, []);

    // Cargar departamentos
    const loadDepartamentos = async () => {
        try {
            setIsLoadingDepartamentos(true);
            setErrorDepartamentos('');
            const data = await locationsAPI.getDepartamentos();
            setDepartamentos(data);
        } catch (error) {
            console.error('Error al cargar departamentos:', error);
            setErrorDepartamentos('Error al cargar departamentos');
        } finally {
            setIsLoadingDepartamentos(false);
        }
    };

    // Cargar ciudades cuando se selecciona un departamento
    const loadCiudades = async (idDepartamento: number) => {
        try {
            setIsLoadingCiudades(true);
            setErrorCiudades('');
            const data = await locationsAPI.getCiudadesPorDepartamento(idDepartamento);
            setCiudades(data);
        } catch (error) {
            console.error('Error al cargar ciudades:', error);
            setErrorCiudades('Error al cargar ciudades');
        } finally {
            setIsLoadingCiudades(false);
        }
    };

    // Cargar barrios cuando se selecciona una ciudad
    const loadBarrios = async (idCiudad: number) => {
        try {
            setIsLoadingBarrios(true);
            setErrorBarrios('');
            const data = await locationsAPI.getBarriosPorCiudad(idCiudad);
            setBarrios(data);
        } catch (error) {
            console.error('Error al cargar barrios:', error);
            setErrorBarrios('Error al cargar barrios');
        } finally {
            setIsLoadingBarrios(false);
        }
    };

    // Manejar cambio de departamento
    const handleDepartamentoChange = (departamento: Departamento | null) => {
        setSelectedDepartamento(departamento);
        setSelectedCiudad(null);
        setSelectedBarrio(null);
        setCiudades([]);
        setBarrios([]);
        
        if (departamento) {
            loadCiudades(departamento.id_departamento);
        }
        
        notifyAddressChange(departamento, null, null);
    };

    // Manejar cambio de ciudad
    const handleCiudadChange = (ciudad: Ciudad | null) => {
        setSelectedCiudad(ciudad);
        setSelectedBarrio(null);
        setBarrios([]);
        
        if (ciudad) {
            loadBarrios(ciudad.id_ciudad);
        }
        
        notifyAddressChange(selectedDepartamento, ciudad, null);
    };

    // Manejar cambio de barrio
    const handleBarrioChange = (barrio: Barrio | null) => {
        setSelectedBarrio(barrio);
        notifyAddressChange(selectedDepartamento, selectedCiudad, barrio);
    };

    // Notificar cambios al componente padre
    const notifyAddressChange = (departamento: Departamento | null, ciudad: Ciudad | null, barrio: Barrio | null) => {
        onAddressChange({
            departamento,
            ciudad,
            barrio
        });
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Selector de Departamento */}
            <LocationSelector
                label="Departamento *"
                placeholder="Selecciona un departamento..."
                options={departamentos}
                value={selectedDepartamento}
                onChange={handleDepartamentoChange}
                isLoading={isLoadingDepartamentos}
                disabled={disabled}
                error={errorDepartamentos}
            />

            {/* Selector de Ciudad */}
            <LocationSelector
                label="Ciudad *"
                placeholder={selectedDepartamento ? "Selecciona una ciudad..." : "Primero selecciona un departamento"}
                options={ciudades}
                value={selectedCiudad}
                onChange={handleCiudadChange}
                isLoading={isLoadingCiudades}
                disabled={disabled || !selectedDepartamento}
                error={errorCiudades}
            />

            {/* Selector de Barrio */}
            <LocationSelector
                label="Barrio"
                placeholder={selectedCiudad ? "Selecciona un barrio (opcional)..." : "Primero selecciona una ciudad"}
                options={barrios}
                value={selectedBarrio}
                onChange={handleBarrioChange}
                isLoading={isLoadingBarrios}
                disabled={disabled || !selectedCiudad}
                error={errorBarrios}
            />

            {/* Información adicional */}
            <div className="text-xs text-gray-500">
                <p>• Los campos marcados con * son obligatorios</p>
                <p>• Puedes escribir para buscar opciones específicas</p>
                <p>• La selección se actualiza automáticamente según tu elección anterior</p>
            </div>
        </div>
    );
};
