import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {   
            en: {
                translation: {
                    "Sales": "Sales",
                    "Species": "Species",
                    "Suppliers": "Suppliers",
                    "Inventory": "Inventory",
                    "Catalog": "Catalog",
                    "Reports": "Reports"
                }
            },
            es: {
                translation: {
                    "Aquarium Manager": "Administrador de Acuario",
                    "Sales": "Ventas",
                    "Species": "Especies",
                    "Suppliers": "Proveedores",
                    "Supplier": "Proveedor",
                    "Inventory": "Inventario",
                    "Catalog": "Catálogo",
                    "Reports": "Reportes",
                    
                    //Catalog, species and inventory fields
                     "Available": "Disponible",
                     "Category": "Categoría",
                     "ScientificName": "Nombre Científico",
                     "CommonName": "Nombre Común",
                     "Variety": "Variedad",
                     "Units Available": "Unidades Disponibles",
                     "Oldest Lot": "Lote Más Antiguo",
                     "Search by name, scientific name or category...": "Buscar por nombre, nombre científico o categoría...",
                     "Search lots...": "Buscar lotes...",
                     "Create Lot": "Crear Lote",
                     "Inventory Lots": "Lotes de Inventario",
                     "Arrival Date": "Fecha de Llegada",
                     "Initial Qty": "Cantidad Inicial",
                     "Current Stock": "Stock Actual",
                     "Status": "Estado",
                     "Actions": "Acciones", 
                        "Empty": "Vacío",
                        "Low": "Bajo",
                        "lots tracked": "lotes registrados",
                    
                        //Reports
                        "Reports": "Reportes",
                        "Cost Value": "Valor de Costo",
                        "Loading...": "Cargando...",
                        "Failed to load stock report": "Error al cargar el reporte de stock",
                        "Load Stock Report": "Cargar Reporte de Stock",
                        "Export to CSV": "Exportar a CSV",
                        "Valuation": "Valoración",
                        "Mortality": "Mortalidad",
                        "Dashboard": "Tablero",
                        "Exported {count} records to CSV": "Exportados {count} registros a CSV",
                        "Export CSV": "Exportar CSV",

                        //Dashboard
                        "Total Species": "Total de Especies",
                        "Total Stock": "Stock Total",
                        "Total Sales": "Ventas Totales",
                        "Revenue": "Ingresos",
                        "Active species in catalog": "Especies activas en el catálogo",
                        "Units across all inventory": "Unidades en todo el inventario",
                        "Transactions recorded": "Transacciones registradas",
                        "Total sales revenue": "Ingresos totales por ventas",
                        "Error loading dashboard": "Error al cargar el tablero",
                        "Quick Actions": "Acciones Rápidas",
                        "Add Species": "Agregar Especie",
                        "New Inventory": "Nuevo Inventario",
                        "Record Sale": "Registrar Venta",
                        "View Reports": "Ver Reportes",
                        "Recent Sales": "Ventas Recientes",
                        "View All": "Ver Todo",
                        "Low Stock Alert": "Alerta de Bajo Stock",
                        "{count} species with low stock levels": "{count} especies con niveles de stock bajos",
                        "Welcome to your Aquarium Manager": "Bienvenido a tu Administrador de Acuario"

                    }

            }

        },
      
        lng: 'es',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

    export default i18n;
