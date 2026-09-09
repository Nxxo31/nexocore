import { Html, Head, Body, Section, Heading, Text, Button, Preview } from '@react-email/components';

export const PasswordResetEmail = ({ resetUrl, tenantName }: { resetUrl: string; tenantName: string }) => {
  return (
    <>
      <Preview>Restablece tu contraseña en {tenantName}</Preview>
      <Html>
        <Head />
        <Body style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
          <Section style={{ padding: '20px', textAlign: 'center' }}>
            <Heading>Restablece tu contraseña</Heading>
            <Text>Hola,</Text>
            <Text>
              Has solicitado restablecer tu contraseña en {tenantName}. Haz clic en el botón de abajo para establecer una nueva contraseña:
            </Text>
            <Button href={resetUrl} style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '12px 24px', borderRadius: '4px', textDecoration: 'none' }}>
              Restablecer contraseña
            </Button>
            <Text style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
              Este enlace expirará en 1 hora. Si no solicitaste este cambio, ignora este correo.
            </Text>
          </Section>
        </Body>
      </Html>
    </>
  );
};