//Funciones para llamar a la api
const API_BASE_URL = "http://localhost:5087/api"; // Ajusta el puerto si es necesario

export async function createInventoryLot(dto) {
   const response = await fetch(`${API_BASE_URL}/InventoryLots`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });

    if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}` || "Error al cargar lotes de inventario");
    }

    return await response.json();
}

