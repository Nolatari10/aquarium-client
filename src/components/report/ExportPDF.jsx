import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { useTranslation } from 'react-i18next';
import { Button } from '@mantine/core';
import { formatLabel, formatCellValue } from '../../tools/format';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
    color: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottom: '2 solid #2563eb',
    paddingBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  companyName: {
    fontSize: 11,
    color: '#2563eb',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
  },
  subtitle: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 2,
  },
  dateLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 9,
    color: '#374151',
  },
  tableSection: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: '1 solid #e5e7eb',
  },
  table: {
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottom: '1 solid #d1d5db',
  },
  tableHeaderCell: {
    flex: 1,
    padding: 5,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    borderRight: '1 solid #d1d5db',
  },
  tableHeaderCellLast: {
    flex: 1,
    padding: 5,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5e7eb',
  },
  tableRowEven: {
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    flex: 1,
    padding: 5,
    fontSize: 8,
    color: '#4b5563',
    borderRight: '1 solid #e5e7eb',
  },
  tableCellLast: {
    flex: 1,
    padding: 5,
    fontSize: 8,
    color: '#4b5563',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: 16,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1 solid #e5e7eb',
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: '#9ca3af',
  },
});

function parseReportData(data, t) {
  const tables = [];
  const { tr } = useTranslation();
  for (const [key, value] of Object.entries(data)) {
    if (key === 'headers') continue;
    if (!Array.isArray(value)) continue;

    const formattedTitle = formatLabel(key, t);
    if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      const headerKeys = Object.keys(value[0]).filter((k) => !k.endsWith('Id'));

      tables.push({
        title: formattedTitle,
        headerKeys,
        headers: headerKeys.map((k) => formatLabel(k, t)),
        rows: value,
      });
    } else {
      tables.push({
        title: formattedTitle,
        headerKeys: [],
        headers: [],
        rows: [],
      });
    }
  }

  return { tables };
}

function ReportDocument({ title, subtitle, data, t, tenantName }) {
  const { tables } = parseReportData(data, t);
  const today = new Date().toLocaleDateString();

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>{tenantName || t('Aquarium Manager')}</Text>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.dateLabel}>{t('Date')}</Text>
            <Text style={styles.dateValue}>{today}</Text>
          </View>
        </View>

        {tables.map((table, tableIdx) => (
          <View key={tableIdx} style={styles.tableSection}>
            <Text style={styles.sectionTitle}>{table.title}</Text>
            {table.headerKeys.length === 0 ? (
              <Text style={styles.emptyText}>{t('No data available')}</Text>
            ) : (
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  {table.headers.map((h, hIdx) => (
                    <Text
                      key={hIdx}
                      style={
                        hIdx === table.headers.length - 1
                          ? styles.tableHeaderCellLast
                          : styles.tableHeaderCell
                      }
                    >
                      {h}
                    </Text>
                  ))}
                </View>
                {table.rows.map((row, rowIdx) => (
                  <View
                    key={rowIdx}
                    style={[
                      styles.tableRow,
                      rowIdx % 2 === 1 && styles.tableRowEven,
                    ]}
                  >
                    {table.headerKeys.map((key, colIdx) => (
                      <Text
                        key={colIdx}
                        style={
                          colIdx === table.headerKeys.length - 1
                            ? styles.tableCellLast
                            : styles.tableCell
                        }
                      >
                        {formatCellValue(row[key], key, t)}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <View fixed style={styles.footer}>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `${t('Page')} ${pageNumber} ${t('of')} ${totalPages}`
            }
          />
          <Text style={styles.footerText}>
            {t('Generated by Aquarium Manager')}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

function ExportPDF({ data, title, subtitle, fileName, tenantName }) {
  const { t } = useTranslation();

  return (
    <PDFDownloadLink
      document={<ReportDocument title={title} subtitle={subtitle} data={data} t={t} tenantName={tenantName} />}
      fileName={fileName}
    >
      {({ loading }) => (
        <Button loading={loading} variant="light" color="teal" size="sm">
          {t('Export PDF')}
        </Button>
      )}
    </PDFDownloadLink>
  );
}

export default ExportPDF;
