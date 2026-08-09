import { Html, Head, Body, Section, Heading, Text, Button, Preview } from '@react-email/components';

export const WelcomeEmail = ({ userName, tenantName }: { userName: string; tenantName: string }) => {
  return (
    <>
      <Preview>Bienvenido a {tenantName}</Preview>
      <Html>
        <Head />
        <Body style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
          <Section style={{ padding: '20px', textAlign: 'center' }}>
            <Heading>Bienvenido a {tenantName}</Heading>
            <Text>Hola {userName},</Text>
            <Text>
              Estamos emocionados de que te hayas unido a {tenantName}. Tu cuenta ha sido creada exitosamente.
            </Text>
            <Button href="#" style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '12px 24px', borderRadius: '4px', textDecoration: 'none' }}>
              Iniciar sesión
            </Button>
            <Text style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
              Si tienes alguna pregunta, no dudes en contactarnos.
            </Text>
          </Section>
        </Body>
      </Html>
    </>
  );
};