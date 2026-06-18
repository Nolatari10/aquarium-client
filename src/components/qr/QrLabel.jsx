import { Card, Stack, Text, Button } from "@mantine/core";
import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useReactToPrint } from "react-to-print";
import { useTranslation } from "react-i18next";
function QrLabel({ title, value, subtitle }) {
  const printRef = useRef(null);
  const { t } = useTranslation();
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: title || "QR Code",
        
    });

    return (
        <>
      <Card withBorder radius="md" padding="md">
        <Stack align="center" gap="sm">
          <Text fw={600}>{title}</Text>

          <QRCodeSVG value={value} size={180} />

          {subtitle ? (
            <Text size="sm" c="dimmed" ta="center">
              {subtitle}
            </Text>
          ) : null}

          <Button onClick={handlePrint} variant="light">
            {t("Print QR Label")}
          </Button>
        </Stack>
      </Card>

      <div style={{ display: "none" }}>
        <div ref={printRef} className="qr-print-card">
          <Stack align="center" gap="sm">
            <Text fw={600}>{title}</Text>
            <QRCodeSVG value={value} size={180} />
            {subtitle ? (
              <Text size="sm" ta="center">
                {subtitle}
              </Text>
            ) : null}
          </Stack>
        </div>
      </div>
    </>
  );
}

export default QrLabel;