// ExportPDF.jsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink, Image
} from "@react-pdf/renderer";
import { useTranslation } from 'react-i18next';
import { Button } from '@mantine/core'; // O el botón que estés usando
// IMPORTA el botón de donde lo estés usando (ej: antd, MUI, tu propio botón)

const styles = StyleSheet.create({
  page: { padding: 20 },
  section: { marginBottom: 10 },
  header: { flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
            marginBottom: 20,
            borderBottom: "1 solid #ccc",
    paddingBottom: 10,},
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  metaInfo: {
    fontSize: 9,
    color: "#666",
  },
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
  },
  tableHeaderCell: {
    flex: 1,
    padding: 6,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  tableCell: {
    flex: 1,
    padding: 6,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    fontSize: 8,
    color: "#999",
    textAlign: "center",
    borderTop: "1 solid #eee",
    paddingTop: 5,
  },
});

// 1) Componente que define el contenido del PDF
function StockReportDocument({ data, headers, t }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.header}>
        <View style={styles.section}>
          <Text>{t("reportTitle")}</Text>
          <Text style={styles.metaInfo}>{t("reportMetaInfo")}</Text>
        </View>

        {/* Ejemplo: recorrer headers y data si quieres */}
        
        <View style={styles.section}>
          {headers.map((h) => (
            <Text key={h.key}>{h.label}</Text>
          ))}
        </View>
        {/* TABLA */}
        <View style={styles.table}>
          {/* Encabezados */}
          <View style={styles.tableHeader}>
            {headers.map((h) => (
              <Text key={h.key} style={styles.tableHeaderCell}>
                {h.label}
              </Text>
            ))}
          </View>

          {/* Filas */}
          {data.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              {headers.map((h) => (
                <Text key={h.key} style={styles.tableCell}>
                  {String(item[h.key] ?? "")}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

// 2) Componente que muestra el botón y usa PDFDownloadLink
function ExportPDF({ data, fileName, headers }) {

  const { t, i18n} = useTranslation();

  return (
    <PDFDownloadLink
      document={<StockReportDocument data={data} headers={headers} t={t} />}
      fileName={fileName}
    >
      {({ loading }) => (
        <Button loading={loading}>
          {t("Export PDF")}
        </Button>
      )}
    </PDFDownloadLink>
  );
}

export default ExportPDF;