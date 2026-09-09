import { Html, Head, Body, Section, Heading, Text, Button, Preview } from '@react-email/components';

export const InvoiceEmail = ({ invoiceNumber, amount, dueDate, tenantName }: { invoiceNumber: string; amount: number; dueDate: string; tenantName: string }) => {
  return (
    <>
      <Preview>Factura {invoiceNumber} - {tenantName}</Preview>
      <Html>
        <Head />
        <Body style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
          <Section style={{ padding: '20px', textAlign: 'center' }}>
            <Heading>Factura {invoiceNumber}</Heading>
            <Text>Hola,</Text>
            <Text>
              Adjuntamos la factura {invoiceNumber} por un monto de ${amount.toFixed(2)} con vencimiento el {dueDate}.
            </Text>
            <Button href="#" style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '12px 24px', borderRadius: '4px', textDecoration: 'none' }}>
              Ver factura
            </Button>
            <Text style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
              Si tienes alguna pregunta sobre esta factura, contacta a nuestro departamento de cuentas por cobrar.
            </Text>
          </Section>
        </Body>
      </Html>
    </>
  );
};