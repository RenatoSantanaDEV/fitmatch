import {
  AvailabilityRecurrence,
  ExperienceLevel,
  PrismaClient,
  SessionModality,
  SpecializationType,
  UserRole,
} from '@prisma/client';
import { hashSync } from 'bcryptjs';

const prisma = new PrismaClient();
const SEED_PASSWORD_HASH = hashSync('seed-password-123', 10);

async function main() {
  console.log('Seeding FitMatch prototype data...');

  const studentUser = await prisma.user.upsert({
    where: { email: 'aluno@fitmatch.dev' },
    update: {},
    create: {
      email: 'aluno@fitmatch.dev',
      name: 'Renato Almeida',
      passwordHash: SEED_PASSWORD_HASH,
      phone: '+5511999990001',
      role: UserRole.STUDENT,
    },
  });

  const student = await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      fitnessGoals: ['emagrecimento', 'condicionamento cardiovascular'],
      experienceLevel: ExperienceLevel.INTERMEDIATE,
      preferredModality: SessionModality.HYBRID,
      preferredSpecializations: [
        SpecializationType.PERSONAL_TRAINING,
        SpecializationType.FUNCTIONAL_TRAINING,
      ],
      bio: 'Aluno intermediário querendo perder 6kg em 4 meses e melhorar condicionamento.',
      locationCity: 'São Paulo',
      locationState: 'SP',
      locationCountry: 'Brasil',
      locationPostal: '01310-100',
      budgetMin: 100,
      budgetMax: 250,
      budgetCurrency: 'BRL',
    },
  });

  // --- Professionals ------------------------------------------------------
  const professionals: ProfessionalSeed[] = [
    {
      email: 'ana.personal@fitmatch.dev',
      name: 'Ana Martins',
      bio: 'Personal trainer com foco em emagrecimento e condicionamento. Treinos presenciais em SP e online.',
      specializations: [
        SpecializationType.PERSONAL_TRAINING,
        SpecializationType.FUNCTIONAL_TRAINING,
      ],
      modalities: [SessionModality.IN_PERSON, SessionModality.ONLINE, SessionModality.HYBRID],
      yearsExperience: 8,
      averageRating: 4.9,
      totalReviews: 87,
      priceMin: 120,
      priceMax: 180,
      city: 'São Paulo',
      state: 'SP',
      isVerified: true,
    },
    {
      email: 'rafael.crossfit@fitmatch.dev',
      name: 'Rafael Souza',
      bio: 'Coach de CrossFit e treinamento funcional, 12 anos de box. Aulas presenciais em SP zona oeste.',
      specializations: [SpecializationType.CROSSFIT, SpecializationType.FUNCTIONAL_TRAINING],
      modalities: [SessionModality.IN_PERSON],
      yearsExperience: 12,
      averageRating: 4.7,
      totalReviews: 120,
      priceMin: 150,
      priceMax: 220,
      city: 'São Paulo',
      state: 'SP',
      isVerified: true,
    },
    {
      email: 'paula.online@fitmatch.dev',
      name: 'Paula Ribeiro',
      bio: 'Personal online para alunos intermediários. Programas individualizados e acompanhamento por app.',
      specializations: [
        SpecializationType.PERSONAL_TRAINING,
        SpecializationType.NUTRITION_COACHING,
      ],
      modalities: [SessionModality.ONLINE],
      yearsExperience: 5,
      averageRating: 4.8,
      totalReviews: 42,
      priceMin: 90,
      priceMax: 140,
      city: 'Curitiba',
      state: 'PR',
      isVerified: true,
    },
    {
      email: 'joao.yoga@fitmatch.dev',
      name: 'João Pereira',
      bio: 'Professor de Yoga e Meditação, aulas online e híbridas. Foco em redução de estresse e flexibilidade.',
      specializations: [SpecializationType.YOGA, SpecializationType.MEDITATION],
      modalities: [SessionModality.ONLINE, SessionModality.HYBRID],
      yearsExperience: 10,
      averageRating: 4.95,
      totalReviews: 210,
      priceMin: 80,
      priceMax: 130,
      city: 'Belo Horizonte',
      state: 'MG',
      isVerified: true,
    },
    {
      email: 'carla.pilates@fitmatch.dev',
      name: 'Carla Nogueira',
      bio: 'Pilates clínico e reabilitação postural. Atende presencialmente no Rio de Janeiro.',
      specializations: [SpecializationType.PILATES, SpecializationType.REHABILITATION],
      modalities: [SessionModality.IN_PERSON, SessionModality.HYBRID],
      yearsExperience: 14,
      averageRating: 4.85,
      totalReviews: 98,
      priceMin: 140,
      priceMax: 200,
      city: 'Rio de Janeiro',
      state: 'RJ',
      isVerified: true,
    },
    {
      email: 'marcos.muaythai@fitmatch.dev',
      name: 'Marcos Lima',
      bio: 'Faixa preta de Muay Thai competitivo, 15 anos. Aulas presenciais em SP para iniciantes e avançados.',
      specializations: [SpecializationType.MARTIAL_ARTS],
      modalities: [SessionModality.IN_PERSON],
      yearsExperience: 15,
      averageRating: 4.6,
      totalReviews: 55,
      priceMin: 160,
      priceMax: 240,
      city: 'São Paulo',
      state: 'SP',
      isVerified: false,
    },
  ];

  for (const p of professionals) {
    await upsertProfessional(p);
  }

  console.log('\nSeed concluído.');
  console.log(`Student ID:   ${student.id}`);
  console.log(`Student User: ${studentUser.id}  (${studentUser.email})`);
  console.log(
    `Navegue para /matches?studentId=${student.id} para testar o ranking da IA.`,
  );
}

