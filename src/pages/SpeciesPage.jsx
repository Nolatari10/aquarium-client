import { useState, useEffect, useRef } from 'react';
import { Button, Table, Modal, TextInput, Select, Group, Text, ActionIcon, Box, Stack, Badge, Paper, Checkbox, Pagination, Loader } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconFileImport, IconUpload, IconTrashX } from '@tabler/icons-react';
import { speciesApi } from '../api/species';
import { useTranslation } from 'react-i18next';

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  const parseRow = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
      else { current += ch; }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/[^a-z]/g, ''));
  const rows = lines.slice(1).map(l => parseRow(l));
  return { headers, rows };
}

function mapCSVRow(headers, row) {
  const get = (names) => {
    for (const n of names) {
      const idx = headers.indexOf(n);
      if (idx >= 0 && idx < row.length && row[idx]) return row[idx];
    }
    return '';
  };

  const parseNum = (v) => { const n = parseFloat(v); return isNaN(n) ? null : n; };

  return {
    CommonName: get(['commonname', 'name']),
    ScientificName: get(['scientificname', 'scientific_name']),
    Category: get(['category', 'type']) || 'Other',
    MinTemperature: parseNum(get(['mintemperature', 'min_temp', 'mintemp'])),
    MaxTemperature: parseNum(get(['maxtemperature', 'max_temp', 'maxtemp'])),
    MinPH: parseNum(get(['minph', 'min_ph'])),
    MaxPH: parseNum(get(['maxph', 'max_ph'])),
    ImageUrl: get(['imageurl', 'image_url', 'image']),
    Type: get(['type_name', 'typename']),
    Variety: get(['variety']),
    Notes: get(['notes', 'description']),
    CompatibilityNotes: get(['compatibilitynotes', 'compatibility_notes', 'compatibility']),
  };
}

function parseJSONFile(text) {
  try {
    const data = JSON.parse(text);
    const arr = Array.isArray(data) ? data : (data.Species || data.species || [data]);
    return arr.map(item => ({
      CommonName: item.CommonName || item.commonName || item.Name || item.name || '',
      ScientificName: item.ScientificName || item.scientificName || item.scientific_name || '',
      Category: item.Category || item.category || item.Type || item.type || 'Other',
      MinTemperature: item.MinTemperature ?? item.minTemperature ?? item.min_temp ?? null,
      MaxTemperature: item.MaxTemperature ?? item.maxTemperature ?? item.max_temp ?? null,
      MinPH: item.MinPH ?? item.minPH ?? item.min_ph ?? null,
      MaxPH: item.MaxPH ?? item.maxPH ?? item.max_ph ?? null,
      ImageUrl: item.ImageUrl || item.imageUrl || item.image_url || item.image || '',
      Type: item.Type || item.type || '',
      Variety: item.Variety || item.variety || '',
      Notes: item.Notes || item.notes || item.description || '',
      CompatibilityNotes: item.CompatibilityNotes || item.compatibilityNotes || item.compatibility_notes || '',
    }));
  } catch {
    return null;
  }
}

function SpeciesPage() {
  const { t } = useTranslation();
  const [species, setSpecies] = useState([]);
  const [filteredSpecies, setFilteredSpecies] = useState([]);
  const [editingSpecies, setEditingSpecies] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;
  const [search, setSearch] = useState('');
  const [opened, { open, close }] = useDisclosure(false);
  const [importOpened, { open: openImport, close: closeImport }] = useDisclosure(false);
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const [importFileName, setImportFileName] = useState('');
  const fileInputRef = useRef(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteOpened, { open: openBulkDelete, close: closeBulkDelete }] = useDisclosure(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    CommonName: '',
    ScientificName: '',
    Category: 'Fish',
    MinTemperature: 0,
    MaxTemperature: 0,
    MinPH: 0,
    MaxPH: 0,
    ImageUrl: ''
  });

  useEffect(() => { loadSpecies(page); }, [page]);

  useEffect(() => {
    const term = search.toLowerCase();
    setFilteredSpecies(species.filter(s =>
      s.CommonName?.toLowerCase().includes(term) ||
      s.ScientificName?.toLowerCase().includes(term) ||
      s.Category?.toLowerCase().includes(term)
    ));
  }, [search, species]);

  const loadSpecies = async (p) => {
    try {
      setListLoading(true);
      const response = await speciesApi.getAll(p, pageSize);
      const data = response.data;
      setSpecies(data.Items || []);
      setFilteredSpecies(data.Items || []);
      setTotalPages(data.TotalPages || 1);
    } catch {
      notifications.show({ title: t('Error'), message: t('Failed to load species'), color: 'red' });
    } finally {
      setListLoading(false);
    }
  };

  const refreshSpecies = () => { setPage(1); loadSpecies(1); };

  const handlePageChange = (p) => {
    setPage(p);
    setSelectedIds([]);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const visibleIds = filteredSpecies.map(s => s.Id);
    setSelectedIds(selectedIds.length === visibleIds.length ? [] : visibleIds);
  };

  const handleBulkDelete = async () => {
    try {
      setDeleting(true);
      const response = await speciesApi.bulkDelete(selectedIds);
      notifications.show({
        title: 'Deleted',
        message: `${response.data.Deleted} species removed`,
        color: 'green'
      });
      closeBulkDelete();
      refreshSpecies;
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to delete species', color: 'red' });
    } finally { setDeleting(false); }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const isCSV = file.name.endsWith('.csv');
      let parsed;

      if (isCSV) {
        const { headers, rows } = parseCSV(text);
        if (headers.length === 0 || rows.length === 0) {
          notifications.show({ title: 'Error', message: 'Empty or invalid CSV file', color: 'red' });
          return;
        }
        parsed = rows.map(row => mapCSVRow(headers, row)).filter(r => r.CommonName);
      } else {
        parsed = parseJSONFile(text);
        if (!parsed) {
          notifications.show({ title: 'Error', message: 'Invalid JSON file — expected an array of species objects', color: 'red' });
          return;
        }
        parsed = parsed.filter(r => r.CommonName);
      }

      if (parsed.length === 0) {
        notifications.show({ title: 'Error', message: 'No valid species found in file', color: 'red' });
        return;
      }

      setPreviewData(parsed);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;
    try {
      setImporting(true);
      const response = await speciesApi.bulkImport(previewData);
      setImportResult(response.data);
      notifications.show({
        title: 'Import complete',
        message: `${response.data.Created} created, ${response.data.Skipped} skipped`,
        color: response.data.Skipped > 0 ? 'yellow' : 'green'
      });
      setPage(1);
      loadSpecies(1);
    } catch (e) {
      notifications.show({
        title: 'Error',
        message: e.response?.data || 'Import failed',
        color: 'red'
      });
    } finally {
      setImporting(false);
    }
  };

  const handleCloseImport = () => {
    closeImport();
    setPreviewData([]);
    setImportResult(null);
    setImportFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (editingSpecies) {
        await speciesApi.update(editingSpecies.Id, formData);
        notifications.show({ title: 'Success', message: t('Species updated'), color: 'green' });
      } else {
        await speciesApi.create(formData);
        notifications.show({ title: 'Success', message: t('Species created'), color: 'green' });
      }
      close();
      resetForm();
      refreshSpecies;
    } catch (e) {
      notifications.show({ title: 'Error', message: e.response?.data?.ErrorMessage || t('Operation failed'), color: 'red' });
    } finally { setLoading(false); }
  };

  const handleEdit = (item) => {
    setEditingSpecies(item);
    setFormData({
      CommonName: item.CommonName || '',
      ScientificName: item.ScientificName || '',
      Category: item.Category || 'Fish',
      MinTemperature: item.MinTemperature || 0,
      MaxTemperature: item.MaxTemperature || 0,
      MinPH: item.MinPH || 0,
      MaxPH: item.MaxPH || 0,
      ImageUrl: item.ImageUrl || ''
    });
    open();
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this species?')) return;
    try {
      await speciesApi.delete(id);
      notifications.show({ title: 'Success', message: t('Species deleted'), color: 'green' });
      refreshSpecies;
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to delete species', color: 'red' });
    }
  };

  const resetForm = () => {
    setEditingSpecies(null);
    setFormData({
      CommonName: '', ScientificName: '', Category: 'Fish',
      MinTemperature: 0, MaxTemperature: 0, MinPH: 0, MaxPH: 0, ImageUrl: ''
    });
  };

  const rows = filteredSpecies.map((item) => (
    <Table.Tr key={item.Id} bg={selectedIds.includes(item.Id) ? 'blue.0' : undefined}>
      <Table.Td>
        <Checkbox
          checked={selectedIds.includes(item.Id)}
          onChange={() => toggleSelect(item.Id)}
          aria-label={`Select ${item.CommonName}`}
        />
      </Table.Td>
      <Table.Td fw={500}>{item.CommonName}</Table.Td>
      <Table.Td><Text size="sm" fs="italic">{item.ScientificName}</Text></Table.Td>
      <Table.Td><Text size="sm" fs="italic">{item.Variety}</Text></Table.Td>
      <Table.Td><Badge variant="light" size="sm">{item.Category}</Badge></Table.Td>
      <Table.Td>{item.MinTemperature} - {item.MaxTemperature}°C</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(item)}><IconEdit size={18} /></ActionIcon>
          <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(item.Id)}><IconTrash size={18} /></ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box>
      <Group justify="space-between" mb="lg">
        <Box>
          <Text size="xl" fw={700}>{t('Species Management')}</Text>
          <Text size="sm" c="dimmed">{filteredSpecies.length} {t('species in catalog')}</Text>
        </Box>
        <Group gap="sm">
          {selectedIds.length > 0 && (
            <Button color="red" variant="outline" leftSection={<IconTrashX size={16} />} onClick={openBulkDelete}>
              {t('Delete Selected')} ({selectedIds.length})
            </Button>
          )}
          <Button variant="default" leftSection={<IconFileImport size={16} />} onClick={openImport}>
            {t('Import')}
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={() => { resetForm(); open(); }}>
            {t('Add Species')}
          </Button>
        </Group>
      </Group>

      <TextInput
        placeholder={t('Search species...')}
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mb="lg"
        style={{ maxWidth: 320 }}
      />

      {filteredSpecies.length > 0 ? (
        <>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={40}>
                <Checkbox
                  checked={filteredSpecies.length > 0 && selectedIds.length === filteredSpecies.length}
                  indeterminate={selectedIds.length > 0 && selectedIds.length < filteredSpecies.length}
                  onChange={toggleSelectAll}
                  aria-label={t('Select all')}
                />
              </Table.Th>
              <Table.Th>{t('Common Name')}</Table.Th>
              <Table.Th>{t('Scientific Name')}</Table.Th>
              <Table.Th>{t('Variety')}</Table.Th>  
              <Table.Th>{t('Category')}</Table.Th>
              <Table.Th>{t('Temperature')}</Table.Th>
              <Table.Th>{t('Actions')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
        {!listLoading && (
          <Group justify="center" mt="md">
            <Pagination total={totalPages} value={page} onChange={handlePageChange} />
          </Group>
        )}
        </>
      ) : listLoading ? (
        <Stack align="center" py="xl"><Loader /></Stack>
      ) : (
        <Stack align="center" py="xl">
          <Text c="dimmed">{t('No species found')}</Text>
          <Group>
            <Button variant="light" onClick={openImport} leftSection={<IconFileImport size={16} />}>{t('Import')} species</Button>
            <Button variant="light" onClick={() => { resetForm(); open(); }} leftSection={<IconPlus size={16} />}>{t('Add your first species')}</Button>
          </Group>
        </Stack>
      )}

      <Modal opened={opened} onClose={close} title={editingSpecies ? t('Edit Species') : t('Add Species')} size="md">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <Stack gap="sm">
            <TextInput label={t('Common Name')} required value={formData.CommonName} onChange={(e) => setFormData({ ...formData, CommonName: e.target.value })} />
            <TextInput label={t('Scientific Name')} required value={formData.ScientificName} onChange={(e) => setFormData({ ...formData, ScientificName: e.target.value })} />
            <TextInput label={t('Variety')} value={formData.Variety} onChange={(e) => setFormData({ ...formData, Variety: e.target.value })} />
            <Select label={t('Category')} value={formData.Category} onChange={(value) => setFormData({ ...formData, Category: value })} data={['Fish', 'Invertebrate', 'Plant', 'Coral', 'Other']} />
            <Group grow>
              <TextInput label="Min Temp (°C)" type="number" step="0.1" value={formData.MinTemperature} onChange={(e) => setFormData({ ...formData, MinTemperature: parseFloat(e.target.value) })} />
              <TextInput label="Max Temp (°C)" type="number" step="0.1" value={formData.MaxTemperature} onChange={(e) => setFormData({ ...formData, MaxTemperature: parseFloat(e.target.value) })} />
            </Group>
            <Group grow>
              <TextInput label="Min pH" type="number" step="0.1" value={formData.MinPH} onChange={(e) => setFormData({ ...formData, MinPH: parseFloat(e.target.value) })} />
              <TextInput label="Max pH" type="number" step="0.1" value={formData.MaxPH} onChange={(e) => setFormData({ ...formData, MaxPH: parseFloat(e.target.value) })} />
            </Group>
            <TextInput label="Image URL" value={formData.ImageUrl} onChange={(e) => setFormData({ ...formData, ImageUrl: e.target.value })} />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={close} disabled={loading}>{t('Cancel')}</Button>
              <Button type="submit" loading={loading}>{editingSpecies ? t('Update') : t('Create')}</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal opened={importOpened} onClose={handleCloseImport} title="{t('Import')} Species" size="lg">
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Upload a JSON or CSV file with species data. CSV must have a header row with column names.
          </Text>

          {!previewData.length && !importResult && (
            <Paper p="lg" withBorder>
              <Stack align="center" gap="md">
                <IconUpload size={32} style={{ color: 'var(--mantine-color-gray-5)' }} />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id="species-file-input"
                />
                <Button component="label" htmlFor="species-file-input" variant="light" leftSection={<IconFileImport size={16} />}>
                  Choose File (.json or .csv)
                </Button>
                <Text size="xs" c="dimmed">JSON: array of species objects. CSV: columns CommonName, ScientificName, {t('Variety')}, {t('Category')}, Min{t('Temperature')}, Max{t('Temperature')}, MinPH, MaxPH, ImageUrl</Text>
              </Stack>
            </Paper>
          )}

          {importFileName && !importResult && (
            <Paper p="sm" withBorder>
              <Group gap="xs">
                <Text size="sm" fw={500}>{importFileName}</Text>
                <Badge size="sm" variant="light">{previewData.length} species</Badge>
              </Group>
            </Paper>
          )}

          {previewData.length > 0 && !importResult && (
            <Box style={{ maxHeight: 300, overflowY: 'auto' }}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('Common Name')}</Table.Th>
                    <Table.Th>{t('Scientific Name')}</Table.Th>
                    <Table.Th>{t('Variety')}</Table.Th>
                    <Table.Th>{t('Category')}</Table.Th>
                    <Table.Th>Temp (°C)</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {previewData.map((item, idx) => (
                    <Table.Tr key={idx}>
                      <Table.Td fw={500}>{item.CommonName}</Table.Td>
                      <Table.Td><Text size="sm" fs="italic">{item.ScientificName || '—'}</Text></Table.Td>
                      <Table.Td><Text size="sm" fs="italic">{item.Variety || '—'}</Text></Table.Td>
                      <Table.Td><Badge variant="light" size="sm">{item.Category}</Badge></Table.Td>
                      <Table.Td>{item.MinTemperature != null ? `${item.MinTemperature} - ${item.MaxTemperature}` : '—'}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
          )}

          {importResult && (
            <Paper p="md" withBorder>
              <Stack gap="xs">
                <Group gap="md">
                  <Badge color="teal" size="lg">Total: {importResult.TotalProcessed}</Badge>
                  <Badge color="green" size="lg">Created: {importResult.Created}</Badge>
                  {importResult.Skipped > 0 && <Badge color="orange" size="lg">Skipped: {importResult.Skipped}</Badge>}
                </Group>
                {importResult.Errors?.length > 0 && (
                  <Paper p="sm" withBorder bg="red.0">
                    <Stack gap={4}>
                      <Text size="sm" fw={600} c="red.7">Errors:</Text>
                      {importResult.Errors.map((err, idx) => (
                        <Text key={idx} size="xs" c="red.7">{err}</Text>
                      ))}
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </Paper>
          )}

          <Group justify="space-between">
            <Button variant="default" onClick={handleCloseImport}>Close</Button>
            {previewData.length > 0 && !importResult && (
              <Button onClick={handleImport} loading={importing} leftSection={<IconUpload size={16} />}>
                {t('Import')} {previewData.length} species
              </Button>
            )}
            {importResult && (
              <Button variant="light" onClick={() => { setPreviewData([]); setImportResult(null); setImportFileName(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                {t('Import')} Another File
              </Button>
            )}
          </Group>
        </Stack>
      </Modal>

      <Modal opened={bulkDeleteOpened} onClose={closeBulkDelete} title={t('Delete Selected Species')} size="sm">
        <Stack gap="md">
          <Text>
            Are you sure you want to delete <strong>{selectedIds.length}</strong> species? This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={closeBulkDelete} disabled={deleting}>Cancel</Button>
            <Button color="red" onClick={handleBulkDelete} loading={deleting} leftSection={<IconTrash size={16} />}>
              Delete {selectedIds.length} Species
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}

export default SpeciesPage;
