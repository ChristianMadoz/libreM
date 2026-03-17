/**
 * Verificar configuración de autenticación de InsForge
 */

const BASE_URL = 'https://ciyndj73.us-east.insforge.app';

async function checkAuthConfig() {
    console.log('🔍 Verificando configuración de auth...\n');

    try {
        // Endpoint público - no requiere auth
        const response = await fetch(`${BASE_URL}/api/auth/public-config`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const config = await response.json();

        console.log('📋 Configuración de Auth:\n');
        console.log(`  requireEmailVerification: ${config.requireEmailVerification}`);
        console.log(`  passwordMinLength: ${config.passwordMinLength}`);
        console.log(`  verifyEmailMethod: ${config.verifyEmailMethod}`);
        console.log(`  resetPasswordMethod: ${config.resetPasswordMethod}`);
        
        console.log('\n🔐 OAuth Providers habilitados:');
        if (config.oAuthProviders && config.oAuthProviders.length > 0) {
            config.oAuthProviders.forEach(provider => {
                console.log(`    ✓ ${provider}`);
            });
        } else {
            console.log('    (ninguno configurado)');
        }

        console.log('\n💡 Recomendaciones:');
        
        if (config.requireEmailVerification) {
            console.log('  • El registro requiere verificación por email');
            console.log(`  • Método: ${config.verifyEmailMethod === 'code' ? 'Código OTP de 6 dígitos' : 'Magic link'}`);
        } else {
            console.log('  • El registro NO requiere verificación (login inmediato)');
        }

        if (config.oAuthProviders?.includes('google')) {
            console.log('  • Google OAuth está habilitado - mostrar botón en login');
        }

        return config;

    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

checkAuthConfig();