interface ProfessionalSeed {
  email: string;
  name: string;
  bio: string;
  specializations: SpecializationType[];
  modalities: SessionModality[];
  yearsExperience: number;
  averageRating: number;
  totalReviews: number;
  priceMin: number;
  priceMax: number;
  city: string;
  state: string;
  isVerified: boolean;
}

async function upsertProfessional(p: ProfessionalSeed) {
  const user = await prisma.user.upsert({
    where: { email: p.email },
    update: { name: p.name },
    create: { email: p.email, name: p.name, passwordHash: SEED_PASSWORD_HASH, role: UserRole.PROFESSIONAL },
  });

  const professional = await prisma.professional.upsert({
    where: { userId: user.id },
    update: {
      bio: p.bio,
      specializations: p.specializations,
      modalities: p.modalities,
      yearsExperience: p.yearsExperience,
      averageRating: p.averageRating,
      totalReviews: p.totalReviews,
      priceMin: p.priceMin,
      priceMax: p.priceMax,
      priceCurrency: 'BRL',
      locationCity: p.city,
      locationState: p.state,
      locationCountry: 'Brasil',
      locationStreet: 'Rua Exemplo, 100',
      locationPostal: '00000-000',
      isVerified: p.isVerified,
      isAcceptingClients: true,
    },
    create: {
      userId: user.id,
      bio: p.bio,
      specializations: p.specializations,
      modalities: p.modalities,
      yearsExperience: p.yearsExperience,
      averageRating: p.averageRating,
      totalReviews: p.totalReviews,
      priceMin: p.priceMin,
      priceMax: p.priceMax,
      priceCurrency: 'BRL',
      locationCity: p.city,
      locationState: p.state,
      locationCountry: 'Brasil',
      locationStreet: 'Rua Exemplo, 100',
      locationPostal: '00000-000',
      isVerified: p.isVerified,
      isAcceptingClients: true,
    },
  });

  // One specialization record + a weekly availability so the data is richer.
  for (const type of p.specializations) {
    await prisma.specialization.upsert({
      where: { professionalId_type: { professionalId: professional.id, type } },
      update: {},
      create: {
        professionalId: professional.id,
        type,
        yearsExperience: p.yearsExperience,
        description: null,
        subSpecializations: [],
      },
    });
  }

  const existingAvailability = await prisma.availability.findFirst({
    where: { professionalId: professional.id },
  });
  if (!existingAvailability) {
    const start = new Date();
    start.setHours(18, 0, 0, 0);
    const end = new Date(start);
    end.setHours(19, 0, 0, 0);
    await prisma.availability.create({
      data: {
        professionalId: professional.id,
        dayOfWeek: 1, // Monday
        startTime: start,
        endTime: end,
        recurrence: AvailabilityRecurrence.WEEKLY,
        validFrom: new Date(),
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
