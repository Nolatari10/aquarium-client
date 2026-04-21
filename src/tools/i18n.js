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
                    "Sales": "Ventas",
                    "Species": "Especies",
                    "Suppliers": "Proveedores",
                    "Inventory": "Inventario",
                    "Catalog": "Catálogo",
                    "Reports": "Reportes"
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
