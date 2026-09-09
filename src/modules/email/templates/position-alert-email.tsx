import { Html, Head, Body, Section, Heading, Text, Button, Preview } from '@react-email/components';

export interface PositionAlertEmailProps {
  productName: string;
  currentStock: number;
  minStock: number;
  unit: string;
  tenantName: string;
  productUrl?: string;
}

export const PositionAlertEmail = ({
  productName,
  currentStock,
  minStock,
  unit,
  tenantName,
  productUrl = '#',
}: PositionAlertEmailProps) => {
  return (
    <>
      <Preview>Stock bajo: {productName}</Preview>
      <Html>
        <Head />
        <Body style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
          <Section style={{ padding: '20px' }}>
            <Heading as="h2" style={{ color: '#dc2626' }}>🔴 Alerta de stock bajo</Heading>
            <Text>Hola,</Text>
            <Text>
              El producto <strong>{productName}</strong> ha caído por debajo del stock mínimo
              en {tenantName}.
            </Text>
            <Section style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '8px', margin: '20px 0', border: '1px solid #fecaca' }}>
              <Text style={{ margin: '0' }}>
                <strong>Stock actual:</strong> {currentStock} {unit}<br />
                <strong>Stock mínimo:</strong> {minStock} {unit}<br />
                <strong>Déficit:</strong> {Math.max(0, minStock - currentStock)} {unit}
              </Text>
            </Section>
            <Button href={productUrl} style={{ backgroundColor: '#dc2626', color: '#ffffff', padding: '12px 24px', borderRadius: '4px', textDecoration: 'none' }}>
              Ver producto
            </Button>
            <Text style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
              Te recomendamos generar una orden de compra para reposicionar el inventario
              antes de que se agote completamente.
            </Text>
          </Section>
        </Body>
      </Html>
    </>
  );
};
