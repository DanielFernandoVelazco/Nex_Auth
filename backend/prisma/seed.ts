import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL no definido');

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Iniciando seed...');

    // 1. Organización
    const org = await prisma.organization.upsert({
        where: { slug: 'acme-corp' },
        update: {},
        create: {
            name: 'Acme Corp',
            slug: 'acme-corp',
            domain: 'acme.com',
        },
    });
    console.log('✓ Organización:', org.slug);

    // 2. Permisos base
    const permissionData = [
        { resource: 'users', action: 'read', description: 'Ver usuarios' },
        { resource: 'users', action: 'write', description: 'Crear/editar usuarios' },
        { resource: 'users', action: 'delete', description: 'Eliminar usuarios' },
        { resource: 'applications', action: 'read', description: 'Ver aplicaciones' },
        { resource: 'applications', action: 'write', description: 'Crear/editar aplicaciones' },
        { resource: 'roles', action: 'read', description: 'Ver roles' },
        { resource: 'roles', action: 'write', description: 'Crear/editar roles' },
        { resource: 'permissions', action: 'read', description: 'Ver permisos' },
        { resource: 'audit-logs', action: 'read', description: 'Ver audit logs' },
        { resource: 'api-keys', action: 'read', description: 'Ver API keys' },
        { resource: 'api-keys', action: 'write', description: 'Crear/rotar API keys' },
        { resource: 'sessions', action: 'read', description: 'Ver sesiones' },
        { resource: 'sessions', action: 'revoke', description: 'Revocar sesiones' },
    ];

    const permissions = await Promise.all(
        permissionData.map(p =>
            prisma.permission.upsert({
                where: { resource_action: { resource: p.resource, action: p.action } },
                update: {},
                create: p,
            })
        )
    );
    console.log(`✓ ${permissions.length} permisos creados`);

    // 3. Rol Security Admin con todos los permisos
    const adminRole = await prisma.role.upsert({
        where: { name_organizationId: { name: 'Security Admin', organizationId: org.id } },
        update: {},
        create: {
            name: 'Security Admin',
            description: 'Acceso completo al tenant',
            organizationId: org.id,
            isSystem: false,
            permissions: {
                create: permissions.map(p => ({ permissionId: p.id })),
            },
        },
    });
    console.log('✓ Rol:', adminRole.name);

    // 4. Usuario admin
    const passwordHash = await bcrypt.hash('admin123', 10);
    const user = await prisma.user.upsert({
        where: { email: 'sofia.alarcon@acme.com' },
        update: { passwordHash },
        create: {
            email: 'sofia.alarcon@acme.com',
            passwordHash,
            name: 'Sofia Alarcón',
            isActive: true,
        },
    });
    console.log('✓ Usuario:', user.email);

    // 5. Membership
    await prisma.userOrganization.upsert({
        where: { userId_organizationId: { userId: user.id, organizationId: org.id } },
        update: { roleId: adminRole.id },
        create: {
            userId: user.id,
            organizationId: org.id,
            roleId: adminRole.id,
        },
    });
    console.log('✓ Membership creado');

    // 6. Aplicaciones de ejemplo
    const appsData = [
        {
            name: 'Acme Web Portal',
            subtitle: 'SPA · React / Next.js',
            icon: 'web',
            type: 'spa',
            domainValue: 'https://app.acme.com',
            clientId: 'app_clnt_8f92a10b48e3',
        },
        {
            name: 'Acme Mobile App',
            subtitle: 'Native PKCE · iOS/Android',
            icon: 'smartphone',
            type: 'native',
            domainValue: 'acmeapp://auth/callback',
            clientId: 'app_clnt_91ba73c1d904',
        },
        {
            name: 'Billing Microservice',
            subtitle: 'Machine-to-Machine',
            icon: 'dns',
            type: 'm2m',
            domainValue: 'read:invoices · write:charges',
            clientId: 'm2m_srv_44a9e201b2ff',
        },
    ];

    for (const app of appsData) {
        await prisma.application.upsert({
            where: { clientId: app.clientId },
            update: {},
            create: {
                ...app,
                iconColor: 'primary',
                status: 'active',
                statusLabel: 'Activa',
                domainLabel: 'Dominio Principal',
                domainIcon: 'lock',
                metricLabel: 'Logins (24h)',
                metricValue: '0',
                organizationId: org.id,
            },
        });
    }
    console.log(`✓ ${appsData.length} aplicaciones creadas`);

    console.log('\n🎉 SEED COMPLETADO\n');
    console.log('📧 Login: sofia.alarcon@acme.com');
    console.log('🔑 Password: admin123');
    console.log('🏢 Tenant: acme-corp\n');
}

main()
    .catch((e) => {
        console.error('❌ Error en seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });