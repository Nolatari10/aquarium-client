// src/components/inventory/InventoryLotForm.jsx
import { useState } from "react";

const initialFormState = {
  speciesId: "",
  arrivalDate: "",
  initialQuantity: "",
  deadOnArrival: "",
  unitCost: "",
  supplierId: "",
  batchNumber: "",
  notes: "",
};

export function InventoryLotForm({ onSubmit, isSubmitting }) {
  const [form, setForm] = useState(initialFormState);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const dto = {
      speciesId: Number(form.speciesId),
      arrivalDate: form.arrivalDate
        ? new Date(form.arrivalDate).toISOString()
        : new Date().toISOString(),
      initialQuantity: Number(form.initialQuantity),
      deadOnArrival: Number(form.deadOnArrival || 0),
      unitCost: Number(form.unitCost),
      supplierId: form.supplierId ? Number(form.supplierId) : null,
      batchNumber: form.batchNumber || null,
      notes: form.notes || null,
    };

    await onSubmit(dto);

    setForm(initialFormState);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registrar lote recibido</h2>

      <div>
        <label>
          SpeciesId:
          <input
            type="number"
            name="speciesId"
            value={form.speciesId}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <div>
        <label>
          Fecha de llegada:
          <input
            type="date"
            name="arrivalDate"
            value={form.arrivalDate}
            onChange={handleChange}
          />
        </label>
      </div>

      <div>
        <label>
          Cantidad inicial:
          <input
            type="number"
            name="initialQuantity"
            value={form.initialQuantity}
            onChange={handleChange}
            required
            min={1}
          />
        </label>
      </div>

      <div>
        <label>
          Decesos al llegar:
          <input
            type="number"
            name="deadOnArrival"
            value={form.deadOnArrival}
            onChange={handleChange}
            min={0}
          />
        </label>
      </div>

      <div>
        <label>
          Costo unitario:
          <input
            type="number"
            name="unitCost"
            value={form.unitCost}
            onChange={handleChange}
            step="0.01"
            min={0}
            required
          />
        </label>
      </div>

      <div>
        <label>
          SupplierId:
          <input
            type="number"
            name="supplierId"
            value={form.supplierId}
            onChange={handleChange}
            min={1}
          />
        </label>
      </div>

      <div>
        <label>
          Lote / Batch:
          <input
            type="text"
            name="batchNumber"
            value={form.batchNumber}
            onChange={handleChange}
          />
        </label>
      </div>

      <div>
        <label>
          Notas:
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
          />
        </label>
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Registrar lote"}
      </button>
    </form>
  );
}