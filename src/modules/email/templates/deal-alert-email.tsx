import { Html, Head, Body, Section, Heading, Text, Button, Preview } from '@react-email/components';

export interface DealAlertEmailProps {
  dealTitle: string;
  contactName: string;
  stage: string;
  value: number;
  daysStale: number;
  tenantName: string;
  dealUrl?: string;
}

export const DealAlertEmail = ({ dealTitle, contactName, stage, value, daysStale, tenantName, dealUrl = '#' }: DealAlertEmailProps) => {
  return (
    <>
      <Preview>Negociación estancada: {dealTitle}</Preview>
      <Html>
        <Head />
        <Body style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
          <Section style={{ padding: '20px' }}>
            <Heading as="h2" style={{ color: '#d97706' }}>⚠️ Negociación sin movimiento</Heading>
            <Text>Hola,</Text>
            <Text>
              La negociación <strong>{dealTitle}</strong> de <strong>{contactName}</strong> lleva
              <strong> {daysStale} días</strong> sin actividad en la etapa <strong>{stage}</strong>.
            </Text>
            <Section style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', margin: '20px 0' }}>
              <Text style={{ margin: '0' }}>
                <strong>Valor:</strong> ${value.toFixed(2)}<br />
                <strong>Etapa actual:</strong> {stage}<br />
                <strong>Días sin actividad:</strong> {daysStale}
              </Text>
            </Section>
            <Button href={dealUrl} style={{ backgroundColor: '#d97706', color: '#ffffff', padding: '12px 24px', borderRadius: '4px', textDecoration: 'none' }}>
              Ver negociación
            </Button>
            <Text style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
              Recibes esta alerta de {tenantName} porque la negociación supera el tiempo máximo
              configurado en esta etapa del pipeline.
            </Text>
          </Section>
        </Body>
      </Html>
    </>
  );
};
